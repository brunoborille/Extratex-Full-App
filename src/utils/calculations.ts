import type {
  AssayData,
  PriceData,
  WeightData,
  FormulaData,
  DeductionData,
  PayableMetals,
  RevenueData,
  DeductionResults,
  CalculationResults,
} from '../types';
import type { ClientFormula } from '../types/formula';
import { gramsToDMTToTroyOz, mtToLbs, troyOzToLbs } from './conversions';
import { FormulaParser } from './formulaParser';

export function calculateDryWeight(wetWeight: number, moisture: number): number {
  return wetWeight * (1 - moisture / 100);
}

export function calculatePayableCopper(
  copperPercent: number,
  dryWeight: number,
  formula: string
): number {
  if (formula.includes('Pay 96.5% Min Deduction 1.5%')) {
    // (Assay * LME Factor - Deduction) / 100 * dryWeight
    const payablePercent = Math.max(0, copperPercent * 0.965 - 1.5);
    return (payablePercent / 100) * dryWeight;
  } else if (formula.includes('Pay 95% Min Deduction 1 unit')) {
    const payablePercent = Math.max(0, copperPercent * 0.95 - 1);
    return (payablePercent / 100) * dryWeight;
  } else if (formula.includes('Pay 97% Min Deduction 1%')) {
    const payablePercent = Math.max(0, copperPercent * 0.97 - 1);
    return (payablePercent / 100) * dryWeight;
  } else if (formula.includes('Pay 95% Min Deduction 1.5%')) {
    const payablePercent = Math.max(0, copperPercent * 0.95 - 1.5);
    return (payablePercent / 100) * dryWeight;
  }
  return 0;
}

export function calculatePayableGold(
  goldGPerDMT: number,
  dryWeight: number,
  formula: string
): number {
  if (formula.includes('Above 1g/MT 90%')) {
    if (goldGPerDMT > 1) {
      return gramsToDMTToTroyOz(goldGPerDMT, dryWeight) * 0.9;
    }
  } else if (formula.includes('Above 0.5g/MT 95%')) {
    if (goldGPerDMT > 0.5) {
      return gramsToDMTToTroyOz(goldGPerDMT, dryWeight) * 0.95;
    }
  } else if (formula.includes('Above 1g/MT 95%')) {
    if (goldGPerDMT > 1) {
      return gramsToDMTToTroyOz(goldGPerDMT, dryWeight) * 0.95;
    }
  } else if (formula.includes('Above 0.5g/MT 90%')) {
    if (goldGPerDMT > 0.5) {
      return gramsToDMTToTroyOz(goldGPerDMT, dryWeight) * 0.9;
    }
  }
  return 0;
}

export function calculatePayableSilver(
  silverGPerDMT: number,
  dryWeight: number,
  formula: string
): number {
  if (formula.includes('Above 30g/MT 90%')) {
    if (silverGPerDMT > 30) {
      return gramsToDMTToTroyOz(silverGPerDMT, dryWeight) * 0.9;
    }
  } else if (formula.includes('Above 50g/MT 85%')) {
    if (silverGPerDMT > 50) {
      return gramsToDMTToTroyOz(silverGPerDMT, dryWeight) * 0.85;
    }
  } else if (formula.includes('Above 30g/MT 95%')) {
    if (silverGPerDMT > 30) {
      return gramsToDMTToTroyOz(silverGPerDMT, dryWeight) * 0.95;
    }
  } else if (formula.includes('Above 20g/MT 90%')) {
    if (silverGPerDMT > 20) {
      return gramsToDMTToTroyOz(silverGPerDMT, dryWeight) * 0.9;
    }
  }
  return 0;
}

function buildFormulaVariables(
  metal: 'copper' | 'gold' | 'silver',
  assay: number,
  dryWeight: number
): Record<string, number> {
  return {
    assay,
    [`${metal}Assay`]: assay,
    dryWeight,
  };
}

function evaluateClientFormula(
  formula: ClientFormula,
  metal: 'copper' | 'gold' | 'silver',
  assay: number,
  dryWeight: number
): number {
  const vars = buildFormulaVariables(metal, assay, dryWeight);
  const { result, error } = FormulaParser.evaluate(formula.expression, vars);
  if (error || result === null) return 0;
  return result;
}

function findClientFormula(
  formulaId: string,
  clientFormulas?: ClientFormula[]
): ClientFormula | undefined {
  if (!clientFormulas) return undefined;
  return clientFormulas.find(f => f.id === formulaId);
}

export function calculatePayableMetals(
  assays: AssayData,
  weights: WeightData,
  formulas: FormulaData,
  clientFormulas?: ClientFormula[]
): PayableMetals {
  const copperFormula = findClientFormula(formulas.copper, clientFormulas);
  const goldFormula = findClientFormula(formulas.gold, clientFormulas);
  const silverFormula = findClientFormula(formulas.silver, clientFormulas);

  const copper = copperFormula
    ? evaluateClientFormula(copperFormula, 'copper', assays.copper, weights.totalDryWeight)
    : calculatePayableCopper(assays.copper, weights.totalDryWeight, formulas.copper);

  const gold = goldFormula
    ? evaluateClientFormula(goldFormula, 'gold', assays.gold, weights.totalDryWeight)
    : calculatePayableGold(assays.gold, weights.totalDryWeight, formulas.gold);

  const silver = silverFormula
    ? evaluateClientFormula(silverFormula, 'silver', assays.silver, weights.totalDryWeight)
    : calculatePayableSilver(assays.silver, weights.totalDryWeight, formulas.silver);

  return { copper, gold, silver };
}

export function calculateRevenue(
  payableMetals: PayableMetals,
  prices: PriceData
): RevenueData {
  const copper = payableMetals.copper * prices.copper;
  const gold = payableMetals.gold * prices.gold;
  const silver = payableMetals.silver * prices.silver;
  const total = copper + gold + silver;

  return { copper, gold, silver, total };
}

export function calculateDeductions(
  payableMetals: PayableMetals,
  weights: WeightData,
  deductions: DeductionData
): DeductionResults {
  const treatmentCharges = deductions.treatmentCharge * weights.totalDryWeight;

  const copperRefining = mtToLbs(payableMetals.copper) * deductions.refiningCharges.copper;
  const silverRefining = troyOzToLbs(payableMetals.silver) * deductions.refiningCharges.silver;
  const goldRefining = troyOzToLbs(payableMetals.gold) * deductions.refiningCharges.gold;

  const total = treatmentCharges + copperRefining + silverRefining + goldRefining;

  return {
    treatmentCharges,
    copperRefining,
    silverRefining,
    goldRefining,
    total,
  };
}

export function calculateFinalResults(
  assays: AssayData,
  prices: PriceData,
  weights: WeightData,
  formulas: FormulaData,
  deductions: DeductionData,
  invoicePercentage: number = 100,
  clientFormulas?: ClientFormula[]
): CalculationResults {
  const payableMetals = calculatePayableMetals(assays, weights, formulas, clientFormulas);
  const revenue = calculateRevenue(payableMetals, prices);
  const deductionResults = calculateDeductions(payableMetals, weights, deductions);

  const provisionalValue = revenue.total;
  const invoiceAmount = provisionalValue - deductionResults.total;
  const finalInvoiceAmount = invoiceAmount * (invoicePercentage / 100);
  const valuePerMT = weights.totalDryWeight > 0
    ? finalInvoiceAmount / weights.totalDryWeight
    : 0;

  return {
    payableMetals,
    revenue,
    deductions: deductionResults,
    provisionalValue,
    invoicePercentage,
    finalInvoiceAmount,
    valuePerMT,
  };
}

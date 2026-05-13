export interface AssayData {
  copper: number;
  gold: number;
  silver: number;
}

export interface PriceData {
  copper: number;
  gold: number;
  silver: number;
}

export interface WeightData {
  totalWetWeight: number;
  moisture: number;
  totalDryWeight: number;
}

export interface FormulaData {
  copper: string;
  gold: string;
  silver: string;
}

export interface RefiningCharges {
  copper: number;
  silver: number;
  gold: number;
}

export interface DeductionData {
  treatmentCharge: number;
  refiningCharges: RefiningCharges;
}

export interface PayableMetals {
  copper: number;
  gold: number;
  silver: number;
}

export interface RevenueData {
  copper: number;
  gold: number;
  silver: number;
  total: number;
}

export interface DeductionResults {
  treatmentCharges: number;
  copperRefining: number;
  silverRefining: number;
  goldRefining: number;
  total: number;
}

export interface CalculationResults {
  payableMetals: PayableMetals;
  revenue: RevenueData;
  deductions: DeductionResults;
  provisionalValue: number;
  invoicePercentage: number;
  finalInvoiceAmount: number;
  valuePerMT: number;
}

export interface CalculationData {
  id?: string;
  name: string;
  timestamp: string;
  assays: AssayData;
  prices: PriceData;
  weights: WeightData;
  formulas: FormulaData;
  deductions: DeductionData;
  results: CalculationResults;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  profit_margin: number;
  usd_brl_rate: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierCostCalculation {
  totalProvisionalValue: number;
  taxes: number;
  fobCosts: number;
  truckFreight: number;
  totalCosts: number;
  netValue: number;
  profitMargin: number;
  paymentAmount: number;
  paymentAmountBRL: number;
}

export type TabType = 'input' | 'results' | 'history' | 'formulas' | 'suppliers';

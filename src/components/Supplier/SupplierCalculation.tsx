import { useState } from 'react';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { formatCurrency, formatNumber, formatBRL } from '../../utils/formatting';
import { Supplier, SupplierCostCalculation, AssayData } from '../../types';
import { DollarSign, TrendingUp, TrendingDown, Calculator, Info } from 'lucide-react';

interface SupplierCalculationProps {
  supplier: Supplier;
  totalProvisionalValue: number;
  totalDryWeight: number;
  assays: AssayData;
  onUpdateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
}

export function SupplierCalculation({
  supplier,
  totalProvisionalValue,
  totalDryWeight,
  assays,
  onUpdateSupplier,
}: SupplierCalculationProps) {
  const [profitMargin, setProfitMargin] = useState(supplier.profit_margin.toString());
  const [usdBrlRate, setUsdBrlRate] = useState(supplier.usd_brl_rate.toString());

  const handleProfitMarginBlur = async () => {
    const margin = parseFloat(profitMargin);
    if (!isNaN(margin) && margin >= 0 && margin <= 100 && margin !== supplier.profit_margin) {
      await onUpdateSupplier(supplier.id, { profit_margin: margin });
    } else {
      setProfitMargin(supplier.profit_margin.toString());
    }
  };

  const handleExchangeRateBlur = async () => {
    const rate = parseFloat(usdBrlRate);
    if (!isNaN(rate) && rate > 0 && rate !== supplier.usd_brl_rate) {
      await onUpdateSupplier(supplier.id, { usd_brl_rate: rate });
    } else {
      setUsdBrlRate(supplier.usd_brl_rate.toString());
    }
  };

  const calculateCosts = (): SupplierCostCalculation => {
    const taxes = totalProvisionalValue * 0.05;
    const fobCosts = totalDryWeight * 70;
    const truckFreightBRL = totalDryWeight * 400;
    const truckFreightUSD = truckFreightBRL / supplier.usd_brl_rate;

    const totalCosts = taxes + fobCosts + truckFreightUSD;
    const netValue = totalProvisionalValue - totalCosts;
    const baseProfitMarginAmount = netValue * (supplier.profit_margin / 100);
    const basePaymentAmount = netValue - baseProfitMarginAmount;
    const basePaymentAmountBRL = basePaymentAmount * supplier.usd_brl_rate;

    const roundedPaymentAmountBRL = Math.floor(basePaymentAmountBRL);
    const roundingDifferenceBRL = basePaymentAmountBRL - roundedPaymentAmountBRL;
    const roundingDifferenceUSD = roundingDifferenceBRL / supplier.usd_brl_rate;

    const finalProfitMargin = baseProfitMarginAmount + roundingDifferenceUSD;
    const roundedPaymentAmountUSD = roundedPaymentAmountBRL / supplier.usd_brl_rate;

    return {
      totalProvisionalValue,
      taxes,
      fobCosts,
      truckFreight: truckFreightUSD,
      totalCosts,
      netValue,
      profitMargin: finalProfitMargin,
      paymentAmount: roundedPaymentAmountUSD,
      paymentAmountBRL: roundedPaymentAmountBRL,
    };
  };

  const costs = calculateCosts();

  const totalGramsGold = assays.gold * totalDryWeight;
  const totalGramsSilver = assays.silver * totalDryWeight;

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Supplier: {supplier.name}
        </h3>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <Info className="w-5 h-5 text-slate-600 mr-2" />
            <h4 className="text-sm font-semibold text-slate-700">Reference Data</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-slate-500 block">DMT Weight</span>
              <span className="text-lg font-bold text-slate-800">{formatNumber(totalDryWeight)} MT</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Material Cu Grade</span>
              <span className="text-lg font-bold text-orange-600">{formatNumber(assays.copper)}%</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Total Grams of Gold</span>
              <span className="text-lg font-bold text-amber-600">{formatNumber(totalGramsGold)} g</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Total Grams of Silver</span>
              <span className="text-lg font-bold text-slate-600">{formatNumber(totalGramsSilver)} g</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="Company Profit Margin (%)"
            type="number"
            value={profitMargin}
            onChange={(e) => setProfitMargin(e.target.value)}
            onBlur={handleProfitMarginBlur}
            min="0"
            max="100"
            step="0.1"
          />
          <Input
            label="USD/BRL Exchange Rate"
            type="number"
            value={usdBrlRate}
            onChange={(e) => setUsdBrlRate(e.target.value)}
            onBlur={handleExchangeRateBlur}
            min="0.01"
            step="0.01"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-slate-200">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-slate-700 font-medium">Invoice Amount (from Final Valuation)</span>
            </div>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(costs.totalProvisionalValue)}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
              Cost Deductions
            </h4>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Taxes (5%)</span>
              <span className="text-red-600 font-semibold">
                -{formatCurrency(costs.taxes)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">FOB Costs ($70/MT)</span>
              <span className="text-red-600 font-semibold">
                -{formatCurrency(costs.fobCosts)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Truck Freight (R$400/MT)</span>
              <span className="text-red-600 font-semibold">
                -{formatCurrency(costs.truckFreight)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-300">
              <span className="text-slate-700 font-semibold">Total Costs</span>
              <span className="text-red-700 font-bold">
                -{formatCurrency(costs.totalCosts)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-200">
            <div className="flex items-center">
              <Calculator className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-slate-700 font-medium">Net Value (after costs)</span>
            </div>
            <span className="text-lg font-bold text-green-700">
              {formatCurrency(costs.netValue)}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-200">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-slate-700 font-medium">
                Company Profit ({supplier.profit_margin}%)
              </span>
            </div>
            <span className="text-lg font-bold text-orange-600">
              {formatCurrency(costs.profitMargin)}
            </span>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-900 font-semibold text-lg">
                Supplier Payment (USD)
              </span>
              <span className="text-2xl font-bold text-blue-700">
                {formatCurrency(costs.paymentAmount)}
              </span>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-green-900 font-semibold text-lg">
                Supplier Payment (BRL)
              </span>
              <span className="text-2xl font-bold text-green-700">
                {formatBRL(costs.paymentAmountBRL, 0)}
              </span>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-3 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Payment per MT (BRL)</span>
              <span className="font-semibold text-slate-800">
                {formatBRL(Math.floor(costs.paymentAmountBRL / totalDryWeight), 0)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

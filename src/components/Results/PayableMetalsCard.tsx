import React from 'react';
import { Card } from '../UI/Card';
import { formatNumber } from '../../utils/formatting';
import type { PayableMetals, FormulaData } from '../../types';

interface PayableMetalsCardProps {
  payableMetals: PayableMetals;
  formulas: FormulaData;
}

interface MetalRowProps {
  symbol: string;
  name: string;
  value: number;
  unit: string;
  formula: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  symbolBg: string;
  symbolText: string;
}

function MetalRow({ symbol, name, value, unit, formula, colorClass, bgClass, borderClass, symbolBg, symbolText }: MetalRowProps) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${bgClass} ${borderClass} transition-all duration-200 hover:shadow-sm`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${symbolBg} ${symbolText}`}>
        {symbol}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{name}</p>
        <p className={`text-2xl font-bold ${colorClass} leading-tight`}>
          {formatNumber(value)}
          <span className="text-sm font-semibold ml-1.5 opacity-70">{unit}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1 truncate" title={formula}>{formula}</p>
      </div>
    </div>
  );
}

export function PayableMetalsCard({ payableMetals, formulas }: PayableMetalsCardProps) {
  return (
    <Card title="Payable Metals" subtitle="Calculated from assay data and payment formulas" accent="copper">
      <div className="space-y-3">
        <MetalRow
          symbol="Cu"
          name="Payable Copper"
          value={payableMetals.copper}
          unit="MT"
          formula={formulas.copper}
          colorClass="text-blue-700"
          bgClass="bg-blue-50/60"
          borderClass="border-blue-200/60"
          symbolBg="bg-blue-100"
          symbolText="text-blue-700"
        />
        <MetalRow
          symbol="Au"
          name="Payable Gold"
          value={payableMetals.gold}
          unit="Oz"
          formula={formulas.gold}
          colorClass="text-amber-700"
          bgClass="bg-amber-50/60"
          borderClass="border-amber-200/60"
          symbolBg="bg-amber-100"
          symbolText="text-amber-700"
        />
        <MetalRow
          symbol="Ag"
          name="Payable Silver"
          value={payableMetals.silver}
          unit="Oz"
          formula={formulas.silver}
          colorClass="text-slate-700"
          bgClass="bg-slate-50/60"
          borderClass="border-slate-200/60"
          symbolBg="bg-slate-200"
          symbolText="text-slate-700"
        />
      </div>
    </Card>
  );
}

import React from 'react';
import { Card } from '../UI/Card';
import { formatCurrency } from '../../utils/formatting';
import type { DeductionResults } from '../../types';
import { TrendingDown } from 'lucide-react';

interface DeductionsCardProps {
  deductions: DeductionResults;
}

interface DeductionRowProps {
  label: string;
  value: number;
  total: number;
}

function DeductionRow({ label, value, total }: DeductionRowProps) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1">
        <span className="text-sm text-gray-600">{label}</span>
        <div className="mt-1.5 w-full bg-red-50 rounded-full h-1">
          <div
            className="h-full bg-red-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="ml-4 text-sm font-semibold text-red-600 tabular-nums">
        -{formatCurrency(value)}
      </span>
    </div>
  );
}

export function DeductionsCard({ deductions }: DeductionsCardProps) {
  const items = [
    { label: 'Treatment Charges', value: deductions.treatmentCharges },
    { label: 'Copper Refining', value: deductions.copperRefining },
    { label: 'Silver Refining', value: deductions.silverRefining },
    { label: 'Gold Refining', value: deductions.goldRefining },
  ];

  return (
    <Card title="Deductions" subtitle="Treatment and refining charges" accent="silver">
      <div className="divide-y divide-gray-50">
        {items.map((item) => (
          <DeductionRow key={item.label} label={item.label} value={item.value} total={deductions.total} />
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
            <TrendingDown size={14} className="text-red-600" />
          </div>
          <span className="text-sm font-semibold text-gray-800">Total Deductions</span>
        </div>
        <span className="text-2xl font-bold text-red-600">-{formatCurrency(deductions.total)}</span>
      </div>
    </Card>
  );
}

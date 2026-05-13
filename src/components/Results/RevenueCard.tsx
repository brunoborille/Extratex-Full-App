import React from 'react';
import { Card } from '../UI/Card';
import { formatCurrency } from '../../utils/formatting';
import type { RevenueData } from '../../types';

interface RevenueCardProps {
  revenue: RevenueData;
}

interface RevenueBarProps {
  label: string;
  value: number;
  total: number;
  barColor: string;
  textColor: string;
  bgColor: string;
}

function RevenueBar({ label, value, total, barColor, textColor, bgColor }: RevenueBarProps) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div className={`p-4 rounded-xl ${bgColor} border border-gray-100`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${textColor}`}>{label}</span>
        <span className={`text-base font-bold ${textColor}`}>{formatCurrency(value)}</span>
      </div>
      <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1.5">{pct.toFixed(1)}% of total revenue</p>
    </div>
  );
}

export function RevenueCard({ revenue }: RevenueCardProps) {
  return (
    <Card title="Revenue Breakdown" subtitle="Gross revenue before deductions" accent="gold">
      <div className="space-y-3">
        <RevenueBar
          label="Copper Revenue"
          value={revenue.copper}
          total={revenue.total}
          barColor="bg-blue-500"
          textColor="text-blue-700"
          bgColor="bg-blue-50/50"
        />
        <RevenueBar
          label="Gold Revenue"
          value={revenue.gold}
          total={revenue.total}
          barColor="bg-amber-500"
          textColor="text-amber-700"
          bgColor="bg-amber-50/50"
        />
        <RevenueBar
          label="Silver Revenue"
          value={revenue.silver}
          total={revenue.total}
          barColor="bg-slate-400"
          textColor="text-slate-700"
          bgColor="bg-slate-50/50"
        />

        <div className="pt-3 mt-1 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Total Provisional Value</span>
          <span className="text-2xl font-bold text-emerald-600">{formatCurrency(revenue.total)}</span>
        </div>
      </div>
    </Card>
  );
}

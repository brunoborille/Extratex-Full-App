import React, { useState } from 'react';
import { Card } from '../UI/Card';
import { formatCurrency } from '../../utils/formatting';
import type { CalculationResults } from '../../types';
import { CheckCircle, Copy, TrendingUp } from 'lucide-react';

interface FinalValueCardProps {
  results: CalculationResults;
}

export function FinalValueCard({ results }: FinalValueCardProps) {
  const [copied, setCopied] = useState(false);

  const copyValue = () => {
    navigator.clipboard.writeText(results.finalInvoiceAmount.toFixed(2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const netAfterDeductions = results.provisionalValue - results.deductions.total;
  const deductionPct = results.provisionalValue > 0
    ? (results.deductions.total / results.provisionalValue) * 100
    : 0;

  return (
    <Card title="Final Valuation" subtitle="After all deductions and invoice percentage" accent="emerald">
      <div className="space-y-4">
        {/* Line items */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-100">
            <span className="text-sm text-gray-500">Gross Revenue</span>
            <span className="text-sm font-semibold text-gray-800">{formatCurrency(results.provisionalValue)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-100">
            <span className="text-sm text-gray-500">
              Total Deductions <span className="text-xs text-red-400">({deductionPct.toFixed(1)}%)</span>
            </span>
            <span className="text-sm font-semibold text-red-600">-{formatCurrency(results.deductions.total)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-100">
            <span className="text-sm text-gray-500">Net Invoice Amount</span>
            <span className="text-sm font-semibold text-gray-800">{formatCurrency(netAfterDeductions)}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500">Invoice Percentage</span>
            <span className="text-sm font-semibold text-blue-700">{results.invoicePercentage}%</span>
          </div>
        </div>

        {/* Final value hero */}
        <div className="final-value-box relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                Total Cargo Invoice
              </p>
              <p className="text-4xl font-black text-emerald-700 leading-none tracking-tight">
                {formatCurrency(results.finalInvoiceAmount)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={copyValue}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-semibold transition-all duration-150"
                title="Copy to clipboard"
              >
                {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-600" />
              <span className="text-sm text-emerald-600 font-medium">Net Value per MT</span>
            </div>
            <span className="text-xl font-bold text-emerald-700">{formatCurrency(results.valuePerMT)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

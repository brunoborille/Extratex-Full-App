import React, { useState, useMemo } from 'react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Trash2, ArrowUpRight, Search, BarChart2, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatting';
import type { CalculationData } from '../../types';

interface CalculationsListProps {
  calculations: CalculationData[];
  onLoad: (calculation: CalculationData) => void;
  onDelete: (id: string) => void;
}

const PAGE_SIZE = 10;

export function CalculationsList({ calculations, onLoad, onDelete }: CalculationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return calculations.filter(c =>
      c.name.toLowerCase().includes(q) || (c.notes && c.notes.toLowerCase().includes(q))
    );
  }, [calculations, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearchTerm(v);
    setPage(1);
  };

  const totalValue = calculations.reduce((s, c) => s + (c.results?.finalInvoiceAmount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      {calculations.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: BarChart2, label: 'Total Calculations', value: calculations.length.toString(), color: 'blue' },
            { icon: DollarSign, label: 'Combined Value', value: formatCurrency(totalValue), color: 'emerald' },
            { icon: Calendar, label: 'Latest', value: calculations[0] ? formatDate(calculations[0].timestamp).split(',')[0] : '—', color: 'amber' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className={`card p-4 flex items-center gap-3`}>
              <div className={`w-9 h-9 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={`text-${color}-600`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-bold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card title="Saved Calculations" subtitle={`${filtered.length} calculation${filtered.length !== 1 ? 's' : ''} found`}>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or notes..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {/* List */}
          {paginated.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <BarChart2 size={28} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">
                {searchTerm ? 'No calculations match your search' : 'No saved calculations yet'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm ? 'Try a different search term' : 'Save your first calculation from the Input tab'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 scrollbar-thin overflow-y-auto max-h-[640px]">
              {paginated.map((calc, idx) => (
                <div
                  key={calc.id}
                  className="history-item group animate-fade-in"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{calc.name}</h4>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{formatDate(calc.timestamp)}</p>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="stat-chip bg-blue-100 text-blue-700">Cu {calc.assays.copper}%</span>
                        <span className="stat-chip bg-amber-100 text-amber-700">Au {calc.assays.gold} g/DMT</span>
                        <span className="stat-chip bg-slate-100 text-slate-600">Ag {calc.assays.silver} g/DMT</span>
                        <span className="stat-chip bg-gray-100 text-gray-600">{calc.weights.totalDryWeight.toFixed(0)} MT dry</span>
                      </div>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(calc.results.finalInvoiceAmount)}
                      </p>
                      {calc.notes && (
                        <p className="text-xs text-gray-400 mt-1.5 italic truncate" title={calc.notes}>
                          {calc.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button size="xs" variant="primary" onClick={() => onLoad(calc)}>
                        <ArrowUpRight size={13} />
                        Load
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 hover:text-red-700 min-w-0 px-2"
                        onClick={() => calc.id && onDelete(calc.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 text-xs font-medium text-gray-600 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  ← Prev
                </button>
                <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded border border-blue-100">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1 text-xs font-medium text-gray-600 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

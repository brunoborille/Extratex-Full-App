import React, { useState, useEffect, useCallback } from 'react';
import {
  Calculator, History, Save, FileText, Settings, Truck,
  TrendingUp, DollarSign, Scale, FlaskConical, CheckCircle,
  AlertCircle, X, ChevronRight,
} from 'lucide-react';
import { Button } from './components/UI/Button';
import { Modal } from './components/UI/Modal';
import { Input } from './components/UI/Input';
import { AssaysForm } from './components/Input/AssaysForm';
import { PricesForm } from './components/Input/PricesForm';
import { WeightsForm } from './components/Input/WeightsForm';
import { FormulasForm } from './components/Input/FormulasForm';
import { DeductionsForm } from './components/Input/DeductionsForm';
import { PayableMetalsCard } from './components/Results/PayableMetalsCard';
import { RevenueCard } from './components/Results/RevenueCard';
import { DeductionsCard } from './components/Results/DeductionsCard';
import { FinalValueCard } from './components/Results/FinalValueCard';
import { CalculationsList } from './components/History/CalculationsList';
import { ExportButton } from './components/Export/ExportButton';
import { ClientSelector } from './components/Formula/ClientSelector';
import { FormulaManager } from './components/Formula/FormulaManager';
import { ClientFormulasSelector } from './components/Input/ClientFormulasSelector';
import { DocumentUpload } from './components/Input/DocumentUpload';
import { SupplierManager } from './components/Supplier/SupplierManager';
import { calculateFinalResults } from './utils/calculations';
import { formatCurrency } from './utils/formatting';
import { useCalculations } from './hooks/useCalculations';
import type {
  AssayData, PriceData, WeightData, FormulaData, DeductionData, TabType, CalculationData,
} from './types';

// ── Toast ────────────────────────────────────────────────────────────────────

interface ToastData { id: number; message: string; type: 'success' | 'error' | 'info' }

let toastId = 0;

function Toast({ toasts, onRemove }: { toasts: ToastData[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto animate-slide-in-right flex items-center gap-3 min-w-[280px] max-w-sm px-4 py-3 rounded-xl shadow-2xl border"
          style={
            t.type === 'success'
              ? { background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', borderColor: '#6ee7b7', color: '#065f46' }
              : t.type === 'error'
              ? { background: 'linear-gradient(135deg,#fef2f2,#fee2e2)', borderColor: '#fca5a5', color: '#7f1d1d' }
              : { background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderColor: '#93c5fd', color: '#1e3a8a' }
          }
        >
          {t.type === 'success' && <CheckCircle size={16} className="flex-shrink-0 text-emerald-600" />}
          {t.type === 'error' && <AlertCircle size={16} className="flex-shrink-0 text-red-600" />}
          {t.type === 'info' && <TrendingUp size={16} className="flex-shrink-0 text-blue-600" />}
          <span className="text-sm font-medium flex-1">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ isOpen, message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Confirm Action"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>Delete</Button>
        </>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
}

// ── Quick Stats Bar ───────────────────────────────────────────────────────────

function QuickStatsBar({
  results,
  assays,
  weights,
  hasInput,
  onViewResults,
}: {
  results: ReturnType<typeof calculateFinalResults>;
  assays: AssayData;
  weights: WeightData;
  hasInput: boolean;
  onViewResults: () => void;
}) {
  if (!hasInput) return null;

  return (
    <div className="bg-white border-b border-gray-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-0 py-0 overflow-x-auto scrollbar-thin">
          {[
            {
              icon: FlaskConical, label: 'Cu Assay', value: `${assays.copper}%`,
              color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
            },
            {
              icon: Scale, label: 'Dry Weight', value: `${weights.totalDryWeight.toFixed(0)} MT`,
              color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100',
            },
            {
              icon: TrendingUp, label: 'Gross Revenue', value: formatCurrency(results.revenue.total),
              color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100',
            },
            {
              icon: DollarSign, label: 'Final Invoice', value: formatCurrency(results.finalInvoiceAmount),
              color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100',
            },
          ].map(({ icon: Icon, label, value, color, bg, border }) => (
            <div key={label} className={`flex items-center gap-2 px-5 py-2.5 border-r ${border} flex-shrink-0`}>
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={14} className={color} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide leading-none mb-0.5">{label}</p>
                <p className={`text-sm font-bold ${color} leading-none`}>{value}</p>
              </div>
            </div>
          ))}
          <button
            onClick={onViewResults}
            className="flex items-center gap-1.5 ml-auto px-5 py-2.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors flex-shrink-0"
          >
            View Full Results
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'input',     label: 'Input',     icon: FileText },
  { id: 'results',   label: 'Results',   icon: Calculator },
  { id: 'history',   label: 'History',   icon: History },
  { id: 'formulas',  label: 'Formulas',  icon: Settings },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
];

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('input');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [calculationName, setCalculationName] = useState('');
  const [notes, setNotes] = useState('');
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);
  const [selectedCalculationClient, setSelectedCalculationClient] = useState<{ id: string; name: string } | null>(null);
  const [clientFormulas, setClientFormulas] = useState<any>(null);

  const { calculations, loading, saveCalculation, deleteCalculation } = useCalculations();

  const [assays, setAssays] = useState<AssayData>({ copper: 0, gold: 0, silver: 0 });
  const [prices, setPrices] = useState<PriceData>({ copper: 0, gold: 0, silver: 0 });
  const [weights, setWeights] = useState<WeightData>({ totalWetWeight: 0, moisture: 0, totalDryWeight: 0 });
  const [formulas, setFormulas] = useState<FormulaData>({
    copper: 'Pay 96.5% Min Deduction 1.5%',
    gold: 'Above 1g/MT 90%',
    silver: 'Above 30g/MT 90%',
  });
  const [deductions, setDeductions] = useState<DeductionData>({
    treatmentCharge: 0,
    refiningCharges: { copper: 0, silver: 0, gold: 0 },
  });

  const allClientFormulas = clientFormulas
    ? [...(clientFormulas.copper || []), ...(clientFormulas.gold || []), ...(clientFormulas.silver || [])]
    : undefined;

  const results = calculateFinalResults(assays, prices, weights, formulas, deductions, 100, allClientFormulas);

  const hasInput = assays.copper > 0 || weights.totalWetWeight > 0 || prices.copper > 0;

  // ── Toast helpers ────────────────────────────────────────────────────────────

  const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Keyboard shortcut: Ctrl+S / Cmd+S to save ────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setSaveModalOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleDataExtracted = (extractedData: any) => {
    if (extractedData.copper !== undefined) setAssays(prev => ({ ...prev, copper: extractedData.copper }));
    if (extractedData.gold !== undefined) setAssays(prev => ({ ...prev, gold: extractedData.gold }));
    if (extractedData.silver !== undefined) setAssays(prev => ({ ...prev, silver: extractedData.silver }));
    if (extractedData.humidity !== undefined) setWeights(prev => ({ ...prev, moisture: extractedData.humidity }));
    showToast('Lab results extracted and populated', 'success');
  };

  const handleSave = async () => {
    if (!calculationName.trim()) {
      showToast('Please enter a calculation name', 'error');
      return;
    }
    try {
      const data: CalculationData = {
        name: calculationName,
        timestamp: new Date().toISOString(),
        assays, prices, weights, formulas, deductions, results, notes,
      };
      await saveCalculation(data);
      showToast('Calculation saved successfully', 'success');
      setSaveModalOpen(false);
      setCalculationName('');
      setNotes('');
    } catch {
      showToast('Failed to save calculation', 'error');
    }
  };

  const handleLoad = (calc: CalculationData) => {
    setAssays(calc.assays);
    setPrices(calc.prices);
    setWeights(calc.weights);
    setFormulas(calc.formulas);
    setDeductions(calc.deductions);
    setActiveTab('input');
    showToast(`Loaded "${calc.name}"`, 'success');
  };

  const handleDeleteRequest = (id: string) => {
    setConfirmModal({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCalculation(confirmModal.id);
      showToast('Calculation deleted', 'success');
    } catch {
      showToast('Failed to delete calculation', 'error');
    } finally {
      setConfirmModal({ open: false, id: '' });
    }
  };

  const handleClearForm = () => {
    setAssays({ copper: 0, gold: 0, silver: 0 });
    setPrices({ copper: 0, gold: 0, silver: 0 });
    setWeights({ totalWetWeight: 0, moisture: 0, totalDryWeight: 0 });
    setDeductions({ treatmentCharge: 0, refiningCharges: { copper: 0, silver: 0, gold: 0 } });
    setSelectedCalculationClient(null);
    setClientFormulas(null);
    showToast('Form cleared', 'info');
  };

  const currentCalculationData: CalculationData = {
    name: calculationName || 'Current Calculation',
    timestamp: new Date().toISOString(),
    assays, prices, weights, formulas, deductions, results, notes,
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="nav-glass sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img src="/white_logo.png" alt="Extratex Mineração" className="h-9 drop-shadow-sm" />
              <div className="hidden sm:block border-l border-white/20 pl-4">
                <h1 className="text-base font-bold text-white leading-tight">Copper Ore Valuation</h1>
                <p className="text-[10px] text-blue-200 font-medium tracking-wide uppercase">Professional Pricing Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === 'results' && (
                <ExportButton calculation={currentCalculationData} onToast={showToast} />
              )}
              <Button
                variant="success"
                size="sm"
                onClick={() => setSaveModalOpen(true)}
                title="Save (Ctrl+S)"
              >
                <Save size={14} />
                Save
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Quick Stats Bar */}
      <QuickStatsBar
        results={results}
        assays={assays}
        weights={weights}
        hasInput={hasInput}
        onViewResults={() => setActiveTab('results')}
      />

      {/* Tab bar */}
      <div className="bg-slate-100/80 border-b border-gray-200/80 sticky top-16 z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0.5 py-1.5 overflow-x-auto scrollbar-thin">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`tab-button flex-shrink-0 ${activeTab === id ? 'tab-button-active' : 'tab-button-inactive'}`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
                {id === 'history' && calculations.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                    {calculations.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* INPUT TAB */}
        {activeTab === 'input' && (
          <div className="space-y-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Shipment Data Entry</h2>
                <p className="text-sm text-gray-500">Enter assay, price, weight, and formula data below</p>
              </div>
              <div className="flex items-center gap-2">
                {hasInput && (
                  <Button variant="ghost" size="sm" onClick={handleClearForm}>
                    Clear Form
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('results')}
                >
                  <Calculator size={14} />
                  View Results
                </Button>
              </div>
            </div>

            <DocumentUpload onDataExtracted={handleDataExtracted} />
            <ClientFormulasSelector
              selectedClient={selectedCalculationClient}
              onClientChange={(client) => {
                setSelectedCalculationClient(client);
                if (!client) setClientFormulas(null);
              }}
              onFormulasLoad={(copper, gold, silver) => {
                setClientFormulas({ copper, gold, silver });
              }}
              onDefaultSettingsLoad={(settings) => {
                if (settings) {
                  if (settings.default_copper_formula_id) setFormulas(prev => ({ ...prev, copper: settings.default_copper_formula_id! }));
                  if (settings.default_gold_formula_id) setFormulas(prev => ({ ...prev, gold: settings.default_gold_formula_id! }));
                  if (settings.default_silver_formula_id) setFormulas(prev => ({ ...prev, silver: settings.default_silver_formula_id! }));
                  setDeductions({
                    treatmentCharge: settings.default_treatment_charge,
                    refiningCharges: {
                      copper: settings.default_copper_refining,
                      gold: settings.default_gold_refining,
                      silver: settings.default_silver_refining,
                    },
                  });
                }
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <AssaysForm data={assays} onChange={setAssays} />
              <PricesForm data={prices} onChange={setPrices} onToast={showToast} />
            </div>
            <WeightsForm data={weights} onChange={setWeights} />
            <FormulasForm data={formulas} onChange={setFormulas} clientFormulas={clientFormulas} />
            <DeductionsForm data={deductions} onChange={setDeductions} />

            <div className="flex justify-center pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setActiveTab('results')}
                className="px-10"
              >
                <Calculator size={18} />
                Calculate Results
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* RESULTS TAB */}
        {activeTab === 'results' && (
          <div className="space-y-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Calculation Results</h2>
                <p className="text-sm text-gray-500">Complete valuation breakdown for current shipment</p>
              </div>
              <ExportButton calculation={currentCalculationData} onToast={showToast} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <PayableMetalsCard payableMetals={results.payableMetals} formulas={formulas} />
              <RevenueCard revenue={results.revenue} />
              <DeductionsCard deductions={results.deductions} />
              <FinalValueCard results={results} />
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="animate-slide-up">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" style={{ borderWidth: 3 }} />
                <p className="text-gray-500">Loading calculations...</p>
              </div>
            ) : (
              <CalculationsList
                calculations={calculations}
                onLoad={handleLoad}
                onDelete={handleDeleteRequest}
              />
            )}
          </div>
        )}

        {/* FORMULAS TAB */}
        {activeTab === 'formulas' && (
          <div className="animate-slide-up">
            {!selectedClient ? (
              <ClientSelector
                onSelectClient={(id, name) => setSelectedClient({ id, name })}
              />
            ) : (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedClient(null)}
                  className="mb-5"
                >
                  ← Back to Clients
                </Button>
                <FormulaManager clientId={selectedClient.id} clientName={selectedClient.name} />
              </div>
            )}
          </div>
        )}

        {/* SUPPLIERS TAB */}
        {activeTab === 'suppliers' && (
          <div className="animate-slide-up">
            <SupplierManager
              calculationResults={results}
              assays={assays}
              weights={weights}
            />
          </div>
        )}
      </main>

      {/* Save Modal */}
      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save Calculation"
        subtitle="Store this valuation to your history"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setSaveModalOpen(false)}>Cancel</Button>
            <Button variant="success" size="sm" onClick={handleSave}>
              <Save size={14} />
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Calculation Name"
            type="text"
            value={calculationName}
            onChange={(e) => setCalculationName(e.target.value)}
            placeholder="e.g., Q1 2025 Shipment — Supplier A"
            hint="Use a descriptive name to find it later"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this shipment..."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
              style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        message="Are you sure you want to delete this calculation? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmModal({ open: false, id: '' })}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Supplier, CalculationResults, AssayData } from '../../types';
import { SupplierForm } from './SupplierForm';
import { SupplierCalculation } from './SupplierCalculation';
import { GradePaymentTable } from './GradePaymentTable';
import { Select } from '../UI/Select';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import { Download, Trash2, Plus } from 'lucide-react';

interface SupplierManagerProps {
  calculationResults: CalculationResults | null;
  assays: AssayData;
  weights: { totalDryWeight: number };
}

export function SupplierManager({ calculationResults, assays, weights }: SupplierManagerProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSuppliers(data || []);
      if (data && data.length > 0 && !selectedSupplierId) {
        setSelectedSupplierId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (name: string, profitMargin: number, usdBrlRate: number) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([
          {
            name,
            profit_margin: profitMargin,
            usd_brl_rate: usdBrlRate,
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          alert('A supplier with this name already exists');
        }
        throw error;
      }

      setSuppliers([data, ...suppliers]);
      setSelectedSupplierId(data.id);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding supplier:', error);
      throw error;
    }
  };

  const handleUpdateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setSuppliers(
        suppliers.map((s) =>
          s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
        )
      );
    } catch (error) {
      console.error('Error updating supplier:', error);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);

      if (error) throw error;

      const newSuppliers = suppliers.filter((s) => s.id !== id);
      setSuppliers(newSuppliers);

      if (selectedSupplierId === id) {
        setSelectedSupplierId(newSuppliers.length > 0 ? newSuppliers[0].id : '');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Failed to delete supplier');
    }
  };

  const handleExportPDF = () => {
    const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!selectedSupplier || !calculationResults) {
      alert('Please select a supplier and ensure calculations are available');
      return;
    }

    alert('PDF export functionality coming soon!');
  };

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Loading suppliers...</div>;
  }

  if (!calculationResults) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 mb-2">No calculation results available.</p>
        <p className="text-sm text-slate-500">
          Please complete calculations in the Input and Results tabs first.
        </p>
      </div>
    );
  }

  const calculateSupplierPaymentBRL = (supplier: Supplier): number => {
    const invoiceAmount = calculationResults.provisionalValue - calculationResults.deductions.total;
    const totalDryWeight = weights.totalDryWeight;

    const taxes = invoiceAmount * 0.05;
    const fobCosts = totalDryWeight * 70;
    const truckFreightBRL = totalDryWeight * 400;
    const truckFreightUSD = truckFreightBRL / supplier.usd_brl_rate;

    const totalCosts = taxes + fobCosts + truckFreightUSD;
    const netValue = invoiceAmount - totalCosts;
    const baseProfitMarginAmount = netValue * (supplier.profit_margin / 100);
    const basePaymentAmount = netValue - baseProfitMarginAmount;
    const basePaymentAmountBRL = basePaymentAmount * supplier.usd_brl_rate;

    return Math.floor(basePaymentAmountBRL);
  };

  const supplierPaymentBRL = selectedSupplier ? calculateSupplierPaymentBRL(selectedSupplier) : 0;

  return (
    <div className="space-y-6">
      {/* Create New Supplier Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Supplier Management</h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="shadow-lg"
          aria-label="Create new supplier"
        >
          <Plus size={18} />
          Create New Supplier
        </Button>
      </div>

      {/* Modal for Adding Supplier */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Supplier"
      >
        <SupplierForm onAddSupplier={handleAddSupplier} />
      </Modal>

      {suppliers.length > 0 && (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1">
              <Select
                label="Select Supplier"
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExportPDF}
                disabled={!selectedSupplierId}
                variant="secondary"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button
                onClick={() => selectedSupplierId && handleDeleteSupplier(selectedSupplierId)}
                disabled={!selectedSupplierId}
                variant="secondary"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>

          {selectedSupplier && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SupplierCalculation
                supplier={selectedSupplier}
                totalProvisionalValue={calculationResults.provisionalValue - calculationResults.deductions.total}
                totalDryWeight={weights.totalDryWeight}
                assays={assays}
                onUpdateSupplier={handleUpdateSupplier}
              />
              <GradePaymentTable
                supplierPaymentBRL={supplierPaymentBRL}
                dmtWeight={weights.totalDryWeight}
                copperGrade={assays.copper}
              />
            </div>
          )}
        </>
      )}

      {suppliers.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <Plus size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 mb-2 text-lg font-semibold">No suppliers yet</p>
          <p className="text-sm text-slate-500 mb-4">Get started by creating your first supplier</p>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            size="lg"
          >
            <Plus size={20} />
            Create First Supplier
          </Button>
        </div>
      )}
    </div>
  );
}

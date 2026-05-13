import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { CalculationData } from '../types';

export function useCalculations() {
  const [calculations, setCalculations] = useState<CalculationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCalculations = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('calculations')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setCalculations(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calculations');
    } finally {
      setLoading(false);
    }
  };

  const saveCalculation = async (calculation: CalculationData) => {
    try {
      const { data, error: saveError } = await supabase
        .from('calculations')
        .insert([{
          name: calculation.name,
          timestamp: calculation.timestamp,
          assays: calculation.assays,
          prices: calculation.prices,
          weights: calculation.weights,
          formulas: calculation.formulas,
          deductions: calculation.deductions,
          results: calculation.results,
          notes: calculation.notes || '',
        }])
        .select()
        .single();

      if (saveError) throw saveError;

      await loadCalculations();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save calculation');
      throw err;
    }
  };

  const deleteCalculation = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('calculations')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await loadCalculations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete calculation');
      throw err;
    }
  };

  useEffect(() => {
    loadCalculations();
  }, []);

  return {
    calculations,
    loading,
    error,
    saveCalculation,
    deleteCalculation,
    refreshCalculations: loadCalculations,
  };
}

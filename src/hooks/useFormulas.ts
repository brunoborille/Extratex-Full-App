import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Client, FormulaTemplate, ClientFormula, FormulaVersion, FormulaTestResult } from '../types/formula';

export function useFormulas(clientId?: string) {
  const [formulas, setFormulas] = useState<ClientFormula[]>([]);
  const [templates, setTemplates] = useState<FormulaTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFormulas = async () => {
    try {
      setLoading(true);
      let query = supabase.from('client_formulas').select('*').order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setFormulas(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load formulas');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('formula_templates')
        .select('*')
        .order('category');

      if (fetchError) throw fetchError;
      setTemplates(data || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const saveFormula = async (formula: Partial<ClientFormula>) => {
    try {
      const { data, error: saveError } = await supabase
        .from('client_formulas')
        .insert([formula])
        .select()
        .maybeSingle();

      if (saveError) throw saveError;

      if (data) {
        await createVersion(data.id, 1, 'Initial version', formula.created_by || '');
      }
      await loadFormulas();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save formula');
      throw err;
    }
  };

  const updateFormula = async (id: string, updates: Partial<ClientFormula>) => {
    try {
      const existing = formulas.find(f => f.id === id);
      if (!existing) throw new Error('Formula not found');

      const { data, error: updateError } = await supabase
        .from('client_formulas')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (updateError) throw updateError;

      const versions = await getVersions(id);
      const nextVersion = versions.length + 1;
      await createVersion(id, nextVersion, 'Formula updated', updates.created_by || '');

      await loadFormulas();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update formula');
      throw err;
    }
  };

  const deleteFormula = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('client_formulas').delete().eq('id', id);

      if (deleteError) throw deleteError;
      await loadFormulas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete formula');
      throw err;
    }
  };

  const createVersion = async (formulaId: string, versionNumber: number, changeSummary: string, changedBy: string) => {
    const formula = formulas.find(f => f.id === formulaId);
    if (!formula) return;

    await supabase.from('formula_versions').insert([{
      client_formula_id: formulaId,
      version_number: versionNumber,
      expression: formula.expression,
      variables: formula.variables,
      parameters: formula.parameters,
      change_summary: changeSummary,
      changed_by: changedBy,
    }]);
  };

  const getVersions = async (formulaId: string): Promise<FormulaVersion[]> => {
    const { data } = await supabase
      .from('formula_versions')
      .select('*')
      .eq('client_formula_id', formulaId)
      .order('version_number', { ascending: false });

    return data || [];
  };

  const saveTestResult = async (result: Partial<FormulaTestResult>) => {
    try {
      const { error: saveError } = await supabase.from('formula_test_results').insert([result]);

      if (saveError) throw saveError;
    } catch (err) {
      console.error('Failed to save test result:', err);
    }
  };

  const getTestResults = async (formulaId: string): Promise<FormulaTestResult[]> => {
    const { data } = await supabase
      .from('formula_test_results')
      .select('*')
      .eq('client_formula_id', formulaId)
      .order('tested_at', { ascending: false })
      .limit(10);

    return data || [];
  };

  useEffect(() => {
    loadFormulas();
    loadTemplates();
  }, [clientId]);

  return {
    formulas,
    templates,
    loading,
    error,
    saveFormula,
    updateFormula,
    deleteFormula,
    getVersions,
    saveTestResult,
    getTestResults,
    refreshFormulas: loadFormulas,
  };
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('clients').select('*').order('name');
      setClients(data || []);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveClient = async (client: Partial<Client>) => {
    const { data, error } = await supabase.from('clients').insert([client]).select().maybeSingle();
    if (error) throw error;
    await loadClients();
    return data;
  };

  useEffect(() => {
    loadClients();
  }, []);

  return { clients, loading, saveClient, refreshClients: loadClients };
}

import { useEffect, useState } from 'react';
import { Card } from '../UI/Card';
import { Select } from '../UI/Select';
import { useClients } from '../../hooks/useFormulas';
import { useFormulas } from '../../hooks/useFormulas';
import { supabase } from '../../lib/supabase';
import type { ClientFormula, ClientDefaultSettings } from '../../types/formula';

interface ClientFormulasSelectorProps {
  selectedClient: { id: string; name: string } | null;
  onClientChange: (client: { id: string; name: string } | null) => void;
  onFormulasLoad: (copperFormulas: ClientFormula[], goldFormulas: ClientFormula[], silverFormulas: ClientFormula[]) => void;
  onDefaultSettingsLoad?: (settings: ClientDefaultSettings | null) => void;
}

export function ClientFormulasSelector({
  selectedClient,
  onClientChange,
  onFormulasLoad,
  onDefaultSettingsLoad
}: ClientFormulasSelectorProps) {
  const { clients, loading: loadingClients } = useClients();
  const { formulas, loading: loadingFormulas } = useFormulas(selectedClient?.id);
  const [hasLoadedFormulas, setHasLoadedFormulas] = useState(false);

  useEffect(() => {
    if (selectedClient && !loadingFormulas && !hasLoadedFormulas) {
      const copperFormulas = formulas.filter(f => f.category === 'copper' && f.is_active);
      const goldFormulas = formulas.filter(f => f.category === 'gold' && f.is_active);
      const silverFormulas = formulas.filter(f => f.category === 'silver' && f.is_active);

      onFormulasLoad(copperFormulas, goldFormulas, silverFormulas);
      loadDefaultSettings();
      setHasLoadedFormulas(true);
    }
  }, [selectedClient, formulas, loadingFormulas, hasLoadedFormulas, onFormulasLoad]);

  const loadDefaultSettings = async () => {
    if (!selectedClient || !onDefaultSettingsLoad) return;

    try {
      const { data } = await supabase
        .from('client_default_settings')
        .select('*')
        .eq('client_id', selectedClient.id)
        .maybeSingle();

      onDefaultSettingsLoad(data);
    } catch (error) {
      console.error('Failed to load default settings:', error);
      onDefaultSettingsLoad(null);
    }
  };

  useEffect(() => {
    if (selectedClient) {
      setHasLoadedFormulas(false);
    }
  }, [selectedClient]);

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        onClientChange({ id: client.id, name: client.name });
      }
    } else {
      onClientChange(null);
    }
  };

  const clientOptions = [
    { value: '', label: 'Select a client...' },
    ...clients.map(client => ({ value: client.id, label: client.name }))
  ];

  return (
    <Card title="Client Selection">
      <div className="space-y-4">
        <Select
          label="Select Client for Calculations"
          options={clientOptions}
          value={selectedClient?.id || ''}
          onChange={handleClientChange}
          disabled={loadingClients}
        />

        {selectedClient && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Active Client:</span> {selectedClient.name}
            </p>
            {loadingFormulas ? (
              <p className="text-xs text-blue-600 mt-1">Loading client formulas...</p>
            ) : (
              <p className="text-xs text-blue-600 mt-1">
                Using {formulas.filter(f => f.is_active).length} active formula(s) from this client
              </p>
            )}
          </div>
        )}

        {!selectedClient && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              Select a client to use their custom formulas for calculations.
              If no client is selected, default formulas will be used.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

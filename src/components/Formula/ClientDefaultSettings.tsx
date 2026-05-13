import { useState, useEffect } from 'react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ClientDefaultSettings, ClientFormula } from '../../types/formula';

interface ClientDefaultSettingsProps {
  clientId: string;
  clientName: string;
  availableFormulas: ClientFormula[];
}

export function ClientDefaultSettingsManager({
  clientId,
  clientName,
  availableFormulas,
}: ClientDefaultSettingsProps) {
  const [settings, setSettings] = useState<Partial<ClientDefaultSettings>>({
    default_copper_formula_id: null,
    default_gold_formula_id: null,
    default_silver_formula_id: null,
    default_treatment_charge: 0,
    default_copper_refining: 0,
    default_gold_refining: 0,
    default_silver_refining: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [clientId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('client_default_settings')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Convert empty strings to null for formula IDs
      const settingsData = {
        client_id: clientId,
        default_copper_formula_id: settings.default_copper_formula_id || null,
        default_gold_formula_id: settings.default_gold_formula_id || null,
        default_silver_formula_id: settings.default_silver_formula_id || null,
        default_treatment_charge: Number(settings.default_treatment_charge) || 0,
        default_copper_refining: Number(settings.default_copper_refining) || 0,
        default_gold_refining: Number(settings.default_gold_refining) || 0,
        default_silver_refining: Number(settings.default_silver_refining) || 0,
        updated_at: new Date().toISOString(),
      };

      const { data: existing, error: checkError } = await supabase
        .from('client_default_settings')
        .select('id')
        .eq('client_id', clientId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing settings:', checkError);
        throw checkError;
      }

      let result;
      if (existing) {
        result = await supabase
          .from('client_default_settings')
          .update(settingsData)
          .eq('client_id', clientId);
      } else {
        result = await supabase
          .from('client_default_settings')
          .insert([settingsData]);
      }

      if (result.error) {
        console.error('Save error:', result.error);
        throw result.error;
      }

      alert('Default settings saved successfully!');
      await loadSettings(); // Reload to confirm
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(`Failed to save settings: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const copperFormulas = availableFormulas.filter((f) => f.category === 'copper');
  const goldFormulas = availableFormulas.filter((f) => f.category === 'gold');
  const silverFormulas = availableFormulas.filter((f) => f.category === 'silver');

  const copperOptions = [
    { value: '', label: 'None (use manual selection)' },
    ...copperFormulas.map((f) => ({ value: f.id, label: f.name })),
  ];

  const goldOptions = [
    { value: '', label: 'None (use manual selection)' },
    ...goldFormulas.map((f) => ({ value: f.id, label: f.name })),
  ];

  const silverOptions = [
    { value: '', label: 'None (use manual selection)' },
    ...silverFormulas.map((f) => ({ value: f.id, label: f.name })),
  ];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <Card
      title={`Default Settings for ${clientName}`}
      headerAction={
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            These default values will auto-populate when this client is selected in the Input tab. Users can still override them manually.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Formulas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Default Copper Formula"
              options={copperOptions}
              value={settings.default_copper_formula_id || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  default_copper_formula_id: e.target.value || null,
                })
              }
            />
            <Select
              label="Default Gold Formula"
              options={goldOptions}
              value={settings.default_gold_formula_id || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  default_gold_formula_id: e.target.value || null,
                })
              }
            />
            <Select
              label="Default Silver Formula"
              options={silverOptions}
              value={settings.default_silver_formula_id || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  default_silver_formula_id: e.target.value || null,
                })
              }
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Deductions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Treatment Charge ($/MT)"
              type="number"
              value={settings.default_treatment_charge || 0}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  default_treatment_charge: parseFloat(e.target.value) || 0,
                })
              }
            />
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Refining Charges</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Copper Refining"
                  type="number"
                  value={settings.default_copper_refining || 0}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      default_copper_refining: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <Input
                  label="Gold Refining"
                  type="number"
                  value={settings.default_gold_refining || 0}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      default_gold_refining: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <Input
                  label="Silver Refining"
                  type="number"
                  value={settings.default_silver_refining || 0}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      default_silver_refining: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

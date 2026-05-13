import { useEffect } from 'react';
import { Card } from '../UI/Card';
import { Select } from '../UI/Select';
import type { FormulaData } from '../../types';
import type { ClientFormula } from '../../types/formula';

interface FormulasFormProps {
  data: FormulaData;
  onChange: (data: FormulaData) => void;
  clientFormulas?: {
    copper: ClientFormula[];
    gold: ClientFormula[];
    silver: ClientFormula[];
  };
}

const defaultCopperFormulas = [
  { value: 'Pay 96.5% Min Deduction 1.5%', label: 'Pay 96.5% Min Deduction 1.5%' },
  { value: 'Pay 95% Min Deduction 1 unit', label: 'Pay 95% Min Deduction 1 unit' },
  { value: 'Pay 97% Min Deduction 1%', label: 'Pay 97% Min Deduction 1%' },
  { value: 'Pay 95% Min Deduction 1.5%', label: 'Pay 95% Min Deduction 1.5%' },
];

const defaultGoldFormulas = [
  { value: 'Above 1g/MT 90%', label: 'Above 1g/MT 90%' },
  { value: 'Above 0.5g/MT 95%', label: 'Above 0.5g/MT 95%' },
  { value: 'Above 1g/MT 95%', label: 'Above 1g/MT 95%' },
  { value: 'Above 0.5g/MT 90%', label: 'Above 0.5g/MT 90%' },
];

const defaultSilverFormulas = [
  { value: 'Above 30g/MT 90%', label: 'Above 30g/MT 90%' },
  { value: 'Above 50g/MT 85%', label: 'Above 50g/MT 85%' },
  { value: 'Above 30g/MT 95%', label: 'Above 30g/MT 95%' },
  { value: 'Above 20g/MT 90%', label: 'Above 20g/MT 90%' },
];

export function FormulasForm({ data, onChange, clientFormulas }: FormulasFormProps) {
  const copperFormulas = clientFormulas?.copper.length
    ? clientFormulas.copper.map(f => ({ value: f.id, label: f.name }))
    : defaultCopperFormulas;

  const goldFormulas = clientFormulas?.gold.length
    ? clientFormulas.gold.map(f => ({ value: f.id, label: f.name }))
    : defaultGoldFormulas;

  const silverFormulas = clientFormulas?.silver.length
    ? clientFormulas.silver.map(f => ({ value: f.id, label: f.name }))
    : defaultSilverFormulas;

  useEffect(() => {
    if (clientFormulas) {
      const updates: Partial<FormulaData> = {};

      if (clientFormulas.copper.length > 0 && !clientFormulas.copper.find(f => f.id === data.copper)) {
        updates.copper = clientFormulas.copper[0].id;
      }
      if (clientFormulas.gold.length > 0 && !clientFormulas.gold.find(f => f.id === data.gold)) {
        updates.gold = clientFormulas.gold[0].id;
      }
      if (clientFormulas.silver.length > 0 && !clientFormulas.silver.find(f => f.id === data.silver)) {
        updates.silver = clientFormulas.silver[0].id;
      }

      if (Object.keys(updates).length > 0) {
        onChange({ ...data, ...updates });
      }
    }
  }, [clientFormulas]);

  const handleChange = (field: keyof FormulaData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <Card title="Payable Metal Formulas">
      <div className="space-y-4">
        {clientFormulas && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Using client-specific formulas. If a category has no active formulas, default options will be shown.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Copper Formula"
            options={copperFormulas}
            value={data.copper}
            onChange={(e) => handleChange('copper', e.target.value)}
          />
          <Select
            label="Gold Formula"
            options={goldFormulas}
            value={data.gold}
            onChange={(e) => handleChange('gold', e.target.value)}
          />
          <Select
            label="Silver Formula"
            options={silverFormulas}
            value={data.silver}
            onChange={(e) => handleChange('silver', e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
}

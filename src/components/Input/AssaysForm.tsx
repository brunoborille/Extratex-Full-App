import React from 'react';
import { Input } from '../UI/Input';
import { Card } from '../UI/Card';
import type { AssayData } from '../../types';
import { FlaskConical } from 'lucide-react';

interface AssaysFormProps {
  data: AssayData;
  onChange: (data: AssayData) => void;
}

export function AssaysForm({ data, onChange }: AssaysFormProps) {
  const handleChange = (field: keyof AssayData, value: string) => {
    onChange({ ...data, [field]: parseFloat(value) || 0 });
  };

  const hasData = data.copper > 0 || data.gold > 0 || data.silver > 0;

  return (
    <Card
      title="Provisional Assays"
      subtitle="Metal content from laboratory analysis"
      accent="copper"
      headerAction={
        hasData ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            <FlaskConical size={11} />
            Data entered
          </span>
        ) : null
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Copper (Cu)</span>
          </div>
          <Input
            label="Cu Content"
            type="number"
            step="0.01"
            min="0"
            max="100"
            unit="%"
            value={data.copper || ''}
            onChange={(e) => handleChange('copper', e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Gold (Au)</span>
          </div>
          <Input
            label="Au Content"
            type="number"
            step="0.01"
            min="0"
            unit="g/DMT"
            value={data.gold || ''}
            onChange={(e) => handleChange('gold', e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-slate-400" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Silver (Ag)</span>
          </div>
          <Input
            label="Ag Content"
            type="number"
            step="0.01"
            min="0"
            unit="g/DMT"
            value={data.silver || ''}
            onChange={(e) => handleChange('silver', e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>
    </Card>
  );
}

import React from 'react';
import { Input } from '../UI/Input';
import { Card } from '../UI/Card';
import type { WeightData } from '../../types';
import { calculateDryWeight } from '../../utils/calculations';
import { Scale } from 'lucide-react';

interface WeightsFormProps {
  data: WeightData;
  onChange: (data: WeightData) => void;
}

export function WeightsForm({ data, onChange }: WeightsFormProps) {
  const handleChange = (field: keyof WeightData, value: string) => {
    const numValue = parseFloat(value) || 0;
    if (field === 'totalDryWeight') return;

    const newData = { ...data, [field]: numValue };
    if (field === 'totalWetWeight' || field === 'moisture') {
      newData.totalDryWeight = calculateDryWeight(
        field === 'totalWetWeight' ? numValue : data.totalWetWeight,
        field === 'moisture' ? numValue : data.moisture
      );
    }
    onChange(newData);
  };

  const moistureLoss = data.totalWetWeight - data.totalDryWeight;

  return (
    <Card
      title="Provisional Weights"
      subtitle="Wet and dry mass of concentrate shipment"
      accent="copper"
      headerAction={
        data.totalWetWeight > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
            <Scale size={11} />
            {data.totalDryWeight.toFixed(2)} MT dry
          </span>
        ) : null
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Input
          label="Total Wet Weight"
          type="number"
          step="0.01"
          min="0"
          unit="MT"
          value={data.totalWetWeight || ''}
          onChange={(e) => handleChange('totalWetWeight', e.target.value)}
          placeholder="0.00"
        />
        <Input
          label="Moisture Content"
          type="number"
          step="0.01"
          min="0"
          max="99.99"
          unit="%"
          value={data.moisture || ''}
          onChange={(e) => handleChange('moisture', e.target.value)}
          placeholder="0.00"
          hint="Auto-calculates dry weight"
        />
        <div>
          <Input
            label="Total Dry Weight"
            type="number"
            step="0.01"
            unit="MT"
            value={data.totalDryWeight.toFixed(2)}
            readOnly
          />
          {moistureLoss > 0 && (
            <p className="mt-1.5 text-xs text-amber-600 font-medium">
              -{moistureLoss.toFixed(2)} MT moisture loss
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

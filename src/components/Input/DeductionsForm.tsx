import React from 'react';
import { Input } from '../UI/Input';
import { Card } from '../UI/Card';
import type { DeductionData } from '../../types';

interface DeductionsFormProps {
  data: DeductionData;
  onChange: (data: DeductionData) => void;
}

export function DeductionsForm({ data, onChange }: DeductionsFormProps) {
  const handleTreatmentChange = (value: string) => {
    onChange({ ...data, treatmentCharge: parseFloat(value) || 0 });
  };

  const handleRefiningChange = (field: keyof DeductionData['refiningCharges'], value: string) => {
    onChange({
      ...data,
      refiningCharges: { ...data.refiningCharges, [field]: parseFloat(value) || 0 },
    });
  };

  return (
    <Card
      title="Deductions"
      subtitle="Treatment and refining charges applied against revenue"
      accent="silver"
    >
      <div className="space-y-5">
        <div>
          <p className="section-label">Treatment Charges</p>
          <div className="max-w-xs">
            <Input
              label="TC Rate"
              type="number"
              step="0.01"
              unit="$/MT"
              value={data.treatmentCharge || ''}
              onChange={(e) => handleTreatmentChange(e.target.value)}
              placeholder="0.00"
              hint="Applied to dry weight in MT"
            />
          </div>
        </div>

        <div>
          <p className="section-label">Refining Charges (RC)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Copper</span>
              </div>
              <Input
                label="Cu RC"
                type="number"
                step="0.0001"
                unit="$/lb"
                value={data.refiningCharges.copper || ''}
                onChange={(e) => handleRefiningChange('copper', e.target.value)}
                placeholder="0.0000"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Silver</span>
              </div>
              <Input
                label="Ag RC"
                type="number"
                step="0.0001"
                unit="$/lb"
                value={data.refiningCharges.silver || ''}
                onChange={(e) => handleRefiningChange('silver', e.target.value)}
                placeholder="0.0000"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Gold</span>
              </div>
              <Input
                label="Au RC"
                type="number"
                step="0.0001"
                unit="$/lb"
                value={data.refiningCharges.gold || ''}
                onChange={(e) => handleRefiningChange('gold', e.target.value)}
                placeholder="0.0000"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

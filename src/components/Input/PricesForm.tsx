import React, { useState } from 'react';
import { Input } from '../UI/Input';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { RefreshCw, TrendingUp } from 'lucide-react';
import type { PriceData } from '../../types';

interface PricesFormProps {
  data: PriceData;
  onChange: (data: PriceData) => void;
  onToast?: (message: string, type: 'success' | 'error') => void;
}

export function PricesForm({ data, onChange, onToast }: PricesFormProps) {
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof PriceData, value: string) => {
    onChange({ ...data, [field]: parseFloat(value) || 0 });
  };

  const fetchLivePrices = async () => {
    setLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-metal-prices`;
      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
      });
      const result = await response.json();
      if (result.success && result.prices) {
        onChange({
          copper: result.prices.copper || data.copper,
          gold: result.prices.gold || data.gold,
          silver: result.prices.silver || data.silver,
        });
        onToast?.('Live metal prices updated successfully', 'success');
      } else {
        onToast?.(`Failed to fetch live prices: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      onToast?.(`Error fetching prices: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const hasLivePrices = data.copper > 0 || data.gold > 0 || data.silver > 0;

  return (
    <Card
      title="Provisional Prices"
      subtitle="Metal exchange prices for valuation"
      accent="gold"
      headerAction={
        <div className="flex items-center gap-2">
          {hasLivePrices && (
            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
              <TrendingUp size={12} />
              Prices set
            </span>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchLivePrices}
            loading={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Live Prices
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Copper</span>
          </div>
          <Input
            label="Cu Price"
            type="number"
            step="0.01"
            min="0"
            unit="$/MT"
            value={data.copper || ''}
            onChange={(e) => handleChange('copper', e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Gold</span>
          </div>
          <Input
            label="Au Price"
            type="number"
            step="0.01"
            min="0"
            unit="$/Oz"
            value={data.gold || ''}
            onChange={(e) => handleChange('gold', e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-slate-400" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Silver</span>
          </div>
          <Input
            label="Ag Price"
            type="number"
            step="0.01"
            min="0"
            unit="$/Oz"
            value={data.silver || ''}
            onChange={(e) => handleChange('silver', e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>
    </Card>
  );
}

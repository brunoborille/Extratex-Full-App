import { useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Plus } from 'lucide-react';

interface SupplierFormProps {
  onAddSupplier: (name: string, profitMargin: number, usdBrlRate: number) => Promise<void>;
}

export function SupplierForm({ onAddSupplier }: SupplierFormProps) {
  const [name, setName] = useState('');
  const [profitMargin, setProfitMargin] = useState('40');
  const [usdBrlRate, setUsdBrlRate] = useState('5.0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a supplier name');
      return;
    }

    const margin = parseFloat(profitMargin);
    const rate = parseFloat(usdBrlRate);

    if (isNaN(margin) || margin < 0 || margin > 100) {
      alert('Profit margin must be between 0 and 100');
      return;
    }

    if (isNaN(rate) || rate <= 0) {
      alert('Exchange rate must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddSupplier(name.trim(), margin, rate);
      setName('');
      setProfitMargin('40');
      setUsdBrlRate('5.0');
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert('Failed to add supplier. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <Input
          label="Supplier Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Andre"
          required
        />
        <Input
          label="Profit Margin (%)"
          type="number"
          value={profitMargin}
          onChange={(e) => setProfitMargin(e.target.value)}
          min="0"
          max="100"
          step="0.1"
          required
        />
        <Input
          label="USD/BRL Exchange Rate"
          type="number"
          value={usdBrlRate}
          onChange={(e) => setUsdBrlRate(e.target.value)}
          min="0.01"
          step="0.01"
          required
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="primary"
          size="md"
        >
          <Plus size={18} />
          {isSubmitting ? 'Adding...' : 'Add Supplier'}
        </Button>
      </div>
    </form>
  );
}

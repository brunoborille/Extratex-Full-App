import React, { useState } from 'react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Modal } from '../UI/Modal';
import { Plus, Building2 } from 'lucide-react';
import { useClients } from '../../hooks/useFormulas';

interface ClientSelectorProps {
  onSelectClient: (clientId: string, clientName: string) => void;
}

export function ClientSelector({ onSelectClient }: ClientSelectorProps) {
  const { clients, loading, saveClient } = useClients();
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCode, setNewClientCode] = useState('');

  const handleAddClient = async () => {
    if (!newClientName.trim() || !newClientCode.trim()) {
      alert('Please enter both client name and code');
      return;
    }

    try {
      await saveClient({
        name: newClientName,
        code: newClientCode.toUpperCase(),
        active: true,
      });
      setShowAddClient(false);
      setNewClientName('');
      setNewClientCode('');
    } catch (error) {
      alert('Failed to create client');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Select Client</h2>
          <p className="text-sm text-gray-600">Choose a client to manage their formulas</p>
        </div>
        <Button onClick={() => setShowAddClient(true)}>
          <Plus size={20} />
          New Client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <button
            key={client.id}
            onClick={() => onSelectClient(client.id, client.name)}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <div className="flex items-start gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 size={24} className="text-blue-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{client.name}</h3>
                <p className="text-sm text-gray-600 mb-2">Code: {client.code}</p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    client.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {client.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {clients.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No clients found. Create your first client to get started.</p>
            <Button onClick={() => setShowAddClient(true)}>
              Create First Client
            </Button>
          </div>
        </Card>
      )}

      <Modal
        isOpen={showAddClient}
        onClose={() => setShowAddClient(false)}
        title="Add New Client"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddClient(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleAddClient}>
              Create Client
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Client Name"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            placeholder="e.g., Acme Mining Corp"
          />
          <Input
            label="Client Code"
            value={newClientCode}
            onChange={(e) => setNewClientCode(e.target.value.toUpperCase())}
            placeholder="e.g., AMC"
          />
        </div>
      </Modal>
    </div>
  );
}

import React, { useState } from 'react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import { Plus, Edit, Trash2, Clock, Copy, Settings } from 'lucide-react';
import { FormulaBuilder } from './FormulaBuilder';
import { FormulaVersionHistory } from './FormulaVersionHistory';
import { ClientDefaultSettingsManager } from './ClientDefaultSettings';
import { useFormulas } from '../../hooks/useFormulas';
import type { ClientFormula } from '../../types/formula';

interface FormulaManagerProps {
  clientId: string;
  clientName: string;
}

export function FormulaManager({ clientId, clientName }: FormulaManagerProps) {
  const { formulas, templates, loading, saveFormula, updateFormula, deleteFormula } = useFormulas(clientId);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingFormula, setEditingFormula] = useState<ClientFormula | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeView, setActiveView] = useState<'formulas' | 'settings'>('formulas');

  const handleSave = async (formula: Partial<ClientFormula>) => {
    try {
      const formulaData = {
        ...formula,
        client_id: clientId,
      };
      delete formulaData.created_at;
      delete formulaData.updated_at;

      if (editingFormula?.id) {
        await updateFormula(editingFormula.id, formulaData);
      } else {
        delete formulaData.id;
        await saveFormula(formulaData);
      }

      setShowBuilder(false);
      setEditingFormula(null);
    } catch (error) {
      console.error('Failed to save formula:', error);
      alert('Failed to save formula');
    }
  };

  const handleEdit = (formula: ClientFormula) => {
    setEditingFormula(formula);
    setShowBuilder(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this formula?')) {
      try {
        await deleteFormula(id);
      } catch (error) {
        alert('Failed to delete formula');
      }
    }
  };

  const handleDuplicate = async (formula: ClientFormula) => {
    const duplicate: Partial<ClientFormula> = {
      ...formula,
      name: `${formula.name} (Copy)`,
    };
    delete duplicate.id;
    delete duplicate.created_at;
    delete duplicate.updated_at;
    setEditingFormula(duplicate as ClientFormula);
    setShowBuilder(true);
  };

  const handleViewHistory = (formulaId: string) => {
    setSelectedFormulaId(formulaId);
    setShowVersionHistory(true);
  };

  const handleUseTemplate = (template: any) => {
    setEditingFormula({
      id: '',
      client_id: clientId,
      name: template.name,
      description: template.description,
      category: template.category,
      formula_type: template.formula_type,
      expression: template.expression,
      variables: template.variables,
      parameters: {},
      is_active: true,
      validation_rules: [],
      test_cases: [],
      created_by: 'current_user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setShowBuilder(true);
  };

  const filteredFormulas = filterCategory === 'all'
    ? formulas
    : formulas.filter(f => f.category === filterCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formula Manager</h2>
          <p className="text-sm text-gray-600">Client: {clientName}</p>
        </div>
        {activeView === 'formulas' && (
          <Button onClick={() => setShowBuilder(true)}>
            <Plus size={20} />
            Create Formula
          </Button>
        )}
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveView('formulas')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeView === 'formulas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Formulas
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeView === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings size={18} />
            Default Settings
          </button>
        </nav>
      </div>

      {activeView === 'settings' && (
        <ClientDefaultSettingsManager
          clientId={clientId}
          clientName={clientName}
          availableFormulas={formulas.filter(f => f.is_active)}
        />
      )}

      {activeView === 'formulas' && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter by category:</span>
            {['all', 'copper', 'gold', 'silver', 'treatment', 'refining', 'custom'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </>
      )}

      {activeView === 'formulas' && templates.length > 0 && (
        <Card title="Formula Templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map((template) => (
              <div key={template.id} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>
                    <p className="text-xs text-gray-600">{template.category}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleUseTemplate(template)}>
                    <Plus size={14} />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                <code className="text-xs bg-gray-50 p-1 rounded block truncate">{template.expression}</code>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeView === 'formulas' && (
        <Card title="Client Formulas">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading formulas...</p>
          </div>
        ) : filteredFormulas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No formulas found. Create your first formula to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFormulas.map((formula) => (
              <div key={formula.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{formula.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          formula.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {formula.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {formula.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{formula.description}</p>
                    <div className="bg-gray-50 p-2 rounded">
                      <code className="text-xs text-gray-800 font-mono">{formula.expression}</code>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>{formula.variables.length} variables</span>
                      <span>•</span>
                      <span>Type: {formula.formula_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="ghost" onClick={() => handleViewHistory(formula.id)} title="Version History">
                      <Clock size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDuplicate(formula)} title="Duplicate">
                      <Copy size={16} />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleEdit(formula)}>
                      <Edit size={16} />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(formula.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </Card>
      )}

      <Modal
        isOpen={showBuilder}
        onClose={() => {
          setShowBuilder(false);
          setEditingFormula(null);
        }}
        title={editingFormula?.id ? 'Edit Formula' : 'Create New Formula'}
      >
        <FormulaBuilder
          initialFormula={editingFormula || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowBuilder(false);
            setEditingFormula(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showVersionHistory}
        onClose={() => {
          setShowVersionHistory(false);
          setSelectedFormulaId(null);
        }}
        title="Version History"
      >
        {selectedFormulaId && <FormulaVersionHistory formulaId={selectedFormulaId} />}
      </Modal>
    </div>
  );
}

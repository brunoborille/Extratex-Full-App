import React, { useState, useEffect } from 'react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Plus, X, Play, Info, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { FormulaParser } from '../../utils/formulaParser';
import type { FormulaVariable, ClientFormula } from '../../types/formula';

interface FormulaBuilderProps {
  initialFormula?: Partial<ClientFormula>;
  onSave: (formula: Partial<ClientFormula>) => void;
  onCancel: () => void;
}

export function FormulaBuilder({ initialFormula, onSave, onCancel }: FormulaBuilderProps) {
  const [name, setName] = useState(initialFormula?.name || '');
  const [description, setDescription] = useState(initialFormula?.description || '');
  const [category, setCategory] = useState(initialFormula?.category || 'copper');
  const [formulaType, setFormulaType] = useState(initialFormula?.formula_type || 'percentage');
  const [expression, setExpression] = useState(initialFormula?.expression || '');
  const [variables, setVariables] = useState<FormulaVariable[]>(initialFormula?.variables || []);
  const [errors, setErrors] = useState<string[]>([]);
  const [testInputs, setTestInputs] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState<number | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  useEffect(() => {
    validateFormula();
  }, [expression, variables]);

  const validateFormula = () => {
    const validation = FormulaParser.validateExpression(expression, variables);
    setErrors(validation.errors);
  };

  const addVariable = () => {
    setVariables([
      ...variables,
      {
        name: `var${variables.length + 1}`,
        type: 'number',
        description: '',
        required: true,
      },
    ]);
  };

  const updateVariable = (index: number, field: keyof FormulaVariable, value: any) => {
    const newVariables = [...variables];
    newVariables[index] = { ...newVariables[index], [field]: value };
    setVariables(newVariables);
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const testFormula = () => {
    const result = FormulaParser.evaluate(expression, testInputs);
    if (result.error) {
      setTestError(result.error);
      setTestResult(null);
    } else {
      setTestResult(result.result);
      setTestError(null);
    }
  };

  const handleSave = () => {
    if (errors.length > 0) {
      alert('Please fix validation errors before saving');
      return;
    }

    const formula: Partial<ClientFormula> = {
      ...initialFormula,
      name,
      description,
      category: category as any,
      formula_type: formulaType as any,
      expression,
      variables,
      is_active: true,
      created_by: 'current_user',
    };

    onSave(formula);
  };

  const categoryOptions = [
    { value: 'copper', label: 'Copper' },
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'treatment', label: 'Treatment' },
    { value: 'refining', label: 'Refining' },
    { value: 'custom', label: 'Custom' },
  ];

  const typeOptions = [
    { value: 'percentage', label: 'Percentage-based' },
    { value: 'threshold', label: 'Threshold-based' },
    { value: 'deduction', label: 'Deduction-based' },
    { value: 'custom', label: 'Custom' },
  ];

  const commonExamples = [
    {
      name: 'Simple Percentage',
      expression: 'assay * 0.95',
      variables: [{ name: 'assay', type: 'number' as const, description: 'Metal assay %', required: true }],
      description: 'Apply a 95% recovery rate to the assay'
    },
    {
      name: 'Deduction with Threshold',
      expression: 'IF(assay > 1, assay - 1, 0)',
      variables: [{ name: 'assay', type: 'number' as const, description: 'Metal assay %', required: true }],
      description: 'Deduct 1% if assay is greater than 1%'
    },
    {
      name: 'Weight-based Calculation',
      expression: '(assay / 100) * wetWeight * (1 - moisture / 100)',
      variables: [
        { name: 'assay', type: 'number' as const, description: 'Metal assay %', required: true },
        { name: 'wetWeight', type: 'number' as const, description: 'Wet weight (MT)', required: true },
        { name: 'moisture', type: 'number' as const, description: 'Moisture %', required: true }
      ],
      description: 'Calculate metal content with moisture adjustment'
    }
  ];

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return name.trim() !== '' && description.trim() !== '';
      case 2:
        return variables.length > 0 && variables.every(v => v.name.trim() !== '');
      case 3:
        return expression.trim() !== '' && errors.length === 0;
      case 4:
        return testResult !== null && testError === null;
      default:
        return false;
    }
  };

  const useExample = (example: typeof commonExamples[0]) => {
    setExpression(example.expression);
    setVariables(example.variables);
    setShowExamples(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="text-blue-600 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Formula Builder Guide</h3>
            <p className="text-sm text-blue-800 mb-3">
              Create custom formulas in 4 simple steps. Use variables, operators, and functions to build your calculation logic.
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowExamples(!showExamples)}
              className="bg-white"
            >
              {showExamples ? 'Hide Examples' : 'View Examples'}
            </Button>
          </div>
        </div>

        {showExamples && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">Common Formula Examples:</h4>
            <div className="grid grid-cols-1 gap-3">
              {commonExamples.map((example, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-gray-900">{example.name}</h5>
                      <p className="text-sm text-gray-600">{example.description}</p>
                    </div>
                    <Button size="sm" onClick={() => useExample(example)}>
                      Use This
                    </Button>
                  </div>
                  <code className="text-xs bg-gray-50 px-2 py-1 rounded block mt-2">{example.expression}</code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${isStepComplete(1) ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
            {isStepComplete(1) ? <CheckCircle size={16} /> : '1'}
          </div>
          <h3 className="font-semibold text-gray-900">Basic Information</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Formula Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Premium Copper Payment"
              required
            />
            <Select
              label="Category"
              options={categoryOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            />
          </div>
          <Select
            label="Formula Type"
            options={typeOptions}
            value={formulaType}
            onChange={(e) => setFormulaType(e.target.value as any)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Explain what this formula calculates and when to use it..."
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${isStepComplete(2) ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
              {isStepComplete(2) ? <CheckCircle size={16} /> : '2'}
            </div>
            <h3 className="font-semibold text-gray-900">Define Variables</h3>
          </div>
          <Button size="sm" onClick={addVariable}>
            <Plus size={16} />
            Add Variable
          </Button>
        </div>
        <div className="p-6">
          {variables.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600 font-medium mb-1">No variables defined</p>
              <p className="text-sm text-gray-500 mb-4">Variables are the inputs your formula will use (e.g., assay, weight, price)</p>
              <Button size="sm" onClick={addVariable}>Add Your First Variable</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {variables.map((variable, index) => (
                <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">Variable {index + 1}</span>
                    <button
                      onClick={() => removeVariable(index)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                      title="Remove variable"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="Name"
                      value={variable.name}
                      onChange={(e) => updateVariable(index, 'name', e.target.value)}
                      placeholder="e.g., assay"
                      required
                    />
                    <Select
                      label="Type"
                      options={[
                        { value: 'number', label: 'Number' },
                        { value: 'string', label: 'String' },
                        { value: 'boolean', label: 'Boolean' },
                      ]}
                      value={variable.type}
                      onChange={(e) => updateVariable(index, 'type', e.target.value)}
                    />
                    <Input
                      label="Description"
                      value={variable.description}
                      onChange={(e) => updateVariable(index, 'description', e.target.value)}
                      placeholder="e.g., Copper assay %"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${isStepComplete(3) ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
            {isStepComplete(3) ? <CheckCircle size={16} /> : '3'}
          </div>
          <h3 className="font-semibold text-gray-900">Write Formula Expression</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expression <span className="text-red-500">*</span>
            </label>
            <textarea
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
              rows={5}
              placeholder="e.g., (assay * 0.965 - 1.5) / 100 * dryWeight"
              required
            />
          </div>

          {errors.length > 0 && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-2">Validation Errors:</h4>
                  <ul className="space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700">{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {errors.length === 0 && expression && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-semibold text-green-800">Formula is valid</p>
                </div>
              </div>
            </div>
          )}

          <details className="bg-blue-50 border border-blue-200 rounded-lg">
            <summary className="px-4 py-3 cursor-pointer font-medium text-blue-900 hover:bg-blue-100 transition-colors">
              Available Functions & Operators
            </summary>
            <div className="px-4 pb-4 pt-2 text-sm text-blue-800 space-y-3">
              <div>
                <p className="font-semibold mb-1">Mathematical Functions:</p>
                <div className="bg-white rounded px-3 py-2 font-mono text-xs">
                  ABS(x), ROUND(x), SQRT(x), POW(base, exp)
                </div>
              </div>
              <div>
                <p className="font-semibold mb-1">Aggregate Functions:</p>
                <div className="bg-white rounded px-3 py-2 font-mono text-xs">
                  SUM(...), AVERAGE(...), MIN(...), MAX(...)
                </div>
              </div>
              <div>
                <p className="font-semibold mb-1">Conditional Logic:</p>
                <div className="bg-white rounded px-3 py-2 font-mono text-xs">
                  IF(condition, trueValue, falseValue)
                </div>
              </div>
              <div>
                <p className="font-semibold mb-1">Operators:</p>
                <div className="bg-white rounded px-3 py-2 font-mono text-xs">
                  + - * / ^ ( ) &gt; &lt; &gt;= &lt;= == !=
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${isStepComplete(4) ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
            {isStepComplete(4) ? <CheckCircle size={16} /> : '4'}
          </div>
          <h3 className="font-semibold text-gray-900">Test Your Formula</h3>
        </div>
        <div className="p-6 space-y-4">
          {variables.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <Info className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-sm text-gray-600">Add variables in Step 2 to enable testing</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600">Enter sample values to verify your formula works correctly:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {variables.map((variable) => (
                  <Input
                    key={variable.name}
                    label={variable.name}
                    type={variable.type === 'number' ? 'number' : 'text'}
                    value={testInputs[variable.name] || ''}
                    onChange={(e) =>
                      setTestInputs({
                        ...testInputs,
                        [variable.name]: variable.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value,
                      })
                    }
                    placeholder={variable.description || `Enter ${variable.name}`}
                  />
                ))}
              </div>

              <Button
                onClick={testFormula}
                className="flex items-center gap-2 w-full justify-center"
                disabled={errors.length > 0 || !expression}
              >
                <Play size={18} />
                Run Test
              </Button>

              {testResult !== null && (
                <div className="p-5 bg-green-50 border-l-4 border-green-500 rounded">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="text-sm font-medium text-green-800 mb-1">Test Successful</p>
                      <p className="text-3xl font-bold text-green-700">{testResult.toFixed(4)}</p>
                    </div>
                  </div>
                </div>
              )}

              {testError && (
                <div className="p-5 bg-red-50 border-l-4 border-red-500 rounded">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-1">Test Failed</p>
                      <p className="text-sm text-red-700">{testError}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onCancel} className="px-6">
          Cancel
        </Button>
        <div className="flex items-center gap-3">
          {errors.length > 0 && (
            <span className="text-sm text-red-600">Fix errors before saving</span>
          )}
          <Button
            variant="success"
            onClick={handleSave}
            disabled={errors.length > 0 || !name || !description || !expression}
            className="px-8"
          >
            Save Formula
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface Client {
  id: string;
  name: string;
  code: string;
  active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ClientDefaultSettings {
  id: string;
  client_id: string;
  default_copper_formula_id: string | null;
  default_gold_formula_id: string | null;
  default_silver_formula_id: string | null;
  default_treatment_charge: number;
  default_copper_refining: number;
  default_gold_refining: number;
  default_silver_refining: number;
  created_at: string;
  updated_at: string;
}

export interface FormulaVariable {
  name: string;
  type: 'number' | 'string' | 'boolean';
  description: string;
  defaultValue?: any;
  min?: number;
  max?: number;
  required?: boolean;
}

export interface FormulaTemplate {
  id: string;
  name: string;
  description: string;
  category: 'copper' | 'gold' | 'silver' | 'treatment' | 'refining' | 'custom';
  formula_type: 'percentage' | 'threshold' | 'deduction' | 'custom';
  expression: string;
  variables: FormulaVariable[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'min' | 'max' | 'range' | 'pattern';
  value: any;
  message: string;
}

export interface TestCase {
  name: string;
  inputs: Record<string, any>;
  expectedOutput: number;
  description?: string;
}

export interface ClientFormula {
  id: string;
  client_id: string;
  template_id?: string;
  name: string;
  description: string;
  category: 'copper' | 'gold' | 'silver' | 'treatment' | 'refining' | 'custom';
  formula_type: 'percentage' | 'threshold' | 'deduction' | 'custom';
  expression: string;
  variables: FormulaVariable[];
  parameters: Record<string, any>;
  is_active: boolean;
  validation_rules: ValidationRule[];
  test_cases: TestCase[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FormulaVersion {
  id: string;
  client_formula_id: string;
  version_number: number;
  expression: string;
  variables: FormulaVariable[];
  parameters: Record<string, any>;
  change_summary: string;
  changed_by: string;
  created_at: string;
}

export interface FormulaTestResult {
  id: string;
  client_formula_id: string;
  test_inputs: Record<string, any>;
  expected_output: number | null;
  actual_output: number | null;
  passed: boolean;
  error_message: string | null;
  tested_at: string;
  tested_by: string;
}

export interface FormulaBuilderState {
  expression: string;
  variables: FormulaVariable[];
  parameters: Record<string, any>;
  errors: string[];
  isValid: boolean;
}

import type { FormulaVariable } from '../types/formula';

export class FormulaParser {
  private static operators = ['+', '-', '*', '/', '^', '(', ')'];
  private static functions = ['IF', 'SUM', 'AVERAGE', 'MIN', 'MAX', 'ABS', 'ROUND', 'SQRT', 'POW'];

  static validateExpression(expression: string, variables: FormulaVariable[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!expression || expression.trim() === '') {
      errors.push('Expression cannot be empty');
      return { isValid: false, errors };
    }

    const variableNames = variables.map(v => v.name);
    const tokens = this.tokenize(expression);

    let parenthesesCount = 0;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token === '(') {
        parenthesesCount++;
      } else if (token === ')') {
        parenthesesCount--;
        if (parenthesesCount < 0) {
          errors.push('Mismatched parentheses');
        }
      }

      if (this.isVariable(token) && !variableNames.includes(token) && !this.isNumber(token)) {
        if (!this.functions.includes(token.toUpperCase())) {
          errors.push(`Unknown variable or function: ${token}`);
        }
      }
    }

    if (parenthesesCount !== 0) {
      errors.push('Mismatched parentheses');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static evaluate(
    expression: string,
    variables: Record<string, any>
  ): { result: number | null; error: string | null } {
    try {
      let sanitizedExpression = expression;

      Object.keys(variables).forEach(varName => {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        sanitizedExpression = sanitizedExpression.replace(regex, String(variables[varName]));
      });

      sanitizedExpression = sanitizedExpression.replace(/IF\s*\(/gi, 'IF(');
      sanitizedExpression = this.replaceCustomFunctions(sanitizedExpression);

      const result = this.safeEval(sanitizedExpression);
      return { result, error: null };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : 'Evaluation error',
      };
    }
  }

  private static findMatchingParen(str: string, start: number): number {
    let depth = 0;
    for (let i = start; i < str.length; i++) {
      if (str[i] === '(') depth++;
      else if (str[i] === ')') {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  private static splitArgs(str: string): string[] {
    const args: string[] = [];
    let depth = 0;
    let current = '';
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (ch === ',' && depth === 0) {
        args.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) args.push(current.trim());
    return args;
  }

  private static replaceIFs(expression: string): string {
    const pattern = /IF\s*\(/gi;
    let match: RegExpExecArray | null;
    let result = expression;

    for (let safety = 0; safety < 20; safety++) {
      pattern.lastIndex = 0;
      match = pattern.exec(result);
      if (!match) break;

      const funcStart = match.index;
      const argsStart = funcStart + match[0].length;
      const parenEnd = this.findMatchingParen(result, argsStart - 1);
      if (parenEnd === -1) break;

      const argsStr = result.substring(argsStart, parenEnd);
      const args = this.splitArgs(argsStr);

      if (args.length === 3) {
        const replacement = `((${args[0]}) ? (${args[1]}) : (${args[2]}))`;
        result = result.substring(0, funcStart) + replacement + result.substring(parenEnd + 1);
      } else {
        break;
      }
    }

    return result;
  }

  private static replaceCustomFunctions(expression: string): string {
    expression = this.replaceIFs(expression);

    expression = expression.replace(/SUM\s*\(([^)]+)\)/gi, (_match, args) => {
      const values = args.split(',').map((v: string) => v.trim());
      return `(${values.join(' + ')})`;
    });

    expression = expression.replace(/AVERAGE\s*\(([^)]+)\)/gi, (_match, args) => {
      const values = args.split(',').map((v: string) => v.trim());
      return `((${values.join(' + ')}) / ${values.length})`;
    });

    expression = expression.replace(/MIN\s*\(([^)]+)\)/gi, (_match, args) => {
      const values = args.split(',').map((v: string) => v.trim());
      return `Math.min(${values.join(', ')})`;
    });

    expression = expression.replace(/MAX\s*\(([^)]+)\)/gi, (_match, args) => {
      const values = args.split(',').map((v: string) => v.trim());
      return `Math.max(${values.join(', ')})`;
    });

    expression = expression.replace(/ABS\s*\(([^)]+)\)/gi, 'Math.abs($1)');
    expression = expression.replace(/ROUND\s*\(([^)]+)\)/gi, 'Math.round($1)');
    expression = expression.replace(/SQRT\s*\(([^)]+)\)/gi, 'Math.sqrt($1)');
    expression = expression.replace(/POW\s*\(([^,]+),\s*([^)]+)\)/gi, 'Math.pow($1, $2)');

    expression = expression.replace(/\^/g, '**');

    return expression;
  }

  private static safeEval(expression: string): number {
    const allowedChars = /^[0-9+\-*/.() \t\n<>=!&|?:,]+$/;
    if (!allowedChars.test(expression) && !expression.includes('Math.')) {
      throw new Error('Invalid characters in expression');
    }

    const func = new Function(`return ${expression}`);
    const result = func();

    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error('Expression did not evaluate to a valid number');
    }

    return result;
  }

  private static tokenize(expression: string): string[] {
    const tokens: string[] = [];
    let currentToken = '';

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];

      if (char === ' ' || char === '\t' || char === '\n') {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = '';
        }
        continue;
      }

      if (this.operators.includes(char)) {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = '';
        }
        tokens.push(char);
      } else {
        currentToken += char;
      }
    }

    if (currentToken) {
      tokens.push(currentToken);
    }

    return tokens;
  }

  private static isVariable(token: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token);
  }

  private static isNumber(token: string): boolean {
    return !isNaN(parseFloat(token)) && isFinite(parseFloat(token));
  }

  static extractVariables(expression: string): string[] {
    const tokens = this.tokenize(expression);
    const variables = new Set<string>();

    tokens.forEach(token => {
      if (this.isVariable(token) && !this.functions.includes(token.toUpperCase())) {
        variables.add(token);
      }
    });

    return Array.from(variables);
  }

  static formatExpression(expression: string): string {
    return expression
      .replace(/\s+/g, ' ')
      .replace(/\s*([+\-*/^(),])\s*/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

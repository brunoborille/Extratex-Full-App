# Formula Management System - User Guide

## Overview

Your copper ore valuation platform now includes a comprehensive **Formula Management System** that allows you to create, manage, and test client-specific calculation formulas.

## Features

### ✅ Implemented Features

1. **Client-Specific Formulas** - Each client can have their own custom formulas
2. **Formula Builder** - Visual interface to create and edit formulas
3. **Real-time Validation** - Instant error detection and syntax checking
4. **Formula Testing** - Test formulas with sample data before deployment
5. **Version History** - Track all changes to formulas over time
6. **Formula Templates** - 7 pre-built templates for common scenarios
7. **Category Filtering** - Organize formulas by type (copper, gold, silver, etc.)
8. **Formula Duplication** - Clone formulas to create variations

## How to Use

### 1. Access Formula Management

1. Click the **"Formulas"** tab in the main navigation (with the Settings icon)
2. You'll see the Client Selector screen

### 2. Create or Select a Client

**To create a new client:**
- Click "New Client" button
- Enter client name (e.g., "Acme Mining Corp")
- Enter client code (e.g., "AMC")
- Click "Create Client"

**To select an existing client:**
- Click on any client card to manage their formulas

### 3. Create a Formula

Once you've selected a client:

1. Click the **"Create Formula"** button
2. Or click the **"+"** button on any template to use it as a starting point

### 4. Build Your Formula

**Formula Details:**
- **Name**: Give your formula a descriptive name
- **Category**: Choose the category (copper, gold, silver, treatment, refining, custom)
- **Type**: Select formula type (percentage, threshold, deduction, custom)
- **Description**: Explain what the formula does

**Formula Expression:**
- Write your mathematical expression
- Use variables (define them in the next section)
- Supported operations: +, -, *, /, ^ (power), parentheses
- Supported functions:
  - `IF(condition, trueValue, falseValue)` - Conditional logic
  - `SUM(...)` - Sum multiple values
  - `AVERAGE(...)` - Calculate average
  - `MIN(...)`, `MAX(...)` - Find minimum/maximum
  - `ABS(...)`, `ROUND(...)`, `SQRT(...)`, `POW(base, exp)`

**Variables:**
- Click "Add Variable" to define formula inputs
- For each variable, specify:
  - Name (e.g., "assay", "dryWeight")
  - Type (number, string, boolean)
  - Description (helps users understand what it represents)

**Test Formula:**
- Enter sample values for each variable
- Click "Run Test" to see the result
- Fix any errors before saving

### 5. Save and Deploy

- Click "Save Formula" to store it
- The formula becomes active immediately
- All changes are automatically versioned

## Example Formulas

### Example 1: Premium Copper Payment
```
Category: Copper
Type: Percentage
Expression: (assay * 0.97 - 1) / 100 * dryWeight

Variables:
- assay (number) - Copper assay percentage
- dryWeight (number) - Total dry weight in MT

Description: Pays 97% of copper content with 1% minimum deduction
```

### Example 2: Gold Threshold
```
Category: Gold
Type: Threshold
Expression: IF(assay > 0.5, (assay * dryWeight / 31.1035) * 0.95, 0)

Variables:
- assay (number) - Gold assay g/DMT
- dryWeight (number) - Total dry weight in MT

Description: Only pays if gold content exceeds 0.5g/MT, then 95% of value
```

### Example 3: Volume-based Treatment Charge
```
Category: Treatment
Type: Custom
Expression: MIN(dryWeight * 80, 5000) + IF(dryWeight > 100, (dryWeight - 100) * 20, 0)

Variables:
- dryWeight (number) - Total dry weight in MT

Description: Base charge $80/MT capped at $5,000 + $20/MT premium for volume over 100MT
```

## Pre-built Templates

The system includes 7 ready-to-use templates:

**Copper Formulas:**
1. Pay 96.5% Min Deduction 1.5%
2. Pay 95% Min Deduction 1 unit
3. Pay 97% Min Deduction 1%

**Gold Formulas:**
4. Above 1g/MT 90%
5. Above 0.5g/MT 95%

**Silver Formulas:**
6. Above 30g/MT 90%
7. Above 50g/MT 85%

## Formula Management

### Edit a Formula
1. Click the pencil icon next to any formula
2. Make your changes
3. Click "Save Formula"
4. A new version is automatically created

### View Version History
1. Click the clock icon next to any formula
2. See all previous versions with change summaries
3. Review who made changes and when

### Duplicate a Formula
1. Click the copy icon next to any formula
2. The formula opens in the editor with "(Copy)" added to the name
3. Modify as needed and save

### Delete a Formula
1. Click the trash icon next to any formula
2. Confirm the deletion
3. Formula and all its versions are removed

### Filter Formulas
- Use the category filter buttons to show only specific types
- Choose from: All, Copper, Gold, Silver, Treatment, Refining, Custom

## Technical Details

### Database Schema

**5 Tables Created:**
- `clients` - Client information
- `formula_templates` - System-wide reusable templates
- `client_formulas` - Client-specific formulas
- `formula_versions` - Complete version history
- `formula_test_results` - Test execution history

### Security

- **Row Level Security (RLS)** enabled on all tables
- Client data isolation
- Secure formula evaluation (prevents code injection)
- Audit trail for all changes

### Components Created

```
src/
├── types/formula.ts                    # TypeScript definitions
├── utils/formulaParser.ts             # Calculation engine
├── hooks/useFormulas.ts               # Data management hooks
└── components/Formula/
    ├── ClientSelector.tsx             # Client selection interface
    ├── FormulaManager.tsx             # Formula management dashboard
    ├── FormulaBuilder.tsx             # Formula editor
    └── FormulaVersionHistory.tsx      # Version tracking viewer
```

## Best Practices

1. **Test Before Deploying** - Always test formulas with sample data
2. **Use Descriptive Names** - Make formula purposes clear
3. **Document Your Formulas** - Use the description field
4. **Start with Templates** - Modify existing templates when possible
5. **Version Control** - Review version history before major changes
6. **Organize by Category** - Keep formulas organized for easy management

## Troubleshooting

**Validation Errors:**
- Check that all variables used in the expression are defined
- Ensure parentheses are properly matched
- Verify function names are spelled correctly

**Test Failures:**
- Check that variable types match expected values
- Ensure mathematical operations are valid (no division by zero)
- Review the error message for specific issues

**Formula Not Saving:**
- Fix all validation errors first
- Ensure required fields are filled
- Check that formula name is unique for the client

## Support

For additional help or questions about the formula system, review the formula templates or test with simple expressions first to understand the syntax.

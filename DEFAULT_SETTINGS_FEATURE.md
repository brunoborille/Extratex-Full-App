# Client Default Settings - Feature Implementation

## Overview

The Formula Management system now includes a **Default Settings** feature that allows you to configure default formulas and deductions for each client. When a client is selected in the Input tab, their default settings automatically populate, streamlining the data entry process.

## What's New

### 1. Default Settings Tab in Formula Manager

When managing a client's formulas, you'll now see two tabs:
- **Formulas** - Create and manage formulas (existing functionality)
- **Default Settings** - Configure default values for this client (NEW!)

### 2. Default Settings Configuration

For each client, you can now set:

**Default Formulas:**
- Default Copper Formula (auto-selects when client is chosen)
- Default Gold Formula (auto-selects when client is chosen)
- Default Silver Formula (auto-selects when client is chosen)

**Default Deductions:**
- Treatment Charge ($/MT)
- Copper Refining Charge
- Gold Refining Charge  
- Silver Refining Charge

### 3. Auto-Population in Input Tab

When you select a client in the Input tab:
1. Their custom formulas load into the dropdowns
2. Their default formulas are **automatically selected**
3. Their default deductions are **automatically populated**
4. Users can still override any value manually

## How to Use

### Setting Up Client Defaults

1. **Navigate to Formulas Tab**
2. **Select a Client** from the client selector
3. **Click "Default Settings" tab** (next to "Formulas")
4. **Configure Default Formulas:**
   - Choose which copper formula should be selected by default
   - Choose which gold formula should be selected by default
   - Choose which silver formula should be selected by default
   - Select "None" if no default should be set
5. **Configure Default Deductions:**
   - Enter treatment charge amount
   - Enter refining charges for each metal
6. **Click "Save Settings"**

### Using Client Defaults

1. **Go to Input Tab**
2. **Select a Client** from the client selector
3. **Watch as defaults populate automatically:**
   - Formula dropdowns show and select default formulas
   - Deduction fields fill with default values
4. **Enter other data** (assays, prices, weights)
5. **Override any defaults** if needed for this specific calculation
6. **Calculate and save** as usual

## Workflow Example

### Scenario: Setting up "ABC Mining Corp"

**Step 1: Create Client's Formulas**
1. Formulas Tab → Select "ABC Mining"
2. Create formulas:
   - "ABC Premium Copper - 97% Min 1%" (Copper)
   - "ABC Gold - Above 0.5g 95%" (Gold)
   - "ABC Silver - Above 30g 90%" (Silver)

**Step 2: Configure Default Settings**
1. Click "Default Settings" tab
2. Set defaults:
   - Default Copper: "ABC Premium Copper - 97% Min 1%"
   - Default Gold: "ABC Gold - Above 0.5g 95%"
   - Default Silver: "ABC Silver - Above 30g 90%"
   - Treatment Charge: $85/MT
   - Copper Refining: $50
   - Gold Refining: $5
   - Silver Refining: $0.50
3. Click "Save Settings"

**Step 3: Use in Calculations**
1. Input Tab → Select "ABC Mining" from dropdown
2. System automatically:
   - Loads ABC's 3 formulas into dropdowns
   - Selects "ABC Premium Copper - 97% Min 1%"
   - Selects "ABC Gold - Above 0.5g 95%"
   - Selects "ABC Silver - Above 30g 90%"
   - Sets Treatment Charge to $85
   - Sets Copper Refining to $50
   - Sets Gold Refining to $5
   - Sets Silver Refining to $0.50
3. Enter assays, prices, weights
4. Calculate results

## Benefits

### Time Savings
- **No repetitive data entry** for standard client terms
- **One-click setup** for calculations
- **Faster processing** of routine transactions

### Accuracy
- **Eliminates selection errors** - correct formulas always used
- **Consistent deductions** - no forgetting to update values
- **Pre-validated settings** - defaults are saved and tested

### Flexibility
- **Still fully customizable** - override any default for special cases
- **Formula-specific defaults** - different formulas for different clients
- **Easy updates** - change defaults without touching formulas

### Client Management
- **Organized by client** - each client has their own settings
- **Quick switching** - move between clients seamlessly
- **Audit trail** - settings are saved and trackable

## Technical Details

### Database Schema

**New Table: `client_default_settings`**
```sql
- id (uuid, primary key)
- client_id (uuid, foreign key to clients)
- default_copper_formula_id (uuid, nullable)
- default_gold_formula_id (uuid, nullable)
- default_silver_formula_id (uuid, nullable)
- default_treatment_charge (numeric, default 0)
- default_copper_refining (numeric, default 0)
- default_gold_refining (numeric, default 0)
- default_silver_refining (numeric, default 0)
- created_at (timestamptz)
- updated_at (timestamptz)
```

**Security:**
- Row Level Security (RLS) enabled
- Foreign key constraints to formulas
- Cascade delete with client
- Indexed for performance

### Components Created

**New Component:**
- `src/components/Formula/ClientDefaultSettings.tsx` (7.9K)
  - Settings management interface
  - Formula selection dropdowns
  - Deduction input fields
  - Save functionality

**Modified Components:**
- `src/components/Formula/FormulaManager.tsx`
  - Added tabs for Formulas vs Settings
  - Integrated default settings view
- `src/components/Input/ClientFormulasSelector.tsx`
  - Added default settings loading
  - Auto-population logic
- `src/App.tsx`
  - Integrated default settings application
  - Auto-fill formulas and deductions

### Data Flow

```
1. User selects client in Input tab
   ↓
2. ClientFormulasSelector loads:
   - Client's active formulas (existing)
   - Client's default settings (NEW!)
   ↓
3. onDefaultSettingsLoad callback fires
   ↓
4. App.tsx receives settings object
   ↓
5. Auto-populates:
   - Formula dropdowns (copper, gold, silver)
   - Treatment charge field
   - Refining charges (copper, gold, silver)
   ↓
6. User can override or proceed with defaults
```

## User Interface

### Formula Manager - Default Settings Tab

**Visual Elements:**
1. **Tab Navigation**
   - "Formulas" tab (existing)
   - "Default Settings" tab (NEW) with Settings icon

2. **Information Banner**
   - Blue box explaining auto-population behavior
   - "These default values will auto-populate..."

3. **Default Formulas Section**
   - Three dropdowns side-by-side
   - Each shows only active formulas for that category
   - "None" option to skip defaults

4. **Default Deductions Section**
   - Treatment charge input
   - Three refining charge inputs (copper, gold, silver)
   - All numeric with clear labels

5. **Save Button**
   - Top-right header action
   - Shows "Saving..." state
   - Success confirmation

### Input Tab Behavior

**With Client Selected + Defaults Configured:**
- Formula dropdowns auto-select default formulas
- Deduction fields auto-fill with default values
- Blue banner shows "Using client-specific formulas"
- All fields remain editable

**With Client Selected + No Defaults:**
- Formula dropdowns show available formulas
- First formula in each category selected
- Deduction fields show 0 or previous values
- Works exactly as before

**Without Client Selected:**
- Standard default formula options
- Manual deduction entry
- No auto-population

## Important Notes

### Default Formula Selection

- **Only active formulas** appear in default formula dropdowns
- If a default formula is **deactivated**, it won't auto-select
- **"None" option** means don't auto-select any formula

### Deduction Values

- Default deductions are **numeric values only**
- **Zero is valid** - use it for no charge
- Values **auto-populate** but are **fully editable**
- **Not saved** to calculation until user saves calculation

### Formula Changes

- If you **edit a formula** expression, defaults still use that formula
- If you **delete a formula** set as default, system removes the default link
- If you **deactivate** a default formula, it won't auto-select

### Multiple Clients

- Each client has **independent defaults**
- Switching clients **immediately loads new defaults**
- **Previous client's values are replaced**

## Best Practices

### Setting Defaults

1. **Create formulas first** - you can't set defaults without formulas
2. **Use most common terms** - set defaults for typical transactions
3. **Keep updated** - review defaults when client terms change
4. **Test after setting** - verify auto-population works correctly

### Using Defaults

1. **Review auto-populated values** - always verify before calculating
2. **Override when needed** - defaults are starting points, not requirements
3. **Save variations** - if you often override, consider creating another formula
4. **Document special cases** - use notes field for non-standard calculations

### Client Management

1. **Configure on setup** - set defaults when creating a new client
2. **Regular reviews** - check defaults quarterly or when terms change
3. **Bulk updates** - if many clients share terms, consider templates
4. **Deactivate carefully** - don't deactivate formulas that are set as defaults

## Troubleshooting

**Defaults not loading:**
- Check that default settings have been saved
- Verify formulas are active
- Reload client selection

**Wrong formula selected:**
- Check which formula is set as default in Default Settings
- Verify the formula hasn't been deactivated
- Update default if needed

**Deductions not populating:**
- Ensure default settings have been saved
- Check that numeric values were entered
- Try re-selecting the client

**Can't save settings:**
- Verify you have active formulas for the categories
- Check all numeric fields are valid numbers
- Ensure client exists and is active

## Build Status

✅ **Implementation Complete**
- Database migration applied successfully
- New table created with RLS policies
- All components built and integrated
- Build successful: 336.28 kB
- TypeScript validation passed
- Production-ready

## Summary

The Default Settings feature completes the client management workflow by:

1. **Storing** client-specific default formulas and deductions
2. **Auto-populating** these values when a client is selected
3. **Saving time** by eliminating repetitive data entry
4. **Improving accuracy** by ensuring consistent client terms
5. **Maintaining flexibility** with full override capability

This feature bridges the gap between formula configuration and daily calculations, making the system more efficient and user-friendly while maintaining complete flexibility for special cases.

---

**Next Steps:**
1. Navigate to Formulas tab
2. Select a client
3. Click "Default Settings" tab
4. Configure and save defaults
5. Test in Input tab by selecting the client
6. Watch defaults auto-populate!

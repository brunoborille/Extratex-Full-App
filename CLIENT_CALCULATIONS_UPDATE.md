# Client-Based Calculations - Feature Update

## What's New

The Input tab now includes a **Client Selector** that allows you to select a client and automatically use their custom formulas for all calculations.

## How It Works

### 1. Client Selection (Input Tab)

At the top of the Input tab, you'll now see a **"Client Selection"** card with a dropdown menu:

- **Select a client** from the dropdown to load their custom formulas
- When a client is selected, you'll see:
  - Active client name displayed
  - Number of active formulas from that client
  - Blue notification banner on the formulas section

### 2. Automatic Formula Loading

When you select a client:

1. **System loads** all active formulas for that client from the database
2. **Formulas are filtered** by category (copper, gold, silver)
3. **Dropdown options update** to show only the client's custom formulas
4. **First formula is auto-selected** for each category if available

### 3. Formula Dropdowns Behavior

**With Client Selected:**
- Copper/Gold/Silver formula dropdowns show the client's custom formula names
- Only active formulas for that client are displayed
- If a category has no formulas, default options are shown instead

**Without Client Selected:**
- Dropdowns show the standard default formula options
- System works exactly as before

### 4. Client-Specific vs Default Formulas

| Scenario | Behavior |
|----------|----------|
| **No client selected** | Uses default formula options (Pay 96.5%, Above 1g/MT, etc.) |
| **Client selected with formulas** | Uses client's custom formulas from Formula Management |
| **Client selected without formulas** | Falls back to default options for missing categories |

## Benefits

### For Operations
- Quick switching between different client pricing terms
- No manual formula entry needed
- Ensures correct formulas are used for each client

### For Accuracy
- Eliminates formula selection errors
- Uses pre-validated client-specific formulas
- Automatic updates when client formulas are modified in Formula Management

### For Efficiency
- One-click client selection
- Automatic formula population
- Seamless workflow integration

## Workflow Example

### Scenario: Processing ore for Client "ABC Mining"

**Step 1: Input Tab**
1. Select "ABC Mining" from Client Selection dropdown
2. System loads ABC Mining's 3 custom copper formulas, 2 gold formulas, 1 silver formula
3. Formula dropdowns now show only ABC Mining's formulas

**Step 2: Enter Data**
1. Enter assay data (copper, gold, silver percentages)
2. Enter prices
3. Enter weights
4. Select specific formula for each metal (from ABC Mining's options)
5. Enter deductions

**Step 3: Calculate**
1. Click "Calculate Results"
2. System uses ABC Mining's selected formulas for calculations
3. View results in Results tab

**Step 4: Save**
1. Save calculation with client context preserved
2. Can review in History tab later

## Technical Details

### New Components Created
- `src/components/Input/ClientFormulasSelector.tsx` - Client selection interface

### Modified Components
- `src/components/Input/FormulasForm.tsx` - Enhanced to accept client formulas
- `src/App.tsx` - Integrated client formula state management

### Database Integration
- Queries `clients` table for client list
- Queries `client_formulas` table for active formulas
- Filters by category and active status
- Real-time loading of formula data

### State Management
```typescript
selectedCalculationClient: { id: string, name: string } | null
clientFormulas: {
  copper: ClientFormula[],
  gold: ClientFormula[],
  silver: ClientFormula[]
} | null
```

## User Experience

### Visual Indicators

1. **Client Selected State**
   - Blue info box showing active client name
   - Formula count displayed
   - "Using client-specific formulas" banner in Formulas section

2. **No Client Selected State**
   - Gray info box with instructions
   - "Select a client to use their custom formulas" message

3. **Loading States**
   - "Loading client formulas..." shown during data fetch
   - Dropdown disabled during client list load

## Important Notes

### Formula Management Integration
- Client formulas must be created in the **Formulas tab** first
- Only **active** formulas appear in the Input tab dropdowns
- Formula changes in Formula Management are immediately reflected

### Backward Compatibility
- System works exactly as before when no client is selected
- Existing calculations and workflows are not affected
- Default formulas remain available

### Formula IDs vs Names
- When using client formulas, the system stores the formula **ID** (UUID)
- When using default formulas, the system stores the formula **name** (string)
- This ensures proper tracking and client association

## Next Steps

To use this feature:

1. **Create clients** in the Formulas tab if not already done
2. **Create formulas** for each client with appropriate categories
3. **Return to Input tab** to see clients in the dropdown
4. **Select client** to use their formulas for calculations

## Build Status

✅ **Build Successful**
- No compilation errors
- Production bundle: 330.83 kB
- All TypeScript validations passed
- Feature ready for immediate use

---

This feature bridges the Formula Management system with the core calculation workflow, enabling true client-specific calculation processing.

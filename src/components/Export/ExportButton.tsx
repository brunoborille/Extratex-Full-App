import React, { useState } from 'react';
import { Download, FileText, FileJson, Printer, ChevronDown } from 'lucide-react';
import type { CalculationData } from '../../types';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatting';

interface ExportButtonProps {
  calculation: CalculationData;
  onToast?: (message: string, type: 'success' | 'error') => void;
}

export function ExportButton({ calculation, onToast }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  const exportAsJSON = () => {
    const blob = new Blob([JSON.stringify(calculation, null, 2)], { type: 'application/json' });
    download(blob, `${slug()}.json`);
    onToast?.('Exported as JSON', 'success');
    setOpen(false);
  };

  const exportAsCSV = () => {
    const rows = [
      ['Copper Ore Export Valuation Report'],
      [''],
      ['Calculation Name', calculation.name],
      ['Date', formatDate(calculation.timestamp)],
      [''],
      ['ASSAYS'],
      ['Copper (%)', calculation.assays.copper],
      ['Gold (g/DMT)', calculation.assays.gold],
      ['Silver (g/DMT)', calculation.assays.silver],
      [''],
      ['PRICES'],
      ['Copper (USD/MT)', calculation.prices.copper],
      ['Gold (USD/Oz)', calculation.prices.gold],
      ['Silver (USD/Oz)', calculation.prices.silver],
      [''],
      ['WEIGHTS'],
      ['Total Wet Weight (MT)', calculation.weights.totalWetWeight],
      ['Moisture (%)', calculation.weights.moisture],
      ['Total Dry Weight (MT)', calculation.weights.totalDryWeight],
      [''],
      ['FORMULAS'],
      ['Copper', calculation.formulas.copper],
      ['Gold', calculation.formulas.gold],
      ['Silver', calculation.formulas.silver],
      [''],
      ['DEDUCTIONS'],
      ['Treatment Charge (USD/MT)', calculation.deductions.treatmentCharge],
      ['Copper Refining (USD/lb)', calculation.deductions.refiningCharges.copper],
      ['Silver Refining (USD/lb)', calculation.deductions.refiningCharges.silver],
      ['Gold Refining (USD/lb)', calculation.deductions.refiningCharges.gold],
      [''],
      ['PAYABLE METALS'],
      ['Copper (MT)', formatNumber(calculation.results.payableMetals.copper)],
      ['Gold (Oz)', formatNumber(calculation.results.payableMetals.gold)],
      ['Silver (Oz)', formatNumber(calculation.results.payableMetals.silver)],
      [''],
      ['REVENUE'],
      ['Copper Revenue', formatCurrency(calculation.results.revenue.copper)],
      ['Gold Revenue', formatCurrency(calculation.results.revenue.gold)],
      ['Silver Revenue', formatCurrency(calculation.results.revenue.silver)],
      ['Total Provisional Value', formatCurrency(calculation.results.revenue.total)],
      [''],
      ['DEDUCTIONS APPLIED'],
      ['Treatment Charges', formatCurrency(calculation.results.deductions.treatmentCharges)],
      ['Copper Refining', formatCurrency(calculation.results.deductions.copperRefining)],
      ['Silver Refining', formatCurrency(calculation.results.deductions.silverRefining)],
      ['Gold Refining', formatCurrency(calculation.results.deductions.goldRefining)],
      ['Total Deductions', formatCurrency(calculation.results.deductions.total)],
      [''],
      ['FINAL VALUATION'],
      ['Invoice Percentage (%)', calculation.results.invoicePercentage],
      ['Final Invoice Amount', formatCurrency(calculation.results.finalInvoiceAmount)],
      ['Value per MT', formatCurrency(calculation.results.valuePerMT)],
    ];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    download(blob, `${slug()}.csv`);
    onToast?.('Exported as CSV', 'success');
    setOpen(false);
  };

  const exportAsPDF = () => {
    const c = calculation;
    const r = c.results;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${c.name} — Extratex Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; color: #1e293b; background: white; font-size: 12px; }
  .page { padding: 32px 36px; max-width: 900px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; padding: 24px 36px; border-radius: 0 0 16px 16px; margin: -32px -36px 28px; }
  .header-top { display: flex; align-items: center; justify-content: space-between; }
  .header h1 { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
  .header p { font-size: 11px; opacity: 0.75; margin-top: 2px; }
  .badge { background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .meta { display: flex; gap: 20px; margin-top: 14px; font-size: 11px; opacity: 0.85; }

  .section { margin-bottom: 20px; }
  .section-title { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 8px; }

  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }

  .metric-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
  .metric-label { font-size: 10px; color: #64748b; margin-bottom: 2px; }
  .metric-value { font-size: 16px; font-weight: 700; }
  .copper { color: #1d4ed8; } .gold { color: #b45309; } .silver { color: #475569; }
  .emerald { color: #059669; } .red { color: #dc2626; }
  .metric-card.copper-bg { background: #eff6ff; border-color: #bfdbfe; }
  .metric-card.gold-bg { background: #fffbeb; border-color: #fde68a; }
  .metric-card.silver-bg { background: #f8fafc; border-color: #e2e8f0; }

  table { width: 100%; border-collapse: collapse; }
  th { background: #f8fafc; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; padding: 8px 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
  td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
  tr:last-child td { border-bottom: none; }
  .text-right { text-align: right; }
  .font-bold { font-weight: 700; }

  .final-box { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 2px solid #6ee7b7; border-radius: 14px; padding: 20px 24px; margin-top: 20px; }
  .final-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #059669; margin-bottom: 6px; }
  .final-amount { font-size: 32px; font-weight: 900; color: #065f46; letter-spacing: -1px; }
  .final-sub { display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid #a7f3d0; }

  .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
  @media print { .page { padding: 20px 24px; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div>
        <h1>Extratex Mineração</h1>
        <p>Copper Ore Export Valuation Report</p>
      </div>
      <span class="badge">PROVISIONAL</span>
    </div>
    <div class="meta">
      <span><strong>Report:</strong> ${c.name}</span>
      <span><strong>Date:</strong> ${formatDate(c.timestamp)}</span>
      ${c.notes ? `<span><strong>Notes:</strong> ${c.notes}</span>` : ''}
    </div>
  </div>

  <div class="grid-2" style="margin-bottom:20px">
    <div class="section">
      <div class="section-title">Provisional Assays</div>
      <div class="grid-3">
        <div class="metric-card copper-bg">
          <div class="metric-label">Copper (Cu)</div>
          <div class="metric-value copper">${c.assays.copper}%</div>
        </div>
        <div class="metric-card gold-bg">
          <div class="metric-label">Gold (Au)</div>
          <div class="metric-value gold">${c.assays.gold} g/DMT</div>
        </div>
        <div class="metric-card silver-bg">
          <div class="metric-label">Silver (Ag)</div>
          <div class="metric-value silver">${c.assays.silver} g/DMT</div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Provisional Prices</div>
      <div class="grid-3">
        <div class="metric-card copper-bg">
          <div class="metric-label">Copper</div>
          <div class="metric-value copper">${formatCurrency(c.prices.copper)}/MT</div>
        </div>
        <div class="metric-card gold-bg">
          <div class="metric-label">Gold</div>
          <div class="metric-value gold">${formatCurrency(c.prices.gold)}/Oz</div>
        </div>
        <div class="metric-card silver-bg">
          <div class="metric-label">Silver</div>
          <div class="metric-value silver">${formatCurrency(c.prices.silver)}/Oz</div>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Weights & Moisture</div>
    <div class="grid-3">
      <div class="metric-card"><div class="metric-label">Wet Weight</div><div class="metric-value">${c.weights.totalWetWeight} MT</div></div>
      <div class="metric-card"><div class="metric-label">Moisture</div><div class="metric-value">${c.weights.moisture}%</div></div>
      <div class="metric-card"><div class="metric-label">Dry Weight (DMT)</div><div class="metric-value">${c.weights.totalDryWeight.toFixed(2)} MT</div></div>
    </div>
  </div>

  <div class="grid-2" style="margin-bottom:20px">
    <div class="section">
      <div class="section-title">Payable Metals</div>
      <table>
        <thead><tr><th>Metal</th><th>Formula</th><th class="text-right">Payable</th></tr></thead>
        <tbody>
          <tr><td class="copper font-bold">Copper</td><td>${c.formulas.copper}</td><td class="text-right font-bold">${formatNumber(r.payableMetals.copper)} MT</td></tr>
          <tr><td class="gold font-bold">Gold</td><td>${c.formulas.gold}</td><td class="text-right font-bold">${formatNumber(r.payableMetals.gold)} Oz</td></tr>
          <tr><td class="silver font-bold">Silver</td><td>${c.formulas.silver}</td><td class="text-right font-bold">${formatNumber(r.payableMetals.silver)} Oz</td></tr>
        </tbody>
      </table>
    </div>
    <div class="section">
      <div class="section-title">Revenue Breakdown</div>
      <table>
        <thead><tr><th>Source</th><th class="text-right">Revenue</th></tr></thead>
        <tbody>
          <tr><td class="copper">Copper</td><td class="text-right font-bold copper">${formatCurrency(r.revenue.copper)}</td></tr>
          <tr><td class="gold">Gold</td><td class="text-right font-bold gold">${formatCurrency(r.revenue.gold)}</td></tr>
          <tr><td class="silver">Silver</td><td class="text-right font-bold silver">${formatCurrency(r.revenue.silver)}</td></tr>
          <tr><td class="font-bold">Total Revenue</td><td class="text-right font-bold emerald">${formatCurrency(r.revenue.total)}</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Deductions</div>
    <table>
      <thead><tr><th>Charge</th><th class="text-right">Amount</th></tr></thead>
      <tbody>
        <tr><td>Treatment Charges</td><td class="text-right red">-${formatCurrency(r.deductions.treatmentCharges)}</td></tr>
        <tr><td>Copper Refining</td><td class="text-right red">-${formatCurrency(r.deductions.copperRefining)}</td></tr>
        <tr><td>Silver Refining</td><td class="text-right red">-${formatCurrency(r.deductions.silverRefining)}</td></tr>
        <tr><td>Gold Refining</td><td class="text-right red">-${formatCurrency(r.deductions.goldRefining)}</td></tr>
        <tr><td class="font-bold">Total Deductions</td><td class="text-right font-bold red">-${formatCurrency(r.deductions.total)}</td></tr>
      </tbody>
    </table>
  </div>

  <div class="final-box">
    <div class="final-label">Total Cargo Invoice Amount</div>
    <div class="final-amount">${formatCurrency(r.finalInvoiceAmount)}</div>
    <div class="final-sub">
      <span style="color:#059669;font-size:11px">Invoice %: <strong>${r.invoicePercentage}%</strong></span>
      <span style="color:#059669;font-size:11px">Net per MT: <strong>${formatCurrency(r.valuePerMT)}</strong></span>
    </div>
  </div>

  <div class="footer">
    <span>Generated by Extratex — Copper Ore Valuation Platform</span>
    <span>Provisional figures — subject to final settlement</span>
  </div>
</div>
<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      onToast?.('Please allow popups to open the PDF report', 'error');
    } else {
      onToast?.('PDF report opened — use browser Print to save', 'success');
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    setOpen(false);
  };

  const slug = () => `${calculation.name.replace(/\s+/g, '_')}_${Date.now()}`;
  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 h-8 px-3.5 text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg shadow-sm transition-all"
      >
        <Download size={14} />
        Export
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 z-50 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
            {[
              { icon: Printer, label: 'PDF Report', onClick: exportAsPDF, color: 'text-blue-600' },
              { icon: FileText, label: 'Export CSV', onClick: exportAsCSV, color: 'text-emerald-600' },
              { icon: FileJson, label: 'Export JSON', onClick: exportAsJSON, color: 'text-amber-600' },
            ].map(({ icon: Icon, label, onClick, color }) => (
              <button
                key={label}
                onClick={onClick}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Icon size={15} className={color} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

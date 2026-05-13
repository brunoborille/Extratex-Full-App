import { Card } from '../UI/Card';
import { formatCurrency } from '../../utils/formatting';

interface GradePaymentTableProps {
  supplierPaymentBRL: number;
  dmtWeight: number;
  copperGrade: number;
}

export function GradePaymentTable({ supplierPaymentBRL, dmtWeight, copperGrade }: GradePaymentTableProps) {
  const gradeRanges = [
    { min: 10, max: 10.99, label: '10%-10,99%' },
    { min: 11, max: 11.99, label: '11%-11,99%' },
    { min: 12, max: 12.99, label: '12%-12,99%' },
    { min: 13, max: 13.99, label: '13%-13,99%' },
    { min: 14, max: 14.99, label: '14%-14,99%' },
    { min: 15, max: 15.99, label: '15%-15,99%' },
    { min: 16, max: 16.99, label: '16%-16,99%' },
    { min: 17, max: 17.99, label: '17%-17,99%' },
    { min: 18, max: 18.99, label: '18%-18,99%' },
    { min: 19, max: 19.99, label: '19%-19,99%' },
    { min: 20, max: 20.99, label: '20%-20,99%' },
    { min: 21, max: 21.99, label: '21%-21,99%' },
    { min: 22, max: 22.99, label: '22%-22,99%' },
    { min: 23, max: 23.99, label: '23%-23,99%' },
    { min: 24, max: 24.99, label: '24%-24,99%' },
    { min: 25, max: 25.99, label: '25%-25,99%' },
    { min: 26, max: 26.99, label: '26%-26,99%' },
    { min: 27, max: 27.99, label: '27%-27,99%' },
    { min: 28, max: 28.99, label: '28%-28,99%' },
    { min: 29, max: 29.99, label: '29%-29,99%' },
    { min: 30, max: Infinity, label: '30% - À MAIS' },
  ];

  const calculatePaymentForGrade = (gradePercent: number): number => {
    if (dmtWeight === 0 || gradePercent === 0) return 0;
    return supplierPaymentBRL / dmtWeight / gradePercent;
  };

  const isCurrentGrade = (min: number, max: number): boolean => {
    return copperGrade >= min && copperGrade <= max;
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Grade Payment Table</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-200">
              <th className="border border-slate-300 px-4 py-3 text-left font-bold text-slate-800">
                TEOR
              </th>
              <th className="border border-slate-300 px-4 py-3 text-left font-bold text-slate-800">
                BRL R$
              </th>
            </tr>
          </thead>
          <tbody>
            {gradeRanges.map((range, index) => {
              const midPoint = range.max === Infinity ? range.min + 5 : (range.min + range.max) / 2;
              const payment = calculatePaymentForGrade(midPoint);
              const isCurrent = isCurrentGrade(range.min, range.max);

              return (
                <tr
                  key={index}
                  className={isCurrent ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                >
                  <td className="border border-slate-300 px-4 py-2 text-slate-700 font-medium">
                    {range.label}
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-slate-700 font-semibold">
                    R${payment.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {copperGrade > 0 && (
          <p className="mt-3 text-sm text-slate-600">
            Current copper grade: <span className="font-semibold text-blue-600">{copperGrade.toFixed(2)}%</span>
            {' - '}Highlighted row shows applicable payment range
          </p>
        )}
      </div>
    </Card>
  );
}

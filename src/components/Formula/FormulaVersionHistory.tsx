import React, { useEffect, useState } from 'react';
import { formatDate } from '../../utils/formatting';
import { useFormulas } from '../../hooks/useFormulas';
import type { FormulaVersion } from '../../types/formula';

interface FormulaVersionHistoryProps {
  formulaId: string;
}

export function FormulaVersionHistory({ formulaId }: FormulaVersionHistoryProps) {
  const { getVersions } = useFormulas();
  const [versions, setVersions] = useState<FormulaVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [formulaId]);

  const loadVersions = async () => {
    setLoading(true);
    const data = await getVersions(formulaId);
    setVersions(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading version history...</p>
      </div>
    );
  }

  if (versions.length === 0) {
    return <p className="text-gray-500 text-center py-4">No version history available</p>;
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto">
      {versions.map((version) => (
        <div key={version.id} className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Version {version.version_number}</h4>
            <span className="text-xs text-gray-500">{formatDate(version.created_at)}</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{version.change_summary}</p>
          <div className="bg-gray-50 p-2 rounded mb-2">
            <code className="text-xs text-gray-800 font-mono">{version.expression}</code>
          </div>
          <div className="text-xs text-gray-500">
            Changed by: {version.changed_by || 'Unknown'}
          </div>
          {version.variables && version.variables.length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              Variables: {version.variables.map((v: any) => v.name).join(', ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

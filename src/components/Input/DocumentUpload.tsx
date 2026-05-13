import React, { useState } from 'react';
import { Upload, FileText, Image, Loader2, X } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

interface ExtractedData {
  copper?: number;
  humidity?: number;
  gold?: number;
  silver?: number;
}

interface DocumentUploadProps {
  onDataExtracted: (data: ExtractedData) => void;
}

export function DocumentUpload({ onDataExtracted }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPG, PNG) or PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError(null);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-lab-results`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process document');
      }

      const data = await response.json();

      if (data.extractedData) {
        onDataExtracted(data.extractedData);
        setError(null);
      } else {
        setError('No data could be extracted from the document');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process document');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFileName(null);
    setError(null);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Upload Lab Results</h3>
          {fileName && (
            <button
              onClick={clearFile}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <p className="text-sm text-gray-600">
          Upload an image or PDF of your lab results to automatically populate the fields below.
        </p>

        <div className="relative">
          <input
            type="file"
            id="document-upload"
            className="hidden"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleFileUpload}
            disabled={uploading}
          />

          <label
            htmlFor="document-upload"
            className={`
              flex flex-col items-center justify-center w-full h-32 px-4 transition-all
              border-2 border-dashed rounded-lg cursor-pointer
              ${uploading ? 'bg-gray-50 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'}
            `}
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                <span className="text-sm text-gray-600">Processing document...</span>
              </>
            ) : fileName ? (
              <>
                <FileText className="w-8 h-8 text-green-500 mb-2" />
                <span className="text-sm text-gray-900 font-medium">{fileName}</span>
                <span className="text-xs text-gray-500 mt-1">Click to upload a different file</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <Image className="w-6 h-6 text-gray-400" />
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG or PDF (max. 10MB)
                </span>
              </>
            )}
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {fileName && !uploading && !error && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              Data extracted successfully! Check the fields below.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

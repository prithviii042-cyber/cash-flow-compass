import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UploadValidation } from '@/types/cashflow';

interface FileUploadZoneProps {
  title: string;
  description: string;
  acceptedFormats: string[];
  onUpload: (file: File) => Promise<UploadValidation>;
}

export function FileUploadZone({ title, description, acceptedFormats, onUpload }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validation, setValidation] = useState<UploadValidation | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setValidation(null);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidation(null);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await onUpload(file);
      setValidation(result);
    } catch (error) {
      setValidation({
        success: false,
        errors: ['Upload failed. Please try again.'],
        warnings: [],
        recordCount: 0,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setValidation(null);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {!file ? (
        <div
          className={cn('upload-zone', isDragging && 'active')}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            id={`file-${title.replace(/\s/g, '-')}`}
          />
          <label htmlFor={`file-${title.replace(/\s/g, '-')}`} className="cursor-pointer">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">
              Drop your file here or <span className="text-primary">browse</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Accepted formats: {acceptedFormats.join(', ')}
            </p>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Preview */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50 border border-border">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={clearFile}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Validation Results */}
          {validation && (
            <div className="space-y-3">
              {validation.success ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/30">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <div>
                    <p className="font-medium text-success">Upload Successful</p>
                    <p className="text-sm text-muted-foreground">
                      {validation.recordCount} records processed
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <p className="font-medium text-destructive">Validation Errors</p>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-8">
                    {validation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                  <p className="font-medium text-warning mb-2">Warnings</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Upload Button */}
          {!validation?.success && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isUploading ? 'Processing...' : 'Upload & Validate'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, X } from 'lucide-react';
import { useContacts } from '@/app/providers/ContactsProvider';
import { getApiErrorMessage } from '@/lib/api-client';
import { useModalKeyboard, useModalScrollLock } from '@/lib/hooks/use-modal';

interface ContactUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactUploadModal({ isOpen, onClose }: ContactUploadModalProps) {
  const { uploadBulkFile } = useContacts();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useModalKeyboard(isOpen, onClose);
  useModalScrollLock(isOpen);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.vcf')) {
      setError('Unsupported file format. Please upload a CSV or VCF file.');
      return;
    }

    setError('');
    setIsLoading(true);
    setUploadSuccess(false);

    try {
      await uploadBulkFile(file);
      setUploadSuccess(true);
      setError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => {
        setUploadSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setUploadSuccess(false);
      console.error('Bulk upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.vcf'))) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileUpload({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleClose = () => {
    setError('');
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div
        className="relative bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Upload Contacts
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        <div className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.vcf"
              onChange={handleFileUpload}
              className="hidden"
              id="contact-file-input-modal"
            />
            <label
              htmlFor="contact-file-input-modal"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              {isLoading ? (
                <Loader2 className="w-12 h-12 text-zinc-400 dark:text-zinc-600 animate-spin" />
              ) : (
                <Upload className="w-12 h-12 text-zinc-400 dark:text-zinc-600" />
              )}
              <div className="space-y-2">
                <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  {isLoading ? 'Processing...' : 'Drop your file here or click to browse'}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Supports CSV and VCF formats
                </p>
              </div>
            </label>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-800 dark:text-green-200">
                Contacts uploaded successfully!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

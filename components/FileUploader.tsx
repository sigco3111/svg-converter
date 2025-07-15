
import React, { useState, useCallback } from 'react';
import { UploadIcon, AlertTriangleIcon } from './Icons';

interface FileUploaderProps {
  onFileSelect: (files: File[]) => void;
  error: string | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(Array.from(files));
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(Array.from(files));
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center mt-8">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative w-full max-w-2xl border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-300 ${isDragging ? 'border-brand-secondary bg-base-200 scale-105' : 'border-base-300 bg-base-200'}`}
      >
        <div className="flex flex-col items-center justify-center">
          <UploadIcon className="w-16 h-16 text-text-secondary mb-4" />
          <p className="text-xl font-semibold text-text-primary">여기에 파일들을 드래그 앤 드롭하세요</p>
          <p className="text-text-secondary mt-1">또는</p>
          <label htmlFor="file-upload" className="mt-4 cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-colors">
            파일 찾아보기
          </label>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".png,.svg" multiple />
          <p className="text-sm text-text-secondary mt-6">지원 형식: PNG, SVG</p>
        </div>
      </div>
      {error && (
        <div className="mt-6 bg-red-900/50 text-red-300 border border-red-700 rounded-lg p-3 max-w-2xl w-full">
           <div className="flex items-start gap-2">
            <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="whitespace-pre-wrap">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;

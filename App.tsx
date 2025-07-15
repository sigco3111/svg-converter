
import React, { useState, useCallback, useMemo } from 'react';
import { AppStatus, ConversionType, ConversionFile, FileStatus } from './types';
import FileUploader from './components/FileUploader';
import BatchProcessor from './components/BatchProcessor';
import { convertSvgToPng, convertPngToSvg } from './services/conversionService';
import { Header } from './components/Header';

const App: React.FC = () => {
  const [appStatus, setAppStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [files, setFiles] = useState<ConversionFile[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleFileSelect = useCallback((selectedFiles: File[]) => {
    setGlobalError(null);
    const newConversionFiles: Promise<ConversionFile>[] = Array.from(selectedFiles).map(file => {
      return new Promise((resolve, reject) => {
        const fileType = file.type;
        if (fileType !== 'image/svg+xml' && fileType !== 'image/png') {
          return reject(`${file.name}: 잘못된 파일 형식입니다.`);
        }

        const conversionType = fileType === 'image/svg+xml' ? ConversionType.SVG_TO_PNG : ConversionType.PNG_TO_SVG;
        const reader = new FileReader();

        reader.onload = (e) => {
          const url = e.target?.result as string;
          const image = new Image();
          image.onload = () => {
            resolve({
              id: crypto.randomUUID(),
              file,
              status: FileStatus.QUEUED,
              previewUrl: url,
              width: image.width,
              height: image.height,
              outputPreviewUrl: null,
              conversionType,
              error: null,
            });
          };
          image.onerror = () => reject(`${file.name}: 이미지 크기를 불러올 수 없습니다.`);
          image.src = url;
        };
        reader.onerror = () => reject(`${file.name}: 파일을 읽는데 실패했습니다.`);
        reader.readAsDataURL(file);
      });
    });

    Promise.allSettled(newConversionFiles).then(results => {
      const successfulFiles = results
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as PromiseFulfilledResult<ConversionFile>).value);
      
      const failedFiles = results
        .filter(r => r.status === 'rejected')
        .map(r => (r as PromiseRejectedResult).reason);

      if (failedFiles.length > 0) {
        setGlobalError(failedFiles.join('\\n'));
      }
      
      if(successfulFiles.length > 0) {
        setFiles(prev => [...prev, ...successfulFiles]);
        setAppStatus(AppStatus.LOADED);
      } else if (files.length === 0) {
        setAppStatus(AppStatus.IDLE);
      }
    });
  }, [files]);

  const updateFileState = (id: string, updates: Partial<ConversionFile>) => {
    setFiles(prevFiles => prevFiles.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleConvertAll = useCallback(async () => {
    setAppStatus(AppStatus.PROCESSING);
    
    const queue = files.filter(f => f.status === FileStatus.QUEUED);
    
    for (const fileToConvert of queue) {
      updateFileState(fileToConvert.id, { status: FileStatus.CONVERTING });
      try {
        let resultUrl: string;
        const { file, width, height, conversionType, previewUrl } = fileToConvert;

        if (conversionType === ConversionType.SVG_TO_PNG) {
          const svgContent = await file.text();
          resultUrl = await convertSvgToPng(svgContent, width, height);
        } else { // PNG_TO_SVG
          resultUrl = await convertPngToSvg(previewUrl, width, height);
        }
        
        updateFileState(fileToConvert.id, { status: FileStatus.CONVERTED, outputPreviewUrl: resultUrl });
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 변환 오류';
        updateFileState(fileToConvert.id, { status: FileStatus.ERROR, error: message });
      }
    }
    setAppStatus(AppStatus.DONE);
  }, [files]);
  
  const handleReset = useCallback(() => {
    setFiles([]);
    setAppStatus(AppStatus.IDLE);
    setGlobalError(null);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => {
        const newFiles = prev.filter(f => f.id !== id);
        if(newFiles.length === 0) {
            setAppStatus(AppStatus.IDLE);
        }
        return newFiles;
    });
  }, []);

  const canConvert = useMemo(() => {
    return files.some(f => f.status === FileStatus.QUEUED);
  }, [files]);

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header />
      <main className="w-full max-w-7xl flex-grow">
        {files.length === 0 ? (
          <FileUploader onFileSelect={handleFileSelect} error={globalError} />
        ) : (
          <BatchProcessor 
            files={files}
            onConvertAll={handleConvertAll}
            onReset={handleReset}
            onRemoveFile={handleRemoveFile}
            appStatus={appStatus}
            canConvert={canConvert}
          />
        )}
      </main>
      <footer className="w-full max-w-6xl text-center p-4 mt-8">
        <p className="text-sm text-text-secondary">&copy; {new Date().getFullYear()} SVG 변환기. 모든 권리 보유.</p>
      </footer>
    </div>
  );
};

export default App;
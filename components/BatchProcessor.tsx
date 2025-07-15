
import React, { useMemo, useState } from 'react';
import { AppStatus, ConversionFile, FileStatus, ConversionType } from '../types';
import Button from './Button';
import Spinner from './Spinner';
import { DownloadIcon, RepeatIcon, AlertTriangleIcon, XIcon, CheckCircleIcon, ArrowRightIcon, ArchiveIcon } from './Icons';
import JSZip from 'jszip';

const FileListItem: React.FC<{
  item: ConversionFile;
  onRemove: (id: string) => void;
}> = ({ item, onRemove }) => {
  
  const getDownloadFileName = () => {
    const nameWithoutExt = item.file.name.split('.').slice(0, -1).join('.');
    const newExt = item.conversionType === ConversionType.PNG_TO_SVG ? 'svg' : 'png';
    return `${nameWithoutExt}-converted.${newExt}`;
  };

  const StatusBadge = () => {
    switch(item.status) {
      case FileStatus.QUEUED:
        return <span className="text-xs font-medium text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded-full">대기중</span>;
      case FileStatus.CONVERTING:
        return <span className="flex items-center gap-1 text-xs font-medium text-blue-400 bg-blue-900/50 px-2 py-1 rounded-full"><Spinner size="sm" /> 변환중</span>;
      case FileStatus.CONVERTED:
        return <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-900/50 px-2 py-1 rounded-full"><CheckCircleIcon className="w-3 h-3"/> 완료</span>;
      case FileStatus.ERROR:
        return <span title={item.error || '오류'} className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-900/50 px-2 py-1 rounded-full"><AlertTriangleIcon className="w-3 h-3"/> 오류</span>;
    }
    return null;
  }

  return (
    <div className="bg-base-200 rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-4 p-4 animate-fade-in">
        <div className="flex items-center gap-4 w-full sm:w-auto">
            <img src={item.previewUrl} alt="Original" className="w-16 h-16 object-contain bg-base-300 rounded-md flex-shrink-0"/>
            <ArrowRightIcon className="w-6 h-6 text-text-secondary hidden sm:block"/>
        </div>

        <div className="flex-grow text-center sm:text-left min-w-0">
            <p className="font-bold text-text-primary truncate" title={item.file.name}>{item.file.name}</p>
            <p className="text-sm text-text-secondary">{item.width}x{item.height} &bull; {item.conversionType === ConversionType.PNG_TO_SVG ? 'PNG → SVG' : 'SVG → PNG'}</p>
            {item.status === FileStatus.ERROR && <p className="text-xs text-red-400 mt-1 truncate" title={item.error!}>오류: {item.error}</p>}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="w-20 flex justify-center"><StatusBadge /></div>
          {item.status === FileStatus.CONVERTED ? (
             <Button as="a" href={item.outputPreviewUrl!} download={getDownloadFileName()} variant="secondary" >
              <DownloadIcon className="w-5 h-5" />
             </Button>
          ) : (
            <div className="w-[44px] h-[44px]"></div>
          )}
          <button onClick={() => onRemove(item.id)} className="text-text-secondary hover:text-red-400 transition-colors p-2 rounded-full bg-base-300 hover:bg-red-900/50">
             <XIcon className="w-5 h-5"/>
          </button>
        </div>
    </div>
  )
}


interface BatchProcessorProps {
  files: ConversionFile[];
  appStatus: AppStatus;
  canConvert: boolean;
  onConvertAll: () => void;
  onReset: () => void;
  onRemoveFile: (id: string) => void;
}

const BatchProcessor: React.FC<BatchProcessorProps> = ({
  files,
  appStatus,
  canConvert,
  onConvertAll,
  onReset,
  onRemoveFile,
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const isProcessing = appStatus === AppStatus.PROCESSING;
  const queuedFilesCount = useMemo(() => files.filter(f=>f.status === FileStatus.QUEUED).length, [files]);
  const convertedFilesCount = useMemo(() => files.filter(f => f.status === FileStatus.CONVERTED).length, [files]);

  const handleDownloadAll = async () => {
    const convertedFiles = files.filter(f => f.status === FileStatus.CONVERTED && f.outputPreviewUrl);
    if (convertedFiles.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      const getDownloadFileName = (item: ConversionFile) => {
          const nameWithoutExt = item.file.name.split('.').slice(0, -1).join('.');
          const newExt = item.conversionType === ConversionType.PNG_TO_SVG ? 'svg' : 'png';
          return `${nameWithoutExt}-converted.${newExt}`;
      };
      
      for (const file of convertedFiles) {
          const response = await fetch(file.outputPreviewUrl!);
          const blob = await response.blob();
          zip.file(getDownloadFileName(file), blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted-images-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("ZIP 파일 생성에 실패했습니다.", err);
      // 향후 사용자에게 오류를 표시할 수 있습니다.
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
        <div className="w-full bg-base-200 p-4 rounded-xl shadow-lg mb-8 flex flex-wrap justify-center items-center gap-4">
            <h3 className="text-lg font-bold text-text-primary mr-auto hidden md:block">파일 목록 ({files.length})</h3>
            <Button onClick={onReset} variant="secondary">
                <RepeatIcon className="w-5 h-5 mr-2" />
                모두 지우기
            </Button>
             <Button onClick={handleDownloadAll} disabled={isZipping || convertedFilesCount === 0} variant="secondary">
                {isZipping ? <Spinner size="sm" /> : <ArchiveIcon className="w-5 h-5 mr-2" />}
                {isZipping ? '압축 중...' : `모두 다운로드 (${convertedFilesCount})`}
            </Button>
            <Button onClick={onConvertAll} disabled={isProcessing || !canConvert} variant="primary">
                {isProcessing ? <Spinner size="sm" /> : <RepeatIcon className="w-5 h-5 mr-2" />}
                {isProcessing ? '변환 중...' : `대기중인 파일 변환 (${queuedFilesCount})`}
            </Button>
        </div>

        <div className="w-full space-y-4">
            {files.map(file => (
                <FileListItem key={file.id} item={file} onRemove={onRemoveFile} />
            ))}
        </div>
    </div>
  );
};

export default BatchProcessor;
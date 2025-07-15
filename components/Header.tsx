
import React from 'react';
import { FileCodeIcon, FileImageIcon, RepeatIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-6xl mb-8 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-2">
        SVG 변환기
      </h1>
      <div className="flex items-center justify-center gap-4 text-text-secondary">
        <FileImageIcon className="w-8 h-8"/>
        <RepeatIcon className="w-6 h-6"/>
        <FileCodeIcon className="w-8 h-8"/>
      </div>
      <p className="mt-4 text-lg text-text-secondary">
        브라우저에서 바로 PNG를 SVG로, SVG를 PNG로 변환하세요.
      </p>
    </header>
  );
};
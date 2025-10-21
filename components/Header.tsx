
import React from 'react';
import { MicIcon } from './icons/MicIcon';

export const Header: React.FC = () => {
  return (
    <header className="py-5 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-3">
          <MicIcon className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Media Transcriber
          </h1>
        </div>
      </div>
    </header>
  );
};

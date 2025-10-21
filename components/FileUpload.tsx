
import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      className={`
        border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer 
        transition-all duration-300 ease-in-out
        hover:border-cyan-500 hover:bg-slate-800/50
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="audio/*,video/*"
        disabled={disabled}
      />
      <div className="flex flex-col items-center justify-center space-y-4 text-gray-400">
        <UploadIcon className="w-12 h-12 text-slate-500 transition-colors duration-300" />
        <p className="text-lg font-semibold">
          <span className="text-cyan-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-sm">Supports: MP3, WAV, MP4, MOV, etc.</p>
      </div>
    </div>
  );
};

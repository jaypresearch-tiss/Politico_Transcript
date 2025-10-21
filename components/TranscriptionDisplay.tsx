import React from 'react';
import type { Transcription, TimestampedSegment } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface TranscriptionDisplayProps {
  transcription: Transcription;
  onExport: () => void;
}

interface Segment {
  startTime: number;
  endTime: number;
  text: string;
}

const TranscriptionColumn: React.FC<{ title: string; segments: Segment[] }> = ({ title, segments }) => (
    <div className="flex flex-col">
        <h3 className="text-xl font-bold text-cyan-400 mb-4 px-1">{title}</h3>
        <div className="h-96 overflow-y-auto bg-slate-800/70 border border-slate-700 rounded-lg p-4 space-y-4 custom-scrollbar">
            {segments.length > 0 ? segments.map((segment, index) => (
                <div key={index} className="border-b border-slate-600 pb-3 last:border-b-0">
                    <p className="font-mono text-xs text-cyan-400/80 mb-1">
                        [{segment.startTime.toFixed(2)}s - {segment.endTime.toFixed(2)}s]
                    </p>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{segment.text}</p>
                </div>
            )) : (
                <p className="text-gray-500">No transcription data available.</p>
            )}
        </div>
        <style>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: #1e293b; /* slate-800 */
                border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #475569; /* slate-600 */
                border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #64748b; /* slate-500 */
            }
        `}</style>
    </div>
);


export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ transcription, onExport }) => {
  return (
    <div className="w-full mt-6 space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-center sm:text-left">Transcription Results</h2>
        <button
          onClick={onExport}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
        >
          <DownloadIcon className="w-5 h-5" />
          Export to Excel
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TranscriptionColumn title="English" segments={transcription.map(t => ({ startTime: t.startTime, endTime: t.endTime, text: t.english }))} />
        <TranscriptionColumn title="Hindi" segments={transcription.map(t => ({ startTime: t.startTime, endTime: t.endTime, text: t.hindi }))} />
      </div>
    </div>
  );
};

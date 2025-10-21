import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { TranscriptionDisplay } from './components/TranscriptionDisplay';
import { Loader } from './components/Loader';
import { transcribeMedia } from './services/geminiService';
import type { Transcription } from './types';
import { FileIcon } from './components/icons/FileIcon';
import { ErrorIcon } from './components/icons/ErrorIcon';

declare const XLSX: any;

// A simple unique ID generator
const generateUniqueId = () => {
  // Combine timestamp and random string for uniqueness
  return `tx_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`;
};


const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uniqueId, setUniqueId] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);
    setTranscription(null);
    setError(null);
    setUniqueId(generateUniqueId()); // Generate and set unique ID

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const dataUrl = reader.result as string;
          const base64Data = dataUrl.split(',')[1];
          
          const result = await transcribeMedia(base64Data, selectedFile.type);
          setTranscription(result);
        } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred during transcription.');
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
        setIsLoading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
    }
  }, []);

  const resetState = () => {
    setFile(null);
    setTranscription(null);
    setError(null);
    setIsLoading(false);
    setUniqueId(null); // Reset unique ID
  };

  const handleExport = useCallback(() => {
    if (!transcription || !file || !uniqueId) return;

    const data = transcription.map(segment => ({
      'unique_id': uniqueId,
      'Start Time (s)': segment.startTime.toFixed(2),
      'End Time (s)': segment.endTime.toFixed(2),
      'English Transcription': segment.english,
      'Hindi Transcription': segment.hindi,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transcription');

    // Set column widths for better readability
    const colWidths = [
      { wch: 25 }, // unique_id
      { wch: 15 }, // Start Time
      { wch: 15 }, // End Time
      { wch: 60 }, // English
      { wch: 60 }, // Hindi
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `${file.name.split('.').slice(0, -1).join('.')}_transcription.xlsx`);
  }, [transcription, file, uniqueId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 md:p-8 border border-slate-700">
            {!file && !isLoading && (
              <>
                <h2 className="text-2xl font-bold text-center text-cyan-400 mb-2">Transcribe Audio & Video</h2>
                <p className="text-center text-gray-400 mb-6">Upload your media file to get started. We'll provide timestamped transcriptions in English and Hindi.</p>
                <FileUpload onFileSelect={handleFileSelect} disabled={isLoading} />
              </>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader />
                <p className="text-lg text-cyan-400">Analyzing your file...</p>
                <p className="text-gray-400 text-sm">This may take a few moments depending on the file size.</p>
                 {file && <p className="text-center text-gray-500 truncate w-64">Processing: {file.name}</p>}
              </div>
            )}
            
            {!isLoading && file && (transcription || error) && (
              <div className="flex flex-col items-center">
                <div className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4 truncate">
                    <FileIcon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                    <p className="font-mono text-sm text-gray-300 truncate">{file.name}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {uniqueId && (
                      <div className="hidden sm:flex items-center gap-2 bg-slate-700/50 border border-slate-600 px-3 py-1 rounded-full">
                          <span className="text-xs font-mono text-gray-400">ID:</span>
                          <span className="text-xs font-mono text-cyan-400 select-all">{uniqueId}</span>
                      </div>
                    )}
                    <button
                      onClick={resetState}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                      New File
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="w-full bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center gap-3 text-red-300">
                    <ErrorIcon className="w-6 h-6 flex-shrink-0"/>
                    <p><strong>Error:</strong> {error}</p>
                  </div>
                )}

                {transcription && <TranscriptionDisplay transcription={transcription} onExport={handleExport} />}
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-gray-500">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
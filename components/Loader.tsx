
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-500" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

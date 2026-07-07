import React from 'react';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = 'Processing your request...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative flex items-center justify-center">
        {/* Animated Outer Pulse Ring */}
        <div className="absolute w-20 h-20 rounded-full border-4 border-indigo-500/25 animate-ping"></div>

        {/* Spinning Rings */}
        <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-indigo-500 border-r-indigo-400 animate-spin"></div>

      </div>

      <p className="mt-6 text-slate-300 font-medium text-sm tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
};

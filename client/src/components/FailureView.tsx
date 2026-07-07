import React from 'react';

interface FailureViewProps {
  errorMessage: string;
  onRetry: () => void;
}

export const FailureView: React.FC<FailureViewProps> = ({ errorMessage, onRetry }) => {
  return (
    <div className="w-full max-w-md glass-panel rounded-2xl p-8 glow-rose animate-scale-in text-center">
      {/* Animated Warning Icon */}
      <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-500 text-3xl mb-6">
        ✕
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
      <p className="text-slate-400 text-sm mb-6">
        We could not complete your transaction at this time.
      </p>

      {/* Error Info Card */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 mb-6 text-left">
        <span className="text-xs text-slate-500 block mb-1">Reason for Failure</span>
        <p className="text-sm text-rose-400 font-medium">
          {errorMessage || 'Unknown error occurred during payment processing.'}
        </p>
      </div>

      <button
        onClick={onRetry}
        className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-rose-500/20 active:scale-[0.98] transition-all duration-150"
      >
        Try Again
      </button>
    </div>
  );
};

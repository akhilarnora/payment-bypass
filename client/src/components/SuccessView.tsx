import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { PaymentDetails } from '../types.js';

interface SuccessViewProps {
  payment: PaymentDetails;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ payment, onReset }) => {
  useEffect(() => {
    // Premium multi-burst confetti effect on mount
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md glass-panel rounded-2xl p-8 glow-emerald animate-scale-in text-center">
      {/* Animated Checkmark Circle */}
      <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 text-3xl mb-6">
        ✓
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
      <p className="text-slate-400 text-sm mb-6">
        Thank you! Your transaction has been verified and processed.
      </p>

      {/* Payment details invoice panel */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 mb-6 text-left space-y-3.5 text-xs sm:text-sm">
        <div className="flex justify-between border-b border-slate-800 pb-2.5">
          <span className="text-slate-500">Transaction ID</span>
          <span className="text-slate-200 font-mono select-all">
            {payment.paymentId || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-2.5">
          <span className="text-slate-500">Order ID</span>
          <span className="text-slate-200 font-mono select-all">
            {payment.orderId}
          </span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-2.5">
          <span className="text-slate-500">Amount Paid</span>
          <span className="text-emerald-400 font-bold">
            ₹{Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-2.5">
          <span className="text-slate-500">Payer Name</span>
          <span className="text-slate-200 font-medium">{payment.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Date & Time</span>
          <span className="text-slate-300">
            {new Date(payment.updatedAt).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-150"
      >
        Make Another Payment
      </button>
    </div>
  );
};

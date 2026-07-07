import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showBackButton }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header section */}
      <header className="w-full flex items-center justify-between py-4 max-w-5xl mx-auto border-b border-slate-900 mb-8 sm:mb-12">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg glow-indigo">
            ⚡
          </div>
          <span className="font-extrabold tracking-tight text-white text-lg sm:text-xl">
            Antigravity<span className="text-indigo-400 font-normal">Pay</span>
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <button
              onClick={() => {
                navigate('/');
              }}
              className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50 text-indigo-400 hover:text-indigo-300 transition-all duration-150"
            >
              Back to Home
            </button>
          )}
          <div className="hidden sm:block text-xs text-slate-500 font-medium">
            Secure 256-bit SSL Encryption
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 flex items-center justify-center w-full max-w-5xl mx-auto mb-12 sm:mb-20">
        {children}
      </main>

      {/* Footer section */}
      <footer className="w-full text-center py-6 border-t border-slate-900/50 max-w-5xl mx-auto text-xs text-slate-600">
        <p>© 2026 ozyqr Pay Inc. All rights reserved.</p>
        <p className="mt-1">
          Powered by Razorpay API. Real-time bank settlements secured by industry standards.
        </p>
      </footer>
    </div>
  );
};

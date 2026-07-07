import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { GeneratePage } from './pages/GeneratePage.js';

export const App: React.FC = () => {
  return (
    <>
      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-slate-900 border border-slate-800 text-slate-100 rounded-xl',
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #1e293b',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<CheckoutPage />} />
        <Route path="/generate" element={<GeneratePage />} />
      </Routes>
    </>
  );
};

export default App;

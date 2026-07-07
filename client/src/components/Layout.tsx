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
      {/* Main Content Layout */}
      <main className="flex-1 flex items-center justify-center w-full max-w-5xl mx-auto mb-12 sm:mb-20">
        {children}
      </main>

    </div>
  );
};

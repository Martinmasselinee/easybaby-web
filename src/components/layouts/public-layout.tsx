import React from 'react';

interface PublicLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function PublicLayout({ children, title, subtitle }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {(title || subtitle) && (
          <div className="text-center">
            {title && (
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            )}
            {subtitle && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
            )}
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export function PublicPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      {subtitle && (
        <p className="text-gray-600">{subtitle}</p>
      )}
    </div>
  );
}

export function PublicLoadingState({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

export function PublicEmptyState({ 
  icon, 
  title, 
  description,
  children 
}: { 
  icon: string; 
  title: string; 
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {children}
    </div>
  );
}

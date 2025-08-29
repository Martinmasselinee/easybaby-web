import React from 'react';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  subtitle?: string;
}

export function PageLayout({ title, children, actions, subtitle }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de page uniforme */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-black">{title}</h1>
            {subtitle && (
              <p className="text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex space-x-3">{actions}</div>}
        </div>
      </div>
      
      {/* Contenu de la page */}
      <div className="px-6 py-6">
        {children}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
      <div className="text-6xl mb-6 opacity-50">{icon}</div>
      <h3 className="text-xl font-semibold text-black mb-3">
        {title}
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {description}
      </p>
      {action && action}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Chargement..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-black mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
      <div className="text-6xl mb-6 opacity-50">⚠️</div>
      <div className="text-black mb-6 font-medium">{message}</div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}

import React from 'react';

interface AdminPageWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function AdminPageWrapper({ title, subtitle, children, actions }: AdminPageWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de page avec titre */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex flex-col sm:flex-row gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

/* États communs */
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="text-6xl mb-4 opacity-60">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Chargement..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900 mx-auto mb-4"></div>
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
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="text-6xl mb-4 opacity-60">⚠️</div>
      <div className="text-gray-900 mb-4 font-medium">{message}</div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}

/* Boutons uniformes */
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function PrimaryButton({ children, onClick, href, disabled, type = 'button' }: PrimaryButtonProps) {
  const className = `inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
    disabled 
      ? 'bg-gray-300 cursor-not-allowed' 
      : 'bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
  }`;

  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, href, disabled, type = 'button' }: PrimaryButtonProps) {
  const className = `inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  }`;

  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}

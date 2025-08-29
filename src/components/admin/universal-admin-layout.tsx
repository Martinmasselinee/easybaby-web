import React from 'react';

interface UniversalAdminLayoutProps {
  children: React.ReactNode;
}

export function UniversalAdminLayout({ children }: UniversalAdminLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-gray-600">{subtitle}</p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}

interface LoadingStateProps {
  title: string;
  subtitle?: string;
  message?: string;
}

export function LoadingState({ title, subtitle, message = "Chargement..." }: LoadingStateProps) {
  return (
    <UniversalAdminLayout>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </UniversalAdminLayout>
  );
}

interface ErrorStateProps {
  title: string;
  subtitle?: string;
  error: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title, subtitle, error, onRetry, retryLabel = "Réessayer" }: ErrorStateProps) {
  return (
    <UniversalAdminLayout>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="text-center py-8">
        <div className="text-6xl mb-4 opacity-50">⚠️</div>
        <p className="text-red-600 mb-4">Erreur : {error}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {retryLabel}
          </button>
        )}
      </div>
    </UniversalAdminLayout>
  );
}

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon: string;
  emptyTitle: string;
  emptyDescription: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, subtitle, icon, emptyTitle, emptyDescription, action }: EmptyStateProps) {
  return (
    <UniversalAdminLayout>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <div className="text-6xl mb-4 opacity-60">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {emptyTitle}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {emptyDescription}
        </p>
        {action}
      </div>
    </UniversalAdminLayout>
  );
}

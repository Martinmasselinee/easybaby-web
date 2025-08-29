import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Edit, Trash2, Eye, Settings, Plus, Download, Search } from 'lucide-react';

// ===== UNIVERSAL DESIGN TOKENS =====
export const DESIGN_TOKENS = {
  // Colors
  colors: {
    primary: {
      50: 'bg-gray-50',
      100: 'bg-gray-100', 
      500: 'bg-gray-500',
      600: 'bg-gray-600',
      700: 'bg-gray-700',
      800: 'bg-gray-800',
      900: 'bg-gray-900'
    },
    success: {
      50: 'bg-green-50',
      100: 'bg-green-100',
      600: 'bg-green-600',
      700: 'bg-green-700',
      800: 'text-green-800'
    },
    danger: {
      50: 'bg-red-50',
      100: 'bg-red-100',
      600: 'bg-red-600',
      700: 'bg-red-700',
      800: 'text-red-800'
    },
    warning: {
      50: 'bg-orange-50',
      100: 'bg-orange-100',
      600: 'bg-orange-600',
      700: 'bg-orange-700',
      800: 'text-orange-800'
    }
  },
  
  // Spacing
  spacing: {
    section: 'space-y-6',
    card: 'space-y-4',
    form: 'space-y-4',
    button: 'space-x-3',
    grid: 'gap-6'
  },
  
  // Borders & Shadows
  borders: {
    card: 'border border-gray-200',
    rounded: 'rounded-lg',
    table: 'border border-gray-200 rounded-lg overflow-hidden'
  }
};

// ===== UNIFIED PAGE LAYOUT =====
interface AdminPageLayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminPageLayout({ title, subtitle, actions, children }: AdminPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        </div>
        
        {/* Page Content */}
        <div className={DESIGN_TOKENS.spacing.section}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ===== STANDARDIZED LOADING STATES =====
export function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <Button onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    </div>
  );
}

// ===== UNIVERSAL TABLE SYSTEM =====
export const ADMIN_TABLE_STYLES = {
  wrapper: "bg-white rounded-lg border border-gray-200 overflow-hidden",
  table: "min-w-full divide-y divide-gray-200",
  thead: "bg-gray-50",
  th: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
  tbody: "bg-white divide-y divide-gray-200", 
  tr: "hover:bg-gray-50 transition-colors",
  td: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900",
  tdSecondary: "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
  actions: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
};

interface TableWrapperProps {
  children: React.ReactNode;
}

export function AdminTableWrapper({ children }: TableWrapperProps) {
  return (
    <div className={ADMIN_TABLE_STYLES.wrapper}>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

// ===== STANDARDIZED BUTTON SYSTEM =====
interface ActionButtonProps {
  variant: 'edit' | 'delete' | 'view' | 'manage' | 'add';
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function ActionButton({ variant, onClick, href, disabled, children }: ActionButtonProps) {
  const getIcon = () => {
    switch (variant) {
      case 'edit': return <Edit className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      case 'view': return <Eye className="h-4 w-4" />;
      case 'manage': return <Settings className="h-4 w-4" />;
      case 'add': return <Plus className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (variant) {
      case 'delete': return 'outline';
      default: return 'outline';
    }
  };

  const getClassName = () => {
    switch (variant) {
      case 'delete': return 'border-red-200 text-red-600 hover:bg-red-50';
      default: return 'border-gray-200';
    }
  };

  const content = children || getIcon();

  if (href) {
    return (
      <Link href={href}>
        <Button
          variant={getVariant()}
          size="sm"
          className={getClassName()}
          disabled={disabled}
        >
          {content}
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant={getVariant()}
      size="sm"
      className={getClassName()}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </Button>
  );
}

// ===== STANDARDIZED PRIMARY BUTTONS =====
interface PrimaryButtonProps {
  variant: 'create' | 'save' | 'download' | 'search';
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function PrimaryButton({ variant, onClick, href, disabled, children }: PrimaryButtonProps) {
  const getIcon = () => {
    switch (variant) {
      case 'create': return <Plus className="h-4 w-4 mr-2" />;
      case 'save': return null;
      case 'download': return <Download className="h-4 w-4 mr-2" />;
      case 'search': return <Search className="h-4 w-4 mr-2" />;
    }
  };

  const getText = () => {
    switch (variant) {
      case 'create': return 'Créer';
      case 'save': return 'Enregistrer';
      case 'download': return 'Télécharger';
      case 'search': return 'Rechercher';
    }
  };

  const content = (
    <>
      {getIcon()}
      {children || getText()}
    </>
  );

  if (href) {
    return (
      <Link href={href}>
        <Button disabled={disabled}>
          {content}
        </Button>
      </Link>
    );
  }

  return (
    <Button onClick={onClick} disabled={disabled}>
      {content}
    </Button>
  );
}

// ===== STANDARDIZED CARDS =====
interface AdminCardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AdminCard({ title, subtitle, actions, children, className = '' }: AdminCardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center space-x-3">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// ===== STANDARDIZED STATS CARDS =====
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: 'gray' | 'green' | 'red' | 'orange' | 'blue';
}

export function AdminStatsCard({ title, value, icon, color = 'gray' }: StatsCardProps) {
  return (
    <div className="p-6 rounded-lg border bg-white border-gray-200">
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-3xl text-gray-700">{icon}</div>
      </div>
    </div>
  );
}

// ===== STANDARDIZED EMPTY STATES =====
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function AdminEmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
}

// ===== STANDARDIZED DIALOGS =====
interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AdminDialog({ isOpen, onClose, title, children, maxWidth = 'md' }: AdminDialogProps) {
  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      default: return 'max-w-md';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={getMaxWidth()}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// ===== STANDARDIZED FORMS =====
interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function AdminFormField({ 
  label, 
  id, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  disabled = false 
}: FormFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {type === 'textarea' ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full"
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full"
        />
      )}
    </div>
  );
}

// ===== STANDARDIZED STATUS BADGES =====
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'success' | 'error' | 'warning' | 'pending';
  text: string;
}

export function AdminStatusBadge({ status, text }: StatusBadgeProps) {
  const getStatusClasses = () => {
    switch (status) {
      case 'active':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses()}`}>
      {text}
    </span>
  );
}

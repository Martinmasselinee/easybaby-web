import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function YellowEmptyState({ icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {children}
    </div>
  );
}

export function BlueEmptyState({ icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {children}
    </div>
  );
}

export function GrayEmptyState({ icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {children}
    </div>
  );
}

// Composants spécialisés pour les prérequis
interface PrerequisiteEmptyStateProps {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export function PrerequisiteEmptyState({ 
  icon, 
  title, 
  description, 
  buttonText, 
  buttonHref 
}: PrerequisiteEmptyStateProps) {
  return (
    <YellowEmptyState
      icon={icon}
      title={title}
      description={description}
    >
      <Button asChild>
        <Link href={buttonHref}>{buttonText}</Link>
      </Button>
    </YellowEmptyState>
  );
}

// Composants de prérequis spécifiques
// Ce composant sera utilisé avec un Dialog externe
export function NoCitiesEmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <BlueEmptyState
      icon="🏙️"
      title="Aucune ville configurée"
      description="Commencez par créer votre première ville. C'est le point de départ pour configurer vos hôtels partenaires et leurs équipements."
    >
      <Button onClick={onCreateClick}>
        Créer votre première ville
      </Button>
    </BlueEmptyState>
  );
}

export function NoHotelsEmptyState() {
  return (
    <PrerequisiteEmptyState
      icon="🏨"
      title="Aucun hôtel disponible"
      description="Vous devez d'abord créer au moins un hôtel avant de pouvoir ajouter des produits. Les produits seront disponibles dans vos hôtels partenaires."
      buttonText="Créer un hôtel"
      buttonHref="/admin/hotels"
    />
  );
}

export function NoProductsEmptyState() {
  return (
    <PrerequisiteEmptyState
      icon="📦"
      title="Aucun produit disponible"
      description="Vous devez d'abord créer des produits avant de pouvoir gérer le stock dans vos hôtels."
      buttonText="Créer des produits"
      buttonHref="/admin/products"
    />
  );
}

export function NoStockEmptyState() {
  return (
    <PrerequisiteEmptyState
      icon="📊"
      title="Aucun stock configuré"
      description="Vous devez d'abord configurer du stock (produits dans les hôtels) avant que les clients puissent faire des réservations."
      buttonText="Configurer le stock"
      buttonHref="/admin/stock"
    />
  );
}

// Composants réutilisables pour les UI
interface TableWrapperProps {
  children: React.ReactNode;
}

export function TableWrapper({ children }: TableWrapperProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

// Standardized table styles to match Products page design
export const TABLE_STYLES = {
  table: "min-w-full divide-y divide-gray-200",
  thead: "bg-gray-50",
  th: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
  tbody: "bg-white divide-y divide-gray-200",
  tr: "hover:bg-gray-50",
  td: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900",
  tdSecondary: "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
  actions: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
};

// Standardized action button styles
export const ACTION_BUTTON_STYLES = {
  edit: "border-gray-200",
  delete: "border-red-200 text-red-600 hover:bg-red-50",
  manage: "border-gray-200"
};

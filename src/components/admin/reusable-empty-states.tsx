import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  AdminEmptyState, 
  AdminTableWrapper, 
  AdminStatsCard, 
  ADMIN_TABLE_STYLES,
  ActionButton,
  PrimaryButton
} from './design-system';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function YellowEmptyState({ icon, title, description, children }: EmptyStateProps) {
  return <AdminEmptyState icon={icon} title={title} description={description} action={children} />;
}

export function BlueEmptyState({ icon, title, description, children }: EmptyStateProps) {
  return <AdminEmptyState icon={icon} title={title} description={description} action={children} />;
}

export function GrayEmptyState({ icon, title, description, children }: EmptyStateProps) {
  return <AdminEmptyState icon={icon} title={title} description={description} action={children} />;
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
  return <AdminTableWrapper>{children}</AdminTableWrapper>;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return <AdminStatsCard title={title} value={value} icon={icon} />;
}

// Export the new standardized styles - keep for backward compatibility
export const TABLE_STYLES = ADMIN_TABLE_STYLES;

// Standardized action button styles - keep for backward compatibility  
export const ACTION_BUTTON_STYLES = {
  edit: "border-gray-200",
  delete: "border-red-200 text-red-600 hover:bg-red-50",
  manage: "border-gray-200"
};

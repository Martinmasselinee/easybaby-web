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
    <div className="text-center py-16 bg-yellow-50 rounded-lg border border-yellow-200">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-yellow-900 mb-2">
        {title}
      </h3>
      <p className="text-yellow-800 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {children}
    </div>
  );
}

export function BlueEmptyState({ icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-blue-50 rounded-lg border border-blue-200">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-blue-900 mb-2">
        {title}
      </h3>
      <p className="text-blue-800 mb-6 max-w-md mx-auto">
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
export function NoCitiesEmptyState() {
  return (
    <BlueEmptyState
      icon="🏙️"
      title="Aucune ville configurée"
      description="Commencez par créer votre première ville. C'est le point de départ pour configurer vos hôtels partenaires et leurs équipements."
    >
      <Button asChild>
        <Link href="/admin/cities">Créer votre première ville</Link>
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

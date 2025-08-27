import { NextRequest } from 'next/server';

export type ApiVersion = 'v1' | 'v2';

export interface VersionedApiResponse<T = any> {
  version: ApiVersion;
  data?: T;
  error?: boolean;
  message?: string;
  deprecated?: boolean;
  upgradeMessage?: string;
}

export function getApiVersion(request: NextRequest): ApiVersion {
  // Priorité : header API-Version > query param version > default v1
  const headerVersion = request.headers.get('API-Version') as ApiVersion;
  const queryVersion = request.nextUrl.searchParams.get('version') as ApiVersion;
  
  const version = headerVersion || queryVersion || 'v1';
  
  // Valider que la version est supportée
  if (!['v1', 'v2'].includes(version)) {
    return 'v1'; // Fallback vers v1
  }
  
  return version;
}

export function createVersionedResponse<T>(
  version: ApiVersion,
  data: T,
  message?: string
): VersionedApiResponse<T> {
  const response: VersionedApiResponse<T> = {
    version,
    data,
    message,
  };

  // Marquer v1 comme deprecated
  if (version === 'v1') {
    response.deprecated = true;
    response.upgradeMessage = 'Cette version de l\'API est dépréciée. Veuillez migrer vers la v2.';
  }

  return response;
}

export function createVersionedErrorResponse(
  version: ApiVersion,
  message: string,
  code?: string
): VersionedApiResponse {
  return {
    version,
    error: true,
    message,
    ...(version === 'v1' && {
      deprecated: true,
      upgradeMessage: 'Cette version de l\'API est dépréciée. Veuillez migrer vers la v2.'
    }),
  };
}

// Transformer les données selon la version
export function transformDataForVersion<T>(data: T, version: ApiVersion): T {
  if (version === 'v1') {
    // Pour v1, on garde le format legacy
    return data;
  }
  
  if (version === 'v2') {
    // Pour v2, on peut transformer les données
    if (Array.isArray(data)) {
      return data.map(item => transformItemForV2(item)) as T;
    } else if (data && typeof data === 'object') {
      return transformItemForV2(data) as T;
    }
  }
  
  return data;
}

function transformItemForV2(item: any): any {
  if (!item || typeof item !== 'object') {
    return item;
  }

  // Exemples de transformations pour v2
  const transformed = { ...item };

  // Standardiser les dates en ISO
  if (transformed.createdAt) {
    transformed.created_at = new Date(transformed.createdAt).toISOString();
    delete transformed.createdAt;
  }
  
  if (transformed.updatedAt) {
    transformed.updated_at = new Date(transformed.updatedAt).toISOString();
    delete transformed.updatedAt;
  }

  // Transformer les montants en format décimal pour v2
  if (transformed.priceCents) {
    transformed.price = (transformed.priceCents / 100).toFixed(2);
    transformed.currency = 'EUR';
    delete transformed.priceCents;
  }

  if (transformed.depositCents) {
    transformed.deposit = (transformed.depositCents / 100).toFixed(2);
    transformed.deposit_currency = 'EUR';
    delete transformed.depositCents;
  }

  // Ajouter des métadonnées pour v2
  if (transformed.id) {
    transformed.links = {
      self: `/api/v2/${getResourceType(transformed)}/${transformed.id}`,
    };
  }

  return transformed;
}

function getResourceType(item: any): string {
  // Détecter le type de ressource basé sur les propriétés
  if (item.code && item.userEmail) return 'reservations';
  if (item.slug && item.name && !item.address) return 'cities';
  if (item.address && item.email) return 'hotels';
  if (item.pricePerHour || item.pricePerDay) return 'products';
  return 'resources';
}

// Middleware pour gérer les versions
export function withApiVersioning<T>(
  handler: (request: NextRequest, version: ApiVersion) => Promise<T>
) {
  return async (request: NextRequest): Promise<T> => {
    const version = getApiVersion(request);
    
    // Logger l'usage des versions pour monitoring
    console.log(`API Request - Version: ${version}, Path: ${request.nextUrl.pathname}`);
    
    return handler(request, version);
  };
}

// Utilitaires pour la deprecation
export function isVersionDeprecated(version: ApiVersion): boolean {
  return version === 'v1';
}

export function getVersionSunsetDate(version: ApiVersion): Date | null {
  if (version === 'v1') {
    // v1 sera supprimée dans 6 mois
    const sunsetDate = new Date();
    sunsetDate.setMonth(sunsetDate.getMonth() + 6);
    return sunsetDate;
  }
  return null;
}

export function addDeprecationHeaders(
  response: Response,
  version: ApiVersion
): Response {
  if (isVersionDeprecated(version)) {
    const sunsetDate = getVersionSunsetDate(version);
    
    response.headers.set('Deprecation', 'true');
    response.headers.set('Warning', '299 - "Cette version de l\'API est dépréciée"');
    
    if (sunsetDate) {
      response.headers.set('Sunset', sunsetDate.toISOString());
    }
    
    response.headers.set('Link', '</api/v2>; rel="successor-version"');
  }
  
  return response;
}

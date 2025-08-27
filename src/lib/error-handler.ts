export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, status: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const errorCodes = {
  // Authentification
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Ressources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Métier
  INSUFFICIENT_INVENTORY: 'INSUFFICIENT_INVENTORY',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  RESERVATION_EXPIRED: 'RESERVATION_EXPIRED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  
  // Système
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const;

export const errorMessages = {
  [errorCodes.UNAUTHORIZED]: 'Vous devez être connecté pour effectuer cette action',
  [errorCodes.FORBIDDEN]: 'Vous n\'avez pas les permissions nécessaires',
  [errorCodes.INVALID_CREDENTIALS]: 'Identifiants invalides',
  [errorCodes.VALIDATION_ERROR]: 'Les données fournies ne sont pas valides',
  [errorCodes.MISSING_REQUIRED_FIELD]: 'Un champ obligatoire est manquant',
  [errorCodes.INVALID_FORMAT]: 'Le format des données est incorrect',
  [errorCodes.NOT_FOUND]: 'La ressource demandée n\'existe pas',
  [errorCodes.ALREADY_EXISTS]: 'Cette ressource existe déjà',
  [errorCodes.CONFLICT]: 'Conflit avec l\'état actuel de la ressource',
  [errorCodes.INSUFFICIENT_INVENTORY]: 'Stock insuffisant pour cette période',
  [errorCodes.INVALID_DATE_RANGE]: 'La plage de dates sélectionnée n\'est pas valide',
  [errorCodes.RESERVATION_EXPIRED]: 'Cette réservation a expiré',
  [errorCodes.PAYMENT_FAILED]: 'Le paiement a échoué',
  [errorCodes.DATABASE_ERROR]: 'Erreur de base de données',
  [errorCodes.EXTERNAL_SERVICE_ERROR]: 'Erreur du service externe',
  [errorCodes.INTERNAL_ERROR]: 'Erreur interne du serveur',
  [errorCodes.RATE_LIMIT_EXCEEDED]: 'Trop de requêtes, veuillez réessayer plus tard'
};

export function createError(code: keyof typeof errorCodes, customMessage?: string, details?: any): AppError {
  const message = customMessage || errorMessages[code];
  const status = getStatusFromCode(code);
  return new AppError(message, status, code, details);
}

function getStatusFromCode(code: keyof typeof errorCodes): number {
  switch (code) {
    case errorCodes.UNAUTHORIZED:
      return 401;
    case errorCodes.FORBIDDEN:
      return 403;
    case errorCodes.NOT_FOUND:
      return 404;
    case errorCodes.ALREADY_EXISTS:
    case errorCodes.CONFLICT:
    case errorCodes.INSUFFICIENT_INVENTORY:
    case errorCodes.INVALID_DATE_RANGE:
    case errorCodes.RESERVATION_EXPIRED:
      return 409;
    case errorCodes.VALIDATION_ERROR:
    case errorCodes.MISSING_REQUIRED_FIELD:
    case errorCodes.INVALID_FORMAT:
    case errorCodes.INVALID_CREDENTIALS:
      return 400;
    case errorCodes.PAYMENT_FAILED:
      return 402;
    case errorCodes.RATE_LIMIT_EXCEEDED:
      return 429;
    case errorCodes.DATABASE_ERROR:
    case errorCodes.EXTERNAL_SERVICE_ERROR:
    case errorCodes.INTERNAL_ERROR:
    default:
      return 500;
  }
}

export function handleApiError(error: unknown): { message: string; code: string; status: number } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status
    };
  }

  if (error instanceof Error) {
    console.error('Unhandled error:', error);
    return {
      message: 'Une erreur inattendue s\'est produite',
      code: errorCodes.INTERNAL_ERROR,
      status: 500
    };
  }

  console.error('Unknown error:', error);
  return {
    message: 'Une erreur inconnue s\'est produite',
    code: errorCodes.INTERNAL_ERROR,
    status: 500
  };
}

// Hook pour la gestion des erreurs côté client
export function useErrorHandler() {
  const handleError = (error: any): string => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error?.message) {
      return error.message;
    }

    if (error?.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Données invalides';
        case 401:
          return 'Vous devez être connecté';
        case 403:
          return 'Accès refusé';
        case 404:
          return 'Ressource introuvable';
        case 409:
          return 'Conflit détecté';
        case 429:
          return 'Trop de requêtes, veuillez patienter';
        case 500:
          return 'Erreur du serveur';
        default:
          return 'Une erreur s\'est produite';
      }
    }

    return 'Une erreur inattendue s\'est produite';
  };

  return { handleError };
}

// Utilitaire pour les retry automatiques
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }

      // Ne pas faire de retry pour certaines erreurs
      if (error instanceof AppError) {
        const noRetryStatuses = [400, 401, 403, 404, 422];
        if (noRetryStatuses.includes(error.status)) {
          throw error;
        }
      }

      // Délai exponentiel
      const retryDelay = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError;
}

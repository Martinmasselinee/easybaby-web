import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, AppError } from './error-handler';
import { logger, MetricsLogger } from './logger';

export interface ApiHandler<T = any> {
  (request: NextRequest, context?: any): Promise<T>;
}

export function withErrorHandling<T>(handler: ApiHandler<T>) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now();
    const method = request.method;
    const url = request.url;
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    try {
      logger.debug('API Request started', {
        method,
        url,
        ip,
        userAgent,
      });

      const result = await handler(request, context);
      
      const duration = Date.now() - startTime;
      let response: NextResponse;
      
      if (result instanceof NextResponse) {
        response = result;
      } else {
        response = NextResponse.json(result);
      }
      
      // Log successful request
      MetricsLogger.logApiRequest(
        method,
        url,
        response.status,
        duration,
        context?.user?.id
      );
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResponse = handleApiError(error);
      
      // Log error with context
      logger.apiError('API Error occurred', error as Error, {
        method,
        url,
        ip,
        userAgent,
        userId: context?.user?.id,
        duration,
        body: context?.body,
      });
      
      // Log metrics for failed request
      MetricsLogger.logApiRequest(
        method,
        url,
        errorResponse.status,
        duration,
        context?.user?.id
      );
      
      return NextResponse.json(
        {
          error: true,
          message: errorResponse.message,
          code: errorResponse.code,
          ...(process.env.NODE_ENV === 'development' && { 
            stack: error instanceof Error ? error.stack : undefined 
          })
        },
        { status: errorResponse.status }
      );
    }
  };
}

export function withValidation<T>(schema: any, handler: ApiHandler<T>) {
  return withErrorHandling(async (request: NextRequest, context?: any) => {
    let body;
    
    try {
      if (request.method !== 'GET' && request.method !== 'DELETE') {
        body = await request.json();
      }
    } catch {
      throw new AppError('Corps de la requête invalide', 400, 'INVALID_JSON');
    }
    
    // Validation avec Zod si un schéma est fourni
    if (schema && body) {
      try {
        body = schema.parse(body);
      } catch (validationError: any) {
        throw new AppError(
          'Données de validation invalides',
          400,
          'VALIDATION_ERROR',
          validationError.errors || validationError.message
        );
      }
    }
    
    return handler(request, { ...context, body });
  });
}

export function withAuth(handler: ApiHandler) {
  return withErrorHandling(async (request: NextRequest, context?: any) => {
    // Pour l'instant, on utilise un système d'authentification simple
    // Dans un vrai projet, on vérifierait un JWT ou une session
    const authHeader = request.headers.get('authorization');
    const sessionCookie = request.cookies.get('admin_session');
    
    if (!authHeader && !sessionCookie) {
      throw new AppError('Authentification requise', 401, 'UNAUTHORIZED');
    }
    
    // Ici on pourrait décoder le token et récupérer les infos utilisateur
    const user = { id: 'admin', email: 'admin@easybaby.io', role: 'admin' };
    
    return handler(request, { ...context, user });
  });
}

export function withRateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return function(handler: ApiHandler) {
    return withErrorHandling(async (request: NextRequest, context?: any) => {
      const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();
      const windowStart = Math.floor(now / windowMs) * windowMs;
      
      const requestData = requests.get(ip);
      
      if (!requestData || requestData.resetTime < windowStart) {
        requests.set(ip, { count: 1, resetTime: windowStart + windowMs });
      } else {
        requestData.count++;
        
        if (requestData.count > maxRequests) {
          throw new AppError(
            'Limite de requêtes dépassée',
            429,
            'RATE_LIMIT_EXCEEDED'
          );
        }
      }
      
      return handler(request, context);
    });
  };
}

// Utilitaire pour logger les erreurs
export function logError(error: any, context?: any) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    message: error.message,
    stack: error.stack,
    context
  };
  
  if (process.env.NODE_ENV === 'production') {
    // En production, on pourrait envoyer vers un service comme Sentry
    console.error('Production Error:', JSON.stringify(errorInfo));
  } else {
    console.error('Development Error:', errorInfo);
  }
}

// Type helper pour les réponses API
export interface ApiResponse<T = any> {
  data?: T;
  error?: boolean;
  message?: string;
  code?: string;
}

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    data,
    message
  };
}

export function createErrorResponse(message: string, code?: string): ApiResponse {
  return {
    error: true,
    message,
    code
  };
}

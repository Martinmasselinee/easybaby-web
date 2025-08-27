'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorReport {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'CRITICAL' | 'WARNING';
  message: string;
  context?: any;
  count: number;
  resolved: boolean;
}

export function ErrorReportsDashboard() {
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [filter, setFilter] = useState<'all' | 'ERROR' | 'CRITICAL' | 'WARNING'>('all');
  const [showResolved, setShowResolved] = useState(false);

  // Simuler des données d'erreurs pour la démo
  useEffect(() => {
    const mockReports: ErrorReport[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        level: 'CRITICAL',
        message: 'Database connection failed',
        context: { database: 'primary', attempts: 3 },
        count: 5,
        resolved: false,
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        level: 'ERROR',
        message: 'Payment processing failed',
        context: { paymentId: 'pi_123', amount: 5000 },
        count: 2,
        resolved: false,
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        level: 'WARNING',
        message: 'High API response time detected',
        context: { endpoint: '/api/reservations', avgTime: 2500 },
        count: 15,
        resolved: true,
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        level: 'ERROR',
        message: 'Email delivery failed',
        context: { provider: 'resend', errorCode: 'RATE_LIMIT' },
        count: 8,
        resolved: false,
      }
    ];

    setReports(mockReports);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesLevel = filter === 'all' || report.level === filter;
    const matchesResolved = showResolved || !report.resolved;
    return matchesLevel && matchesResolved;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ERROR':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const errorTime = new Date(timestamp);
    const diffMs = now.getTime() - errorTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `il y a ${diffHours}h`;
    } else {
      return `il y a ${diffMinutes}min`;
    }
  };

  const markAsResolved = (reportId: string) => {
    setReports(prev =>
      prev.map(report =>
        report.id === reportId ? { ...report, resolved: true } : report
      )
    );
  };

  const getStats = () => {
    const critical = reports.filter(r => r.level === 'CRITICAL' && !r.resolved).length;
    const errors = reports.filter(r => r.level === 'ERROR' && !r.resolved).length;
    const warnings = reports.filter(r => r.level === 'WARNING' && !r.resolved).length;
    
    return { critical, errors, warnings };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Rapports d'erreurs</h1>
        <p className="text-gray-600">
          Surveillez et gérez les erreurs de l'application
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800">Critiques</h3>
          <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-orange-800">Erreurs</h3>
          <p className="text-2xl font-bold text-orange-900">{stats.errors}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800">Avertissements</h3>
          <p className="text-2xl font-bold text-yellow-900">{stats.warnings}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">Tous les niveaux</option>
            <option value="CRITICAL">Critique</option>
            <option value="ERROR">Erreur</option>
            <option value="WARNING">Avertissement</option>
          </select>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Afficher les résolues</span>
          </label>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun rapport d'erreur trouvé
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className={`border rounded-lg p-4 ${
                report.resolved ? 'bg-gray-50 opacity-60' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(
                        report.level
                      )}`}
                    >
                      {report.level}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getTimeAgo(report.timestamp)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {report.count} occurrence{report.count > 1 ? 's' : ''}
                    </span>
                    {report.resolved && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Résolu
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2">
                    {report.message}
                  </h3>
                  
                  {report.context && (
                    <details className="text-sm text-gray-600">
                      <summary className="cursor-pointer hover:text-gray-800">
                        Voir le contexte
                      </summary>
                      <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(report.context, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {!report.resolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsResolved(report.id)}
                    >
                      Marquer comme résolu
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Filter
} from 'lucide-react';
import { getAbsenceTypeLabel, getAbsenceTypeColor, ABSENCE_REQUEST_STATUS } from '../../../constants/team';

/**
 * AbsenceRequestsPanel - Verwaltung von Abwesenheitsanfragen
 *
 * @param {Array} requests - Alle Abwesenheitsanfragen
 * @param {Array} teamMembers - Team-Mitglieder für Namen-Lookup
 * @param {Function} onBack - Zurück zur Liste
 * @param {Function} onApprove - Anfrage genehmigen
 * @param {Function} onReject - Anfrage ablehnen
 */
const AbsenceRequestsPanel = ({
  requests = [],
  teamMembers = [],
  onBack,
  onApprove,
  onReject
}) => {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(null);

  // Member Lookup
  const getMember = (memberId) => teamMembers.find(m => m.id === memberId);

  // Gefilterte Anfragen
  const filteredRequests = requests.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  // Sortiert: Pending zuerst, dann nach Datum
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.requestedAt) - new Date(a.requestedAt);
  });

  const handleApprove = (requestId) => {
    onApprove?.(requestId);
  };

  const handleReject = (requestId) => {
    onReject?.(requestId, rejectReason);
    setShowRejectDialog(null);
    setRejectReason('');
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        icon: AlertCircle,
        label: 'Offen'
      },
      approved: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        icon: CheckCircle,
        label: 'Genehmigt'
      },
      rejected: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        icon: XCircle,
        label: 'Abgelehnt'
      }
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Berechne Anzahl der Tage
  const getDaysCount = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Abwesenheitsanfragen
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {requests.filter(r => r.status === 'pending').length} offene Anfragen
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {[
            { value: 'pending', label: 'Offen' },
            { value: 'approved', label: 'Genehmigt' },
            { value: 'rejected', label: 'Abgelehnt' },
            { value: 'all', label: 'Alle' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                statusFilter === option.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Anfragen Liste */}
      <div className="space-y-4">
        {sortedRequests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {statusFilter === 'pending'
                ? 'Keine offenen Anfragen'
                : 'Keine Anfragen gefunden'}
            </p>
          </div>
        ) : (
          sortedRequests.map(request => {
            const member = getMember(request.memberId);

            return (
              <div
                key={request.id}
                className={`p-4 rounded-lg border ${
                  request.status === 'pending'
                    ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Member Info & Request Details */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    {member?.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {member?.name || 'Unbekannt'}
                        </span>
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium bg-${getAbsenceTypeColor(request.type)}-100 dark:bg-${getAbsenceTypeColor(request.type)}-900/30 text-${getAbsenceTypeColor(request.type)}-700 dark:text-${getAbsenceTypeColor(request.type)}-400`}>
                          {getAbsenceTypeLabel(request.type)}
                        </span>

                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(request.startDate).toLocaleDateString('de-DE')} - {new Date(request.endDate).toLocaleDateString('de-DE')}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {getDaysCount(request.startDate, request.endDate)} Tage
                        </span>
                      </div>

                      {request.reason && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{request.reason}</span>
                        </div>
                      )}

                      {request.status === 'rejected' && request.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-400">
                          <span className="font-medium">Ablehnungsgrund:</span> {request.rejectionReason}
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        Angefragt am {new Date(request.requestedAt).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  {request.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowRejectDialog(request.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Ablehnen"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Genehmigen"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Reject Dialog */}
                {showRejectDialog === request.id && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ablehnungsgrund (optional)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Warum wird die Anfrage abgelehnt?"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => {
                          setShowRejectDialog(null);
                          setRejectReason('');
                        }}
                        className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Ablehnen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AbsenceRequestsPanel;

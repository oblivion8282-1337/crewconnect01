import React, { useState, useMemo } from 'react';
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Palmtree,
  AlertTriangle,
  X,
  Calendar,
  Briefcase
} from 'lucide-react';
import { ABSENCE_TYPES } from '../../constants/team';
import { createDateKey } from '../../utils/dateUtils';

/**
 * MyAbsenceRequests - Urlaubsanträge für Mitarbeiter
 */
const MyAbsenceRequests = ({
  member,
  requests = [],
  absences = [],
  assignments = [],
  projects = [],
  onCreateRequest,
  onWithdraw
}) => {
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);

  const todayKey = createDateKey(new Date());

  // Sortiere nach Status und Datum
  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      // Pending zuerst
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      // Dann nach Startdatum
      return b.startDate.localeCompare(a.startDate);
    });
  }, [requests]);

  // Genehmigte zukünftige Abwesenheiten
  const futureAbsences = useMemo(() => {
    return absences
      .filter(a => a.endDate >= todayKey)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [absences, todayKey]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (start === end) {
      return formatDate(start);
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getAbsenceTypeInfo = (type) => {
    return ABSENCE_TYPES.find(t => t.value === type) || { label: type, color: 'gray' };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
            <Clock className="w-3 h-3" />
            Ausstehend
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            <CheckCircle className="w-3 h-3" />
            Genehmigt
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            <XCircle className="w-3 h-3" />
            Abgelehnt
          </span>
        );
      default:
        return null;
    }
  };

  // Berechne Anzahl der Tage
  const getDayCount = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Urlaub & Abwesenheit</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Verwalte deine Urlaubsanträge
          </p>
        </div>
        <button
          onClick={() => setShowNewRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Neuer Antrag
        </button>
      </div>

      {/* Genehmigte zukünftige Abwesenheiten */}
      {futureAbsences.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4">
          <h2 className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2 mb-3">
            <Palmtree className="w-5 h-5" />
            Kommende Abwesenheiten
          </h2>
          <div className="space-y-2">
            {futureAbsences.map(absence => {
              const typeInfo = getAbsenceTypeInfo(absence.type);
              return (
                <div key={absence.id} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {typeInfo.label}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      {formatDateRange(absence.startDate, absence.endDate)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {getDayCount(absence.startDate, absence.endDate)} Tag(e)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Anträge */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Meine Anträge</h2>
        </div>

        {sortedRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Keine Anträge
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Du hast noch keine Urlaubsanträge gestellt.
            </p>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Jetzt Antrag stellen →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {sortedRequests.map(request => {
              const typeInfo = getAbsenceTypeInfo(request.type);
              const dayCount = getDayCount(request.startDate, request.endDate);

              return (
                <div key={request.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      ${typeInfo.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                        typeInfo.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        typeInfo.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        typeInfo.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}
                    `}>
                      <Palmtree className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {typeInfo.label}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateRange(request.startDate, request.endDate)}
                            <span className="ml-2 text-gray-400">({dayCount} Tag{dayCount !== 1 ? 'e' : ''})</span>
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      {request.reason && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {request.reason}
                        </p>
                      )}

                      {request.status === 'rejected' && request.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <p className="text-sm text-red-700 dark:text-red-300">
                            <strong>Ablehnungsgrund:</strong> {request.rejectionReason}
                          </p>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <button
                          onClick={() => onWithdraw(request.id)}
                          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          Antrag zurückziehen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal für neuen Antrag */}
      {showNewRequestModal && (
        <NewRequestModal
          member={member}
          assignments={assignments}
          projects={projects}
          onClose={() => setShowNewRequestModal(false)}
          onSubmit={(data) => {
            onCreateRequest(member.id, data);
            setShowNewRequestModal(false);
          }}
        />
      )}
    </div>
  );
};

/**
 * Modal für neuen Antrag
 */
const NewRequestModal = ({ member, assignments, projects, onClose, onSubmit }) => {
  const [type, setType] = useState('vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const todayKey = createDateKey(new Date());

  // Prüfe auf Konflikte
  const conflicts = useMemo(() => {
    if (!startDate || !endDate) return [];

    const conflictList = [];
    assignments.forEach(assignment => {
      const project = projects.find(p => p.id === assignment.projectId);
      assignment.dates.forEach(date => {
        if (date >= startDate && date <= endDate) {
          conflictList.push({
            date,
            project: project?.name || 'Projekt'
          });
        }
      });
    });

    return conflictList;
  }, [startDate, endDate, assignments, projects]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    onSubmit({
      type,
      startDate,
      endDate,
      reason
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Neuer Abwesenheitsantrag
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Art */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Art der Abwesenheit
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {ABSENCE_TYPES.filter(t => t.value !== 'sick').map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Zeitraum */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Von
              </label>
              <input
                type="date"
                value={startDate}
                min={todayKey}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate || e.target.value > endDate) {
                    setEndDate(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bis
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || todayKey}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Konflikte */}
          {conflicts.length > 0 && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Achtung: Du bist an diesen Tagen eingeplant
              </p>
              <div className="space-y-1">
                {conflicts.slice(0, 5).map((conflict, idx) => (
                  <p key={idx} className="text-xs text-orange-600 dark:text-orange-400">
                    {formatDate(conflict.date)} - {conflict.project}
                  </p>
                ))}
                {conflicts.length > 5 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    ... und {conflicts.length - 5} weitere
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Grund */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Grund (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Kurze Beschreibung..."
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!startDate || !endDate}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Antrag stellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyAbsenceRequests;

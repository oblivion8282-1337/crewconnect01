import React from 'react';
import { Globe, Users, Lock } from 'lucide-react';
import { CALENDAR_VISIBILITY } from '../../hooks/useProfile';

/**
 * CalendarVisibilitySettings - Einstellung für Kalender-Sichtbarkeit
 */
const CalendarVisibilitySettings = ({
  visibility,
  onChange
}) => {
  const options = [
    {
      value: CALENDAR_VISIBILITY.PUBLIC,
      icon: Globe,
      label: 'Öffentlich',
      description: 'Alle Agenturen sehen deinen Kalender'
    },
    {
      value: CALENDAR_VISIBILITY.CONTACTS_ONLY,
      icon: Users,
      label: 'Nur Kontakte',
      description: 'Nur Agenturen mit denen du gearbeitet hast'
    },
    {
      value: CALENDAR_VISIBILITY.ON_REQUEST,
      icon: Lock,
      label: 'Auf Anfrage',
      description: 'Agenturen müssen deine Verfügbarkeit anfragen'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Kalender-Sichtbarkeit
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Wer kann deinen Verfügbarkeitskalender sehen?
        </p>
      </div>

      <div className="space-y-2">
        {options.map(option => {
          const Icon = option.icon;
          const isSelected = visibility === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                w-full p-4 flex items-start gap-4 rounded-xl transition-all text-left
                ${isSelected
                  ? 'bg-accent/10 border-2 border-accent'
                  : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${isSelected
                  ? 'bg-accent text-gray-900'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }
              `}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${isSelected ? 'text-accent' : 'text-gray-900 dark:text-white'}`}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <span className="px-2 py-0.5 bg-accent text-gray-900 text-xs font-medium rounded-full">
                      Aktiv
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarVisibilitySettings;

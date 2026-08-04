import React, { useState, useRef } from 'react';
import type { Entry, EntryType, CmEntry } from '../types';

interface ResultsTableProps {
  entries: Entry[];
  onDeleteEntry: (id: number) => void;
  onSelectEntry: (entry: Entry) => void;
  activeMode: EntryType;
  theme: any;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ entries, onDeleteEntry, onSelectEntry, activeMode, theme }) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deleteTimerRef = useRef<number | null>(null);

  const handleDeleteStart = (e: React.MouseEvent | React.TouchEvent, id: number) => {
    e.stopPropagation();
    setDeletingId(id);
    deleteTimerRef.current = window.setTimeout(() => {
      onDeleteEntry(id);
      setDeletingId(null);
    }, 1000); // 1 second duration
  };

  const handleDeleteCancel = () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
    }
    setDeletingId(null);
  };

  if (entries.length === 0) {
    return (
      <div className={`text-center py-10 px-6 rounded-xl ${theme.card}`}>
        <h3 className="text-xl font-semibold">Noch keine Einträge vorhanden.</h3>
        <p className="opacity-80 mt-2">Füge einen neuen Eintrag hinzu, um zu beginnen.</p>
      </div>
    );
  }

  const formatPercentage = (value: number) => {
    if (!isFinite(value)) return '∞';
    return `${value.toFixed(0)}%`;
  }

  const renderEntryRow = (entry: Entry) => {
    switch (entry.type) {
        case 'cm':
            return (
                <>
                    <td className="px-6 py-3 whitespace-nowrap text-sm opacity-90 text-center">
                        {typeof entry.before === 'number' ? `${entry.before} cm` : '-'}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm opacity-90 text-center">
                        {typeof entry.after === 'number' ? `${entry.after} cm` : '-'}
                    </td>
                    <td className={`px-6 py-3 whitespace-nowrap text-sm font-semibold text-center ${theme.accentText}`}>
                        {typeof entry.absoluteDifference === 'number' ? `${entry.absoluteDifference.toFixed(1)} cm` : '-'}
                    </td>
                    <td className={`px-6 py-3 whitespace-nowrap text-sm font-semibold text-center ${theme.accentText}`}>
                        {typeof entry.relativeDifference === 'number' ? formatPercentage(entry.relativeDifference) : '-'}
                    </td>
                </>
            );
        case 's':
            return (
                <>
                    <td className="px-6 py-3 whitespace-nowrap text-sm opacity-90 text-center">{typeof entry.value === 'number' ? `${entry.value} s` : '-'}</td>
                </>
            )
        case 'wert':
            return (
                <>
                    <td className="px-6 py-3 whitespace-nowrap text-sm opacity-90 text-center">{typeof entry.value === 'number' ? entry.value : '-'}</td>
                </>
            )
        default:
            return <td colSpan={activeMode === 'cm' ? 4 : 1}></td>
    }
  }

  const getHeaderLabel = () => {
    switch (activeMode) {
        case 'cm': return "Vorher";
        case 's': return "Zeit";
        case 'wert': return "Wert";
    }
  }

  return (
    <div className={`rounded-xl shadow-md overflow-hidden ${theme.card}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-0">
          <thead className={theme.tableHeader}>
            <tr>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium">Name</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium">{getHeaderLabel()}</th>
              {activeMode === 'cm' && (
                <>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium">Nachher</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium">Abs. Schwellung</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium">Rel. Schwellung</th>
                </>
              )}
              <th scope="col" className={`relative py-3 ${activeMode === 'cm' ? 'px-4' : 'px-6'}`}>
                <span className="sr-only">Löschen</span>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme.tableBody}`}>
            {entries.map((entry) => (
              <tr 
                key={entry.id} 
                className="hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                onClick={() => onSelectEntry(entry)}
                aria-label={`Eintrag für ${entry.name} bearbeiten`}
              >
                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-center">
                  {entry.name}
                </td>
                {renderEntryRow(entry)}
                <td className={`whitespace-nowrap text-right text-sm font-medium ${activeMode === 'cm' ? 'px-4' : 'px-6'} py-3`}>
                  <button 
                    onMouseDown={(e) => handleDeleteStart(e, entry.id)}
                    onMouseUp={handleDeleteCancel}
                    onMouseLeave={handleDeleteCancel}
                    onTouchStart={(e) => handleDeleteStart(e, entry.id)}
                    onTouchEnd={handleDeleteCancel}
                    className="relative overflow-hidden text-red-500 hover:text-red-700 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    aria-label={`Eintrag für ${entry.name} löschen (1s gedrückt halten)`}
                  >
                    <span
                      className={`absolute bottom-0 left-0 w-full bg-red-700/30 transition-all duration-1000 ease-linear ${
                        deletingId === entry.id ? 'h-full' : 'h-0'
                      }`}
                      aria-hidden="true"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="relative h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
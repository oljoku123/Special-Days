import React, { useState, useEffect, useMemo } from 'react';
import type { Entry, EntryType, CmEntry } from '../types';

interface EntryFormProps {
  entries: Entry[];
  onAddOrUpdateEntry: (data: { name: string; type: EntryType; before?: number; after?: number; value?: number }) => void;
  activeMode: EntryType;
  theme: any;
  entryToEdit: Entry | null;
  onCancelEdit: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ entries, onAddOrUpdateEntry, activeMode, theme, entryToEdit, onCancelEdit }) => {
  const [name, setName] = useState('');
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const existingEntry = useMemo(() => {
    if (!name.trim()) return null;
    return entries.find(e => e.name.toLowerCase() === name.trim().toLowerCase() && e.type === activeMode) || null;
  }, [name, entries, activeMode]);

  useEffect(() => {
    if (existingEntry) {
      if (existingEntry.type === 'cm') {
        setBefore(existingEntry.before?.toString() ?? '');
        setAfter(existingEntry.after?.toString() ?? '');
        setValue('');
      } else {
        setValue(existingEntry.value?.toString() ?? '');
        setBefore('');
        setAfter('');
      }
      setError('');
    }
  }, [existingEntry]);

  useEffect(() => {
    if (entryToEdit) {
        setName(entryToEdit.name);
        if (entryToEdit.type === 'cm') {
            setBefore(entryToEdit.before?.toString() ?? '');
            setAfter(entryToEdit.after?.toString() ?? '');
            setValue('');
        } else { // 's' or 'wert'
            setValue(entryToEdit.value?.toString() ?? '');
            setBefore('');
            setAfter('');
        }
        setError('');
    }
  }, [entryToEdit]);
  
  // Clear inputs when mode changes
  useEffect(() => {
    clearInputs();
  }, [activeMode]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    // If we are in edit mode, but the user changes the name, it's no longer an edit of the original entry.
    if (entryToEdit && newName.toLowerCase() !== entryToEdit.name.toLowerCase()) {
        // Cancel the edit mode (resets entryToEdit in parent)
        onCancelEdit();
        // Clear the value fields as it's now considered a new entry
        setBefore('');
        setAfter('');
        setValue('');
    }
    
    if (newName.trim() === '') {
        setBefore('');
        setAfter('');
        setValue('');
        setError('');
    }
  }

  const clearInputs = () => {
    setName('');
    setBefore('');
    setAfter('');
    setValue('');
    setError('');
    onCancelEdit(); // Also cancel edit mode when clearing inputs
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
        setError('Bitte geben Sie einen Namen an.');
        return;
    }
    
    if (activeMode === 'cm') {
        const beforeNum = before.trim() !== '' ? parseFloat(before) : undefined;
        if (before.trim() !== '' && (beforeNum === undefined || isNaN(beforeNum))) {
            setError('Der "Vorher"-Wert muss eine Zahl sein, wenn er angegeben wird.');
            return;
        }
        
        const afterNum = after.trim() !== '' ? parseFloat(after) : undefined;
        if (after.trim() !== '' && (afterNum === undefined || isNaN(afterNum))) {
            setError('Der "Nachher"-Wert muss eine Zahl sein, wenn er angegeben wird.');
            return;
        }

        onAddOrUpdateEntry({ name: trimmedName, type: 'cm', before: beforeNum, after: afterNum });
    } else {
        const valueNum = value.trim() !== '' ? parseFloat(value) : undefined;
        if (value.trim() !== '' && (valueNum === undefined || isNaN(valueNum))) {
            setError('Der Wert muss eine Zahl sein, wenn er angegeben wird.');
            return;
        }
        onAddOrUpdateEntry({ name: trimmedName, type: activeMode, value: valueNum });
    }
    
    clearInputs();
  };

  return (
    <div className={`p-6 rounded-xl mb-8 ${theme.card}`}>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className={activeMode === 'cm' ? 'md:col-span-2' : 'md:col-span-3'}>
          <label htmlFor="name" className={theme.label}>Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Name eingeben oder auswählen"
            className={theme.input}
          />
        </div>
        
        {activeMode === 'cm' && (
          <>
            <div>
              <label htmlFor="before" className={theme.label}>Vorher (cm)</label>
              <input
                id="before"
                type="number"
                step="any"
                value={before}
                onChange={(e) => setBefore(e.target.value)}
                placeholder="Wert"
                className={theme.input}
              />
            </div>
            <div>
              <label htmlFor="after" className={theme.label}>Nachher (cm)</label>
              <input
                id="after"
                type="number"
                step="any"
                value={after}
                onChange={(e) => setAfter(e.target.value)}
                placeholder="Wert"
                className={theme.input}
              />
            </div>
          </>
        )}

        {activeMode === 's' && (
             <div>
              <label htmlFor="value" className={theme.label}>Zeit (s)</label>
              <input
                id="value"
                type="number"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Zeit"
                className={theme.input}
              />
            </div>
        )}

        {activeMode === 'wert' && (
             <div>
              <label htmlFor="value" className={theme.label}>Wert</label>
              <input
                id="value"
                type="number"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Wert"
                className={theme.input}
              />
            </div>
        )}

        <div className="md:col-span-4">
            <button
            type="submit"
            className={`w-full font-bold py-3 px-4 rounded-lg text-base transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 ${theme.button}`}
            >
            {existingEntry && !entryToEdit ? 'Aktualisieren' : (entryToEdit ? 'Aktualisieren' : 'Hinzufügen')}
            </button>
        </div>
      </form>
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
    </div>
  );
};
import React, { useState, useMemo, useEffect } from 'react';
import { EntryForm } from './components/EntryForm';
import { ResultsTable } from './components/ResultsTable';
import { Podium } from './components/Podium';
import type { Entry, EntryType, CmEntry, SEntry, WertEntry } from './types';

// Base64 encoded SVG for solid color backgrounds
const pumpkingBackground = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxODE4MmMiPjwvcmVjdD48L3N2Zz4=`;
const whiteBackground = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmZmZmYiPjwvcmVjdD48L3N2Zz4=`;
const goldBackground = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZWZjZTgiPjwvcmVjdD48L3N2Zz4=`;


const modeConfig: Record<EntryType, {
    name: string;
    icon: string;
    fontClass: string;
    background: string;
    theme: {
        body: string;
        header: string;
        button: string;
        backButton: string;
        input: string;
        label: string;
        card: string;
        tableHeader: string;
        tableBody: string;
        accentText: string;
        modalBg: string;
    };
}> = {
  cm: { 
    name: "PumpKing", 
    icon: "🎃", 
    fontClass: 'font-creepster',
    background: pumpkingBackground,
    theme: {
        body: 'text-gray-200',
        header: 'bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-yellow-500',
        button: 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500',
        backButton: 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-2 focus:ring-orange-500',
        input: 'w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-base text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500',
        label: 'block text-sm font-medium text-gray-400 mb-1',
        card: 'bg-gray-900/60 backdrop-blur-sm border border-gray-700 shadow-lg shadow-orange-500/10',
        tableHeader: 'bg-gray-800 text-gray-300 uppercase tracking-wider',
        tableBody: 'bg-gray-900/80 divide-gray-700 text-gray-200',
        accentText: 'text-orange-400',
        modalBg: 'bg-gray-800 text-gray-200'
    }
  },
  s: { 
    name: "Santa Special", 
    icon: "🎅", 
    fontClass: 'font-mountains-of-christmas',
    background: goldBackground,
    theme: {
        body: 'text-black',
        header: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
        backButton: 'bg-yellow-300/70 hover:bg-yellow-400/80 text-yellow-800 focus:ring-2 focus:ring-yellow-500',
        input: 'w-full bg-white/80 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500',
        label: 'block text-sm font-medium text-gray-700 mb-1',
        card: 'bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg shadow-red-500/10',
        tableHeader: 'bg-yellow-300/70 text-yellow-800 uppercase tracking-wider',
        tableBody: 'bg-white/80 divide-gray-200 text-gray-900',
        accentText: 'text-red-700',
        modalBg: 'bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg shadow-red-500/10 text-black'
    }
  },
  wert: { 
    name: "Special Days", 
    icon: "🙏", 
    fontClass: 'font-sans',
    background: whiteBackground,
    theme: {
        body: 'text-black',
        header: 'text-black',
        button: 'bg-black hover:bg-gray-800 text-white focus:ring-black',
        backButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-2 focus:ring-black',
        input: 'w-full bg-gray-200/80 border border-gray-400 rounded-lg px-4 py-3 text-base text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black',
        label: 'block text-sm font-medium text-gray-600 mb-1',
        card: 'bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg shadow-gray-500/10',
        tableHeader: 'bg-gray-200 text-black uppercase tracking-wider',
        tableBody: 'bg-white/80 divide-gray-300 text-gray-800',
        accentText: 'text-black',
        modalBg: 'bg-gray-100 text-black'
    }
  },
};

function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [view, setView] = useState<'menu' | 'tracker'>('menu');
  const [activeMode, setActiveMode] = useState<EntryType | null>(null);
  const [specialDaysTitle, setSpecialDaysTitle] = useState('Special Days');
  const [showPodium, setShowPodium] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<Entry | null>(null);

  useEffect(() => {
    // Manage root font size
    document.documentElement.style.fontSize = activeMode ? '20.8px' : '';

    // Manage body styles (font and background)
    const currentConfig = activeMode ? modeConfig[activeMode] : null;

    // Clear previous font classes from body
    Object.values(modeConfig).forEach(config => {
      document.body.classList.remove(config.fontClass);
    });
    
    document.body.classList.add(currentConfig ? currentConfig.fontClass : 'font-sans');
    
    document.body.style.background = currentConfig 
      ? `url("${currentConfig.background}")` 
      : '#f3f4f6'; // bg-gray-100
    document.body.style.backgroundSize = 'auto';
    document.body.style.transition = 'background 0.5s ease-in-out';
    
    // Cleanup on component unmount or mode change
    return () => {
       document.documentElement.style.fontSize = '';
    }
  }, [activeMode]);


  const handleSelectMode = (mode: EntryType) => {
    setActiveMode(mode);
    setShowPodium(false);
    setView('tracker');
  };

  const handleBackToMenu = () => {
    setView('menu');
    setActiveMode(null);
    setShowPodium(false);
  };
  
  const handleSelectEntry = (entry: Entry) => {
    setEntryToEdit(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEntryToEdit(null);
  };

  const addOrUpdateEntry = (data: { name: string; type: EntryType; before?: number; after?: number; value?: number }) => {
    const trimmedName = data.name.trim();
    
    // Find by name AND type. If editing, entryToEdit provides the ID to update.
    const entryToUpdate = entryToEdit ?? entries.find(e => e.name.toLowerCase() === trimmedName.toLowerCase() && e.type === data.type);

    let newOrUpdatedEntry: Entry;

    if (data.type === 'cm') {
        const oldEntry = entryToUpdate as CmEntry | undefined;
        const before = data.before !== undefined ? data.before : oldEntry?.before;
        const after = data.after !== undefined ? data.after : oldEntry?.after;
      
      let absoluteDifference: number | undefined = undefined;
      let relativeDifference: number | undefined = undefined;

      if (typeof after === 'number' && typeof before === 'number') {
        absoluteDifference = Math.abs(after - before);
        relativeDifference = before === 0 ? (absoluteDifference > 0 ? Infinity : 0) : (absoluteDifference / Math.abs(before)) * 100;
      }
      
      newOrUpdatedEntry = {
        id: entryToUpdate?.id ?? Date.now(),
        type: 'cm',
        name: trimmedName,
        before,
        after,
        absoluteDifference,
        relativeDifference,
      } as CmEntry;

    } else { // 's' or 'wert'
        const oldEntry = entryToUpdate as SEntry | WertEntry | undefined;
        const value = data.value !== undefined ? data.value : oldEntry?.value;
        newOrUpdatedEntry = {
            id: entryToUpdate?.id ?? Date.now(),
            type: data.type,
            name: trimmedName,
            value,
        } as SEntry | WertEntry;
    }
    
    if (entryToUpdate) {
        setEntries(prev => prev.map(e => e.id === entryToUpdate.id ? newOrUpdatedEntry : e));
    } else {
        setEntries(prev => [...prev, newOrUpdatedEntry]);
    }
    handleCancelEdit(); // Clear edit state after any submission
  };

  const deleteEntry = (id: number) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
  }
  
  const filteredEntries = useMemo(() => {
    if (!activeMode) return [];
    return entries.filter(entry => entry.type === activeMode);
  }, [entries, activeMode]);

  const sortedEntries = useMemo(() => {
    if (!activeMode) return [];
    return [...filteredEntries].sort((a, b) => {
      if (a.type === 'cm' && b.type === 'cm') {
        const aAbs = a.absoluteDifference ?? -1;
        const bAbs = b.absoluteDifference ?? -1;
        if (bAbs !== aAbs) {
          return bAbs - aAbs;
        }
        const aRel = a.relativeDifference ?? -1;
        const bRel = b.relativeDifference ?? -1;
        return bRel - aRel;
      }
      
      if ((a.type === 's' || a.type === 'wert') && (b.type === 's' || b.type === 'wert')) {
        return (b.value ?? -Infinity) - (a.value ?? -Infinity);
      }

      return 0;
    });
  }, [filteredEntries, activeMode]);

  const podiumEligibleEntries = useMemo(() => {
    if (!activeMode) return [];
    return sortedEntries.filter(entry => {
        if (entry.type === 'cm') {
            return typeof entry.before === 'number' && typeof entry.after === 'number';
        }
        if (entry.type === 's' || entry.type === 'wert') {
            return typeof entry.value === 'number';
        }
        return false;
    });
  }, [sortedEntries, activeMode]);

  if (view === 'menu') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 select-none">
        <div className="flex flex-col lg:flex-row flex-wrap items-center justify-center gap-12 w-full max-w-7xl">
            {(Object.keys(modeConfig) as EntryType[]).map((key) => {
                const config = modeConfig[key];
                const theme = config.theme;
                
                let hoverHeaderTextClass;
                if (key === 'cm') {
                    // For PumpKing, the header is a gradient. Use the accent color for a solid text color on hover.
                    hoverHeaderTextClass = theme.accentText;
                } else {
                    // For other modes, extract the text color from the header theme, ignoring 'text-transparent'.
                    hoverHeaderTextClass = theme.header.split(' ').find(c => c.startsWith('text-') && c !== 'text-transparent') || 'text-gray-800';
                }

                let finalHoverBgClass;
                if (key === 'cm') {
                    // For PumpKing, use the mode's actual dark background color on hover.
                    finalHoverBgClass = 'hover:bg-[#18182c]';
                } else {
                    // For other modes, use the existing logic based on the table header.
                    const bgClass = theme.tableHeader.split(' ').find(c => c.startsWith('bg-')) || 'bg-gray-200';
                    finalHoverBgClass = `hover:${bgClass}`;
                }

                // For PumpKing, the icon's color must also change on hover for visibility against the new dark background.
                const iconHoverClass = key === 'cm' ? `group-hover:${theme.accentText}` : '';


                return (
                    <button
                        key={key}
                        onClick={() => handleSelectMode(key)}
                        className={`group bg-white rounded-xl shadow-md p-12 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 w-full lg:flex-1 ${finalHoverBgClass}`}
                    >
                        <div className={`text-8xl mb-6 transition-transform duration-300 group-hover:scale-110 ${iconHoverClass}`}>{config.icon}</div>
                        <h2 className={`text-4xl font-bold text-gray-800 ${config.fontClass} group-hover:${hoverHeaderTextClass}`}>{config.name}</h2>
                    </button>
                )
            })}
        </div>
      </div>
    );
  }

  const currentTheme = activeMode ? modeConfig[activeMode].theme : modeConfig['wert'].theme;

  // Tracker View
  return (
    <div className={`min-h-screen p-4 sm:p-6 md:p-8 ${currentTheme.body} select-none`}>
      <div className="max-w-5xl mx-auto">
        <header className="relative text-center mb-8">
            <button 
                onClick={handleBackToMenu}
                className={`absolute left-0 top-1/2 -translate-y-1/2 font-bold p-2 rounded-full transition duration-300 ease-in-out focus:outline-none ${currentTheme.backButton}`}
                aria-label="Zurück zum Menü"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            {activeMode === 'wert' ? (
                 <input
                    type="text"
                    value={specialDaysTitle}
                    onChange={(e) => setSpecialDaysTitle(e.target.value)}
                    className={`w-full bg-transparent text-center text-4xl md:text-5xl font-extrabold tracking-tight focus:outline-none p-0 border-0 placeholder-gray-400 ${currentTheme.header} select-text`}
                    placeholder="Titel bearbeiten"
                />
            ) : (
                <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${currentTheme.header}`}>
                    {activeMode && modeConfig[activeMode].name}
                </h1>
            )}
        </header>

        <main>
          <div className="select-text">
            <EntryForm 
              entries={filteredEntries} 
              onAddOrUpdateEntry={addOrUpdateEntry} 
              activeMode={activeMode!} 
              theme={currentTheme}
              entryToEdit={entryToEdit}
              onCancelEdit={handleCancelEdit}
            />
          </div>
          <ResultsTable 
            entries={sortedEntries} 
            onDeleteEntry={deleteEntry} 
            activeMode={activeMode!} 
            theme={currentTheme}
            onSelectEntry={handleSelectEntry}
          />
          
          {sortedEntries.length > 0 && (
            <div className="mt-8 text-center">
                <button
                    onClick={() => setShowPodium(true)}
                    disabled={podiumEligibleEntries.length < 3}
                    className={`font-bold py-3 px-8 rounded-lg text-base transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed ${currentTheme.button}`}
                >
                    Siegerehrung
                </button>
            </div>
          )}

          {showPodium && (
            <Podium 
                topEntries={podiumEligibleEntries.slice(0, 3)} 
                onClose={() => setShowPodium(false)}
                activeMode={activeMode!}
                theme={currentTheme}
                modeName={activeMode ? modeConfig[activeMode].name : ''}
                backgroundUrl={activeMode ? modeConfig[activeMode].background : ''}
            />
          )}

        </main>
        
      </div>
    </div>
  );
}

export default App;
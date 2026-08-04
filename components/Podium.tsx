import React, { useState } from 'react';
import type { Entry, EntryType, CmEntry } from '../types';

interface PodiumProps {
    topEntries: Entry[];
    onClose: () => void;
    activeMode: EntryType;
    theme: any;
    modeName: string;
    backgroundUrl: string;
}

const PodiumPlace: React.FC<{
    entry: Entry;
    place: number;
    isRevealed: boolean;
    activeMode: EntryType;
    theme: any;
}> = ({ entry, place, isRevealed, activeMode, theme }) => {
    
    const placeStyles: Record<number, { medal: string; bgColor: string }> = {
        1: { medal: '🥇', bgColor: 'bg-yellow-100' },
        2: { medal: '🥈', bgColor: 'bg-gray-200' },
        3: { medal: '🥉', bgColor: 'bg-orange-200' },
    };

    const style = placeStyles[place];

    const formatPercentage = (value: number) => {
        if (!isFinite(value)) return '∞';
        return `${value.toFixed(0)}%`;
    }

    const renderValue = () => {
        if (entry.type === 'cm') {
            const cmEntry = entry as CmEntry;
            return (
                <>
                    <p className="text-base text-gray-500">Abs. Schwellung</p>
                    <p className={`font-bold text-2xl ${theme.accentText}`}>{cmEntry.absoluteDifference?.toFixed(1)} cm</p>
                    <p className="text-sm text-gray-500 mt-1">({formatPercentage(cmEntry.relativeDifference!)})</p>
                </>
            );
        }
        if (entry.type === 's') return <p className={`font-bold text-2xl ${theme.accentText}`}>{entry.value} s</p>;
        if (entry.type === 'wert') return <p className={`font-bold text-2xl ${theme.accentText}`}>{entry.value}</p>;
        return null;
    }
    
    const nameSizeClass = entry.name.length > 8 ? 'text-xl' : 'text-2xl';

    return (
        <div className={`
            w-full h-full
            ${style.bgColor} rounded-t-lg shadow-xl p-4 text-gray-800
            flex flex-col items-center justify-start text-center
        `}>
            <div className={`transition-all duration-[3000ms] ease-out ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="text-5xl">{style.medal}</div>
                <h3 
                    className={`font-bold text-black mt-2 truncate w-full ${nameSizeClass}`}
                    title={entry.name}
                >
                    {entry.name}
                </h3>
                <div className="mt-1">
                  {renderValue()}
                </div>
            </div>
        </div>
    );
};


const PodiumSlot: React.FC<{
    entry: Entry;
    place: number;
    isRevealed: boolean;
    onReveal: (place: number) => void;
    activeMode: EntryType;
    theme: any;
}> = ({ entry, place, isRevealed, onReveal, activeMode, theme }) => {
    
    const placeStyles: Record<number, { container: string; order: string; }> = {
        1: { container: 'h-64', order: 'order-2' }, // Gold
        2: { container: 'h-56', order: 'order-1' },  // Silver
        3: { container: 'h-48', order: 'order-3' }, // Bronze
    };
    
    const style = placeStyles[place];

    return (
        <button
            className={`relative ${style.container} ${style.order} w-1/3 max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 rounded-t-lg transition-transform duration-200 hover:scale-105`}
            onClick={() => onReveal(place)}
            aria-label={`Platz ${place} aufdecken`}
        >
            <PodiumPlace
                entry={entry}
                place={place}
                isRevealed={isRevealed}
                activeMode={activeMode}
                theme={theme}
            />
        </button>
    );
};


export const Podium: React.FC<PodiumProps> = ({ topEntries, onClose, activeMode, theme, modeName, backgroundUrl }) => {
    const [revealedPlaces, setRevealedPlaces] = useState<Set<number>>(new Set());

    const handleReveal = (place: number) => {
        setRevealedPlaces(prev => new Set(prev).add(place));
    };
    
    const [first, second, third] = topEntries;

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center p-4 z-50 select-none" 
            style={{ backgroundImage: `url("${backgroundUrl}")`, backgroundSize: 'cover' }}
            onClick={onClose}
        >
            <div className={`rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-3xl animate-fade-in ${theme.modalBg}`} onClick={(e) => e.stopPropagation()}>
                <div className="text-center mb-6">
                    <h2 className={`text-3xl md:text-4xl font-bold ${theme.header}`}>
                        Siegerehrung
                    </h2>
                    <h3 className={`text-2xl md:text-3xl font-bold ${theme.header}`}>{modeName}</h3>
                </div>

                <div className="flex items-end justify-center gap-2 md:gap-4 h-64">
                    {second && <PodiumSlot entry={second} place={2} isRevealed={revealedPlaces.has(2)} onReveal={handleReveal} activeMode={activeMode} theme={theme} />}
                    {first && <PodiumSlot entry={first} place={1} isRevealed={revealedPlaces.has(1)} onReveal={handleReveal} activeMode={activeMode} theme={theme} />}
                    {third && <PodiumSlot entry={third} place={3} isRevealed={revealedPlaces.has(3)} onReveal={handleReveal} activeMode={activeMode} theme={theme} />}
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
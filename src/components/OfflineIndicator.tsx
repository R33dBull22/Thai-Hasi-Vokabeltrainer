import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Offline-Status"
      className="fixed bottom-16 sm:bottom-6 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-3 rounded-2xl bg-[#1C1C1E] border border-amber-500/40 p-3.5 shadow-2xl shadow-black/80 animate-in slide-in-from-bottom duration-300"
    >
      <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
        <WifiOff className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-white">Offline-Modus aktiv</p>
        <p className="text-[11px] text-[#A1A1AA] truncate">
          Alle im Browser zwischengespeicherten Vokabeln bleiben voll nutzbar.
        </p>
      </div>
      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
    </aside>
  );
};

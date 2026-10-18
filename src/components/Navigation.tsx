import React from 'react';
import { Home, BookOpen, PlusCircle, Settings, BarChart3, GraduationCap, Crown } from 'lucide-react';
import { ActiveTab } from '../types/vocab';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  dueCount: number;
  isAdmin?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  dueCount,
  isAdmin = false,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'learn', label: 'Lernen', icon: Home, badge: dueCount > 0 ? dueCount : undefined },
    { id: 'pool', label: 'Pool', icon: BookOpen },
    { id: 'reference', label: 'Tafel', icon: GraduationCap },
    { id: 'stats', label: 'Statistik', icon: BarChart3 },
    { id: 'create', label: 'Neu', icon: PlusCircle },
    { id: 'settings', label: 'Optionen', icon: Settings },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', label: 'Admin', icon: Crown });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1C1C1E]/95 backdrop-blur-md border-t border-[#2C2C2E] px-3 py-2 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 relative transition-colors"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'text-[#FF7A00] scale-105' : 'text-[#8E8E93] hover:text-[#D1D1D6]'
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#FF7A00] text-black text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[15px] text-center leading-none shadow-sm">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium tracking-tight ${
                  isActive ? 'text-[#FF7A00]' : 'text-[#8E8E93]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

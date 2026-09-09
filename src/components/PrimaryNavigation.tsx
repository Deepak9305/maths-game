import React from 'react';
import { Home, Map, PawPrint, Settings } from 'lucide-react';

export type NavigationDestination = 'dashboard' | 'map' | 'pet';
export type NavigationScreen = NavigationDestination | 'achievements' | 'shop' | 'settings';

interface PrimaryNavigationProps {
  activeScreen: NavigationScreen;
  onNavigate: (screen: NavigationDestination) => void;
  onOpenSettings: () => void;
  variant?: 'standard' | 'dashboard';
}

const NAV_ITEMS = [
  { id: 'dashboard' as const, label: 'Math Quest', icon: Home, tone: 'cyan' },
  { id: 'map' as const, label: 'Galaxy Map', icon: Map, tone: 'cyan' },
  { id: 'pet' as const, label: 'Pets', icon: PawPrint, tone: 'emerald' },
  { id: 'settings' as const, label: 'Settings', icon: Settings, tone: 'violet' }
];

const ACTIVE_TONES: Record<string, string> = {
  cyan: 'bg-cyan-300/10 text-cyan-200',
  emerald: 'bg-emerald-300/10 text-emerald-200',
  violet: 'bg-violet-300/10 text-violet-200'
};

const HOVER_TONES: Record<string, string> = {
  cyan: 'hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:ring-cyan-300/90',
  emerald: 'hover:bg-emerald-300/10 hover:text-emerald-100 focus-visible:ring-emerald-300/90',
  violet: 'hover:bg-violet-300/10 hover:text-violet-100 focus-visible:ring-violet-300/90'
};

const PrimaryNavigation: React.FC<PrimaryNavigationProps> = ({ activeScreen, onNavigate, onOpenSettings, variant = 'standard' }) => {
  return (
    <nav
      aria-label="Primary navigation"
      className={`${variant === 'dashboard' ? 'absolute h-[14%]' : 'fixed'} inset-x-0 bottom-0 z-30 px-2`}
      style={{ paddingBottom: 'max(.5rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className={`mx-auto grid h-full w-full max-w-[430px] grid-cols-4 rounded-t-2xl border border-cyan-200/15 bg-[#061638]/98 px-1 shadow-[0_-8px_28px_rgba(2,6,23,.42)] ${variant === 'dashboard' ? 'min-h-[5rem]' : 'h-[4.5rem]'}`}>
        {NAV_ITEMS.map(({ id, label, icon: Icon, tone }) => {
          const isActive = activeScreen === id;
          const isSettings = id === 'settings';

          return (
            <button
              key={id}
              type="button"
              aria-label={isSettings ? 'Open settings' : `Open ${label}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => isSettings ? onOpenSettings() : onNavigate(id)}
              className={`flex h-full min-w-0 flex-col items-center justify-end gap-1 rounded-t-xl pb-2.5 outline-none transition ${
                isActive ? ACTIVE_TONES[tone] : `text-white/55 ${HOVER_TONES[tone]}`
              } focus-visible:ring-4`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="max-w-full truncate px-0.5 text-[9px] font-black uppercase tracking-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default PrimaryNavigation;

import React from 'react';
import { LogOut } from 'lucide-react';
import type { UserData } from '../types';

const NavBar: React.FC<{ user: UserData | null; isDevMode: boolean; isLoading: boolean; onLogout: () => void; onLogoClick: () => void }> = ({ user, isDevMode, isLoading, onLogout, onLogoClick }) => {
  return (
    <nav className="sticky top-0 z-50 border-b border-transparent bg-transparent px-3 py-2 shadow-none sm:border-slate-200 sm:bg-white sm:px-4 sm:py-3 sm:shadow-sm">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="hidden sm:flex items-center gap-2 font-bold text-indigo-600 text-xl cursor-pointer" onClick={onLogoClick}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">P</div>
          <span className="tracking-tighter">Practice2Gether</span>
        </div>
        {user && (
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-black leading-tight">{user.name}</span>
              <span className={`text-[9px] px-1.5 rounded font-black tracking-tight ${isDevMode ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{isDevMode ? 'DEV-BYPASS' : user.email}</span>
            </div>
            <div className="sm:hidden text-[10px] font-black tracking-[0.18em] uppercase text-slate-400">
              {user.name}
            </div>
            <button onClick={onLogout} disabled={isLoading} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-20 bg-white/85 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none border border-slate-200 sm:border-transparent">
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;

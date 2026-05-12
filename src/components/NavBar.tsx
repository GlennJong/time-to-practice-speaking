import React from 'react';
import { LogOut } from 'lucide-react';
import type { UserData } from '../types';

const NavBar: React.FC<{ user: UserData | null; isDevMode: boolean; isLoading: boolean; onLogout: () => void; onLogoClick: () => void }> = ({ user, isDevMode, isLoading, onLogout, onLogoClick }) => {
  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-indigo-600 text-xl cursor-pointer" onClick={onLogoClick}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">P</div>
          <span className="tracking-tighter">Practice2Gether</span>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-black leading-tight">{user.name}</span>
              <span className={`text-[9px] px-1.5 rounded font-black tracking-tight ${isDevMode ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{isDevMode ? 'DEV-BYPASS' : user.email}</span>
            </div>
            <button onClick={onLogout} disabled={isLoading} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-20">
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;

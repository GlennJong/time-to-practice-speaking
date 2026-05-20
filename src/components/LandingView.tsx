import React from 'react';
import { Calendar, Cpu } from 'lucide-react';

interface Props {
  onLogin: () => void;
  onDevBypass: () => void;
  onShowPracticeGuide: () => void;
}

const LandingView: React.FC<Props> = ({ onLogin, onDevBypass, onShowPracticeGuide }) => (
  <div className="text-center py-8 sm:py-12 px-4 max-w-2xl mx-auto">
    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-50 text-indigo-600 rounded-3xl sm:rounded-4xl mb-4 sm:mb-6 shadow-inner">
      <Calendar size={24} className="sm:w-8 sm:h-8" />
    </div>
    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 sm:mb-4 tracking-tight leading-tight">找個夥伴，開口說英文</h1>
    <p className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-10 font-medium leading-relaxed">這是一個封閉式的 10 人小組預約系統。若您是受邀成員，請登入以查看可用時段。</p>
    <div className="flex flex-col gap-4 items-center">
      <button
        onClick={onLogin}
        className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl transition-all transform hover:scale-[1.02] shadow-2xl shadow-indigo-200 w-full max-w-xs active:scale-95"
      >
        登入系統
      </button>
      <button
        onClick={onDevBypass}
        className="flex items-center gap-2 text-slate-400 hover:text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors pt-4"
      >
        <Cpu size={12} /> Developer Bypass
      </button>
      <button
        onClick={onShowPracticeGuide}
        className="mt-4 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-black hover:bg-slate-50 transition-all w-full max-w-xs"
      >
        如何進行練習
      </button>
    </div>
  </div>
);

export default LandingView;

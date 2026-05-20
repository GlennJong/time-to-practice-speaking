import React from 'react';
import { Calendar, ChevronLeft, Info, Loader2, Plus, Trash2 } from 'lucide-react';

const snapTo30Minutes = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const snappedMinutes = Math.round(date.getMinutes() / 30) * 30;
  date.setMinutes(snappedMinutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

interface Props {
  newSlots: string[];
  addSlotErrors: string[];
  isLoading: boolean;
  onSlotsChange: (slots: string[]) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const AddSlotsView: React.FC<Props> = ({
  newSlots,
  addSlotErrors,
  isLoading,
  onSlotsChange,
  onBack,
  onSubmit,
}) => (
  <div className="mt-12 sm:mt-0 max-w-xl mx-auto animate-in slide-in-from-bottom-12 duration-600">
    <div className="bg-white p-4 md:p-12 rounded-[1.5rem] md:rounded-[3.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
      <div className="flex justify-between items-center mb-10">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 font-bold transition-colors disabled:opacity-30"
        >
          <ChevronLeft size={20} />
          <span>取消</span>
        </button>
        <h2 className="text-3xl font-black text-indigo-950 tracking-tight">發布時段</h2>
        <div className="w-10"></div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-100 rounded-[2rem] p-4 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="bg-amber-200 p-2 rounded-xl text-amber-700 shadow-sm">
          <Info size={24} className="shrink-0" />
        </div>
        <div className="text-xs text-amber-900 leading-relaxed font-bold">
          <p>• 時間單位自動調整 30 分為單位。</p>
          <p>• 每一筆時段自動設為 1 小時。</p>
          <p>• 可新增多筆，列表僅顯示近 2 週時段。</p>
        </div>
      </div>

      <div className="space-y-4 mb-10">
        {newSlots.map((time, idx) => (
          <div
            key={idx}
            className="slot-datetime-row grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1 sm:gap-3 group animate-in slide-in-from-left-4 duration-300"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="w-full min-w-0 flex-1 relative">
              <input
                type="datetime-local"
                step="1800"
                placeholder="選擇日期與時間"
                value={time}
                disabled={isLoading}
                onChange={(e) => {
                  const snapped = snapTo30Minutes(e.target.value);
                  const updated = [...newSlots];
                  updated[idx] = snapped;
                  onSlotsChange(updated);
                }}
                className="slot-datetime-input block w-full min-w-0 px-3 sm:px-6 py-2 sm:py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.75rem] focus:ring-8 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-black text-xs sm:text-base tabular-nums transition-all disabled:opacity-40"
              />
              {!time && (
                <div className="ios-datetime-hint pointer-events-none absolute inset-y-0 left-0 items-center gap-1.5 pl-3 text-slate-400 sm:hidden">
                  <Calendar size={13} className="shrink-0" />
                  <span className="text-[10px] font-black tracking-wide">點擊選擇日期時間</span>
                </div>
              )}
            </div>
            {newSlots.length > 1 && (
              <button
                onClick={() => onSlotsChange(newSlots.filter((_, i) => i !== idx))}
                disabled={isLoading}
                className="self-center shrink-0 p-2 sm:p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-[1.5rem] transition-all disabled:opacity-20"
              >
                <Trash2 size={24} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => onSlotsChange([...newSlots, ''])}
          disabled={isLoading}
          className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[1.75rem] text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-all text-[11px] font-black flex items-center justify-center gap-2 disabled:opacity-30 uppercase tracking-widest"
        >
          <Plus size={16} /> Add another slot
        </button>
      </div>

      {addSlotErrors.length > 0 && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 font-bold leading-relaxed">
          {addSlotErrors.map((error) => (
            <p key={error}>• {error}</p>
          ))}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={isLoading || newSlots.some((s) => s.trim() === '')}
        className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4"
      >
        {isLoading ? <><Loader2 className="animate-spin" /> Processing...</> : '發布邀請'}
      </button>
    </div>
  </div>
);

export default AddSlotsView;

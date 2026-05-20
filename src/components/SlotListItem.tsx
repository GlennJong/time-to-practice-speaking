import React from 'react';
import { Calendar, CalendarX2, Loader2, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import type { Slot } from '../types';

interface Props {
  slot: Slot;
  userEmail: string | undefined;
  isLoading: boolean;
  isActive: boolean;
  bookBlockReason: string | null;
  onBook: (uid: string) => void;
  onDelete: (uid: string) => void;
  onCancelBooking: (uid: string) => void;
}

const SlotListItem: React.FC<Props> = ({
  slot,
  userEmail,
  isLoading,
  isActive,
  bookBlockReason,
  onBook,
  onDelete,
  onCancelBooking,
}) => {
  const isHost = slot.host === userEmail;
  const isGuest = slot.guest === userEmail;
  const canCancelBooking = slot.status === 'Booked' && isGuest && !isHost;

  return (
    <div className={`flex items-center justify-between p-4 sm:p-6 gap-3 sm:gap-4 transition-all ${isHost ? 'bg-indigo-50/20' : 'hover:bg-slate-50/30'}`}>
      <div className="flex items-center gap-3 sm:gap-6 flex-1">
        <div className="flex flex-col items-start min-w-[70px] sm:min-w-[100px]">
          <span className="text-lg sm:text-2xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">
            {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
          <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            to {new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <div className="flex items-center gap-1 sm:gap-2">
            <StatusBadge status={slot.status} />
            <span className="text-[11px] sm:text-sm font-black text-slate-700 truncate max-w-[80px] sm:max-w-none">
              <span className="sm:inline hidden">主辦人：</span>{slot.hostName}
            </span>
          </div>
          {slot.status === 'Booked' && (
            <div className="flex items-center gap-1 text-[8px] sm:text-[10px] text-indigo-500 font-black italic">
              <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
              <span className="truncate max-w-[80px] sm:max-w-none">
                <span className="sm:inline hidden">受邀人：</span>{slot.guestName}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {slot.status === 'Open' && !isHost && (
          <button
            onClick={() => onBook(slot.uid)}
            disabled={isLoading || !!bookBlockReason}
            className="tour-book-slot p-2 sm:px-10 sm:py-3 bg-indigo-600 text-white rounded-xl sm:rounded-[1.25rem] text-xs sm:text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            title={bookBlockReason || '預約'}
          >
            {isActive ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <Calendar size={16} className="sm:hidden" />
                <span className="hidden sm:inline">預約</span>
              </>
            )}
          </button>
        )}
        {isHost && (
          <button
            onClick={() => onDelete(slot.uid)}
            disabled={isLoading}
            className="p-2 sm:p-3 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl sm:rounded-2xl transition-all disabled:opacity-20"
          >
            {isActive ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} className="sm:w-6 sm:h-6" />}
          </button>
        )}
        {canCancelBooking && (
          <button
            onClick={() => onCancelBooking(slot.uid)}
            disabled={isLoading}
            className="tour-book-slot p-2 sm:px-10 sm:py-3 bg-gray-500 text-white rounded-xl sm:rounded-[1.25rem] text-xs sm:text-sm font-black hover:bg-gray-700 shadow-xl shadow-indigo-100 flex items-center gap-2 active:scale-95"
          >
            {isActive ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <CalendarX2 size={16} className="sm:hidden" />
                <span className="hidden sm:inline">取消</span>
              </>
            )}
          </button>
        )}
        {slot.status === 'Booked' && !isHost && !isGuest && (
          <span className="text-[9px] sm:text-[11px] text-slate-300 font-black uppercase tracking-widest bg-slate-50 px-2 py-0.5 sm:px-3 sm:py-1 rounded sm:rounded-lg">
            已被預約
          </span>
        )}
      </div>
    </div>
  );
};

export default SlotListItem;

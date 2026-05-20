import React from 'react';
import { Clock, Loader2 } from 'lucide-react';
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

const SlotCard: React.FC<Props> = ({
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
    <div className={`bg-white border-2 rounded-[2rem] p-6 transition-all shadow-sm flex flex-col justify-between gap-6 relative group ${isHost ? 'border-indigo-100 ring-8 ring-indigo-50/50' : 'border-slate-100 hover:border-indigo-100 hover:shadow-xl'}`}>
      <div>
        <div className="flex justify-between items-start mb-5">
          <StatusBadge status={slot.status} />
          <span className="text-[11px] font-black text-slate-400 tabular-nums bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100 tracking-tighter">
            {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>
        <h4 className="text-lg font-black text-slate-900 mb-1 leading-tight">
          {isHost ? '我的練習邀約' : `${slot.hostName} 的邀請`}
        </h4>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
          <Clock size={12} />
          <span>60 MIN SESSION</span>
        </div>
      </div>
      <div className="flex gap-2 pt-4 border-t border-slate-50">
        {slot.status === 'Open' && !isHost && (
          <button
            onClick={() => onBook(slot.uid)}
            disabled={isLoading || !!bookBlockReason}
            title={bookBlockReason || '預約'}
            className="tour-book-slot flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isActive ? <Loader2 size={16} className="animate-spin" /> : '預約'}
          </button>
        )}
        {isHost && (
          <button
            onClick={() => onDelete(slot.uid)}
            disabled={isLoading}
            className="flex-1 py-4 border-2 border-rose-100 text-rose-500 rounded-2xl text-xs font-black hover:bg-rose-50 flex items-center justify-center gap-2"
          >
            {isActive ? <Loader2 size={16} className="animate-spin" /> : '取消時段'}
          </button>
        )}
        {canCancelBooking && (
          <button
            onClick={() => onCancelBooking(slot.uid)}
            disabled={isLoading}
            className="flex-1 py-4 bg-amber-50 text-amber-700 rounded-2xl text-xs font-black text-center border border-amber-200 hover:bg-amber-100 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isActive ? <Loader2 size={16} className="animate-spin" /> : '取消預約'}
          </button>
        )}
        {slot.status === 'Booked' && !isHost && !isGuest && (
          <div className="flex-1 py-4 bg-slate-50 text-slate-300 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest">
            Occupied
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotCard;

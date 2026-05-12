import React from 'react';

interface MessageState {
  type: 'success' | 'error';
  text: string;
}

const MessageBanner: React.FC<{ message: MessageState; bookingLink?: string | null; onClose: () => void }> = ({ message, bookingLink, onClose }) => {
  return (
    <div className="max-w-4xl mx-auto mt-4 px-4">
      <div className={`p-4 rounded-2xl flex flex-col items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300 border shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'}`}>
        <div className="flex items-center gap-3 w-full">
          <p className="text-sm font-bold leading-tight">{message.text}</p>
          <button onClick={onClose} className="ml-auto p-1 hover:bg-black/5 rounded-lg">×</button>
        </div>
        {bookingLink && (
          <div className="w-full">
            <a href={bookingLink} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 px-4 py-2 bg-white text-indigo-700 rounded-lg font-bold border border-indigo-100 shadow-sm">開啟 Meet 會議連結</a>
            <p className="text-[11px] text-slate-600 mt-2">或複製連結：<span className="font-mono break-all">{bookingLink}</span></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBanner;

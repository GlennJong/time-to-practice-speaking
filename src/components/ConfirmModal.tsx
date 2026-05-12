import React from 'react';

interface ConfirmProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmProps> = ({ open, title, description, confirmText, cancelText, onCancel, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
        <button onClick={onCancel} className="absolute top-3 right-3 p-2 text-slate-500 hover:text-slate-800">×</button>
        <h3 className="text-lg font-black mb-2">{title || '確認'}</h3>
        {description && <p className="text-sm text-slate-600 mb-6">{description}</p>}
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold">{cancelText || '取消'}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-2xl bg-indigo-600 text-white font-black">{confirmText || '確認'}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

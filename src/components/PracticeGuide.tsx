import React from 'react';

interface Props {
  onClose: () => void;
}

const PracticeGuide: React.FC<Props> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl border border-slate-200 shadow-lg p-6 max-h-[90vh] overflow-auto">
      <button onClick={onClose} className="absolute top-3 right-3 p-2 text-slate-500 hover:text-slate-800">
        ×
      </button>
      <picture>
        <source media="(max-width: 640px)" srcSet="images/practice_v.png" />
        <img src="images/practice_h.png" alt="如何進行練習" className="w-full h-auto rounded-lg" />
      </picture>
    </div>
  </div>
);

export default PracticeGuide;

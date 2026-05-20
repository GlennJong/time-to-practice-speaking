import React from 'react';
import { Loader2, Mail } from 'lucide-react';

interface Props {
  name: string;
  email: string;
  isLoading: boolean;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onRequestOTP: () => void;
  onAlreadyHaveOTP: () => void;
  onBack: () => void;
}

const LoginView: React.FC<Props> = ({
  name,
  email,
  isLoading,
  onNameChange,
  onEmailChange,
  onRequestOTP,
  onAlreadyHaveOTP,
  onBack,
}) => (
  <div className="max-w-md mt-2 mx-2 sm:mx-auto bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
    <h2 className="text-2xl font-black mb-8 flex items-center gap-2 text-indigo-950">
      <Mail className="text-indigo-600" />身份驗證
    </h2>
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">您的稱呼</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
          placeholder="例如：Glenn"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Google Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
          placeholder="name@gmail.com"
        />
      </div>
      <button
        onClick={onRequestOTP}
        disabled={isLoading}
        className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : '取得驗證碼'}
      </button>
      <button
        type="button"
        disabled={isLoading}
        className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-2xl font-black hover:bg-indigo-100 disabled:opacity-50 transition-all shadow flex items-center justify-center gap-2 text-sm mt-1"
        onClick={onAlreadyHaveOTP}
      >
        已取得驗證碼
      </button>
      <button onClick={onBack} className="w-full py-2 text-slate-400 text-sm font-bold hover:text-slate-700">
        返回首頁
      </button>
    </div>
  </div>
);

export default LoginView;

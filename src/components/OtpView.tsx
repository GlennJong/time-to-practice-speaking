import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

interface Props {
  email: string;
  otp: string;
  isLoading: boolean;
  onOtpChange: (otp: string) => void;
  onVerifyOTP: () => void;
  onBack: () => void;
}

const OtpView: React.FC<Props> = ({ email, otp, isLoading, onOtpChange, onVerifyOTP, onBack }) => (
  <div className="max-w-md mt-2 mx-2 sm:mx-auto bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl text-center">
    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
      <ShieldCheck size={36} />
    </div>
    <h2 className="text-2xl font-black mb-2 text-indigo-950">驗證信箱</h2>
    <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">
      我們已寄送 4 位數驗證碼至 <br />
      <span className="font-black text-indigo-600">{email}</span>
    </p>
    <input
      type="text"
      maxLength={4}
      value={otp}
      onChange={(e) => onOtpChange(e.target.value)}
      className="w-full text-center text-5xl tracking-[0.4em] px-4 py-6 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none font-black mb-8 focus:border-indigo-600 transition-all"
      placeholder="0000"
    />
    <button
      onClick={onVerifyOTP}
      disabled={isLoading || otp.length !== 4}
      className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
    >
      {isLoading ? <Loader2 className="animate-spin" /> : '完成登入'}
    </button>
    <button
      type="button"
      disabled={isLoading}
      className="w-full py-2 mt-2 bg-indigo-50 text-indigo-600 rounded-2xl font-black hover:bg-indigo-100 disabled:opacity-50 transition-all shadow flex items-center justify-center gap-2 text-sm"
      onClick={onBack}
    >
      返回登入
    </button>
  </div>
);

export default OtpView;

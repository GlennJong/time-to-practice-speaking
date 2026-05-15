import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Plus, Trash2, ChevronLeft, Mail, ShieldCheck, Loader2, Cpu, Database, Filter, CalendarDays, Info, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { Joyride } from 'react-joyride';
import type { EventData, Step } from 'react-joyride';
import StatusBadge from './components/StatusBadge';
import ConfirmModal from './components/ConfirmModal';
import MessageBanner from './components/MessageBanner';
import NavBar from './components/NavBar';
import type { UserData, Slot, MessageState, ApiResponse, RawSlot, ViewType, LayoutType } from './types';

// ==========================================
// 配置區：從環境變數讀取 GAS Web App URL (Vite 前綴為 VITE_*)
// 設定 `VITE_GAS_URL` 作為部署時的環境變數
// ==========================================
const GAS_URL: string = (import.meta.env.VITE_GAS_URL as string) || '';

// ==========================================
// 模擬資料 (Mock Data)
// ==========================================
const MOCK_SLOTS = (devEmail: string, devName: string): Slot[] => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return [
    {
      uid: 'mock-1',
      host: devEmail,
      hostName: devName,
      start: tomorrow.toISOString(),
      end: new Date(tomorrow.getTime() + 3600000).toISOString(),
      status: 'Open',
      guest: '',
      guestName: ''
    },
    {
      uid: 'mock-2',
      host: 'teacher_lin@example.com',
      hostName: '林老師',
      start: tomorrow.toISOString(),
      end: new Date(tomorrow.getTime() + 3600000).toISOString(),
      status: 'Open',
      guest: '',
      guestName: ''
    }
  ];
};

const getOnboardingKey = (email: string): string => `onboarding_done_${email.toLowerCase()}`;
const AUTH_PROFILE_KEY = 'eng_practice_auth_profile';

const App: React.FC = () => {
  // --- 狀態管理 ---
  const [view, setView] = useState<ViewType>('landing'); 
  const [layout, setLayout] = useState<LayoutType>('list');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageState | null>(null); 
  const [filterTag, setFilterTag] = useState<string>('All'); 
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);

  const [user, setUser] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('eng_practice_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authData, setAuthData] = useState(() => {
    const savedProfile = localStorage.getItem(AUTH_PROFILE_KEY);
    if (!savedProfile) return { email: '', otp: '', name: '' };
    try {
      const parsed = JSON.parse(savedProfile) as { email?: unknown; name?: unknown };
      return {
        email: typeof parsed.email === 'string' ? parsed.email : '',
        name: typeof parsed.name === 'string' ? parsed.name : '',
        otp: '',
      };
    } catch {
      return { email: '', otp: '', name: '' };
    }
  });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [newSlots, setNewSlots] = useState<string[]>(['']); 
  const [bookingLink, setBookingLink] = useState<string | null>(null);
  const [showPracticeGuide, setShowPracticeGuide] = useState<boolean>(false);
  const [runOnboarding, setRunOnboarding] = useState<boolean>(false);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    resolve?: (v: boolean) => void;
  }>({ open: false });
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 檢查是否有設定 GAS_URL（從 env 注入），若無則視為服務不可用
  const serviceAvailable = (GAS_URL && GAS_URL.trim().length > 0);

  useEffect(() => {
    if (!message) return;
    // start 10s timer to auto-clear
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current as unknown as number);
    }
    messageTimerRef.current = window.setTimeout(() => {
      setMessage(null);
      setBookingLink(null);
      messageTimerRef.current = null;
    }, 10000);
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current as unknown as number);
        messageTimerRef.current = null;
      }
    };
  }, [message]);

  // --- 初始化 ---
  useEffect(() => {
    if (user?.token) {
      setView('dashboard');
      if (user.token === 'dev-token-bypass') {
        setIsDevMode(true);
        setSlots(MOCK_SLOTS(user.email, user.name));
      } else {
        fetchSlots();
      }
    }
  }, []);

  // --- 輔助函式 ---
  const snapTo30Minutes = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const snappedMinutes = Math.round(date.getMinutes() / 30) * 30;
    date.setMinutes(snappedMinutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const availableTags = useMemo((): { id: string; label: string }[] => {
    if (!slots.length) return [{ id: 'All', label: '全部' }, { id: 'Me', label: '我的' }];
    const hosts = Array.from(new Set(slots.map(s => s.host).filter((v): v is string => !!v && typeof v === 'string')));
    const otherHosts = hosts.filter(email => email !== user?.email).map(email => ({
      id: email,
      label: (slots.find(s => s.host === email)?.hostName) || email,
    }));
    const meLabel = slots.find(s => s.host === user?.email)?.hostName || '我的';
    return [{ id: 'All', label: '全部' }, { id: 'Me', label: meLabel }, ...otherHosts];
  }, [slots, user?.email]);

  const hasBookableSlot = useMemo((): boolean => {
    return slots.some((slot) => slot.status === 'Open' && slot.host !== user?.email);
  }, [slots, user?.email]);

  const onboardingSteps = useMemo((): Step[] => {
    return [
      {
        target: '.tour-publish-invite',
        title: '先建立一個邀請',
        content: '點這裡發布你可練習的時段，其他夥伴就可以看到並預約。',
        
      },
      {
        target: hasBookableSlot ? '.tour-book-slot' : '.tour-slot-section',
        title: '接著預約時間',
        content: hasBookableSlot
          ? '看到可用時段時，點「預約」就能快速卡位。'
          : '這裡會顯示可預約的時段；當有開放時，你會看到「預約」按鈕。',
      },
    ];
  }, [hasBookableSlot]);

  const groupedSlots = useMemo((): Record<string, Slot[]> => {
    let filtered = slots;
    if (filterTag === 'Me') filtered = slots.filter(s => s.host === user?.email);
    else if (filterTag !== 'All') filtered = slots.filter(s => s.host === filterTag);

    const sorted = [...filtered].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return sorted.reduce((acc: Record<string, Slot[]>, slot) => {
      const dateKey = new Date(slot.start).toLocaleDateString('zh-TW', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
      });
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(slot);
      return acc;
    }, {});
  }, [slots, filterTag, user?.email]);

  // --- API 呼叫 ---
  const callApi = async (action: string, body: Record<string, unknown> = {}): Promise<ApiResponse | null> => {
    if (isDevMode && action !== 'getSlots') {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 1000)); 
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(true);
    try {
      const response: Response = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({ action, ...body }),
      });
      
      const result = (await response.json()) as ApiResponse;

      // 權限與狀態攔截
      if (result.error === 'BLACKLISTED' || result.error === '此帳號已被停用') {
        handleAuthError('發生錯誤，請聯絡管理員。');
        return null;
      }

      // 後端在 token 無效 / 驗證失敗時會回傳 '驗證失敗'
      if (result.error === 'TOKEN_EXPIRED' || result.error === '驗證失敗') {
        handleAuthError('登入逾期或驗證失敗，請重新驗證。');
        return null;
      }

      if (result.error) throw new Error(result.error);
      return result;
    } catch (err: unknown) {
      const messageText = err instanceof Error ? err.message : String(err);
      setMessage({ type: 'error', text: messageText || '連線失敗' });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (text: string): void => {
    localStorage.removeItem('eng_practice_user');
    setUser(null);
    setIsDevMode(false);
    setRunOnboarding(false);
    setView('landing');
    setMessage({ type: 'error', text });
  };

  const handleOnboardingCallback = (data: EventData): void => {
    const { status, action } = data;
    if (status === 'finished' || status === 'skipped' || action === 'close') {
      if (user?.email) {
        localStorage.setItem(getOnboardingKey(user.email), '1');
      }
      setRunOnboarding(false);
    }
  };

  const persistAuthProfile = (email: string, name: string): void => {
    localStorage.setItem(
      AUTH_PROFILE_KEY,
      JSON.stringify({ email: email.trim(), name: name.trim() })
    );
  };

  const fetchSlots = async (): Promise<void> => {
    if (isDevMode) {
      if (user) setSlots(MOCK_SLOTS(user.email, user.name));
      return;
    }
    const data = await callApi('getSlots');
    if (data && Array.isArray(data)) {
      const normalizeSlot = (raw: RawSlot): Slot => {
        const asString = (v: unknown): string => (typeof v === 'string' ? v : '');
        const startRaw = asString(raw.start ?? raw.startAt ?? raw.Start ?? '');
        const endRaw = asString(raw.end ?? raw.endAt ?? raw.End ?? '');
        const host = asString(raw.host ?? raw.host_email ?? raw.hostEmail ?? '');
        const guest = asString(raw.guest ?? raw.guest_email ?? raw.guestEmail ?? '');
        const hostName = asString(raw.hostName ?? raw.host_name ?? raw.hostName ?? (typeof host === 'string' ? host.split('@')[0] : ''));
        const guestName = asString(raw.guestName ?? raw.guest_name ?? raw.guestName ?? (typeof guest === 'string' ? guest.split('@')[0] : ''));
        const statusRaw = raw.status ?? raw.Status ?? 'Open';
        const status = typeof statusRaw === 'string' && (statusRaw === 'Booked' || statusRaw === 'Cancelled') ? (statusRaw as Slot['status']) : 'Open';
        const uid = asString(raw.uid ?? raw.id ?? raw.slotUid ?? '');
        return {
          uid,
          host,
          hostName,
          start: startRaw,
          end: endRaw,
          status,
          guest,
          guestName,
        };
      };

      setSlots(data.map((d) => normalizeSlot(d as RawSlot)));
    }
  };

  const handleRequestOTP = async (): Promise<void> => {
    if (!authData.email || !authData.name) {
      setMessage({ type: 'error', text: '姓名與 Email 為必填' });
      return;
    }
    persistAuthProfile(authData.email, authData.name);
    const res = await callApi('requestOTP', { email: authData.email });
    if (res?.success) setView('otp');
  };

  const handleVerifyOTP = async (): Promise<void> => {
    const res = await callApi('verifyOTP', {
      email: authData.email,
      otp: authData.otp,
      name: authData.name,
    });
    if (res?.token && typeof res.email === 'string' && typeof res.name === 'string') {
      const userData: UserData = { token: String(res.token), email: res.email, name: res.name };
      setUser(userData);
      setIsDevMode(false);
      localStorage.setItem('eng_practice_user', JSON.stringify(userData));
      persistAuthProfile(res.email, res.name);
      setView('dashboard');
      if (!localStorage.getItem(getOnboardingKey(res.email))) {
        setRunOnboarding(true);
      }
      fetchSlots();
    }
  };

  const handleDevBypass = (): void => {
    const show = (title = '啟用開發模式？') => new Promise<boolean>(res => setConfirmState({ open: true, title, confirmText: '啟動', cancelText: '取消', resolve: res }));
    (async () => {
      const ok = await show();
      if (!ok) return;
      const devEmail = 'dev@example.com';
      const devName = '開發測試者';
      const devUser: UserData = { token: 'dev-token-bypass', email: devEmail, name: devName };
      setUser(devUser);
      setIsDevMode(true);
      localStorage.setItem('eng_practice_user', JSON.stringify(devUser));
      setView('dashboard');
      setSlots(MOCK_SLOTS(devEmail, devName));
      setMessage({ type: 'success', text: '開發模式已啟動' });
    })();
  };

  const handleAddSlots = async (): Promise<void> => {
    const validSlots = newSlots.filter(s => s !== '');
    if (validSlots.length === 0 || !user) return;
    const ok = await new Promise<boolean>(res => setConfirmState({ open: true, title: '確認發布時段？', description: '確定要發布這些時段到系統嗎？', confirmText: '發布', cancelText: '取消', resolve: res }));
    if (!ok) return;
    const res = await callApi('addSlots', { token: user.token, timeArray: validSlots });
    if (res?.success) {
      setMessage({ type: 'success', text: '已成功發布練習時段' });
      setNewSlots(['']);
      setView('dashboard');
      await fetchSlots(); 
    }
  };

  const handleBook = async (uid: string): Promise<void> => {
    if (!user) return;
    const ok = await new Promise<boolean>(res => setConfirmState({ open: true, title: '確認預約？', description: '確定要預約此時段嗎？', confirmText: '預約', cancelText: '取消', resolve: res }));
    if (!ok) return;
    setActiveSlotId(uid);
    const res = await callApi('bookSlot', { token: user.token, slotUid: uid });
    if (res?.success) {
      setMessage({ type: 'success', text: '預約成功！請查看 Email 確認 Google Meet 通知！' });
      if (res.link) setBookingLink(res.link);
      await fetchSlots();
    }
    setActiveSlotId(null);
  };

  const handleDelete = async (uid: string): Promise<void> => {
    if (!user) return;
    const ok = await new Promise<boolean>(res => setConfirmState({ open: true, title: '確定要取消嗎？', description: '系統會同步移除日曆事件。', confirmText: '取消時段', cancelText: '保留', resolve: res }));
    if (!ok) return;
    setActiveSlotId(uid);
    const res = await callApi('deleteSlot', { token: user.token, slotUid: uid });
    if (res?.success) {
      setMessage({ type: 'success', text: '時段已取消' });
      await fetchSlots();
    }
    setActiveSlotId(null);
  };

  const handleLogout = (): void => {
    (async () => {
      const ok = await new Promise<boolean>(res => setConfirmState({ open: true, title: '確定要登出？', confirmText: '登出', cancelText: '取消', resolve: res }));
      if (!ok) return;
      localStorage.removeItem('eng_practice_user');
      setUser(null);
      setIsDevMode(false);
      setRunOnboarding(false);
      setView('landing');
      setBookingLink(null);
    })();
  };

  // helper for showing a confirm modal is now done inline where needed

  

  return (
    <div className="app-shell bg-slate-50 text-slate-900 font-sans">
      <NavBar user={user} isDevMode={isDevMode} isLoading={isLoading} onLogout={handleLogout} onLogoClick={() => !isLoading && view !== 'landing' && setView('dashboard')} />

      {message && (
        <MessageBanner
          message={message}
          bookingLink={bookingLink}
          onClose={() => {
            if (messageTimerRef.current) {
              clearTimeout(messageTimerRef.current as unknown as number);
              messageTimerRef.current = null;
            }
            setMessage(null);
            setBookingLink(null);
          }}
        />
      )}

      <main className="app-main max-w-4xl mx-auto w-full p-2 sm:p-4 md:py-8">
        
        {view === 'landing' && (
          <div className="text-center py-8 sm:py-12 px-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-50 text-indigo-600 rounded-3xl sm:rounded-4xl mb-4 sm:mb-6 shadow-inner">
              <Calendar size={24} className="sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 sm:mb-4 tracking-tight leading-tight">找個夥伴，開口說英文</h1>
            <p className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-10 font-medium leading-relaxed">這是一個封閉式的 10 人小組預約系統。若您是受邀成員，請登入以查看可用時段。</p>
            <div className="flex flex-col gap-4 items-center">
              <button 
                onClick={() => setView('login')} 
                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl transition-all transform hover:scale-[1.02] shadow-2xl shadow-indigo-200 w-full max-w-xs active:scale-95"
              >
                登入系統
              </button>
              <button 
                onClick={handleDevBypass} 
                className="flex items-center gap-2 text-slate-400 hover:text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors pt-4"
              >
                <Cpu size={12} /> Developer Bypass
              </button>
              <button
                onClick={() => setShowPracticeGuide(!showPracticeGuide)}
                className="mt-4 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-black hover:bg-slate-50 transition-all w-full max-w-xs"
              >
                如何進行練習
              </button>
            </div>
            
          </div>
        )}

        {view === 'login' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-2 text-indigo-950"><Mail className="text-indigo-600" />身份驗證</h2>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">您的稱呼</label>
                <input
                  type="text"
                  value={authData.name}
                  onChange={(e) => {
                    const nextName = e.target.value;
                    setAuthData({ ...authData, name: nextName });
                    persistAuthProfile(authData.email, nextName);
                  }}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
                  placeholder="例如：Glenn"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Google Email</label>
                <input
                  type="email"
                  value={authData.email}
                  onChange={(e) => {
                    const nextEmail = e.target.value;
                    setAuthData({ ...authData, email: nextEmail });
                    persistAuthProfile(nextEmail, authData.name);
                  }}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
                  placeholder="name@gmail.com"
                />
              </div>
              <button 
                onClick={handleRequestOTP} 
                disabled={isLoading} 
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : '取得驗證碼'}
              </button>
              <button onClick={() => setView('landing')} className="w-full py-2 text-slate-400 text-sm font-bold hover:text-slate-700">返回首頁</button>
            </div>
          </div>
        )}

        {view === 'otp' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl text-center">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShieldCheck size={36} />
            </div>
            <h2 className="text-2xl font-black mb-2 text-indigo-950">驗證信箱</h2>
            <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">我們已寄送 4 位數驗證碼至 <br /><span className="font-black text-indigo-600">{authData.email}</span></p>
            <input type="text" maxLength={4} value={authData.otp} onChange={(e) => setAuthData({...authData, otp: e.target.value})} className="w-full text-center text-5xl tracking-[0.4em] px-4 py-6 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none font-black mb-8 focus:border-indigo-600 transition-all" placeholder="0000" />
            <button 
              onClick={handleVerifyOTP} 
              disabled={isLoading || authData.otp.length !== 4} 
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : '完成登入'}
            </button>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
            {user && (
              <Joyride
                run={runOnboarding}
                steps={onboardingSteps}
                continuous
                onEvent={handleOnboardingCallback}
                options={{
                  buttons: ['back', 'skip', 'close', 'primary'],
                  showProgress: true,
                  closeButtonAction: 'skip',
                  primaryColor: '#4f46e5',
                  textColor: '#0f172a',
                  zIndex: 1100,
                }}
                locale={{ back: '上一步', close: '關閉', last: '完成', next: '下一步', skip: '跳過' }}
              />
            )}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-3xl sm:rounded-4xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">時間列表 <Database size={16} className={isDevMode ? "text-amber-500" : "hidden"} /></h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">Active slots for next 2 weeks</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end items-stretch gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex bg-slate-100 p-1 rounded-xl sm:p-1.5 sm:rounded-2xl shadow-inner">
                    <button onClick={() => setLayout('list')} className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${layout === 'list' ? 'bg-white shadow-sm text-indigo-600 font-black' : 'text-slate-400'}`}><List size={18} /></button>
                    <button onClick={() => setLayout('grid')} className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${layout === 'grid' ? 'bg-white shadow-sm text-indigo-600 font-black' : 'text-slate-400'}`}><LayoutGrid size={18} /></button>
                  </div>
                  <button 
                    onClick={fetchSlots} 
                    disabled={isLoading}
                    className="p-2 sm:p-3 border border-slate-200 rounded-xl sm:rounded-2xl hover:bg-white hover:shadow-sm transition-all text-slate-400 disabled:opacity-30"
                    title="重新整理"
                  >
                    <RefreshCw size={18} className={isLoading ? "animate-spin text-indigo-600" : ""} />
                  </button>
                  <button
                    onClick={() => setShowPracticeGuide(true)}
                    className="p-2 sm:p-3 border border-slate-200 rounded-xl sm:rounded-2xl hover:bg-white hover:shadow-sm transition-all text-slate-400 disabled:opacity-30"
                    title="如何進行練習"
                  >
                    <Info size={18} />
                  </button>
                </div>
                <button 
                  onClick={() => setView('add-slots')} 
                  disabled={isLoading}
                  className="tour-publish-invite w-full sm:w-auto px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-xl sm:rounded-2xl hover:bg-indigo-700 transition-all font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                >
                  <Plus size={18} /> 發布邀請
                </button>
              </div>
            </div>

            {/* 過濾器 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-4 no-scrollbar">
              <Filter size={14} className="text-slate-300 shrink-0 ml-1" />
              {availableTags.map(tag => {
                return (
                  <button 
                    key={tag.id} 
                    disabled={isLoading}
                    onClick={() => setFilterTag(tag.id)} 
                    className={`whitespace-nowrap px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black transition-all border-2 ${filterTag === tag.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'} disabled:opacity-40`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>

            {/* 列表內容 */}
            {isLoading && slots.length === 0 ? (
              <div className="py-24 text-center font-black text-slate-300 flex flex-col items-center gap-4 animate-in fade-in duration-300">
                <Loader2 className="animate-spin" size={48} />
                <p className="tracking-widest uppercase text-[10px]">Syncing with Google Sheets...</p>
              </div>
            ) : Object.keys(groupedSlots).length === 0 ? (
              <div className="py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center font-black italic text-slate-400 animate-in fade-in duration-1000">
                目前沒有可預約的時段。
              </div>
            ) : (
              <div className="tour-slot-section space-y-8 sm:space-y-12">
                {Object.entries(groupedSlots).map(([dateLabel, dateSlots]) => (
                  <div key={dateLabel} className="space-y-3 sm:space-y-5">
                    <div className="flex items-center gap-2 sm:gap-3 sticky top-[52px] sm:top-[72px] z-40 sticky-date-bar backdrop-blur-md py-2 sm:py-3 px-1" style={{ background: 'transparent'}}>
                      <div className="p-1.5 sm:p-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm text-indigo-600"><CalendarDays size={14} className="sm:w-4 sm:h-4" /></div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">{dateLabel}</h3>
                      <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    {layout === 'list' ? (
                      <div className="bg-white rounded-3xl sm:rounded-4xl border border-slate-200 divide-y divide-slate-50 overflow-hidden shadow-sm">
                        {dateSlots.map((slot) => {
                          const isHost = slot.host === user?.email;
                          const isGuest = slot.guest === user?.email;
                          const isCurrentSlotLoading = activeSlotId === slot.uid;

                          return (
                            <div key={slot.uid} className={`flex items-center justify-between p-4 sm:p-6 gap-3 sm:gap-4 transition-all ${isHost ? 'bg-indigo-50/20' : 'hover:bg-slate-50/30'}`}>
                              <div className="flex items-center gap-3 sm:gap-6 flex-1">
                                <div className="flex flex-col items-start min-w-[70px] sm:min-w-[100px]">
                                  <span className="text-lg sm:text-2xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">
                                    {new Date(slot.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
                                  </span>
                                  <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                                    to {new Date(slot.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
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
                                    onClick={() => handleBook(slot.uid)} 
                                    disabled={isLoading} 
                                    className="tour-book-slot p-2 sm:px-10 sm:py-3 bg-indigo-600 text-white rounded-xl sm:rounded-[1.25rem] text-xs sm:text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 active:scale-95"
                                    title="預約"
                                  >
                                    {isCurrentSlotLoading ? (
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
                                    onClick={() => handleDelete(slot.uid)} 
                                    disabled={isLoading} 
                                    className="p-2 sm:p-3 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl sm:rounded-2xl transition-all disabled:opacity-20"
                                  >
                                    {isCurrentSlotLoading ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} className="sm:w-6 sm:h-6" />}
                                  </button>
                                )}
                                {slot.status === 'Booked' && isGuest && (
                                  <span className="px-3 py-2 sm:px-6 sm:py-3 bg-indigo-50 text-indigo-600 rounded-lg sm:rounded-2xl text-[10px] sm:text-xs font-black border border-indigo-100 shadow-sm">已預約</span>
                                )}
                                {slot.status === 'Booked' && !isHost && !isGuest && (
                                  <span className="text-[9px] sm:text-[11px] text-slate-300 font-black uppercase tracking-widest bg-slate-50 px-2 py-0.5 sm:px-3 sm:py-1 rounded sm:rounded-lg">已被預約</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dateSlots.map((slot) => {
                          const isHost = slot.host === user?.email;
                          const isGuest = slot.guest === user?.email;
                          const isCurrentSlotLoading = activeSlotId === slot.uid;
                          return (
                            <div key={slot.uid} className={`bg-white border-2 rounded-[2rem] p-6 transition-all shadow-sm flex flex-col justify-between gap-6 relative group ${isHost ? 'border-indigo-100 ring-8 ring-indigo-50/50' : 'border-slate-100 hover:border-indigo-100 hover:shadow-xl'}`}>
                              <div>
                                <div className="flex justify-between items-start mb-5">
                                  <StatusBadge status={slot.status} />
                                  <span className="text-[11px] font-black text-slate-400 tabular-nums bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100 tracking-tighter">
                                    {new Date(slot.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
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
                                  <button onClick={() => handleBook(slot.uid)} disabled={isLoading} className="tour-book-slot flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95">
                                    {isCurrentSlotLoading ? <Loader2 size={16} className="animate-spin" /> : '預約'}
                                  </button>
                                )}
                                {isHost && (
                                  <button onClick={() => handleDelete(slot.uid)} disabled={isLoading} className="flex-1 py-4 border-2 border-rose-100 text-rose-500 rounded-2xl text-xs font-black hover:bg-rose-50 flex items-center justify-center gap-2">
                                    {isCurrentSlotLoading ? <Loader2 size={16} className="animate-spin" /> : '取消時段'}
                                  </button>
                                )}
                                {slot.status === 'Booked' && isGuest && (
                                  <div className="flex-1 py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black text-center border border-indigo-100">已預約</div>
                                )}
                                {slot.status === 'Booked' && !isHost && !isGuest && (
                                  <div className="flex-1 py-4 bg-slate-50 text-slate-300 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest">Occupied</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'add-slots' && (
          <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-12 duration-600">
            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                <button 
                  onClick={() => !isLoading && setView('dashboard')} 
                  disabled={isLoading}
                  className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 font-bold transition-colors disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                  <span>取消</span>
                </button>
                <h2 className="text-3xl font-black text-indigo-950 tracking-tight">發布時段</h2>
                <div className="w-10"></div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-100 rounded-[2rem] p-6 mb-10 flex items-start gap-4">
                <div className="bg-amber-200 p-2 rounded-xl text-amber-700 shadow-sm"><Info size={24} className="shrink-0" /></div>
                <div className="text-xs text-amber-900 leading-relaxed font-bold">
                  <p>• 時間單位會自動調整以 30 分分割。</p>
                  <p>• 每一筆時段為一小時。</p>
                  <p>• 可新增多筆時段，列表僅顯示近 2 週</p>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                {newSlots.map((time, idx) => (
                  <div key={idx} className="flex gap-3 group animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${idx * 60}ms` }}>
                    <div className="flex-1 relative">
                      <input 
                        type="datetime-local" 
                        step="1800" 
                        value={time} 
                        disabled={isLoading}
                        onChange={(e) => {
                          const updated = [...newSlots];
                          updated[idx] = snapTo30Minutes(e.target.value);
                          setNewSlots(updated);
                        }} 
                        className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.75rem] focus:ring-8 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-black tabular-nums transition-all disabled:opacity-40" 
                      />
                    </div>
                    {newSlots.length > 1 && (
                      <button 
                        onClick={() => setNewSlots(newSlots.filter((_, i) => i !== idx))} 
                        disabled={isLoading}
                        className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-[1.5rem] transition-all disabled:opacity-20"
                      >
                        <Trash2 size={24} />
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  onClick={() => setNewSlots([...newSlots, ''])} 
                  disabled={isLoading}
                  className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[1.75rem] text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-all text-[11px] font-black flex items-center justify-center gap-2 disabled:opacity-30 uppercase tracking-widest"
                >
                  <Plus size={16} /> Add another slot
                </button>
              </div>

              <button 
                onClick={handleAddSlots} 
                disabled={isLoading || newSlots.every(s => s === '')} 
                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {isLoading ? <><Loader2 className="animate-spin" /> Processing...</> : '發布所有時段'}
              </button>
            </div>
          </div>
        )}

      </main>
      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        onCancel={() => {
          if (confirmState.resolve) confirmState.resolve(false);
          setConfirmState({ open: false });
        }}
        onConfirm={() => {
          if (confirmState.resolve) confirmState.resolve(true);
          setConfirmState({ open: false });
        }}
      />
      {showPracticeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPracticeGuide(false)} />
          <div className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl border border-slate-200 shadow-lg p-6 max-h-[90vh] overflow-auto">
            <button onClick={() => setShowPracticeGuide(false)} className="absolute top-3 right-3 p-2 text-slate-500 hover:text-slate-800">×</button>
            <picture>
              <source media="(max-width: 640px)" srcSet="images/practice_v.png" />
              <img src="images/practice_h.png" alt="如何進行練習" className="w-full h-auto rounded-lg" />
            </picture>
          </div>
        </div>
      )}

      <footer className="hidden sm:block max-w-4xl mx-auto p-10 text-center">
        <div className="flex flex-col items-center gap-4 opacity-30">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Practice2Gether</p>
            <p className="text-[8px] font-bold text-slate-400">Restricted Group Usage Only</p>
          </div>
        </div>
      </footer>
        {/* 若未取得 GAS_URL，覆蓋整個 UI 並顯示提示，阻止任何操作 */}
        {!serviceAvailable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl border border-slate-200 shadow-lg p-6 text-center">
              <h3 className="text-2xl font-black text-rose-600 mb-2">目前無法提供服務</h3>
              <p className="text-sm text-slate-600">系統尚未設定服務端點，請聯絡管理員或在部署環境中設定。</p>
            </div>
          </div>
        )}
    </div>
  );
};

export default App;
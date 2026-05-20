import React, { useRef, useState, useEffect, useMemo } from 'react';
import type { EventData, Step } from 'react-joyride';
import ConfirmModal from './components/ConfirmModal';
import MessageBanner from './components/MessageBanner';
import NavBar from './components/NavBar';
import LandingView from './components/LandingView';
import LoginView from './components/LoginView';
import OtpView from './components/OtpView';
import DashboardView from './components/DashboardView';
import AddSlotsView from './components/AddSlotsView';
import PracticeGuide from './components/PracticeGuide';
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
const SLOT_DURATION_MS = 60 * 60 * 1000;

type TimeInterval = {
  startMs: number;
  endMs: number;
};

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
  const [addSlotErrors, setAddSlotErrors] = useState<string[]>([]);
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

  const parseInterval = (startValue: string, endValue: string): TimeInterval | null => {
    const startMs = new Date(startValue).getTime();
    const endMs = new Date(endValue).getTime();
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return null;
    return { startMs, endMs };
  };

  const parseInputSlotInterval = (timeValue: string): TimeInterval | null => {
    if (!timeValue || timeValue.trim() === '') return null;
    const startMs = new Date(timeValue).getTime();
    if (!Number.isFinite(startMs)) return null;
    return { startMs, endMs: startMs + SLOT_DURATION_MS };
  };

  const isIntervalOverlap = (a: TimeInterval, b: TimeInterval): boolean => {
    return a.startMs < b.endMs && b.startMs < a.endMs;
  };

  const formatHm = (timeMs: number): string => {
    return new Date(timeMs).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const myOccupiedIntervals = useMemo((): TimeInterval[] => {
    if (!user?.email) return [];
    return slots
      .filter((slot) => {
        const isHostOwned = slot.host === user.email && (slot.status === 'Open' || slot.status === 'Booked');
        const isGuestBooked = slot.guest === user.email && slot.status === 'Booked';
        return isHostOwned || isGuestBooked;
      })
      .map((slot) => parseInterval(slot.start, slot.end))
      .filter((interval): interval is TimeInterval => interval !== null);
  }, [slots, user?.email]);

  const collectAddSlotConflicts = (timeValues: string[]): string[] => {
    const errors: string[] = [];
    const intervals = timeValues
      .map((value, idx) => ({ idx, interval: parseInputSlotInterval(value) }))
      .filter((item): item is { idx: number; interval: TimeInterval } => item.interval !== null);

    intervals.forEach(({ idx, interval }) => {
      const overlapWithMine = myOccupiedIntervals.some((occupied) => isIntervalOverlap(interval, occupied));
      if (overlapWithMine) {
        errors.push(`第 ${idx + 1} 筆 ${formatHm(interval.startMs)}-${formatHm(interval.endMs)} 與你的既有時段衝突`);
      }
    });

    for (let i = 0; i < intervals.length; i += 1) {
      for (let j = i + 1; j < intervals.length; j += 1) {
        if (isIntervalOverlap(intervals[i].interval, intervals[j].interval)) {
          errors.push(`第 ${intervals[i].idx + 1} 筆與第 ${intervals[j].idx + 1} 筆互相重疊`);
        }
      }
    }

    return Array.from(new Set(errors));
  };

  const getBookBlockReason = (slot: Slot): string | null => {
    if (!user) return '請先登入';
    if (slot.status !== 'Open') return '此時段已不可預約';
    if (slot.host === user.email) return '不可預約自己發布的時段';
    const targetInterval = parseInterval(slot.start, slot.end);
    if (!targetInterval) return '時段資料異常，請稍後再試';
    const overlapWithMine = myOccupiedIntervals.some((occupied) => isIntervalOverlap(targetInterval, occupied));
    if (overlapWithMine) {
      return `此時段與你的既有安排重疊 (${formatHm(targetInterval.startMs)}-${formatHm(targetInterval.endMs)})`;
    }
    return null;
  };

  useEffect(() => {
    if (view !== 'add-slots' && addSlotErrors.length > 0) {
      setAddSlotErrors([]);
    }
  }, [view, addSlotErrors.length]);

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
    const hasEmptySlot = newSlots.some(s => s.trim() === '');
    if (hasEmptySlot) {
      setMessage({ type: 'error', text: '請先填寫所有時段，空白欄位無法發布。' });
      return;
    }
    const validSlots = newSlots.filter(s => s !== '');
    if (validSlots.length === 0 || !user) return;
    const conflicts = collectAddSlotConflicts(validSlots);
    if (conflicts.length > 0) {
      setAddSlotErrors(conflicts);
      return;
    }
    const ok = await new Promise<boolean>(res => setConfirmState({ open: true, title: '確認發布時段？', description: '確定要發布這些時段到系統嗎？', confirmText: '發布', cancelText: '取消', resolve: res }));
    if (!ok) return;
    const res = await callApi('addSlots', { token: user.token, timeArray: validSlots });
    if (res?.success) {
      setMessage({ type: 'success', text: '已成功發布練習時段' });
      setNewSlots(['']);
      setAddSlotErrors([]);
      setView('dashboard');
      await fetchSlots(); 
    }
  };

  const handleBook = async (uid: string): Promise<void> => {
    if (!user) return;
    const targetSlot = slots.find((slot) => slot.uid === uid);
    if (!targetSlot) return;
    const blockReason = getBookBlockReason(targetSlot);
    if (blockReason) {
      setMessage({ type: 'error', text: blockReason });
      return;
    }
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

  const handleCancelBooking = async (uid: string): Promise<void> => {
    if (!user) return;
    const ok = await new Promise<boolean>(res => setConfirmState({ open: true, title: '確認取消預約？', description: '確定要取消你已預約的時段嗎？', confirmText: '取消預約', cancelText: '保留', resolve: res }));
    if (!ok) return;
    setActiveSlotId(uid);
    const res = await callApi('cancelSlot', { token: user.token, slotUid: uid });
    if (res?.success) {
      setMessage({ type: 'success', text: '已取消預約' });
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


  const handleNameChange = (name: string): void => {
    setAuthData((prev) => ({ ...prev, name }));
    persistAuthProfile(authData.email, name);
  };

  const handleEmailChange = (email: string): void => {
    setAuthData((prev) => ({ ...prev, email }));
    persistAuthProfile(email, authData.name);
  };

  const handleAlreadyHaveOTP = (): void => {
    if (!authData.email || !authData.name) {
      setMessage({ type: 'error', text: '請輸入稱呼與 Email' });
      return;
    }
    persistAuthProfile(authData.email, authData.name);
    setView('otp');
  };

  const handleSlotsChange = (updatedSlots: string[]): void => {
    setNewSlots(updatedSlots);
    if (addSlotErrors.length > 0) setAddSlotErrors([]);
  };

  return (
    <div className="app-shell bg-slate-50 text-slate-900 font-sans">
      <NavBar
        user={user}
        isDevMode={isDevMode}
        isLoading={isLoading}
        onLogout={handleLogout}
        onLogoClick={() => !isLoading && view !== 'landing' && setView('dashboard')}
      />

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

      <main className="app-main max-w-4xl mx-auto w-full p-0 sm:p-4 md:py-8">
        {view === 'landing' && (
          <LandingView
            onLogin={() => setView('login')}
            onDevBypass={handleDevBypass}
            onShowPracticeGuide={() => setShowPracticeGuide(true)}
          />
        )}

        {view === 'login' && (
          <LoginView
            name={authData.name}
            email={authData.email}
            isLoading={isLoading}
            onNameChange={handleNameChange}
            onEmailChange={handleEmailChange}
            onRequestOTP={handleRequestOTP}
            onAlreadyHaveOTP={handleAlreadyHaveOTP}
            onBack={() => setView('landing')}
          />
        )}

        {view === 'otp' && (
          <OtpView
            email={authData.email}
            otp={authData.otp}
            isLoading={isLoading}
            onOtpChange={(otp) => setAuthData((prev) => ({ ...prev, otp }))}
            onVerifyOTP={handleVerifyOTP}
            onBack={() => {
              setAuthData((prev) => ({ ...prev, otp: '' }));
              setView('login');
            }}
          />
        )}

        {view === 'dashboard' && (
          <DashboardView
            user={user}
            isLoading={isLoading}
            isDevMode={isDevMode}
            layout={layout}
            filterTag={filterTag}
            activeSlotId={activeSlotId}
            slotsEmpty={slots.length === 0}
            runOnboarding={runOnboarding}
            onboardingSteps={onboardingSteps}
            availableTags={availableTags}
            groupedSlots={groupedSlots}
            getBookBlockReason={getBookBlockReason}
            onLayoutChange={setLayout}
            onFilterChange={setFilterTag}
            onRefresh={fetchSlots}
            onAddSlots={() => setView('add-slots')}
            onShowGuide={() => setShowPracticeGuide(true)}
            onBook={handleBook}
            onCancelBooking={handleCancelBooking}
            onDelete={handleDelete}
            onOnboardingCallback={handleOnboardingCallback}
          />
        )}

        {view === 'add-slots' && (
          <AddSlotsView
            newSlots={newSlots}
            addSlotErrors={addSlotErrors}
            isLoading={isLoading}
            onSlotsChange={handleSlotsChange}
            onBack={() => !isLoading && setView('dashboard')}
            onSubmit={handleAddSlots}
          />
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

      {showPracticeGuide && <PracticeGuide onClose={() => setShowPracticeGuide(false)} />}

      <footer className="hidden sm:block max-w-4xl mx-auto p-10 text-center">
        <div className="flex flex-col items-center gap-4 opacity-30">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Practice2Gether</p>
            <p className="text-[8px] font-bold text-slate-400">Restricted Group Usage Only</p>
          </div>
        </div>
      </footer>

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

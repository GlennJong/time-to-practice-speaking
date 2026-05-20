import React from 'react';
import { Joyride } from 'react-joyride';
import type { EventData, Step } from 'react-joyride';
import { CalendarDays, Database, Filter, Info, LayoutGrid, List, Loader2, Plus, RefreshCw } from 'lucide-react';
import SlotListItem from './SlotListItem';
import SlotCard from './SlotCard';
import type { LayoutType, Slot, UserData } from '../types';

interface Props {
  user: UserData | null;
  isLoading: boolean;
  isDevMode: boolean;
  layout: LayoutType;
  filterTag: string;
  activeSlotId: string | null;
  slotsEmpty: boolean;
  runOnboarding: boolean;
  onboardingSteps: Step[];
  availableTags: { id: string; label: string }[];
  groupedSlots: Record<string, Slot[]>;
  getBookBlockReason: (slot: Slot) => string | null;
  onLayoutChange: (layout: LayoutType) => void;
  onFilterChange: (tag: string) => void;
  onRefresh: () => void;
  onAddSlots: () => void;
  onShowGuide: () => void;
  onBook: (uid: string) => void;
  onCancelBooking: (uid: string) => void;
  onDelete: (uid: string) => void;
  onOnboardingCallback: (data: EventData) => void;
}

const DashboardView: React.FC<Props> = ({
  user,
  isLoading,
  isDevMode,
  layout,
  filterTag,
  activeSlotId,
  slotsEmpty,
  runOnboarding,
  onboardingSteps,
  availableTags,
  groupedSlots,
  getBookBlockReason,
  onLayoutChange,
  onFilterChange,
  onRefresh,
  onAddSlots,
  onShowGuide,
  onBook,
  onCancelBooking,
  onDelete,
  onOnboardingCallback,
}) => (
  <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
    {user && (
      <Joyride
        run={runOnboarding}
        steps={onboardingSteps}
        continuous
        onEvent={onOnboardingCallback}
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

    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white mx-2 mt-2 p-4 sm:p-6 rounded-3xl sm:rounded-4xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            時間列表 <Database size={16} className={isDevMode ? 'text-amber-500' : 'hidden'} />
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">Active slots for next 2 weeks</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end items-stretch gap-2 sm:gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl sm:p-1.5 sm:rounded-2xl shadow-inner">
            <button
              onClick={() => onLayoutChange('list')}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${layout === 'list' ? 'bg-white shadow-sm text-indigo-600 font-black' : 'text-slate-400'}`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => onLayoutChange('grid')}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${layout === 'grid' ? 'bg-white shadow-sm text-indigo-600 font-black' : 'text-slate-400'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 sm:p-3 border border-slate-200 rounded-xl sm:rounded-2xl hover:bg-white hover:shadow-sm transition-all text-slate-400 disabled:opacity-30"
            title="重新整理"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin text-indigo-600' : ''} />
          </button>
          <button
            onClick={onShowGuide}
            className="p-2 sm:p-3 border border-slate-200 rounded-xl sm:rounded-2xl hover:bg-white hover:shadow-sm transition-all text-slate-400 disabled:opacity-30"
            title="如何進行練習"
          >
            <Info size={18} />
          </button>
        </div>
        <button
          onClick={onAddSlots}
          disabled={isLoading}
          className="tour-publish-invite w-full sm:w-auto px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-xl sm:rounded-2xl hover:bg-indigo-700 transition-all font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus size={18} /> 發布邀請
        </button>
      </div>
    </div>

    {/* Filter tags */}
    <div className="flex mx-2 items-center gap-2 overflow-x-auto pb-2 sm:pb-4 no-scrollbar">
      <Filter size={14} className="text-slate-300 shrink-0 ml-1" />
      {availableTags.map((tag) => (
        <button
          key={tag.id}
          disabled={isLoading}
          onClick={() => onFilterChange(tag.id)}
          className={`whitespace-nowrap px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black transition-all border-2 ${filterTag === tag.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'} disabled:opacity-40`}
        >
          {tag.label}
        </button>
      ))}
    </div>

    {/* Slot list */}
    {isLoading && slotsEmpty ? (
      <div className="py-24 text-center font-black text-slate-300 flex flex-col items-center gap-4 animate-in fade-in duration-300">
        <Loader2 className="animate-spin" size={48} />
        <p className="tracking-widest uppercase text-[10px]">Syncing...</p>
      </div>
    ) : Object.keys(groupedSlots).length === 0 ? (
      <div className="py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center font-black italic text-slate-400 animate-in fade-in duration-1000">
        目前沒有可預約的時段。
      </div>
    ) : (
      <div className="tour-slot-section space-y-8 sm:space-y-12">
        {Object.entries(groupedSlots).map(([dateLabel, dateSlots]) => (
          <div key={dateLabel} className="space-y-3 sm:space-y-5">
            <div
              className="flex items-center gap-2 sm:gap-3 sticky top-[0px] sm:top-[72px] z-40 sticky-date-bar backdrop-blur-md sm:backdrop-blur-none py-4 sm:py-3 px-2"
              style={{ background: 'transparent' }}
            >
              <div className="p-1.5 sm:p-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm text-indigo-600">
                <CalendarDays size={14} className="sm:w-4 sm:h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">{dateLabel}</h3>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {layout === 'list' ? (
              <div className="mx-2 bg-white rounded-3xl sm:rounded-4xl border border-slate-200 divide-y divide-slate-50 overflow-hidden shadow-sm">
                {dateSlots.map((slot) => (
                  <SlotListItem
                    key={slot.uid}
                    slot={slot}
                    userEmail={user?.email}
                    isLoading={isLoading}
                    isActive={activeSlotId === slot.uid}
                    bookBlockReason={getBookBlockReason(slot)}
                    onBook={onBook}
                    onDelete={onDelete}
                    onCancelBooking={onCancelBooking}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dateSlots.map((slot) => (
                  <SlotCard
                    key={slot.uid}
                    slot={slot}
                    userEmail={user?.email}
                    isLoading={isLoading}
                    isActive={activeSlotId === slot.uid}
                    bookBlockReason={getBookBlockReason(slot)}
                    onBook={onBook}
                    onDelete={onDelete}
                    onCancelBooking={onCancelBooking}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default DashboardView;

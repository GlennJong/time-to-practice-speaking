
export type BeatFrets = (number | null)[];
export type Beat = BeatFrets | string | null;

interface Measure {
  id: number;
  chord: string;
  chordPositionIndex?: number;
  lyrics: string;
  notes: Beat[];
  textTab?: string;
  breakAfter?: boolean;
}

export type Data = {
  id: string;
  title: string;
  artist: string;
  key: string;
  bpm: number;
  subdivisions: number;
  capo: number;
  tuningName: string;
  measures: Measure[];
  updated_at: string;
  created_at: string;
}

export type RawData = {
  id: string;
  title: string;
  artist: string;
  key: string;
  bpm: number;
  subdivisions: number;
  capo: number;
  tuningName: string;
  measures: string;
  updated_at: string;
  created_at: string;
}

export type SyncStatus = 'synced' | 'pending' | 'error';

export interface TabData extends Data {
  syncStatus?: SyncStatus;
}

// App specific types
export interface UserData {
  token: string;
  email: string;
  name: string;
}

export interface Slot {
  uid: string;
  host: string;
  hostName: string;
  start: string;
  end: string;
  status: 'Open' | 'Booked' | 'Cancelled';
  guest: string;
  guestName: string;
}

export interface MessageState {
  type: 'success' | 'error';
  text: string;
}

export type ViewType = 'landing' | 'login' | 'otp' | 'dashboard' | 'add-slots';
export type LayoutType = 'list' | 'grid';

export type RawSlot = Record<string, unknown>;

export type ApiResponse = {
  success?: boolean;
  error?: string;
  token?: string;
  email?: string;
  name?: string;
  link?: string;
} & Record<string, unknown>;

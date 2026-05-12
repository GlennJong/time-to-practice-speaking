
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

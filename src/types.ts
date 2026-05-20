
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

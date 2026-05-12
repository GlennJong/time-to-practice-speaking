// src/utils/musicTheory.ts

// 定義音符型別
export type NoteName = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";

// 基礎設定：我們專注於一個八度內的練習 (Middle C area)
export const NOTES: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// 定義和弦結構 (半音距離)
const CHORD_INTERVALS = {
  major: [0, 4, 7],      // 大三和弦 (Root, Major 3rd, Perfect 5th)
  minor: [0, 3, 7],      // 小三和弦
  diminished: [0, 3, 6], // 減三和弦
};

// 產生 E2 到 A4 的所有音符
const GUITAR_Range_NOTES: string[] = [];
// E2 - B2
for (let i = NOTES.indexOf('E'); i < NOTES.length; i++) GUITAR_Range_NOTES.push(`${NOTES[i]}2`); 
// C3 - B3
for (let i = 0; i < NOTES.length; i++) GUITAR_Range_NOTES.push(`${NOTES[i]}3`); 
// C4 - A4
for (let i = 0; i <= NOTES.indexOf('A'); i++) GUITAR_Range_NOTES.push(`${NOTES[i]}4`); 

export interface Question {
  root: NoteName;
  type: string; // major, minor, single...
  notes: string[]; // 包含八度的完整音名，如 ["C4", "E4", "G4"]
}

// 取得某個音符加上半音後的音符
const getNoteFromInterval = (root: NoteName, semitones: number): string => {
  const rootIndex = NOTES.indexOf(root);
  const targetIndex = rootIndex + semitones;
  
  // 計算是第幾個八度 (假設從 4 開始)
  const octaveOffset = Math.floor(targetIndex / 12);
  const noteIndex = targetIndex % 12;
  
  return `${NOTES[noteIndex]}${4 + octaveOffset}`;
};

// 產生題目：隨機選擇一個根音與和弦類型
export const generateChordQuestion = (): Question => {
  // 1. 隨機選根音 (例如 C, F, G)
  const randomRoot = NOTES[Math.floor(Math.random() * NOTES.length)];
  
  // 2. 隨機選和弦類型 (大三、小三...)
  const types = Object.keys(CHORD_INTERVALS) as (keyof typeof CHORD_INTERVALS)[];
  const randomType = types[Math.floor(Math.random() * types.length)];
  
  // 3. 計算組成音
  const intervals = CHORD_INTERVALS[randomType];
  const notes = intervals.map(interval => getNoteFromInterval(randomRoot, interval));

  return {
    root: randomRoot,
    type: randomType,
    notes: notes
  };
};

export const generateSingleNoteQuestion = (): Question => {
  const randomFullNote = GUITAR_Range_NOTES[Math.floor(Math.random() * GUITAR_Range_NOTES.length)];
  const noteName = randomFullNote.slice(0, -1) as NoteName; // Remove octave number
  
  return {
    root: noteName,
    type: '單音',
    notes: [randomFullNote]
  };
};

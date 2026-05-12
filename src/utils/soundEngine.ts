import * as Tone from 'tone';

class SoundEngine {
  private synth: Tone.PolySynth;

  constructor() {
    // 使用複音合成器 (PolySynth) 才能同時播放多個音 (和弦)
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    
    // 設定音量，避免太刺耳
    this.synth.volume.value = -10;
  }

  // 瀏覽器需要使用者互動後才能啟動 AudioContext
  async initialize() {
    await Tone.start();
  }

  // 播放單音或和弦
  playNotes(notes: string[], duration: string = "1n") {
    // 立即釋放之前的聲音，避免混音太雜
    this.synth.releaseAll();
    // 觸發聲音 (音符陣列, 持續時間)
    this.synth.triggerAttackRelease(notes, duration);
  }
}

// 匯出單例模式 (Singleton)，確保全域只有一個合成器實例
export const soundEngine = new SoundEngine();
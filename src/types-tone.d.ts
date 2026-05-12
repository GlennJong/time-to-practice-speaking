declare module 'tone' {
	export class Synth {}
	export class PolySynth {
		constructor(voice?: any);
		toDestination(): this;
		triggerAttackRelease(notes: string[] | string, duration?: string): void;
		releaseAll(): void;
		volume: { value: number };
	}
	export function start(): Promise<void>;
	const Tone: any;
	export default Tone;
}

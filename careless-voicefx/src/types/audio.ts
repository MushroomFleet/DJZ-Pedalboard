// Audio Effect Types for Careless-VoiceFX

export type EffectType =
  | 'Chorus'
  | 'Compressor'
  | 'Delay'
  | 'Distortion'
  | 'HighpassFilter'
  | 'LowpassFilter'
  | 'Phaser'
  | 'Reverb'
  | 'PitchShift'
  | 'Limiter'
  | 'LadderFilter';

// Effect Parameter Interfaces

export interface ChorusParams {
  rate_hz?: number;      // Default: 1.0, Range: 0.1 - 10.0
  depth?: number;        // Default: 0.25, Range: 0.0 - 1.0
  centre_delay_ms?: number; // Default: 7.0, Range: 1.0 - 50.0
  feedback?: number;     // Default: 0.0, Range: -1.0 - 1.0
  mix?: number;          // Default: 0.5, Range: 0.0 - 1.0
}

export interface CompressorParams {
  threshold_db?: number; // Default: -20.0, Range: -60.0 - 0.0
  ratio?: number;        // Default: 4.0, Range: 1.0 - 20.0
  attack_ms?: number;    // Default: 1.0, Range: 0.1 - 100.0
  release_ms?: number;   // Default: 100.0, Range: 10.0 - 1000.0
}

export interface DelayParams {
  delay_seconds?: number; // Default: 0.5, Range: 0.0 - 5.0
  feedback?: number;      // Default: 0.0, Range: 0.0 - 1.0
  mix?: number;           // Default: 0.5, Range: 0.0 - 1.0
}

export interface DistortionParams {
  drive_db?: number;     // Default: 25.0, Range: 0.0 - 100.0
}

export interface HighpassFilterParams {
  cutoff_frequency_hz?: number; // Default: 50.0, Range: 20.0 - 20000.0
}

export interface LowpassFilterParams {
  cutoff_frequency_hz?: number; // Default: 5000.0, Range: 20.0 - 20000.0
}

export interface PhaserParams {
  rate_hz?: number;      // Default: 1.0, Range: 0.1 - 10.0
  depth?: number;        // Default: 0.5, Range: 0.0 - 1.0
  centre_frequency_hz?: number; // Default: 1300.0, Range: 200.0 - 10000.0
  feedback?: number;     // Default: 0.0, Range: -1.0 - 1.0
  mix?: number;          // Default: 0.5, Range: 0.0 - 1.0
}

export interface ReverbParams {
  room_size?: number;    // Default: 0.5, Range: 0.0 - 1.0
  damping?: number;      // Default: 0.5, Range: 0.0 - 1.0
  wet_level?: number;    // Default: 0.33, Range: 0.0 - 1.0
  dry_level?: number;    // Default: 0.4, Range: 0.0 - 1.0
  width?: number;        // Default: 1.0, Range: 0.0 - 1.0
  freeze_mode?: number;  // Default: 0.0, Range: 0.0 - 1.0
}

export interface PitchShiftParams {
  semitones?: number;    // Default: 0.0, Range: -12.0 - 12.0
}

export interface LimiterParams {
  threshold_db?: number; // Default: -10.0, Range: -60.0 - 0.0
  release_ms?: number;   // Default: 100.0, Range: 10.0 - 1000.0
}

export interface LadderFilterParams {
  mode?: 'LPF12' | 'LPF24' | 'HPF12' | 'HPF24' | 'BPF12' | 'BPF24'; // Default: 'LPF12'
  cutoff_hz?: number;    // Default: 1000.0, Range: 20.0 - 20000.0
  resonance?: number;    // Default: 0.0, Range: 0.0 - 1.0
  drive?: number;        // Default: 1.0, Range: 1.0 - 10.0
}

export type EffectParams =
  | ChorusParams
  | CompressorParams
  | DelayParams
  | DistortionParams
  | HighpassFilterParams
  | LowpassFilterParams
  | PhaserParams
  | ReverbParams
  | PitchShiftParams
  | LimiterParams
  | LadderFilterParams;

// Effect Instance
export interface AudioEffect {
  type: EffectType;
  params: EffectParams;
  enabled?: boolean;
  id?: string;
}

// .pdl File Structure
export interface PDLPreset {
  title: string;
  effects: AudioEffect[];
  outputFilename: string;
}

// Audio Processing Types
export interface AudioBuffer {
  data: Float32Array[];  // Multi-channel audio data
  sampleRate: number;
  duration: number;
  numberOfChannels: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  currentEffect?: string;
}

// Audio File Information
export interface AudioFileInfo {
  name: string;
  size: number;
  type: string;
  duration?: number;
  sampleRate?: number;
  numberOfChannels?: number;
}

// Application State
export interface AudioState {
  inputAudio: AudioBuffer | null;
  processedAudio: AudioBuffer | null;
  currentPreset: PDLPreset | null;
  processingState: ProcessingState;
  fileInfo: AudioFileInfo | null;
}

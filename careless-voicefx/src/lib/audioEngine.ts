import type { AudioEffect, AudioBuffer as CustomAudioBuffer } from '../types/audio';

/**
 * Audio Engine for processing audio with Web Audio API effects
 */
export class AudioEngine {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext();
  }

  /**
   * Load audio file and decode it
   */
  async loadAudioFile(file: File): Promise<CustomAudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    // Convert Web Audio API AudioBuffer to our custom format
    const channels: Float32Array[] = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    return {
      data: channels,
      sampleRate: audioBuffer.sampleRate,
      duration: audioBuffer.duration,
      numberOfChannels: audioBuffer.numberOfChannels,
    };
  }

  /**
   * Process audio through an effect chain
   */
  async processAudio(
    inputBuffer: CustomAudioBuffer,
    effects: AudioEffect[],
    onProgress?: (progress: number, currentEffect: string) => void
  ): Promise<CustomAudioBuffer> {
    // Create an offline audio context for processing
    const offlineContext = new OfflineAudioContext(
      inputBuffer.numberOfChannels,
      inputBuffer.data[0].length,
      inputBuffer.sampleRate
    );

    // Create a buffer source
    const audioBuffer = offlineContext.createBuffer(
      inputBuffer.numberOfChannels,
      inputBuffer.data[0].length,
      inputBuffer.sampleRate
    );

    // Copy data to the buffer
    for (let channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
      const channelData = new Float32Array(inputBuffer.data[channel]);
      audioBuffer.copyToChannel(channelData, channel);
    }

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    // Build effect chain
    let currentNode: AudioNode = source;

    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i];
      if (!effect.enabled) continue;

      if (onProgress) {
        onProgress((i / effects.length) * 100, effect.type);
      }

      const effectNode = await this.createEffectNode(offlineContext, effect);
      if (effectNode) {
        currentNode.connect(effectNode);
        currentNode = effectNode;
      }
    }

    // Connect to destination
    currentNode.connect(offlineContext.destination);

    // Start processing
    source.start(0);

    // Render the audio
    const renderedBuffer = await offlineContext.startRendering();

    // Convert back to our custom format
    const channels: Float32Array[] = [];
    for (let i = 0; i < renderedBuffer.numberOfChannels; i++) {
      channels.push(renderedBuffer.getChannelData(i));
    }

    if (onProgress) {
      onProgress(100, 'Complete');
    }

    return {
      data: channels,
      sampleRate: renderedBuffer.sampleRate,
      duration: renderedBuffer.duration,
      numberOfChannels: renderedBuffer.numberOfChannels,
    };
  }

  /**
   * Create an effect node based on the effect type
   */
  private async createEffectNode(
    context: BaseAudioContext,
    effect: AudioEffect
  ): Promise<AudioNode | null> {
    switch (effect.type) {
      case 'Chorus':
        return this.createChorusNode(context, effect.params);
      case 'Compressor':
        return this.createCompressorNode(context, effect.params);
      case 'Delay':
        return this.createDelayNode(context, effect.params);
      case 'Distortion':
        return this.createDistortionNode(context, effect.params);
      case 'HighpassFilter':
        return this.createHighpassFilterNode(context, effect.params);
      case 'LowpassFilter':
        return this.createLowpassFilterNode(context, effect.params);
      case 'Reverb':
        return this.createReverbNode(context, effect.params);
      case 'Limiter':
        return this.createLimiterNode(context, effect.params);
      default:
        console.warn(`Effect type ${effect.type} not yet implemented`);
        return null;
    }
  }

  /**
   * Create a Chorus effect using Web Audio API
   */
  private createChorusNode(context: BaseAudioContext, params: any): AudioNode {
    const input = context.createGain();
    const output = context.createGain();
    const delay = context.createDelay();
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    const wet = context.createGain();
    const dry = context.createGain();

    const rate = params.rate_hz || 1.0;
    const depth = params.depth || 0.25;
    const mix = params.mix || 0.5;
    const centreDelay = (params.centre_delay_ms || 7.0) / 1000;

    // Configure delay
    delay.delayTime.value = centreDelay;

    // Configure LFO
    lfo.frequency.value = rate;
    lfoGain.gain.value = depth * centreDelay;

    // Configure mix
    wet.gain.value = mix;
    dry.gain.value = 1 - mix;

    // Connect nodes
    input.connect(dry);
    dry.connect(output);

    input.connect(delay);
    lfo.connect(lfoGain);
    lfoGain.connect(delay.delayTime);
    delay.connect(wet);
    wet.connect(output);

    lfo.start(0);

    // Return a wrapper that has both input and output
    const wrapper = context.createGain();
    wrapper.connect(input);
    output.connect(wrapper);

    return wrapper;
  }

  /**
   * Create a Compressor effect
   */
  private createCompressorNode(context: BaseAudioContext, params: any): AudioNode {
    const compressor = context.createDynamicsCompressor();

    compressor.threshold.value = params.threshold_db || -20;
    compressor.ratio.value = params.ratio || 4;
    compressor.attack.value = (params.attack_ms || 1) / 1000;
    compressor.release.value = (params.release_ms || 100) / 1000;

    return compressor;
  }

  /**
   * Create a Delay effect
   */
  private createDelayNode(context: BaseAudioContext, params: any): AudioNode {
    const input = context.createGain();
    const output = context.createGain();
    const delay = context.createDelay();
    const feedback = context.createGain();
    const wet = context.createGain();
    const dry = context.createGain();

    const delayTime = params.delay_seconds || 0.5;
    const feedbackAmount = params.feedback || 0.0;
    const mix = params.mix || 0.5;

    delay.delayTime.value = delayTime;
    feedback.gain.value = feedbackAmount;
    wet.gain.value = mix;
    dry.gain.value = 1 - mix;

    // Connect nodes
    input.connect(dry);
    dry.connect(output);

    input.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(output);

    return input;
  }

  /**
   * Create a Distortion effect
   */
  private createDistortionNode(context: BaseAudioContext, params: any): AudioNode {
    const waveshaper = context.createWaveShaper();
    const drive = params.drive_db || 25;

    // Create distortion curve
    const k = drive;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);

    for (let i = 0; i < n_samples; i++) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20) / (Math.PI + k * Math.abs(x));
    }

    waveshaper.curve = curve;
    waveshaper.oversample = '4x';

    return waveshaper;
  }

  /**
   * Create a Highpass Filter
   */
  private createHighpassFilterNode(context: BaseAudioContext, params: any): AudioNode {
    const filter = context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = params.cutoff_frequency_hz || 50;

    return filter;
  }

  /**
   * Create a Lowpass Filter
   */
  private createLowpassFilterNode(context: BaseAudioContext, params: any): AudioNode {
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = params.cutoff_frequency_hz || 5000;

    return filter;
  }

  /**
   * Create a Reverb effect using convolution
   */
  private createReverbNode(context: BaseAudioContext, params: any): AudioNode {
    const convolver = context.createConvolver();
    const roomSize = params.room_size || 0.5;
    const damping = params.damping || 0.5;

    // Generate impulse response for reverb
    const sampleRate = context.sampleRate;
    const length = sampleRate * roomSize * 3; // Reverb time based on room size
    const impulse = context.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / sampleRate;
      const decay = Math.exp(-n * 3 * (1 - roomSize) * (1 + damping));
      impulseL[i] = (Math.random() * 2 - 1) * decay;
      impulseR[i] = (Math.random() * 2 - 1) * decay;
    }

    convolver.buffer = impulse;

    // Mix wet/dry
    const input = context.createGain();
    const output = context.createGain();
    const wet = context.createGain();
    const dry = context.createGain();

    const wetLevel = params.wet_level || 0.33;
    const dryLevel = params.dry_level || 0.4;

    wet.gain.value = wetLevel;
    dry.gain.value = dryLevel;

    input.connect(dry);
    dry.connect(output);
    input.connect(convolver);
    convolver.connect(wet);
    wet.connect(output);

    return input;
  }

  /**
   * Create a Limiter effect
   */
  private createLimiterNode(context: BaseAudioContext, params: any): AudioNode {
    const compressor = context.createDynamicsCompressor();

    compressor.threshold.value = params.threshold_db || -10;
    compressor.knee.value = 0; // Hard knee for limiting
    compressor.ratio.value = 20; // High ratio for limiting
    compressor.attack.value = 0.001; // Fast attack
    compressor.release.value = (params.release_ms || 100) / 1000;

    return compressor;
  }

  /**
   * Export audio buffer to WAV blob
   */
  exportToWav(audioBuffer: CustomAudioBuffer): Blob {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.data[0].length;

    // Create WAV file
    const buffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(buffer);

    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Write audio data
    const offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.data[channel][i]));
        view.setInt16(
          offset + (i * numberOfChannels + channel) * 2,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
      }
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Get audio context
   */
  getContext(): AudioContext {
    return this.audioContext;
  }

  /**
   * Resume audio context (required for user interaction)
   */
  async resume() {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();

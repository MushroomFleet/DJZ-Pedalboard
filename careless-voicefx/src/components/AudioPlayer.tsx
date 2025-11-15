import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { AudioBuffer } from '../types/audio';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | null;
  label: string;
  onDownload?: () => void;
}

export function AudioPlayer({ audioBuffer, label, onDownload }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef(0);
  const pauseTimeRef = useRef(0);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }

    return () => {
      stop();
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  const play = async () => {
    if (!audioBuffer || !audioContextRef.current || !gainNodeRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    // Stop any currently playing audio
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
    }

    // Create new buffer and source
    const webAudioBuffer = audioContextRef.current.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.data[0].length,
      audioBuffer.sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = new Float32Array(audioBuffer.data[channel]);
      webAudioBuffer.copyToChannel(channelData, channel);
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = webAudioBuffer;
    source.connect(gainNodeRef.current);

    source.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      pauseTimeRef.current = 0;
    };

    startTimeRef.current = audioContextRef.current.currentTime - pauseTimeRef.current;
    source.start(0, pauseTimeRef.current);
    sourceNodeRef.current = source;
    setIsPlaying(true);

    // Update current time
    const updateTime = () => {
      if (audioContextRef.current && sourceNodeRef.current) {
        const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
        setCurrentTime(elapsed);
        if (isPlaying) {
          requestAnimationFrame(updateTime);
        }
      }
    };
    updateTime();
  };

  const pause = () => {
    if (sourceNodeRef.current && audioContextRef.current) {
      pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    pauseTimeRef.current = 0;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (volume === 0) return 'volume-off';
    if (volume < 0.5) return 'volume-low';
    return 'volume-high';
  };

  if (!audioBuffer) {
    return (
      <div className="card opacity-50">
        <h3 className="text-lg font-semibold mb-4">{label}</h3>
        <p className="text-muted-foreground text-center py-8">No audio loaded</p>
      </div>
    );
  }

  const duration = audioBuffer.duration;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">{label}</h3>

      {/* Waveform placeholder / progress bar */}
      <div className="mb-4 bg-muted rounded-lg h-16 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-primary/30 transition-all"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={isPlaying ? pause : play}
          className="btn-primary w-12 h-12 rounded-full flex items-center justify-center"
        >
          <FontAwesomeIcon icon={isPlaying ? 'pause' : 'play'} />
        </button>

        <button
          onClick={stop}
          className="btn-primary w-10 h-10 rounded-full flex items-center justify-center"
        >
          <FontAwesomeIcon icon="stop" />
        </button>

        <div className="flex-1 flex items-center gap-2">
          <FontAwesomeIcon icon={getVolumeIcon()} className="text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none bg-muted cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-primary
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:w-4
                     [&::-moz-range-thumb]:h-4
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-primary
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>

        {onDownload && (
          <button
            onClick={onDownload}
            className="btn-accent h-10 px-4 rounded-lg flex items-center gap-2"
          >
            <FontAwesomeIcon icon="download" />
            <span>Download</span>
          </button>
        )}
      </div>

      {/* Audio info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Sample Rate: {audioBuffer.sampleRate} Hz</div>
        <div>Channels: {audioBuffer.numberOfChannels}</div>
        <div>Duration: {formatTime(duration)}</div>
      </div>
    </div>
  );
}

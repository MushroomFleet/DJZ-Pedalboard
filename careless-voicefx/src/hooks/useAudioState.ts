import { useState } from 'react';
import type { AudioBuffer, PDLPreset, AudioFileInfo, ProcessingState } from '../types/audio';

export function useAudioState() {
  const [inputAudio, setInputAudio] = useState<AudioBuffer | null>(null);
  const [processedAudio, setProcessedAudio] = useState<AudioBuffer | null>(null);
  const [currentPreset, setCurrentPreset] = useState<PDLPreset | null>(null);
  const [fileInfo, setFileInfo] = useState<AudioFileInfo | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
  });

  const reset = () => {
    setInputAudio(null);
    setProcessedAudio(null);
    setCurrentPreset(null);
    setFileInfo(null);
    setProcessingState({
      isProcessing: false,
      progress: 0,
    });
  };

  const resetProcessedAudio = () => {
    setProcessedAudio(null);
  };

  return {
    inputAudio,
    setInputAudio,
    processedAudio,
    setProcessedAudio,
    currentPreset,
    setCurrentPreset,
    fileInfo,
    setFileInfo,
    processingState,
    setProcessingState,
    reset,
    resetProcessedAudio,
  };
}

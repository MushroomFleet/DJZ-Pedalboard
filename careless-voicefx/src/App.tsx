import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AudioUploader } from './components/AudioUploader';
import { AudioPlayer } from './components/AudioPlayer';
import { PresetManager } from './components/PresetManager';
import { ProcessingPanel } from './components/ProcessingPanel';
import { useAudioState } from './hooks/useAudioState';
import { audioEngine } from './lib/audioEngine';
import type { PDLPreset } from './types/audio';
import './lib/fontawesome';

function App() {
  const {
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
  } = useAudioState();

  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setError(null);
    resetProcessedAudio();

    try {
      const buffer = await audioEngine.loadAudioFile(file);
      setInputAudio(buffer);
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type,
        duration: buffer.duration,
        sampleRate: buffer.sampleRate,
        numberOfChannels: buffer.numberOfChannels,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audio file');
      console.error('Error loading audio:', err);
    }
  };

  const handlePresetLoad = (preset: PDLPreset) => {
    setCurrentPreset(preset);
    resetProcessedAudio();
    setError(null);
  };

  const handleProcess = async () => {
    if (!inputAudio || !currentPreset) return;

    setError(null);
    setProcessingState({
      isProcessing: true,
      progress: 0,
    });

    try {
      await audioEngine.resume();

      const processed = await audioEngine.processAudio(
        inputAudio,
        currentPreset.effects,
        (progress, currentEffect) => {
          setProcessingState({
            isProcessing: true,
            progress,
            currentEffect,
          });
        }
      );

      setProcessedAudio(processed);
      setProcessingState({
        isProcessing: false,
        progress: 100,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process audio');
      console.error('Error processing audio:', err);
      setProcessingState({
        isProcessing: false,
        progress: 0,
      });
    }
  };

  const handleDownload = () => {
    if (!processedAudio || !currentPreset) return;

    try {
      const blob = audioEngine.exportToWav(processedAudio);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentPreset.outputFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download audio');
      console.error('Error downloading audio:', err);
    }
  };

  const canProcess = inputAudio !== null && currentPreset !== null && !processingState.isProcessing;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary py-8 px-6 shadow-elegant">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="text-5xl">
              <FontAwesomeIcon icon="music" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold animate-slide-down">
                Careless-VoiceFX
              </h1>
              <p className="text-primary-foreground/80 text-sm md:text-base mt-1">
                Professional Audio Effects Processing
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive flex items-start gap-3 animate-fade-in">
            <FontAwesomeIcon icon="exclamation-triangle" className="text-xl mt-0.5" />
            <div>
              <div className="font-semibold mb-1">Error</div>
              <div className="text-sm">{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-destructive hover:text-destructive/80"
            >
              <FontAwesomeIcon icon="times" />
            </button>
          </div>
        )}

        {fileInfo && (
          <div className="mb-6 card bg-success/10 border border-success animate-scale-in">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon="file-audio" className="text-2xl text-success" />
              <div className="flex-1">
                <div className="font-semibold text-success">{fileInfo.name}</div>
                <div className="text-sm text-muted-foreground">
                  {(fileInfo.size / 1024 / 1024).toFixed(2)} MB • {fileInfo.sampleRate} Hz •{' '}
                  {fileInfo.numberOfChannels ?? 1} channel{(fileInfo.numberOfChannels ?? 1) > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="animate-fade-in">
              <AudioUploader
                onFileSelected={handleFileSelected}
                disabled={processingState.isProcessing}
              />
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <PresetManager
                currentPreset={currentPreset}
                onPresetLoad={handlePresetLoad}
                disabled={processingState.isProcessing}
              />
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <ProcessingPanel
                processingState={processingState}
                onProcess={handleProcess}
                onReset={reset}
                canProcess={canProcess}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <AudioPlayer audioBuffer={inputAudio} label="Input Audio" />
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <AudioPlayer
                audioBuffer={processedAudio}
                label="Processed Audio"
                onDownload={processedAudio ? handleDownload : undefined}
              />
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="card bg-card/50 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon="circle-info" className="text-primary text-xl mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">How to Use</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Upload your audio file using the uploader above</li>
                <li>Load a .pdl preset file with your desired effect chain</li>
                <li>Click "Process Audio" to apply the effects</li>
                <li>Listen to the processed audio and download it when ready</li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Careless-VoiceFX • Professional Audio Effects • Built with Web Audio API</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

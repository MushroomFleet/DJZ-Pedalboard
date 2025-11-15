import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ProcessingState } from '../types/audio';

interface ProcessingPanelProps {
  processingState: ProcessingState;
  onProcess: () => void;
  onReset: () => void;
  canProcess: boolean;
}

export function ProcessingPanel({
  processingState,
  onProcess,
  onReset,
  canProcess,
}: ProcessingPanelProps) {
  const { isProcessing, progress, currentEffect } = processingState;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FontAwesomeIcon icon="gear" className="text-accent" />
        Audio Processing
      </h3>

      {isProcessing ? (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Processing...</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {currentEffect && (
              <div className="mt-2 text-sm text-muted-foreground">
                Current effect: <span className="text-foreground font-medium">{currentEffect}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={onProcess}
              disabled={!canProcess}
              className="btn-primary flex-1 h-12 flex items-center justify-center gap-2 text-lg font-semibold"
            >
              <FontAwesomeIcon icon="play" />
              <span>Process Audio</span>
            </button>

            <button
              onClick={onReset}
              disabled={!canProcess}
              className="btn-primary h-12 px-6 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon="rotate-right" />
              <span>Reset</span>
            </button>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            {!canProcess && 'Upload audio and load a preset to begin processing'}
          </div>
        </div>
      )}
    </div>
  );
}

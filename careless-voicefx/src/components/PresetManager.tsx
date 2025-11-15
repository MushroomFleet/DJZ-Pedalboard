import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { parsePDLFile, serializePDLPreset } from '../lib/pdlParser';
import type { PDLPreset } from '../types/audio';

interface PresetManagerProps {
  currentPreset: PDLPreset | null;
  onPresetLoad: (preset: PDLPreset) => void;
  onPresetSave?: (preset: PDLPreset) => void;
  disabled?: boolean;
}

export function PresetManager({
  currentPreset,
  onPresetLoad,
  onPresetSave,
  disabled = false,
}: PresetManagerProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      const content = await file.text();
      const preset = parsePDLFile(content);
      onPresetLoad(preset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preset');
      console.error('Error loading preset:', err);
    }
  };

  const handleSaveClick = () => {
    if (!currentPreset) return;

    try {
      const content = serializePDLPreset(currentPreset);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentPreset.title.toLowerCase().replace(/\s+/g, '_') + '.pdl';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (onPresetSave) {
        onPresetSave(currentPreset);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preset');
      console.error('Error saving preset:', err);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FontAwesomeIcon icon="sliders" className="text-primary" />
        Preset Manager
      </h3>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm flex items-start gap-2">
          <FontAwesomeIcon icon="exclamation-triangle" className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {currentPreset && (
        <div className="mb-4 p-4 rounded-lg bg-muted">
          <div className="text-sm font-semibold mb-2">{currentPreset.title}</div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Effects: {currentPreset.effects.length}</div>
            <div>Output: {currentPreset.outputFilename}</div>
          </div>
          <div className="mt-3 space-y-1">
            {currentPreset.effects.map((effect, index) => (
              <div
                key={effect.id || index}
                className="text-xs bg-background/50 px-2 py-1 rounded flex items-center gap-2"
              >
                <FontAwesomeIcon icon="wave-square" className="text-primary text-xs" />
                <span className="font-medium">{effect.type}</span>
                <span className="text-muted-foreground flex-1">
                  {Object.keys(effect.params).length} parameters
                </span>
                {effect.enabled === false && (
                  <span className="text-muted-foreground text-xs">(disabled)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleLoadClick}
          disabled={disabled}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon="folder-open" />
          <span>Load Preset (.pdl)</span>
        </button>

        <button
          onClick={handleSaveClick}
          disabled={disabled || !currentPreset}
          className="btn-accent flex-1 flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon="save" />
          <span>Save Preset</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdl"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface AudioUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function AudioUploader({ onFileSelected, disabled = false }: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      onFileSelected(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          border-2 border-dashed border-border rounded-lg p-12
          flex flex-col items-center justify-center gap-4
          cursor-pointer transition-smooth
          hover:border-primary hover:bg-card/50
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="text-6xl text-primary">
          <FontAwesomeIcon icon="upload" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Upload Audio File</h3>
          <p className="text-muted-foreground text-sm">
            Click to browse or drag and drop your audio file here
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Supported formats: MP3, WAV, OGG, FLAC
          </p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
}

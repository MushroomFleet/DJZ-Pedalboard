# Careless-VoiceFX

![Careless-VoiceFX](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Professional audio effects processing web application built with React, TypeScript, Vite, and the Web Audio API. Originally converted from the DJZ-Pedalboard ComfyUI custom node.

## Features

✨ **Pure TypeScript Implementation** - Fully typed codebase for better developer experience

🎨 **NSL Brand Styling** - Beautiful dark purple and golden theme with smooth animations

🎛️ **Professional Audio Effects**:
- Chorus (Subtle & Intense)
- Compressor
- Delay (Single & Multi)
- Distortion (Mild & Heavy)
- Filters (Highpass, Lowpass, Ladder)
- Phaser
- Reverb (Small & Large)
- Pitch Shift (Up & Down)
- Limiter

📝 **.pdl Preset System** - Load and save effect chains in the portable .pdl format

🎵 **Real-time Processing** - Powered by the Web Audio API for high-quality audio processing

📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd careless-voicefx

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## How to Use

1. **Upload Audio** - Click or drag and drop your audio file (MP3, WAV, OGG, FLAC)
2. **Load Preset** - Load a .pdl preset file with your desired effect chain
3. **Process** - Click "Process Audio" to apply the effects
4. **Download** - Listen to the result and download the processed audio

## .pdl Preset Format

Presets are defined in plain text files with the `.pdl` extension:

```
# Preset Title
[Effect1(param1=value1, param2=value2), Effect2(...)],
"output.wav"
```

### Example Preset

```
# Chorus Subtle
[Chorus(rate_hz=1.0, depth=0.25, mix=0.3)],
"chorus_subtle.wav"
```

### Available Effects and Parameters

#### Chorus
- `rate_hz` (0.1 - 10.0): LFO rate
- `depth` (0.0 - 1.0): Effect depth
- `centre_delay_ms` (1.0 - 50.0): Center delay
- `feedback` (-1.0 - 1.0): Feedback amount
- `mix` (0.0 - 1.0): Wet/dry mix

#### Compressor
- `threshold_db` (-60.0 - 0.0): Compression threshold
- `ratio` (1.0 - 20.0): Compression ratio
- `attack_ms` (0.1 - 100.0): Attack time
- `release_ms` (10.0 - 1000.0): Release time

#### Delay
- `delay_seconds` (0.0 - 5.0): Delay time
- `feedback` (0.0 - 1.0): Feedback amount
- `mix` (0.0 - 1.0): Wet/dry mix

#### Distortion
- `drive_db` (0.0 - 100.0): Distortion amount

#### HighpassFilter / LowpassFilter
- `cutoff_frequency_hz` (20.0 - 20000.0): Filter cutoff frequency

#### Phaser
- `rate_hz` (0.1 - 10.0): LFO rate
- `depth` (0.0 - 1.0): Effect depth
- `centre_frequency_hz` (200.0 - 10000.0): Center frequency
- `feedback` (-1.0 - 1.0): Feedback amount
- `mix` (0.0 - 1.0): Wet/dry mix

#### Reverb
- `room_size` (0.0 - 1.0): Room size
- `damping` (0.0 - 1.0): High frequency damping
- `wet_level` (0.0 - 1.0): Wet signal level
- `dry_level` (0.0 - 1.0): Dry signal level
- `width` (0.0 - 1.0): Stereo width
- `freeze_mode` (0.0 - 1.0): Freeze mode

#### PitchShift
- `semitones` (-12.0 - 12.0): Pitch shift in semitones

#### Limiter
- `threshold_db` (-60.0 - 0.0): Limiting threshold
- `release_ms` (10.0 - 1000.0): Release time

#### LadderFilter
- `mode`: 'LPF12', 'LPF24', 'HPF12', 'HPF24', 'BPF12', 'BPF24'
- `cutoff_hz` (20.0 - 20000.0): Filter cutoff frequency
- `resonance` (0.0 - 1.0): Filter resonance
- `drive` (1.0 - 10.0): Filter drive

## Project Structure

```
careless-voicefx/
├── src/
│   ├── components/          # React components
│   │   ├── AudioUploader.tsx
│   │   ├── AudioPlayer.tsx
│   │   ├── PresetManager.tsx
│   │   └── ProcessingPanel.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useAudioState.ts
│   ├── lib/                # Core libraries
│   │   ├── audioEngine.ts  # Web Audio API wrapper
│   │   ├── pdlParser.ts    # .pdl file parser
│   │   └── fontawesome.ts  # FontAwesome config
│   ├── types/              # TypeScript types
│   │   └── audio.ts
│   ├── App.tsx             # Main application
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles (NSL brand)
├── public/
│   └── presets/            # Included .pdl presets
└── package.json
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **FontAwesome** - Icon library
- **Web Audio API** - Audio processing engine

## NSL Brand Style Guidance

This application follows the NSL brand style guidance (CALZONE v1.0):

- **Colors**: Dark purple (`#9F7AEA`) and golden (`#F59E0B`) accent
- **Typography**: System fonts with careful spacing
- **Animations**: Smooth transitions and elegant effects
- **Accessibility**: WCAG AA compliant contrast ratios

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Adding New Effects

1. Add effect types and parameters to `src/types/audio.ts`
2. Implement the effect in `src/lib/audioEngine.ts`
3. Update the .pdl parser if needed

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 15+

Requires Web Audio API support.

## Migration from DJZ-Pedalboard

This project is a complete TypeScript rewrite of the DJZ-Pedalboard Python ComfyUI custom node:

- ✅ All audio effects preserved
- ✅ Full .pdl file compatibility (load/save)
- ✅ Web Audio API implementation (no Python dependencies)
- ✅ Standalone web application
- ✅ Modern React architecture with TypeScript

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Original DJZ-Pedalboard Python implementation
- Spotify Pedalboard library (inspiration for effect parameters)
- NSL brand style guidance (CALZONE v1.0)

---

Built with ❤️ using React, TypeScript, and the Web Audio API

import numpy as np
import torch
import os
import re
import glob
import sys
from pedalboard import Pedalboard, Chorus, Compressor, Delay, Distortion, HighpassFilter, LowpassFilter, Phaser, Reverb, PitchShift, Limiter, LadderFilter

class DJZ_Pedalboard:
    def __init__(self):
        self.type = "DJZ_Pedalboard"
        self.output_type = "AUDIO"
        self.output_dims = 1
        self.compatible_decorators = []
        self.required_extensions = []
        self.category = "Audio"
        self.name = "DJZ Pedalboard Processor"
        self.description = ("Processes audio using a chain of effects defined in an external "
                            "preset file (with .pdl extension) located in the pedalboard/ folder. "
                            "Select a preset from the dropdown to apply its associated effect chain.")
        # Setup logging file in the same directory
        self.log_file = os.path.join(os.path.dirname(__file__), 'djz_pedalboard.log')

    def log(self, message):
        """Log message to file and stderr"""
        print(message, file=sys.stderr)
        try:
            with open(self.log_file, 'a') as f:
                f.write(message + '\n')
        except Exception as e:
            print("Logging error:", e, file=sys.stderr)

    @classmethod
    def INPUT_TYPES(cls):
        import os, glob
        current_dir = os.path.dirname(__file__)
        preset_folder = os.path.join(current_dir, "pedalboard")
        files = []
        if os.path.isdir(preset_folder):
            files = [os.path.basename(p) for p in glob.glob(os.path.join(preset_folder, "*.pdl"))]
        return {
            "required": {
                "audio": ("AUDIO",),
                "effect_presets": (files,)
            }
        }

    RETURN_TYPES = ("AUDIO",)
    RETURN_NAMES = ("audio",)
    FUNCTION = "process"

    def process(self, audio, effect_presets):
        self.log("Starting DJZ_Pedalboard processing...")

        # Validate input audio dictionary
        if not isinstance(audio, dict):
            self.log("Error: Input audio is not a dictionary")
            raise ValueError("Input audio must be a dictionary")
        if "waveform" not in audio:
            self.log("Error: Input audio missing 'waveform' key")
            raise ValueError("Input audio must contain 'waveform' key")
        if audio["waveform"] is None:
            self.log("Error: Input audio waveform is None")
            raise ValueError("Input audio waveform cannot be None")

        sample_rate = audio.get("sample_rate", 44100)
        self.log(f"Using sample rate: {sample_rate}")

        # Convert waveform to numpy array
        waveform = audio["waveform"]
        if isinstance(waveform, torch.Tensor):
            audio_data = waveform.cpu().numpy()
        else:
            audio_data = np.array(waveform)

        # Attempt to normalize the audio_data dimensions to 2D (samples, channels)
        # If audio_data is 1D, make it 2D [samples, 1]
        if audio_data.ndim == 1:
            audio_data = np.expand_dims(audio_data, axis=1)
        # If audio_data is 3D (batch, channels, samples), assume batch size of 1 and use its first element
        elif audio_data.ndim == 3:
            audio_data = np.squeeze(audio_data, axis=0)
        # If audio_data is 2D but shape is (channels, samples), transpose it to (samples, channels)
        if audio_data.ndim == 2 and audio_data.shape[0] < audio_data.shape[1]:
            audio_data = audio_data.T

        self.log(f"Audio data shape after conversion for processing: {audio_data.shape}")

        # Build the path for the selected preset file from the pedalboard/ folder
        current_dir = os.path.dirname(__file__)
        preset_path = os.path.join(current_dir, "pedalboard", effect_presets)
        if not os.path.isfile(preset_path):
            self.log(f"Error: Preset file {preset_path} does not exist")
            raise ValueError(f"Preset file {effect_presets} not found")
        try:
            with open(preset_path, 'r') as f:
                preset_code = f.read()
        except Exception as e:
            self.log(f"Error reading preset file: {str(e)}")
            raise e

        # Extract the effect chain string using regex
        # The expected format is: header, then [effect_chain], then a comma and an output filename in quotes.
        match = re.search(r'(\[.*?\])\s*,\s*"[^"]+"', preset_code, re.DOTALL)
        if not match:
            self.log("Error: Preset file format is invalid. Expected format: [effects_chain], \"output.wav\"")
            raise ValueError("Invalid preset file format")
        effect_chain_str = match.group(1)
        self.log(f"Extracted effect chain: {effect_chain_str}")

        # Define allowed effects mapping
        allowed_effects = {
            "Chorus": Chorus,
            "Compressor": Compressor,
            "Delay": Delay,
            "Distortion": Distortion,
            "HighpassFilter": HighpassFilter,
            "LowpassFilter": LowpassFilter,
            "Phaser": Phaser,
            "Reverb": Reverb,
            "PitchShift": PitchShift,
            "Limiter": Limiter,
            "LadderFilter": LadderFilter,
        }

        try:
            # Evaluate the effect chain string in a restricted context
            effects_list = eval(effect_chain_str, {"__builtins__": None}, allowed_effects)
        except Exception as e:
            self.log(f"Error evaluating effect chain: {str(e)}")
            raise ValueError("Effect chain evaluation failed")

        self.log(f"Evaluated effects list: {effects_list}")

        # Create the Pedalboard instance and process the audio
        board = Pedalboard(effects_list)
        try:
            processed_audio = board(audio_data, sample_rate)
        except Exception as e:
            self.log(f"Error processing audio through Pedalboard: {str(e)}")
            raise ValueError("Audio processing failed")

        # Normalize processed audio if necessary
        max_amp = np.max(np.abs(processed_audio))
        self.log(f"Maximum absolute value before normalization: {max_amp}")
        if max_amp > 1.0:
            processed_audio = processed_audio / max_amp

        # Convert processed audio to torch tensor with correct shape
        try:
            # Ensure processed_audio is (samples, channels)
            if processed_audio.ndim == 1:
                processed_audio = processed_audio.reshape(-1, 1)
            
            # Convert to tensor and reshape to (1, channels, samples)
            processed_tensor = torch.from_numpy(processed_audio).float()
            processed_tensor = processed_tensor.transpose(1, 0).unsqueeze(0)
            processed_tensor = processed_tensor.contiguous().detach()
            
            self.log(f"Converted processed audio to tensor with shape {processed_tensor.shape}")
        except Exception as e:
            self.log(f"Error converting processed audio to tensor: {str(e)}")
            raise ValueError("Tensor conversion failed")

        result = {
            "waveform": processed_tensor,
            "sample_rate": sample_rate,
            "path": None
        }
        self.log("DJZ_Pedalboard processing complete. Returning final output.")
        return (result,)

NODE_CLASS_MAPPINGS = {
    "DJZ_Pedalboard": DJZ_Pedalboard
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "DJZ_Pedalboard": "🎛️ DJZ Pedalboard"
}

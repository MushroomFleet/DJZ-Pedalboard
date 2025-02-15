# Creating and Managing .pdl Presets

This guide explains how to create, edit, and manage audio effect presets in the **.pdl** format used by this project. Presets define chains of audio effects and are stored in the `pedalboard/` directory.

## Preset File Structure

Each preset file is a plain text file that follows this format:

1. A header line starting with a hash (`#`) indicating the preset title.
2. An effect chain definition enclosed in square brackets (`[...]`). This chain consists of one or more effect specifications using a Python function-call syntax. For example:
   ```
   [Chorus(rate_hz=1.0, depth=0.25, mix=0.3), Delay(delay_seconds=0.3, feedback=0.4, mix=0.4)]
   ```
3. A comma followed by the desired output filename in quotes. For example:
   ```
   "custom_effect.wav"
   ```

A complete example preset:
```
# My Custom Preset
[Chorus(rate_hz=1.0, depth=0.25, mix=0.3), Delay(delay_seconds=0.3, feedback=0.4, mix=0.4)],
"my_custom_effect.wav"
```

## Methods to Create Presets

There are two primary methods to create or update .pdl presets:

### 1. Manual Creation
- **Reference Existing Presets:** Use existing files in this folder (e.g., `chorus_subtle.pdl`, `delay_single.pdl`) as templates.
- **Edit as Needed:** Copy an existing preset file and modify the header, effect parameters, and output filename to suit your needs.
- **Maintain Format:** Ensure your preset file retains the structure:
  - Header line with the preset title.
  - Effect chain in square brackets.
  - A comma and an output filename in quotes.

### 2. Using the Designer Tab
- **Access the Designer:** In the Gradio interface, switch to the **Designer** tab.
- **Input and Configure:** Enter a preset title (or leave it blank for an automatic title based on enabled effects). Enable and adjust various effect parameters using sliders and checkboxes.
- **Preview the Preset:** Click **Preview Preset** to generate a text preview of your new preset in the proper .pdl format.
- **Save Your Preset:** Once satisfied with the preview, click **Save Preset** to automatically store the new preset as a `.pdl` file in the project directory.

## Tips for Creating Quality Presets
- **Parameter Ranges:** Ensure that each effect's parameters fall within practical ranges for your audio processing needs.
- **Clear Naming:** Give your preset a clear title and output filename to avoid confusion when selecting presets later.
- **Backup:** Keep copies of frequently used presets so you can easily revert to previous versions if necessary.

By following these guidelines, you can efficiently create and manage custom audio effect chains that integrate seamlessly with the Pedalboard Audio Effects Demo application.

import type { PDLPreset, AudioEffect, EffectType, EffectParams } from '../types/audio';

/**
 * Parses a .pdl preset file content and returns a PDLPreset object
 * Format:
 * # Preset Title
 * [Effect1(param1=value1, param2=value2), Effect2(...)],
 * "output.wav"
 */
export function parsePDLFile(content: string): PDLPreset {
  const lines = content.trim().split('\n');

  // Extract title from the first line (starts with #)
  let title = 'Untitled Preset';
  let effectsStartIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#')) {
      title = line.substring(1).trim();
      effectsStartIndex = i + 1;
      break;
    }
  }

  // Join remaining lines to parse effect chain and output filename
  const remainingContent = lines.slice(effectsStartIndex).join('\n').trim();

  // Extract effect chain and output filename using regex
  // Pattern: [effects], "filename"
  const match = remainingContent.match(/(\[.*?\])\s*,\s*"([^"]+)"/s);

  if (!match) {
    throw new Error('Invalid .pdl file format. Expected: [effects], "output.wav"');
  }

  const effectChainStr = match[1];
  const outputFilename = match[2];

  // Parse effects from the effect chain string
  const effects = parseEffectChain(effectChainStr);

  return {
    title,
    effects,
    outputFilename,
  };
}

/**
 * Parses the effect chain string and returns an array of AudioEffect objects
 */
function parseEffectChain(effectChainStr: string): AudioEffect[] {
  // Remove outer brackets
  const cleaned = effectChainStr.trim().replace(/^\[|\]$/g, '');

  // Split by effect boundaries (looking for "), " pattern or just "," at effect boundaries)
  // We need to be smart about this to handle nested parentheses
  const effects: AudioEffect[] = [];
  let currentEffect = '';
  let depth = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (char === '(') {
      depth++;
      currentEffect += char;
    } else if (char === ')') {
      depth--;
      currentEffect += char;

      // If we're back at depth 0, we've completed an effect
      if (depth === 0) {
        const effect = parseEffect(currentEffect.trim());
        if (effect) {
          effects.push(effect);
        }
        currentEffect = '';
        // Skip the comma and whitespace
        while (i + 1 < cleaned.length && (cleaned[i + 1] === ',' || cleaned[i + 1] === ' ' || cleaned[i + 1] === '\n')) {
          i++;
        }
      }
    } else {
      currentEffect += char;
    }
  }

  return effects;
}

/**
 * Parses a single effect string like "Chorus(rate_hz=1.0, depth=0.25)"
 */
function parseEffect(effectStr: string): AudioEffect | null {
  const match = effectStr.match(/^(\w+)\((.*)\)$/s);

  if (!match) {
    console.warn(`Failed to parse effect: ${effectStr}`);
    return null;
  }

  const effectType = match[1] as EffectType;
  const paramsStr = match[2];

  const params = parseParameters(paramsStr);

  return {
    type: effectType,
    params,
    enabled: true,
    id: crypto.randomUUID(),
  };
}

/**
 * Parses parameter string like "rate_hz=1.0, depth=0.25, mix=0.3"
 */
function parseParameters(paramsStr: string): EffectParams {
  const params: Record<string, any> = {};

  if (!paramsStr.trim()) {
    return params;
  }

  // Split by commas, but be careful about nested structures
  const paramPairs = paramsStr.split(',').map(p => p.trim());

  for (const pair of paramPairs) {
    const [key, value] = pair.split('=').map(s => s.trim());

    if (key && value) {
      // Parse the value (could be number, string, or boolean)
      params[key] = parseValue(value);
    }
  }

  return params;
}

/**
 * Parses a parameter value (number, string, or boolean)
 */
function parseValue(value: string): any {
  // Remove quotes if it's a string
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }

  // Check for boolean
  if (value === 'true' || value === 'True') return true;
  if (value === 'false' || value === 'False') return false;

  // Try to parse as number
  const num = parseFloat(value);
  if (!isNaN(num)) {
    return num;
  }

  // Return as string if nothing else matches
  return value;
}

/**
 * Serializes a PDLPreset object back to .pdl file format
 */
export function serializePDLPreset(preset: PDLPreset): string {
  const lines: string[] = [];

  // Add title
  lines.push(`# ${preset.title}`);

  // Build effect chain
  const effectStrs = preset.effects
    .filter(effect => effect.enabled !== false)
    .map(effect => serializeEffect(effect));

  const effectChain = `[${effectStrs.join(',\n')}]`;

  // Add effect chain and output filename
  lines.push(`${effectChain},`);
  lines.push(`"${preset.outputFilename}"`);

  return lines.join('\n');
}

/**
 * Serializes a single effect to string format
 */
function serializeEffect(effect: AudioEffect): string {
  const paramStrs = Object.entries(effect.params)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${value}"`;
      }
      return `${key}=${value}`;
    });

  return `${effect.type}(${paramStrs.join(', ')})`;
}

/**
 * Validates a PDLPreset object
 */
export function validatePDLPreset(preset: PDLPreset): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!preset.title || preset.title.trim() === '') {
    errors.push('Preset title is required');
  }

  if (!preset.effects || preset.effects.length === 0) {
    errors.push('At least one effect is required');
  }

  if (!preset.outputFilename || preset.outputFilename.trim() === '') {
    errors.push('Output filename is required');
  }

  // Validate each effect
  preset.effects.forEach((effect, index) => {
    if (!effect.type) {
      errors.push(`Effect ${index + 1}: type is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/** Which text form the picker reads and emits. */
export type ColorPickerFormat = 'hex' | 'rgb';

/** Normalised colour with 0-255 channels and 0-1 alpha. */
export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

const HEX_PATTERN = /^#([0-9a-f]{3,8})$/i;
const RGB_PATTERN =
  /^rgba?\(\s*([+-]?\d*\.?\d+)\s*[,\s]\s*([+-]?\d*\.?\d+)\s*[,\s]\s*([+-]?\d*\.?\d+)(?:\s*[,/]\s*([+-]?\d*\.?\d+%?))?\s*\)$/i;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function channel(value: string): number {
  return clamp(Math.round(Number(value)), 0, 255);
}

function alphaChannel(value: string | undefined): number {
  if (value === undefined) return 1;
  if (value.endsWith('%')) return clamp(Number(value.slice(0, -1)) / 100, 0, 1);
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return clamp(parsed, 0, 1);
}

/**
 * Parses `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb(...)` and `rgba(...)`
 * into a normalised colour. Returns `null` for anything else.
 */
export function parseColor(input: string): RgbaColor | null {
  const value = input.trim();
  if (!value) return null;

  const hex = HEX_PATTERN.exec(value);
  if (hex) {
    const digits = hex[1] as string;
    if (digits.length === 3 || digits.length === 4) {
      const [r, g, b, a] = digits.split('').map((char) => parseInt(char + char, 16));
      return {
        r: r as number,
        g: g as number,
        b: b as number,
        a: digits.length === 4 ? (a as number) / 255 : 1,
      };
    }
    if (digits.length === 6 || digits.length === 8) {
      return {
        r: parseInt(digits.slice(0, 2), 16),
        g: parseInt(digits.slice(2, 4), 16),
        b: parseInt(digits.slice(4, 6), 16),
        a: digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1,
      };
    }
    return null;
  }

  const rgb = RGB_PATTERN.exec(value);
  if (rgb) {
    return {
      r: channel(rgb[1] as string),
      g: channel(rgb[2] as string),
      b: channel(rgb[3] as string),
      a: alphaChannel(rgb[4]),
    };
  }

  if (value.toLowerCase() === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

  return null;
}

function hexPair(value: number): string {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');
}

/** Serialises a colour as `#rrggbb` (or `#rrggbbaa` when translucent). */
export function toHex(color: RgbaColor, alpha = false): string {
  const base = `${hexPair(color.r)}${hexPair(color.g)}${hexPair(color.b)}`;
  if (alpha && color.a < 1) return `#${base}${hexPair(color.a * 255)}`;
  return `#${base}`;
}

/** Serialises a colour as `rgb(r, g, b)` (or `rgba(...)` when translucent). */
export function toRgb(color: RgbaColor): string {
  const base = `${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}`;
  if (color.a < 1) return `rgba(${base}, ${Number(color.a.toFixed(2))})`;
  return `rgb(${base})`;
}

/** Serialises a colour in the requested text format. */
export function formatColor(
  color: RgbaColor,
  format: ColorPickerFormat = 'hex',
  alpha = false,
): string {
  return format === 'rgb' ? toRgb(color) : toHex(color, alpha);
}

/** `true` when the string can be parsed by {@link parseColor}. */
export function isValidColor(input: string): boolean {
  return parseColor(input) !== null;
}

/** Converts any supported colour string to a CSS colour usable in `style`. */
export function toCssColor(input: string): string | undefined {
  const parsed = parseColor(input);
  return parsed ? toRgb(parsed) : undefined;
}

/**
 * Simplified theme color hook for flat Colors palette.
 */

export function useThemeColor(
  props: { light?: string; dark?: string },
  _colorName?: string,
) {
  // We always use light mode; return the light prop if provided, else white.
  return props.light ?? props.dark ?? '#ffffff';
}

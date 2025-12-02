import { BeingState, RenderState } from './state';

/**
 * Map internal consciousness state to normalized visual properties
 * No assumptions about rendering backend — just normalized values
 */
export const mapStateToRender = (state: BeingState): RenderState => {
  // Core radius: grows with Knowledge and Integration - MORE DRAMATIC range
  // Range: 0.4 to 1.3 (was 0.3 to 1.0)
  const coreRadius = 0.4 + 0.9 * ((state.K + state.I) / 2);

  // Entropy level: amplified for more visible deformation
  // Range: 0 to 1.5 (amplified)
  const entropyLevel = state.H * 1.5;

  // Color hue: mapped from Valence - WIDER hue range
  // Negative valence → cooler hues (blue-purple: 180-300)
  // Positive valence → warmer hues (red-orange: 0-60)
  // Neutral → green-cyan (120)
  const colorHue = state.V < 0 
    ? 180 + 120 * Math.abs(state.V)  // -1 to 0 → 300 to 180
    : 120 - 120 * state.V;            // 0 to 1 → 120 to 0

  // Glow: mapped from Arousal - FULL range
  // Range: 0.1 to 1.2 (was 0.2 to 1.0)
  const glow = 0.1 + 1.1 * state.A;

  // Particle activity: amplified from Curiosity
  // Range: 0 to 1.3
  const particleActivity = state.C * 1.3;

  // Connection density: amplified from Attachment
  // Range: 0 to 1.2
  const connectionDensity = state.U * 1.2;

  return {
    coreRadius,
    entropyLevel,
    colorHue,
    glow,
    particleActivity,
    connectionDensity,
  };
};

/**
 * Helper: interpolate between two render states for smooth transitions
 */
export const interpolateRenderState = (
  from: RenderState,
  to: RenderState,
  t: number
): RenderState => {
  const lerp = (a: number, b: number) => a + (b - a) * t;

  return {
    coreRadius: lerp(from.coreRadius, to.coreRadius),
    entropyLevel: lerp(from.entropyLevel, to.entropyLevel),
    colorHue: lerp(from.colorHue, to.colorHue),
    glow: lerp(from.glow, to.glow),
    particleActivity: lerp(from.particleActivity, to.particleActivity),
    connectionDensity: lerp(from.connectionDensity, to.connectionDensity),
  };
};

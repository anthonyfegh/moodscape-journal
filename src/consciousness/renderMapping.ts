import { BeingState, RenderState } from './state';

/**
 * Map internal consciousness state to normalized visual properties
 * No assumptions about rendering backend — just normalized values
 */
export const mapStateToRender = (state: BeingState): RenderState => {
  // Core radius: grows with Knowledge and Integration
  // Range: 0.3 to 1.0
  const coreRadius = 0.3 + 0.7 * ((state.K + state.I) / 2);

  // Entropy level: direct mapping
  // Range: 0 to 1
  const entropyLevel = state.H;

  // Color hue: mapped from Valence
  // Negative valence → cooler hues (blue-purple: 200-280)
  // Positive valence → warmer hues (orange-yellow: 30-60)
  // Neutral → green (120)
  const colorHue = state.V < 0 
    ? 200 + 80 * (state.V + 1) / 2  // -1 to 0 → 200 to 280
    : 120 - 90 * state.V;            // 0 to 1 → 120 to 30

  // Glow: mapped from Arousal
  // Range: 0.2 to 1.0
  const glow = 0.2 + 0.8 * state.A;

  // Particle activity: mapped from Curiosity
  // Range: 0 to 1
  const particleActivity = state.C;

  // Connection density: mapped from Attachment
  // Range: 0 to 1
  const connectionDensity = state.U;

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

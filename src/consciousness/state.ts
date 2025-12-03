/**
 * Core state vector representing the being's internal consciousness
 */
export interface BeingState {
  K: number; // Knowledge (0–1)
  V: number; // Valence (-1–1)
  A: number; // Arousal (0–1)
  H: number; // Entropy (0–1)
  I: number; // Integration (0–1)
  C: number; // Curiosity (0–1)
  U: number; // Attachment (0–1)
}

/**
 * Experience vector representing user interaction
 */
export interface ExperienceVector {
  novelty?: number; // 0–1
  mood?: number; // -1–1
  stress?: number; // 0–1
  reflection?: number; // 0–1
  conflict?: number; // 0–1
  vulnerability?: number; // 0–1
  consistency?: number; // 0–1
}

/**
 * Internal action vector for self-regulation
 */
export interface InternalAction {
  deltaH?: number;
  deltaI?: number;
  deltaC?: number;
  deltaV?: number;
}

/**
 * Normalized render state for visual output
 */
export interface RenderState {
  coreRadius: number; // based on K and I
  entropyLevel: number; // mapped from H
  colorHue: number; // mapped from V
  glow: number; // mapped from A
  particleActivity: number; // mapped from C
  connectionDensity: number; // mapped from U
}

/**
 * Initialize a default being state
 */
export const createInitialState = (): BeingState => ({
  K: 0.0,
  V: 0.0,
  A: 0.0,
  H: 0.0,
  I: 0.0,
  C: 0.0,
  U: 0.0,
});

/**
 * Normalize an experience vector with defaults
 */
export const normalizeExperience = (e: ExperienceVector): Required<ExperienceVector> => ({
  novelty: e.novelty ?? 0,
  mood: e.mood ?? 0,
  stress: e.stress ?? 0,
  reflection: e.reflection ?? 0,
  conflict: e.conflict ?? 0,
  vulnerability: e.vulnerability ?? 0,
  consistency: e.consistency ?? 0,
});

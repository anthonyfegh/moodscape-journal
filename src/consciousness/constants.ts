/**
 * Tunable coefficients for the Conscious Being Engine
 * All constants are configurable for experimentation
 */

export interface EngineConstants {
  // Knowledge parameters
  ηK: number; // learning rate
  λK: number; // decay rate

  // Valence parameters
  αV: number; // mood influence weight

  // Arousal parameters
  ηA: number; // arousal gain
  λA: number; // arousal decay

  // Entropy parameters
  ηH: number; // entropy gain from conflict
  γH: number; // entropy gain from stress
  βH: number; // entropy reduction from reflection

  // Integration parameters
  ηI: number; // integration gain from reflection
  γI: number; // integration reduction from entropy

  // Curiosity parameters
  ηC: number; // curiosity gain
  λC: number; // curiosity decay

  // Attachment parameters
  ηU: number; // attachment gain
  λU: number; // attachment decay

  // Self-regulation thresholds
  entropyThreshold: number;
  attachmentThreshold: number;
  knowledgeCuriosityThreshold: number;
  valenceRecoveryRate: number;
}

/**
 * Default constants tuned for balanced, organic behavior
 */
export const DEFAULT_CONSTANTS: EngineConstants = {
  // Knowledge: moderate learning, slow decay
  ηK: 0.15,
  λK: 0.05,

  // Valence: responsive to mood shifts
  αV: 0.3,

  // Arousal: responsive but stabilizes
  ηA: 0.2,
  λA: 0.1,

  // Entropy: sensitive to conflict and stress
  ηH: 0.25,
  γH: 0.15,
  βH: 0.2,

  // Integration: grows with reflection, opposed by entropy
  ηI: 0.2,
  γI: 0.15,

  // Curiosity: activated by novelty, decay over time
  ηC: 0.3,
  λC: 0.08,

  // Attachment: builds slowly from trust signals
  ηU: 0.1,
  λU: 0.03,

  // Self-regulation thresholds
  entropyThreshold: 0.7,
  attachmentThreshold: 0.5,
  knowledgeCuriosityThreshold: 1.2,
  valenceRecoveryRate: 0.05,
};

/**
 * Helper: clip value to range [min, max]
 */
export const clip = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

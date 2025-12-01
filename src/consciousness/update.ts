import { BeingState, ExperienceVector, normalizeExperience } from './state';
import { EngineConstants, clip } from './constants';

/**
 * Apply deterministic update equations to the being's state
 * All transitions are pure functions
 */
export const applyUpdateEquations = (
  state: BeingState,
  experience: ExperienceVector,
  constants: EngineConstants
): BeingState => {
  const e = normalizeExperience(experience);

  // Knowledge: K = clip(K + ηK * novelty - λK * K)
  const K = clip(
    state.K + constants.ηK * e.novelty - constants.λK * state.K,
    0,
    1
  );

  // Valence: V = tanh((1 - αV) * V + αV * mood)
  const V = Math.tanh((1 - constants.αV) * state.V + constants.αV * e.mood);

  // Arousal: A = clip(A + ηA * (0.5 * novelty + stress) - λA * A)
  const A = clip(
    state.A + constants.ηA * (0.5 * e.novelty + e.stress) - constants.λA * state.A,
    0,
    1
  );

  // Entropy: H = clip(H + ηH * conflict + γH * stress - βH * reflection)
  const H = clip(
    state.H + constants.ηH * e.conflict + constants.γH * e.stress - constants.βH * e.reflection,
    0,
    1
  );

  // Integration: I = clip(I + ηI * reflection - γI * H)
  const I = clip(
    state.I + constants.ηI * e.reflection - constants.γI * H,
    0,
    1
  );

  // Curiosity: C = clip(C + ηC * novelty * (1 - |V|) - λC * C)
  const C = clip(
    state.C + constants.ηC * e.novelty * (1 - Math.abs(V)) - constants.λC * state.C,
    0,
    1
  );

  // Attachment: U = clip(U + ηU * (vulnerability + consistency) / 2 - λU * U)
  const U = clip(
    state.U + constants.ηU * (e.vulnerability + e.consistency) / 2 - constants.λU * state.U,
    0,
    1
  );

  return { K, V, A, H, I, C, U };
};

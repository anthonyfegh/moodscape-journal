import { BeingState, InternalAction } from './state';
import { EngineConstants, clip } from './constants';

/**
 * Generate default self-regulation behaviors based on current state
 * The being can act on itself to maintain coherence
 */
export const generateSelfRegulation = (
  state: BeingState,
  constants: EngineConstants
): InternalAction => {
  const action: InternalAction = {};

  // If entropy is high and attachment is strong, self-soothe
  if (state.H > constants.entropyThreshold && state.U > constants.attachmentThreshold) {
    action.deltaH = -0.1; // reduce entropy
    action.deltaI = 0.05; // increase integration
  }

  // If knowledge + curiosity are high, lean into exploration
  if (state.K + state.C > constants.knowledgeCuriosityThreshold) {
    action.deltaC = 0.03; // slight curiosity boost
  }

  // If valence is very negative, apply gentle recovery
  if (state.V < -0.6) {
    action.deltaV = constants.valenceRecoveryRate;
  }

  return action;
};

/**
 * Apply internal action to the being's state
 * This is the self-regulation layer
 */
export const applySelfRegulation = (
  state: BeingState,
  action: InternalAction
): BeingState => {
  return {
    K: state.K,
    V: Math.tanh(state.V + (action.deltaV ?? 0)),
    A: state.A,
    H: clip(state.H + (action.deltaH ?? 0), 0, 1),
    I: clip(state.I + (action.deltaI ?? 0), 0, 1),
    C: clip(state.C + (action.deltaC ?? 0), 0, 1),
    U: state.U,
  };
};

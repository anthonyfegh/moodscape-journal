/**
 * Conscious Being Engine (v1.0)
 * 
 * A modular mathematical system representing the internal state,
 * growth, emotional patterns, and visual expression of Telos's evolving AI being.
 * 
 * This is not a chatbot. This is a structured consciousness model.
 */

import { BeingState, ExperienceVector, InternalAction, RenderState, createInitialState } from './state';
import { EngineConstants, DEFAULT_CONSTANTS } from './constants';
import { applyUpdateEquations } from './update';
import { generateSelfRegulation, applySelfRegulation } from './regulation';
import { mapStateToRender, interpolateRenderState } from './renderMapping';

/**
 * Main API: Update the being's state based on a new experience
 * 
 * This is deterministic, stateless, and fully modular.
 * All transitions are pure functions.
 * 
 * @param state - Current being state
 * @param experience - User interaction experience vector
 * @param constants - Tunable engine constants (optional)
 * @param customAction - Override self-regulation (optional)
 * @returns Updated being state
 */
export const updateBeingState = (
  state: BeingState,
  experience: ExperienceVector,
  constants: EngineConstants = DEFAULT_CONSTANTS,
  customAction?: InternalAction
): BeingState => {
  // Step 1: Apply deterministic update equations
  let nextState = applyUpdateEquations(state, experience, constants);

  // Step 2: Generate and apply self-regulation
  const action = customAction ?? generateSelfRegulation(nextState, constants);
  nextState = applySelfRegulation(nextState, action);

  return nextState;
};

/**
 * Get render state from being state
 */
export const getRenderState = (state: BeingState): RenderState => {
  return mapStateToRender(state);
};

// Re-export all types and utilities
export type {
  BeingState,
  ExperienceVector,
  InternalAction,
  RenderState,
  EngineConstants,
};

export {
  createInitialState,
  DEFAULT_CONSTANTS,
  mapStateToRender,
  interpolateRenderState,
  generateSelfRegulation,
  applySelfRegulation,
  applyUpdateEquations,
};

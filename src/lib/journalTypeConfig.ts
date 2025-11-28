import { JournalType } from "./journalStorage";

export interface TypeConfig {
  // Visual intensity multipliers
  cometIntensity: number;
  inkTrailStrength: number;
  backgroundReactivity: number;
  
  // Persona behavior
  personaAttentiveness: "low" | "normal" | "high";
  
  // Colors and themes
  defaultMoodColor: string;
  themeColors?: string[];
  
  // Content features
  guidingPrompts?: string[];
  showWordPulsing: boolean;
  wordPulsingIntensity: number;
}

export const journalTypeConfigs: Record<JournalType, TypeConfig> = {
  daily: {
    cometIntensity: 1.0,
    inkTrailStrength: 1.0,
    backgroundReactivity: 1.0,
    personaAttentiveness: "normal",
    defaultMoodColor: "#fbbf24",
    showWordPulsing: true,
    wordPulsingIntensity: 1.0,
  },
  
  themed: {
    cometIntensity: 0.8,
    inkTrailStrength: 0.9,
    backgroundReactivity: 0.9,
    personaAttentiveness: "high",
    defaultMoodColor: "#8b5cf6",
    themeColors: ["#8b5cf6", "#a855f7", "#9333ea"],
    guidingPrompts: [
      "What did you learn about yourself today?",
      "What emotions are you sitting with right now?",
      "What would you tell your past self?",
      "What patterns are you noticing?",
    ],
    showWordPulsing: true,
    wordPulsingIntensity: 0.8,
  },
  
  people: {
    cometIntensity: 0.9,
    inkTrailStrength: 1.1,
    backgroundReactivity: 1.0,
    personaAttentiveness: "high",
    defaultMoodColor: "#ec4899",
    themeColors: ["#ec4899", "#f472b6", "#db2777"],
    showWordPulsing: true,
    wordPulsingIntensity: 1.5, // Intensify for recurring names
  },
  
  event: {
    cometIntensity: 1.5,
    inkTrailStrength: 1.4,
    backgroundReactivity: 1.3,
    personaAttentiveness: "high",
    defaultMoodColor: "#ef4444",
    themeColors: ["#ef4444", "#f87171", "#dc2626"],
    showWordPulsing: true,
    wordPulsingIntensity: 1.2,
  },
  
  creative: {
    cometIntensity: 1.2,
    inkTrailStrength: 1.6,
    backgroundReactivity: 1.1,
    personaAttentiveness: "normal",
    defaultMoodColor: "#06b6d4",
    themeColors: ["#06b6d4", "#22d3ee", "#0891b2", "#7c3aed", "#a855f7"],
    showWordPulsing: true,
    wordPulsingIntensity: 1.1,
  },
};

export const getTypeConfig = (type: JournalType): TypeConfig => {
  return journalTypeConfigs[type];
};

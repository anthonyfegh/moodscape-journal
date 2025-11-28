import { motion } from "framer-motion";
import { BookText, Lightbulb, Users, Zap, Sparkles } from "lucide-react";
import { JournalType } from "@/lib/journalStorage";

interface JournalTypeSelectorProps {
  selectedType: JournalType;
  onSelectType: (type: JournalType) => void;
}

const journalTypes = [
  {
    type: "themed" as JournalType,
    icon: Lightbulb,
    label: "Themed",
    description: "Guided reflections with prompts",
    color: "#8b5cf6",
  },
  {
    type: "people" as JournalType,
    icon: Users,
    label: "People",
    description: "Process relationships and connections",
    color: "#ec4899",
  },
  {
    type: "event" as JournalType,
    icon: Zap,
    label: "Event",
    description: "Big emotional moments and milestones",
    color: "#ef4444",
  },
  {
    type: "creative" as JournalType,
    icon: Sparkles,
    label: "Creative",
    description: "Poetry, dreams, and free expression",
    color: "#06b6d4",
  },
];

export const JournalTypeSelector = ({ selectedType, onSelectType }: JournalTypeSelectorProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-foreground mb-3">Journal Type</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {journalTypes.map(({ type, icon: Icon, label, description, color }) => (
          <motion.button
            key={type}
            onClick={() => onSelectType(type)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedType === type
                ? "border-primary bg-primary/10"
                : "border-border/20 bg-background/40 hover:bg-background/60"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-md"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm mb-1 text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground leading-tight">
                  {description}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AIReflection {
  id: string;
  ai_text: string;
  user_reply?: string;
  timestamp: string;
}

interface LogEntry {
  id: string;
  text: string;
  emotion: string;
  color: string;
  timestamp: Date;
  ai_reflections?: AIReflection[];
}

interface InlineMomentsProps {
  logEntries: LogEntry[];
  onSelectMoment: (entry: LogEntry) => void;
  hoveredMoodColor: string | null;
  onMomentHover: (color: string | null) => void;
}

export const InlineMoments = ({
  logEntries,
  onSelectMoment,
  hoveredMoodColor,
  onMomentHover,
}: InlineMomentsProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 mb-8">
      <AnimatePresence>
        {logEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onMouseEnter={() => onMomentHover(entry.color)}
            onMouseLeave={() => onMomentHover(null)}
            onClick={() => onSelectMoment(entry)}
            className="cursor-pointer"
          >
            <Card className="relative p-4 bg-background/40 backdrop-blur-sm border-border/20 hover:bg-background/60 transition-all">
              {/* Mood color indicator */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                style={{ backgroundColor: entry.color }}
              />

              {/* Content */}
              <div className="ml-4">
                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                  <span className="capitalize font-medium">{entry.emotion}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(entry.timestamp)}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {entry.text}
                </p>

                {/* AI Reflections Thread */}
                {entry.ai_reflections && entry.ai_reflections.length > 0 && (
                  <div className="mt-4 space-y-3 pl-4 border-l-2 border-muted-foreground/20">
                    {entry.ai_reflections.map((reflection) => (
                      <div key={reflection.id} className="space-y-2">
                        <p className="text-sm italic text-muted-foreground/90 leading-relaxed">
                          {reflection.ai_text}
                        </p>
                        {reflection.user_reply && (
                          <p className="text-sm leading-relaxed text-foreground/90 pl-3">
                            {reflection.user_reply}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

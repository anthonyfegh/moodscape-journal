import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ReadingSidebarProps {
  isVisible: boolean;
  recentWords: string[];
  moodColor: string;
  personaState: string;
}

export const ReadingSidebar = ({ isVisible, recentWords, moodColor, personaState }: ReadingSidebarProps) => {
  const [displayWords, setDisplayWords] = useState<string[]>([]);

  useEffect(() => {
    if (recentWords.length > 0) {
      const lastWord = recentWords[recentWords.length - 1];
      setDisplayWords((prev) => [...prev.slice(-15), lastWord]);
    }
  }, [recentWords]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-screen w-80 bg-card/95 backdrop-blur-md border-l shadow-lg p-6 overflow-hidden z-50"
          style={{
            borderLeftColor: moodColor,
            borderLeftWidth: "3px",
          }}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Reading your thoughts...</h3>
              <div className="h-1 rounded-full transition-all duration-700" style={{ backgroundColor: moodColor }} />
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Current mood</p>
              <p className="text-lg font-medium capitalize transition-colors duration-700" style={{ color: moodColor }}>
                {personaState}
              </p>
            </div>

            <div className="space-y-2 mt-8">
              <p className="text-xs text-muted-foreground">Recent words</p>
              <div className="flex flex-wrap gap-2 max-h-[60vh] overflow-hidden">
                {displayWords.map((word, index) => (
                  <motion.div
                    key={`${word}-${index}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 - (displayWords.length - index - 1) * 0.06 }}
                    transition={{ duration: 0.3 }}
                    className="text-foreground/80 text-sm font-light px-2 py-1 rounded-md bg-muted/30"
                  >
                    {word}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

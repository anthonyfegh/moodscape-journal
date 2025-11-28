import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import personaAvatar from "@/assets/persona-avatar.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LogEntry {
  id: string;
  text: string;
  emotion: string;
  color: string;
  timestamp: Date;
}

interface PersonaWithThoughtsProps {
  isThinking: boolean;
  recentWords: string[];
  moodColor: string;
  personaState: string;
  logEntries: LogEntry[];
  isTyping: boolean;
}

export const PersonaWithThoughts = ({ isThinking, recentWords, moodColor, personaState, logEntries, isTyping }: PersonaWithThoughtsProps) => {
  const [displayWords, setDisplayWords] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [shouldBlink, setShouldBlink] = useState(false);

  useEffect(() => {
    if (recentWords.length > 0) {
      const lastWord = recentWords[recentWords.length - 1];
      setDisplayWords((prev) => [...prev.slice(-10), lastWord]);
    }
  }, [recentWords]);

  // Blink animation when not typing
  useEffect(() => {
    if (isTyping) {
      setShouldBlink(false);
      return;
    }

    const blinkInterval = setInterval(() => {
      setShouldBlink(true);
      setTimeout(() => setShouldBlink(false), 180);
    }, 3000 + Math.random() * 1500); // Random between 3-4.5 seconds

    return () => clearInterval(blinkInterval);
  }, [isTyping]);

  const handleAvatarClick = () => {
    setIsListening(true);
    setTimeout(() => setIsListening(false), 800);
    setIsOpen(true);
  };

  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end">
      {/* Thought Bubble */}
      <AnimatePresence>
        {isThinking && displayWords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="mb-4 relative"
          >
            {/* Thought bubble content */}
            <div
              className="bg-card/95 backdrop-blur-md rounded-2xl p-4 shadow-xl max-w-xs border-2"
              style={{
                borderColor: moodColor,
                boxShadow: `0 0 20px ${moodColor}30`,
              }}
            >
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Reading...</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-hidden">
                  {displayWords.map((word, index) => (
                    <motion.span
                      key={`${word}-${index}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1 - (displayWords.length - index - 1) * 0.08 
                      }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-light px-2 py-1 rounded-md bg-muted/30"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>

            {/* Thought bubble tail */}
            <div className="absolute -bottom-2 right-8 flex gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: moodColor, opacity: 0.6 }}
              />
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: moodColor, opacity: 0.4 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persona Avatar with Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.div
            animate={{
              scale: isListening ? 1.15 : isTyping ? [1, 1.05, 1] : 1,
              rotateZ: isTyping ? [-3, 3, -3] : 0,
              y: isTyping ? [0, -8, 0] : 0,
            }}
            transition={{
              scale: { 
                duration: isListening ? 0.4 : 1.5, 
                ease: "easeInOut",
                repeat: isTyping ? Infinity : 0,
              },
              rotateZ: { duration: 2.5, repeat: isTyping ? Infinity : 0, ease: "easeInOut" },
              y: { duration: 2.5, repeat: isTyping ? Infinity : 0, ease: "easeInOut" },
            }}
            className="relative cursor-pointer"
            onClick={handleAvatarClick}
          >
            <motion.div
              animate={{
                filter: isListening ? "brightness(1.4)" : "brightness(1)",
                boxShadow: isListening
                  ? `0 0 80px ${moodColor}, 0 0 40px ${moodColor}80`
                  : `0 0 30px ${moodColor}40`,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-20 h-20 rounded-full overflow-hidden border-4 transition-all duration-700 hover:scale-105"
              style={{
                borderColor: moodColor,
              }}
            >
              <motion.img
                src={personaAvatar}
                alt="Reading Persona"
                className="w-full h-full object-cover"
                animate={{
                  scaleY: shouldBlink ? 0.05 : 1,
                }}
                transition={{
                  duration: 0.12,
                  ease: "easeInOut",
                }}
                style={{
                  transformOrigin: "center",
                }}
              />
            </motion.div>

            {/* Status indicator */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background"
              style={{ backgroundColor: moodColor }}
            />
          </motion.div>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Moments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {logEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No moments saved yet. Start writing to create your first moment!</p>
            ) : (
              <ul className="space-y-3">
                {logEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-medium capitalize px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: entry.color,
                            color: 'white',
                          }}
                        >
                          {entry.emotion}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {entry.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

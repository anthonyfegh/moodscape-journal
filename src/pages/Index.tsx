import { useState, useEffect, useCallback } from "react";
import { MicroComments } from "@/components/MicroComments";
import { MemoryBubbles } from "@/components/MemoryBubbles";
import { PersonaWithThoughts } from "@/components/PersonaWithThoughts";
import { JournalSidebar } from "@/components/JournalSidebar";
import { LivingBackground } from "@/components/LivingBackground";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LogEntry {
  id: string;
  text: string;
  emotion: string;
  color: string;
  timestamp: Date;
}

const Index = () => {
  const [text, setText] = useState("");
  const [moodColor, setMoodColor] = useState("#fbbf24");
  const [microComments, setMicroComments] = useState<string[]>([]);
  const [memoryBubble, setMemoryBubble] = useState<string | null>(null);
  const [personaState, setPersonaState] = useState("neutral");
  const [wordFrequency, setWordFrequency] = useState<Map<string, number>>(new Map());
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [editingMomentId, setEditingMomentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [colorResetTimeout, setColorResetTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Hide thought bubble after inactivity
  useEffect(() => {
    if (!isThinking) return;

    const timer = setTimeout(() => {
      setIsThinking(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isThinking, text]);

  // Analyze text and update mood
  const analyzeMood = useCallback(
    (content: string) => {
      const lowerText = content.toLowerCase();
      const words = content.split(/\s+/).filter((w) => w.length > 0);

      // Emotional word detection
      const joyWords = ["happy", "joy", "excited", "love", "wonderful", "amazing", "great"];
      const sadWords = ["sad", "depressed", "unhappy", "hurt", "pain", "sorry", "difficult"];
      const angryWords = ["angry", "frustrated", "mad", "annoyed", "hate", "furious"];
      const calmWords = ["peaceful", "calm", "serene", "quiet", "relaxed", "meditation"];
      const anxiousWords = ["worried", "anxious", "nervous", "scared", "fear", "stress"];

      let joyScore = joyWords.filter((w) => lowerText.includes(w)).length;
      let sadScore = sadWords.filter((w) => lowerText.includes(w)).length;
      let angryScore = angryWords.filter((w) => lowerText.includes(w)).length;
      let calmScore = calmWords.filter((w) => lowerText.includes(w)).length;
      let anxiousScore = anxiousWords.filter((w) => lowerText.includes(w)).length;

      // Determine dominant emotion and set color
      const emotions = [
        { name: "joyful", score: joyScore, color: "#fbbf24" },
        { name: "melancholic", score: sadScore, color: "#60a5fa" },
        { name: "intense", score: angryScore, color: "#f87171" },
        { name: "peaceful", score: calmScore, color: "#4ade80" },
        { name: "restless", score: anxiousScore, color: "#a78bfa" },
      ];

      const dominant = emotions.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));

      if (dominant.score > 0) {
        setMoodColor(dominant.color);
        setPersonaState(dominant.name);
      } else if (words.length > 50) {
        setMoodColor("#4ade80");
        setPersonaState("reflective");
      } else {
        setMoodColor("#60a5fa");
        setPersonaState("contemplative");
      }

      // Update traits and radar data calculations remain in backend logic
      // but we don't display them - they could be used for analytics

      // Track word frequency for memory bubbles
      const newFrequency = new Map(wordFrequency);
      words.forEach((word) => {
        const normalizedWord = word.toLowerCase().replace(/[^\w]/g, "");
        if (normalizedWord.length > 4) {
          newFrequency.set(normalizedWord, (newFrequency.get(normalizedWord) || 0) + 1);
        }
      });
      setWordFrequency(newFrequency);

      // Check for repeated words (memory trigger)
      for (const [word, count] of newFrequency.entries()) {
        if (count >= 3) {
          setMemoryBubble(`You've mentioned "${word}" ${count} times - this seems significant to you`);
          break;
        }
      }
    },
    [wordFrequency],
  );

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    // Set typing state
    setIsTyping(true);
    
    // Clear existing typing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new typing timeout (2.5 seconds of inactivity)
    const newTypingTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 2500);
    setTypingTimeout(newTypingTimeout);

    // Clear existing color reset timeout
    if (colorResetTimeout) {
      clearTimeout(colorResetTimeout);
    }

    // Only process words and mood when a word is completed (space or enter)
    if (newText.endsWith(" ") || newText.endsWith("\n")) {
      const allWords = newText.split(/\s+/).filter((w) => w.length > 0);
      const completedWords = allWords;

      if (completedWords.length > 0) {
        setRecentWords(completedWords);
        setIsThinking(true);
      }

      if (newText.length > 10) {
        analyzeMood(newText);
      }
    }

    // Set timeout to reset color after 3 seconds of inactivity
    if (newText.length > 0) {
      const timeout = setTimeout(() => {
        setMoodColor("#fbbf24");
        setPersonaState("neutral");
      }, 3000);
      setColorResetTimeout(timeout);
    }
  };

  // Handle Enter key to save log entry
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const contentToSave = text.trim();
      if (contentToSave.length === 0) {
        return;
      }

      const newEntry: LogEntry = {
        id: Date.now().toString(),
        text: contentToSave,
        emotion: personaState,
        color: moodColor,
        timestamp: new Date(),
      };

      setLogEntries((prev) => [...prev, newEntry]);
      setText("");
      setMicroComments([]);
      setMemoryBubble(null);
      setIsThinking(false);
      setMoodColor("#fbbf24");
      setPersonaState("neutral");
      setIsTyping(false);
      if (colorResetTimeout) {
        clearTimeout(colorResetTimeout);
        setColorResetTimeout(null);
      }
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
    }
  };

  // Handle editing a moment
  const handleEditMoment = (momentId: string) => {
    const moment = logEntries.find((e) => e.id === momentId);
    if (moment) {
      setEditingMomentId(momentId);
      setEditingText(moment.text);
    }
  };

  // Handle saving edited moment
  const handleSaveEdit = (momentId: string) => {
    setLogEntries((prev) => prev.map((entry) => (entry.id === momentId ? { ...entry, text: editingText } : entry)));
    setEditingMomentId(null);
    setEditingText("");
  };

  // Generate micro-comments periodically
  useEffect(() => {
    if (text.length < 20) return;

    const commentOptions = [
      "I sense deep reflection here...",
      "Your emotions are flowing freely",
      "This feels authentic and raw",
      "You're exploring something important",
      "There's growth in these words",
      "I'm listening closely",
      "Your vulnerability is beautiful",
      "This moment matters",
    ];

    const interval = setInterval(() => {
      const randomComment = commentOptions[Math.floor(Math.random() * commentOptions.length)];
      setMicroComments((prev) => [...prev, randomComment]);
    }, 7000);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative">
        <LivingBackground moodColor={moodColor} isTyping={isTyping} />
        
        <div className="flex-1 min-h-screen relative z-10">
          <PersonaWithThoughts
            isThinking={isThinking}
            recentWords={recentWords}
            moodColor={moodColor}
            personaState={personaState}
            logEntries={logEntries}
          />

          {/* Toggle Sidebar Button */}
          <div className="fixed top-4 right-4 z-50">
            <SidebarTrigger className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-lg">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
          </div>

          <div className="min-h-screen flex flex-col items-center p-8">
            <div className="max-w-3xl w-full">
              <h1 className="text-3xl font-serif font-bold mb-2 text-foreground">Your Journal</h1>
              <p className="text-muted-foreground mb-6">Write freely, and watch your emotions come alive</p>

              {/* Continuous Writing Surface - like a sheet of paper */}
              <div
                className="bg-background/60 backdrop-blur-md rounded-lg p-8 shadow-md border border-border/10"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(transparent, transparent 31px, hsl(var(--border) / 0.18) 31px, hsl(var(--border) / 0.18) 32px)",
                  lineHeight: "32px",
                }}
              >
                <div className="space-y-6">
                  <AnimatePresence>
                    {logEntries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="group cursor-pointer transition-all duration-300 hover:opacity-100 opacity-90 rounded-lg px-3 py-2 -mx-3 -my-2"
                        style={{
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${entry.color}15`;
                          e.currentTarget.style.borderLeft = `3px solid ${entry.color}`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.borderLeft = "3px solid transparent";
                        }}
                        onClick={() => editingMomentId !== entry.id && handleEditMoment(entry.id)}
                      >
                        {editingMomentId === entry.id ? (
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onBlur={() => handleSaveEdit(entry.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveEdit(entry.id);
                              }
                            }}
                            className="w-full p-2 bg-background/50 border border-border/20 rounded outline-none resize-none text-foreground leading-relaxed"
                            rows={4}
                            autoFocus
                            style={{ lineHeight: "32px" }}
                          />
                        ) : (
                          <div className="relative">
                            <p
                              className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-lg"
                              style={{ lineHeight: "32px" }}
                            >
                              {entry.text}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Live Input - blends into the same page */}
                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={handleTextChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Continue writing..."
                      className="w-full p-2 bg-transparent border-none outline-none resize-none text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/40"
                      rows={6}
                      style={{ lineHeight: "32px" }}
                    />
                    <MicroComments comments={microComments} />
                    <MemoryBubbles memory={memoryBubble} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <JournalSidebar logEntries={logEntries} onMomentClick={(id) => handleEditMoment(id)} />
      </div>
    </SidebarProvider>
  );
};

export default Index;

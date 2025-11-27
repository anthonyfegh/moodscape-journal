import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MicroComments } from "@/components/MicroComments";
import { MemoryBubbles } from "@/components/MemoryBubbles";
import { ReadingSidebar } from "@/components/ReadingSidebar";
import { toast } from "sonner";
import { Save, CheckCircle } from "lucide-react";
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
  const [moodColor, setMoodColor] = useState("#4ade80");
  const [microComments, setMicroComments] = useState<string[]>([]);
  const [memoryBubble, setMemoryBubble] = useState<string | null>(null);
  const [personaState, setPersonaState] = useState("neutral");
  const [wordFrequency, setWordFrequency] = useState<Map<string, number>>(new Map());
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [lastMoodColor, setLastMoodColor] = useState("#4ade80");
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // Show/hide sidebar based on triggers
  useEffect(() => {
    if (moodColor !== lastMoodColor || memoryBubble) {
      setSidebarVisible(true);
      setLastMoodColor(moodColor);
    }
  }, [moodColor, memoryBubble, lastMoodColor]);

  // Hide sidebar after inactivity
  useEffect(() => {
    if (!sidebarVisible) return;
    
    const timer = setTimeout(() => {
      setSidebarVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, [sidebarVisible, text]);

  // Analyze text and update mood
  const analyzeMood = useCallback((content: string) => {
    const lowerText = content.toLowerCase();
    const words = content.split(/\s+/).filter(w => w.length > 0);
    
    // Emotional word detection
    const joyWords = ["happy", "joy", "excited", "love", "wonderful", "amazing", "great"];
    const sadWords = ["sad", "depressed", "unhappy", "hurt", "pain", "sorry", "difficult"];
    const angryWords = ["angry", "frustrated", "mad", "annoyed", "hate", "furious"];
    const calmWords = ["peaceful", "calm", "serene", "quiet", "relaxed", "meditation"];
    const anxiousWords = ["worried", "anxious", "nervous", "scared", "fear", "stress"];

    let joyScore = joyWords.filter(w => lowerText.includes(w)).length;
    let sadScore = sadWords.filter(w => lowerText.includes(w)).length;
    let angryScore = angryWords.filter(w => lowerText.includes(w)).length;
    let calmScore = calmWords.filter(w => lowerText.includes(w)).length;
    let anxiousScore = anxiousWords.filter(w => lowerText.includes(w)).length;

    // Determine dominant emotion and set color
    const emotions = [
      { name: "joyful", score: joyScore, color: "#fbbf24" },
      { name: "melancholic", score: sadScore, color: "#60a5fa" },
      { name: "intense", score: angryScore, color: "#f87171" },
      { name: "peaceful", score: calmScore, color: "#4ade80" },
      { name: "restless", score: anxiousScore, color: "#a78bfa" },
    ];

    const dominant = emotions.reduce((prev, curr) => 
      curr.score > prev.score ? curr : prev
    );

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
    words.forEach(word => {
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
  }, [wordFrequency]);

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Only process words and mood when a word is completed (space or enter)
    if (newText.endsWith(" ") || newText.endsWith("\n")) {
      const allWords = newText.split(/\s+/).filter(w => w.length > 0);
      const completedWords = allWords;

      if (completedWords.length > 0) {
        setRecentWords(completedWords);
        setSidebarVisible(true);
      }

      if (newText.length > 10) {
        analyzeMood(newText);
      }
    }
  };

  // Handle Enter key to save log entry
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && text.trim().length > 0) {
      e.preventDefault();
      
      // Save the current log entry
      const newEntry: LogEntry = {
        id: Date.now().toString(),
        text: text.trim(),
        emotion: personaState,
        color: moodColor,
        timestamp: new Date(),
      };
      
      setLogEntries((prev) => [...prev, newEntry]);
      
      // Animate text clearing
      setIsClearing(true);
      setTimeout(() => {
        setText("");
        setIsClearing(false);
        setMicroComments([]);
        setMemoryBubble(null);
      }, 500);
    }
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
      setMicroComments(prev => [...prev, randomComment]);
    }, 7000);

    return () => clearInterval(interval);
  }, [text]);

  const handleSave = () => {
    if (text.length === 0) {
      toast.error("Write something first!");
      return;
    }
    toast.success("Draft saved successfully!");
  };

  const handleFinish = () => {
    if (text.length === 0) {
      toast.error("Write something first!");
      return;
    }
    toast.success("Entry completed and saved!");
    setText("");
    setMicroComments([]);
    setMemoryBubble(null);
    setRecentWords([]);
    setSidebarVisible(false);
  };

  return (
    <div 
      className="min-h-screen transition-colors duration-700"
      style={{
        backgroundColor: `${moodColor}08`,
      }}
    >
      <ReadingSidebar 
        isVisible={sidebarVisible}
        recentWords={recentWords}
        moodColor={moodColor}
        personaState={personaState}
      />
      
      <div className="min-h-screen flex p-8 gap-6">
        <div className="max-w-3xl flex-1 flex flex-col">
          <h1 className="text-3xl font-serif font-bold mb-2 text-foreground">
            Your Journal
          </h1>
          <p className="text-muted-foreground mb-6">
            Write freely, and watch your emotions come alive
          </p>
          
          <div className="relative flex-1 mb-4">
            <AnimatePresence>
              <motion.div
                key={isClearing ? "clearing" : "active"}
                initial={{ opacity: 1 }}
                animate={{ opacity: isClearing ? 0 : 1 }}
                transition={{ duration: 0.5 }}
                className="h-full"
              >
                <Textarea
                  value={text}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Start writing your thoughts... (Press Enter to save as a moment)"
                  className="w-full h-full resize-none bg-card/50 backdrop-blur-sm rounded-lg p-8 text-lg leading-relaxed transition-all duration-700 focus:outline-none"
                  style={{
                    borderWidth: '3px',
                    borderColor: moodColor,
                    boxShadow: `0 0 20px ${moodColor}20`,
                  }}
                />
              </motion.div>
            </AnimatePresence>
            
            <MicroComments comments={microComments} />
            <MemoryBubbles memory={memoryBubble} />
          </div>

          {/* Bottom Action Bar */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleSave}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            <Button
              onClick={handleFinish}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <CheckCircle className="w-4 h-4" />
              Finish Entry
            </Button>
          </div>
        </div>

        {/* Log Entries Column */}
        <div className="w-80 flex flex-col gap-3 overflow-y-auto max-h-screen pb-8">
          <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background/80 backdrop-blur-sm py-2">
            Your Moments
          </h3>
          <AnimatePresence>
            {logEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
                style={{
                  borderLeft: `4px solid ${entry.color}`,
                  backgroundColor: `${entry.color}10`,
                }}
                onClick={() => setExpandedLogId(expandedLogId === entry.id ? null : entry.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-medium capitalize px-2 py-1 rounded"
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
                  
                  <AnimatePresence>
                    {expandedLogId === entry.id ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-foreground/80 leading-relaxed mt-2">
                          {entry.text}
                        </p>
                      </motion.div>
                    ) : (
                      <p className="text-sm text-foreground/60 line-clamp-2">
                        {entry.text}
                      </p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Index;

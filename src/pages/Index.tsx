import { useState, useEffect, useCallback } from "react";
import { MicroComments } from "@/components/MicroComments";
import { MemoryBubbles } from "@/components/MemoryBubbles";
import { PersonaWithThoughts } from "@/components/PersonaWithThoughts";
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
  const [isThinking, setIsThinking] = useState(false);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [editingMomentId, setEditingMomentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Hide thought bubble after inactivity
  useEffect(() => {
    if (!isThinking) return;
    
    const timer = setTimeout(() => {
      setIsThinking(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isThinking, text]);

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
        setIsThinking(true);
      }

      if (newText.length > 10) {
        analyzeMood(newText);
      }
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
      setMoodColor("#4ade80");
      setPersonaState("neutral");
    }
  };

  // Handle editing a moment
  const handleEditMoment = (momentId: string) => {
    const moment = logEntries.find(e => e.id === momentId);
    if (moment) {
      setEditingMomentId(momentId);
      setEditingText(moment.text);
    }
  };

  // Handle saving edited moment
  const handleSaveEdit = (momentId: string) => {
    setLogEntries(prev => prev.map(entry => 
      entry.id === momentId 
        ? { ...entry, text: editingText }
        : entry
    ));
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
      setMicroComments(prev => [...prev, randomComment]);
    }, 7000);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div 
      className="min-h-screen transition-colors duration-700"
      style={{
        backgroundColor: `${moodColor}08`,
      }}
    >
      <PersonaWithThoughts 
        isThinking={isThinking}
        recentWords={recentWords}
        moodColor={moodColor}
        personaState={personaState}
        logEntries={logEntries}
      />
      
      <div className="min-h-screen flex flex-col items-center p-8">
        <div className="max-w-3xl w-full">
          <h1 className="text-3xl font-serif font-bold mb-2 text-foreground">
            Your Journal
          </h1>
          <p className="text-muted-foreground mb-6">
            Write freely, and watch your emotions come alive
          </p>
          
          {/* Alive Canvas - Scrollable container with all moments */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-20rem)] space-y-4 mb-4 pr-2">
            <AnimatePresence>
              {logEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-lg overflow-hidden cursor-pointer transition-all duration-300"
                  style={{
                    borderWidth: '3px',
                    borderColor: entry.color,
                    backgroundColor: `${entry.color}08`,
                    boxShadow: `0 0 20px ${entry.color}20`,
                  }}
                  onClick={() => editingMomentId !== entry.id && handleEditMoment(entry.id)}
                >
                  <div className="p-4 backdrop-blur-sm bg-card/30">
                    <div className="flex items-center justify-between mb-3">
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
                        className="w-full p-3 bg-background/50 border border-border rounded-lg outline-none resize-none text-foreground leading-relaxed"
                        rows={4}
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {entry.text}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* New Entry Input at Bottom */}
          <div 
            className="w-full rounded-lg overflow-hidden transition-all duration-300"
            style={{
              borderWidth: '3px',
              borderColor: moodColor,
              boxShadow: `0 0 20px ${moodColor}20`,
            }}
          >
            <div className="relative">
              <textarea
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Start writing your thoughts... (Press Enter to save as a moment)"
                className="w-full h-32 p-4 bg-card/50 backdrop-blur-sm border-none outline-none resize-none text-lg leading-relaxed text-foreground placeholder:text-muted-foreground"
              />
              <MicroComments comments={microComments} />
              <MemoryBubbles memory={memoryBubble} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

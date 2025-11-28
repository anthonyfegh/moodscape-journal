import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MicroComments } from "@/components/MicroComments";
import { MemoryBubbles } from "@/components/MemoryBubbles";
import { PersonaWithThoughts } from "@/components/PersonaWithThoughts";
import { JournalSidebar } from "@/components/JournalSidebar";
import { LivingBackground } from "@/components/LivingBackground";
import { EmotionalInkTrails } from "@/components/EmotionalInkTrails";
import { HeartbeatHighlights } from "@/components/HeartbeatHighlights";
import { MomentSpotlight } from "@/components/MomentSpotlight";
import { EmotionalRipple } from "@/components/EmotionalRipple";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ManageJournalsSidebar } from "@/components/ManageJournalsSidebar";
import { Menu, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { journalStorage } from "@/lib/journalStorage";
import { Button } from "@/components/ui/button";

interface LogEntry {
  id: string;
  text: string;
  emotion: string;
  color: string;
  timestamp: Date;
}

const IndexContent = () => {
  const { journalId } = useParams();
  const navigate = useNavigate();
  const { setOpen } = useSidebar();
  const [text, setText] = useState("");
  const [journalName, setJournalName] = useState("");
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
  const [hoveredMoodColor, setHoveredMoodColor] = useState<string | null>(null);
  const [caretPosition, setCaretPosition] = useState<{ x: number; y: number } | null>(null);
  const [rippleActive, setRippleActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Load journal and create default sub-journal if needed
  useEffect(() => {
    if (!journalId) {
      navigate("/");
      return;
    }

    const journal = journalStorage.getJournal(journalId);
    if (!journal) {
      navigate("/");
      return;
    }

    setJournalName(journal.name);

    // Get or create default sub-journal
    let subJournals = journalStorage.getSubJournals(journalId);
    if (subJournals.length === 0) {
      journalStorage.createSubJournal(journalId, "Main");
      subJournals = journalStorage.getSubJournals(journalId);
    }

    // Load moments from first sub-journal
    const defaultSubJournal = subJournals[0];
    const moments = journalStorage.getMoments(defaultSubJournal.id);
    const entries: LogEntry[] = moments.map((m) => ({
      id: m.id,
      text: m.text,
      emotion: m.emotion,
      color: m.color,
      timestamp: new Date(m.timestamp),
    }));
    setLogEntries(entries);
  }, [journalId, navigate]);

  // Hide thought bubble after inactivity
  useEffect(() => {
    if (!isThinking) return;

    const timer = setTimeout(() => {
      setIsThinking(false);
    }, 10000);

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

    // Update caret position for ink trails
    setTimeout(updateCaretPosition, 0);
  };

  // Handle Enter key to save log entry
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const contentToSave = text.trim();
      if (contentToSave.length === 0 || !journalId) {
        return;
      }

      // Get default sub-journal
      const subJournals = journalStorage.getSubJournals(journalId);
      if (subJournals.length === 0) return;
      const defaultSubJournal = subJournals[0];

      // Save to localStorage
      const savedMoment = journalStorage.createMoment(
        defaultSubJournal.id,
        contentToSave,
        personaState,
        moodColor
      );

      // Update journal's last mood color
      journalStorage.updateJournal(journalId, { lastMoodColor: moodColor });

      const newEntry: LogEntry = {
        id: savedMoment.id,
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

      // Trigger emotional ripple
      setRippleActive(true);
      setTimeout(() => setRippleActive(false), 2000);

      setMoodColor("#fbbf24");
      setPersonaState("neutral");
      setIsTyping(false);
      setCaretPosition(null);
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

  // Track caret position for ink trails
  const updateCaretPosition = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const selectionStart = textarea.selectionStart;

    // Create a temporary span to measure caret position
    const div = document.createElement("div");
    const style = window.getComputedStyle(textarea);

    // Copy relevant styles
    ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "padding", "border"].forEach((prop) => {
      div.style[prop as any] = style[prop as any];
    });

    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";
    div.style.width = `${textarea.clientWidth}px`;

    div.textContent = textarea.value.substring(0, selectionStart);
    document.body.appendChild(div);

    const rect = textarea.getBoundingClientRect();
    const span = document.createElement("span");
    span.textContent = "|";
    div.appendChild(span);

    const spanRect = span.getBoundingClientRect();

    setCaretPosition({
      x: spanRect.left - rect.left,
      y: spanRect.top - rect.top,
    });

    document.body.removeChild(div);
  }, []);

  // Handle editing a moment
  const handleEditMoment = (momentId: string, fromSidebar: boolean = false) => {
    const moment = logEntries.find((e) => e.id === momentId);
    if (moment) {
      setEditingMomentId(momentId);
      setEditingText(moment.text);

      // If clicked from sidebar, close sidebar and focus at end of text
      if (fromSidebar) {
        setOpen(false);
        // Wait for next tick to ensure textarea is rendered
        setTimeout(() => {
          if (editTextareaRef.current) {
            editTextareaRef.current.focus();
            const length = moment.text.length;
            editTextareaRef.current.setSelectionRange(length, length);
          }
        }, 0);
      }
    }
  };

  // Handle saving edited moment
  const handleSaveEdit = (momentId: string) => {
    journalStorage.updateMoment(momentId, editingText);
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
    <div className="min-h-screen flex w-full relative">
      <LivingBackground moodColor={hoveredMoodColor || moodColor} isTyping={isTyping} rippleActive={rippleActive} />

      <div className="flex-1 min-h-screen relative z-10">
        <PersonaWithThoughts
          isThinking={isThinking}
          recentWords={recentWords}
          moodColor={moodColor}
          personaState={personaState}
          logEntries={logEntries}
          isTyping={isTyping}
        />

        {/* Header with back button and sidebar toggle */}
        <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            size="sm"
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Journals
          </Button>
          <SidebarTrigger className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-lg">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
        </div>

        <div className="min-h-screen flex flex-col items-center p-8 pt-20">
          <div className="max-w-3xl w-full">
            <h1 className="text-3xl font-serif font-bold mb-2 text-foreground">{journalName}</h1>
            <p className="text-muted-foreground mb-6">Write freely, and watch your emotions come alive</p>

            {/* Continuous Writing Surface - like a sheet of paper */}
            <div
              className="bg-background/60 backdrop-blur-md rounded-lg p-8 shadow-md border border-border/10 relative"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(transparent, transparent 31px, hsl(var(--border) / 0.18) 31px, hsl(var(--border) / 0.18) 32px)",
                lineHeight: "32px",
              }}
            >
              <EmotionalRipple isActive={rippleActive} moodColor={moodColor} />
              <div className="space-y-6">
                <AnimatePresence>
                  {logEntries.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MomentSpotlight
                        moodColor={entry.color}
                        onMomentClick={() => {
                          if (editingMomentId !== entry.id) {
                            handleEditMoment(entry.id);
                          }
                        }}
                        onHoverChange={(isHovering) => {
                          setHoveredMoodColor(isHovering ? entry.color : null);
                        }}
                      >
                        {editingMomentId === entry.id ? (
                          <textarea
                            ref={editTextareaRef}
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
                      </MomentSpotlight>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Live Input - blends into the same page */}
                <div className="relative">
                  <HeartbeatHighlights text={text} wordFrequency={wordFrequency} moodColor={moodColor} threshold={2} />
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    onSelect={updateCaretPosition}
                    onClick={updateCaretPosition}
                    placeholder=""
                    className="relative w-full p-2 bg-transparent border-none outline-none resize-none text-lg leading-relaxed text-transparent caret-foreground placeholder:text-muted-foreground/40"
                    rows={6}
                    style={{ lineHeight: "32px" }}
                  />
                  <EmotionalInkTrails isTyping={isTyping} moodColor={moodColor} caretPosition={caretPosition} />
                  <MicroComments comments={microComments} isTyping={isTyping} />
                  <MemoryBubbles memory={memoryBubble} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ManageJournalsSidebar />
      <JournalSidebar logEntries={logEntries} onMomentClick={(id) => handleEditMoment(id, true)} />
    </div>
  );
};

const Index = () => {
  return (
    <SidebarProvider defaultOpen={false}>
      <IndexContent />
    </SidebarProvider>
  );
};

export default Index;

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
import { MomentSelectionModal } from "@/components/MomentSelectionModal";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Menu, ArrowLeft, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { journalStorage } from "@/lib/journalStorage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTypeConfig } from "@/lib/journalTypeConfig";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const IndexContent = () => {
  const { journalId } = useParams();
  const navigate = useNavigate();
  const { setOpen } = useSidebar();
  const [text, setText] = useState("");
  const [journalName, setJournalName] = useState("");
  const [journalType, setJournalType] = useState<"daily" | "themed" | "people" | "event" | "creative">("daily");
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
  const [momentModalOpen, setMomentModalOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<LogEntry | null>(null);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [hoveredReflection, setHoveredReflection] = useState<{ momentId: string; reflectionId: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  // Load journal and create default sub-journal if needed
  useEffect(() => {
    if (!journalId) {
      navigate("/");
      return;
    }

    const loadJournal = async () => {
      const journal = await journalStorage.getJournal(journalId);
      if (!journal) {
        navigate("/");
        return;
      }

      setJournalName(journal.name);
      setJournalType(journal.type);

      // Get or create default sub-journal
      let subJournals = await journalStorage.getSubJournals(journalId);
      if (subJournals.length === 0) {
        await journalStorage.createSubJournal(journalId, "Main");
        subJournals = await journalStorage.getSubJournals(journalId);
      }

      // Load moments from first sub-journal
      const defaultSubJournal = subJournals[0];
      const moments = await journalStorage.getMoments(defaultSubJournal.id);
      const entries: LogEntry[] = moments.map((m) => ({
        id: m.id,
        text: m.text,
        emotion: m.emotion,
        color: m.color,
        timestamp: new Date(m.timestamp),
        ai_reflections: m.ai_reflections || [],
      }));
      setLogEntries(entries);
    };

    loadJournal();
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
      const typeConfig = getTypeConfig(journalType);
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

      // Use theme colors for themed journals if available
      const baseEmotions = [
        { name: "joyful", score: joyScore, color: "#fbbf24" },
        { name: "melancholic", score: sadScore, color: "#60a5fa" },
        { name: "intense", score: angryScore, color: "#f87171" },
        { name: "peaceful", score: calmScore, color: "#4ade80" },
        { name: "restless", score: anxiousScore, color: "#a78bfa" },
      ];

      const dominant = baseEmotions.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));

      if (dominant.score > 0) {
        setMoodColor(dominant.color);
        setPersonaState(dominant.name);
      } else if (words.length > 50) {
        setMoodColor("#4ade80");
        setPersonaState("reflective");
      } else {
        // Use type-specific default color if no emotion detected
        setMoodColor(typeConfig.defaultMoodColor);
        setPersonaState("contemplative");
      }

      // Track word frequency for memory bubbles
      const newFrequency = new Map<string, number>();
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

      // Generate micro-comments based on journal type
      const typeConfig = getTypeConfig(journalType);
      if (journalType === "themed" && typeConfig.guidingPrompts && completedWords.length > 5) {
        const randomPrompt = typeConfig.guidingPrompts[Math.floor(Math.random() * typeConfig.guidingPrompts.length)];
        setMicroComments([randomPrompt]);
      } else if (completedWords.length > 3) {
        const lastWord = completedWords[completedWords.length - 1].toLowerCase();
        if (lastWord === "feel" || lastWord === "feeling") {
          setMicroComments(["How does that make you feel?"]);
        } else if (lastWord === "want" || lastWord === "wish") {
          setMicroComments(["What do you really want?"]);
        }
      }
    }

    // Set timeout to reset color after 3 seconds of inactivity
    if (newText.length > 0) {
      const typeConfig = getTypeConfig(journalType);
      const timeout = setTimeout(() => {
        setMoodColor(typeConfig.defaultMoodColor);
        setPersonaState("neutral");
      }, 3000);
      setColorResetTimeout(timeout);
    }

    // Update caret position for ink trails
    setTimeout(updateCaretPosition, 0);
  };

  // Handle Enter key to save log entry
  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const contentToSave = text.trim();
      if (contentToSave.length === 0 || !journalId) {
        return;
      }

      // Get default sub-journal
      const subJournals = await journalStorage.getSubJournals(journalId);
      if (subJournals.length === 0) return;
      const defaultSubJournal = subJournals[0];

      // Save to database
      const savedMoment = await journalStorage.createMoment(
        defaultSubJournal.id,
        contentToSave,
        personaState,
        moodColor,
      );

      // Update journal's last mood color
      await journalStorage.updateJournal(journalId, { lastMoodColor: moodColor });

      const newEntry: LogEntry = {
        id: savedMoment.id,
        text: contentToSave,
        emotion: personaState,
        color: moodColor,
        timestamp: new Date(),
        ai_reflections: [],
      };

      setLogEntries((prev) => [...prev, newEntry]);
      setText("");
      setMicroComments([]);
      setMemoryBubble(null);
      setIsThinking(false);

      // Trigger emotional ripple
      setRippleActive(true);
      setTimeout(() => setRippleActive(false), 2000);

      const typeConfig = getTypeConfig(journalType);
      setMoodColor(typeConfig.defaultMoodColor);
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

  const handleAvatarClick = () => {
    if (logEntries.length === 0) {
      toast.info("Write and save some moments first to reflect on them!");
      return;
    }
    setMomentModalOpen(true);
  };

  const handleMomentSelect = async (moment: LogEntry) => {
    setSelectedMoment(moment);
    setIsGeneratingReflection(true);
    setMomentModalOpen(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-reflection', {
        body: {
          momentText: moment.text,
          journalType: journalType,
          conversationHistory: (moment.ai_reflections || []).flatMap((r) => [
            { role: 'user', content: moment.text },
            { role: 'assistant', content: r.ai_text },
            ...(r.user_reply ? [{ role: 'user', content: r.user_reply }] : [])
          ])
        }
      });

      if (error) {
        console.error('Error generating reflection:', error);
        if (error.message?.includes('429')) {
          toast.error("Too many requests. Please try again in a moment.");
        } else if (error.message?.includes('402')) {
          toast.error("AI credits exhausted. Please add credits to continue.");
        } else {
          toast.error("Failed to generate reflection. Please try again.");
        }
        return;
      }

      const reflection = data.reflection;
      
      // Save AI reflection to database
      await journalStorage.addAIReflection(moment.id, reflection);

      // Update local state
      setLogEntries((prev) => prev.map((entry) => {
        if (entry.id === moment.id) {
          return {
            ...entry,
            ai_reflections: [
              ...(entry.ai_reflections || []),
              {
                id: crypto.randomUUID(),
                ai_text: reflection,
                timestamp: new Date().toISOString(),
              }
            ]
          };
        }
        return entry;
      }));

      toast.success("AI reflection added to your moment");
    } catch (error) {
      console.error('Error in reflection generation:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  const handleReflectionClick = (momentId: string, reflectionId: string) => {
    // Removed - now using hover instead
  };

  const handleReplySubmit = async (momentId: string, reflectionId: string) => {
    if (!replyText.trim()) return;

    const moment = logEntries.find(e => e.id === momentId);
    if (!moment) return;

    try {
      // Save user reply to database
      await journalStorage.updateAIReflectionReply(momentId, reflectionId, replyText);

      // Update local state with user reply
      setLogEntries((prev) => prev.map((entry) => {
        if (entry.id === momentId) {
          return {
            ...entry,
            ai_reflections: entry.ai_reflections?.map((r) =>
              r.id === reflectionId ? { ...r, user_reply: replyText } : r
            )
          };
        }
        return entry;
      }));

      // Build conversation history including the new reply
      const conversationHistory = (moment.ai_reflections || []).flatMap((r) => {
        const messages: Array<{ role: 'assistant' | 'user'; content: string }> = [
          { role: 'assistant', content: r.ai_text }
        ];
        if (r.id === reflectionId) {
          messages.push({ role: 'user', content: replyText });
        } else if (r.user_reply) {
          messages.push({ role: 'user', content: r.user_reply });
        }
        return messages;
      });

      // Generate follow-up AI response
      setIsGeneratingReflection(true);
      const { data, error } = await supabase.functions.invoke('generate-reflection', {
        body: {
          momentText: moment.text,
          journalType: journalType,
          conversationHistory: [
            { role: 'user', content: moment.text },
            ...conversationHistory
          ]
        }
      });

      if (error) {
        console.error('Error generating follow-up:', error);
        toast.error("Failed to generate follow-up. You can still continue manually.");
        return;
      }

      const followUp = data.reflection;
      
      // Save follow-up AI reflection
      await journalStorage.addAIReflection(momentId, followUp);

      // Update local state with follow-up
      setLogEntries((prev) => prev.map((entry) => {
        if (entry.id === momentId) {
          return {
            ...entry,
            ai_reflections: [
              ...(entry.ai_reflections || []),
              {
                id: crypto.randomUUID(),
                ai_text: followUp,
                timestamp: new Date().toISOString(),
              }
            ]
          };
        }
        return entry;
      }));

      setHoveredReflection(null);
      setReplyText("");
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGeneratingReflection(false);
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
      setMicroComments((prev) => [...prev, randomComment]);
    }, 7000);

    return () => clearInterval(interval);
  }, [text]);

  const typeConfig = getTypeConfig(journalType);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen flex w-full relative"
    >
      <LivingBackground
        moodColor={hoveredMoodColor || moodColor}
        isTyping={isTyping}
        rippleActive={rippleActive}
        intensityMultiplier={typeConfig.cometIntensity}
      />

      <div className="flex-1 min-h-screen relative z-10">
        <PersonaWithThoughts
          isThinking={isThinking}
          recentWords={recentWords}
          moodColor={moodColor}
          personaState={personaState}
          logEntries={logEntries}
          isTyping={isTyping}
          onClick={handleAvatarClick}
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
          <div className="max-w-4xl w-full mx-auto">
            <h1 className="text-3xl font-serif font-bold mb-2 text-foreground text-center">{journalName}</h1>
            <p className="text-muted-foreground mb-6 text-center">Write freely, and watch your emotions come alive</p>

            {/* Centered layout with moments on the side */}
            <div className="flex gap-4 justify-center items-start">
              {/* Left column: Compact Moments */}
              <div className="space-y-3 w-64 flex-shrink-0">
                <AnimatePresence>
                  {logEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onMouseEnter={() => setHoveredMoodColor(entry.color)}
                      onMouseLeave={() => setHoveredMoodColor(null)}
                      onClick={() => handleEditMoment(entry.id, true)}
                      className="cursor-pointer"
                    >
                      <Card 
                        className="relative p-3 bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all border-2"
                        style={{ borderColor: entry.color }}
                      >
                        {/* Content */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-muted-foreground">
                            <span className="capitalize font-medium">{entry.emotion}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {entry.timestamp.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap line-clamp-2">
                            {entry.text}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Center: Writing Surface */}
              <div
                className="bg-background/60 backdrop-blur-md rounded-lg p-8 shadow-md border border-border/10 relative min-h-[600px] w-[700px] flex-shrink-0"
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
                            <div className="relative space-y-4">
                              <p
                                className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-lg"
                                style={{ lineHeight: "32px" }}
                              >
                                {entry.text}
                              </p>

                              {/* AI Reflections - soft, handwritten style */}
                              {entry.ai_reflections && entry.ai_reflections.length > 0 && (
                                <div className="pl-6 border-l-2 border-muted-foreground/10 space-y-3">
                                  {entry.ai_reflections.map((reflection, index) => (
                                    <div 
                                      key={reflection.id} 
                                      className="space-y-2"
                                      onMouseEnter={() => !reflection.user_reply && setHoveredReflection({ momentId: entry.id, reflectionId: reflection.id })}
                                      onMouseLeave={() => setHoveredReflection(null)}
                                    >
                                      <p 
                                        className="text-base italic text-muted-foreground/80 leading-relaxed hover:text-muted-foreground transition-colors" 
                                        style={{ lineHeight: "30px" }}
                                      >
                                        {reflection.ai_text}
                                      </p>
                                      {reflection.user_reply && (
                                        <p className="text-base text-foreground/80 leading-relaxed pl-4" style={{ lineHeight: "30px" }}>
                                          {reflection.user_reply}
                                        </p>
                                      )}
                                      {/* Reply input - appears on hover */}
                                      {hoveredReflection?.momentId === entry.id && 
                                       hoveredReflection?.reflectionId === reflection.id && 
                                       !reflection.user_reply && (
                                         <div className="pl-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                           <input
                                             ref={replyInputRef}
                                             type="text"
                                             value={replyText}
                                             onChange={(e) => setReplyText(e.target.value)}
                                             onClick={(e) => e.stopPropagation()}
                                             onKeyDown={(e) => {
                                               if (e.key === 'Enter') {
                                                 e.preventDefault();
                                                 handleReplySubmit(entry.id, reflection.id);
                                               } else if (e.key === 'Escape') {
                                                 setHoveredReflection(null);
                                                 setReplyText("");
                                               }
                                             }}
                                             placeholder="Reply to continue the conversation..."
                                             className="w-full px-3 py-2 bg-background/50 border border-border/20 rounded-md text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-muted-foreground/30 transition-colors"
                                           />
                                           <p className="text-xs text-muted-foreground/50 mt-1">Press Enter to send, Esc to cancel</p>
                                         </div>
                                       )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </MomentSpotlight>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Live Input - blends into the same page */}
                  <div className="relative">
                    <HeartbeatHighlights
                      text={text}
                      wordFrequency={wordFrequency}
                      moodColor={moodColor}
                      threshold={2}
                      intensityMultiplier={typeConfig.wordPulsingIntensity}
                    />
                    <textarea
                      ref={textareaRef}
                      value={text}
                      onChange={handleTextChange}
                      onKeyDown={handleKeyDown}
                      onSelect={updateCaretPosition}
                      onClick={updateCaretPosition}
                      placeholder=""
                      className="relative w-full p-2 bg-transparent border-none outline-none resize-none text-base leading-relaxed text-transparent caret-foreground placeholder:text-muted-foreground/40"
                      rows={6}
                      style={{ lineHeight: "28px" }}
                    />
                    <EmotionalInkTrails
                      isTyping={isTyping}
                      moodColor={moodColor}
                      caretPosition={caretPosition}
                      strengthMultiplier={typeConfig.inkTrailStrength}
                    />
                    <MicroComments comments={microComments} isTyping={isTyping} />
                    <MemoryBubbles memory={memoryBubble} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <JournalSidebar logEntries={logEntries} onMomentClick={(id) => handleEditMoment(id, true)} />

      <MomentSelectionModal
        open={momentModalOpen}
        onClose={() => setMomentModalOpen(false)}
        moments={logEntries}
        onSelectMoment={handleMomentSelect}
      />
    </motion.div>
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

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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  summary?: string;
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
  const [isSelectingMoment, setIsSelectingMoment] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<LogEntry | null>(null);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [hoveredReflection, setHoveredReflection] = useState<{ momentId: string; reflectionId: string } | null>(null);
  const [pinnedReflection, setPinnedReflection] = useState<{ momentId: string; reflectionId: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);
  const replyContainerRef = useRef<HTMLDivElement>(null);
  const [guidance, setGuidance] = useState<string>("");
  const guidanceTimeoutRef = useRef<NodeJS.Timeout>();
  const [highlightedMomentId, setHighlightedMomentId] = useState<string | null>(null);
  const momentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

    // Set typing state and clear guidance
    setIsTyping(true);
    setGuidance("");

    // Clear existing typing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Clear any pending guidance call
    if (guidanceTimeoutRef.current) {
      clearTimeout(guidanceTimeoutRef.current);
    }

    // Set new typing timeout (2.5 seconds of inactivity)
    const newTypingTimeout = setTimeout(() => {
      setIsTyping(false);

      // Call AI for guidance after 2 seconds of stopping
      guidanceTimeoutRef.current = setTimeout(async () => {
        if (newText.trim().length > 20 && journalId) {
          try {
            const subJournals = await journalStorage.getSubJournals(journalId);
            if (subJournals.length === 0) return;

            const { data, error } = await supabase.functions.invoke("generate-guidance", {
              body: {
                journalText: newText,
                journalType: journalType,
              },
            });

            if (!error && data?.guidance) {
              setGuidance(data.guidance);
            }
          } catch (err) {
            console.error("Error getting guidance:", err);
          }
        }
      }, 2000);
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

      try {
        // Get default sub-journal
        const subJournals = await journalStorage.getSubJournals(journalId);
        if (subJournals.length === 0) return;
        const defaultSubJournal = subJournals[0];

        // Call AI to analyze mood and get appropriate color
        toast.loading("Analyzing your moment...", { id: "analyzing" });
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke("analyze-moment", {
          body: {
            momentText: contentToSave,
            journalType: journalType,
          },
        });

        let aiEmotion = personaState;
        let aiColor = moodColor;

        if (analysisError) {
          console.error("Error analyzing moment:", analysisError);
          toast.dismiss("analyzing");
          toast.error("Could not analyze mood, using current colors");
        } else {
          aiEmotion = analysisData.emotion || personaState;
          aiColor = analysisData.color || moodColor;
          toast.dismiss("analyzing");
        }

        // Save to database with AI-generated emotion and color
        const savedMoment = await journalStorage.createMoment(defaultSubJournal.id, contentToSave, aiEmotion, aiColor);

        // Update journal's last mood color
        await journalStorage.updateJournal(journalId, { lastMoodColor: aiColor });

        const newEntry: LogEntry = {
          id: savedMoment.id,
          text: contentToSave,
          emotion: aiEmotion,
          color: aiColor,
          timestamp: new Date(),
          ai_reflections: [],
        };

        setLogEntries((prev) => [...prev, newEntry]);
        setText("");
        setMicroComments([]);
        setMemoryBubble(null);
        setIsThinking(false);

        // Trigger emotional ripple with AI color
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
      } catch (error) {
        console.error("Error saving moment:", error);
        toast.error("Failed to save moment. Please try again.");
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
    setIsSelectingMoment(true);
  };

  // Handle Escape key to cancel selection mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSelectingMoment) {
        setIsSelectingMoment(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isSelectingMoment]);

  // Handle click outside to unpin reply input
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pinnedReflection && replyContainerRef.current && !replyContainerRef.current.contains(e.target as Node)) {
        setPinnedReflection(null);
        setReplyText("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pinnedReflection]);

  const handleMomentSelect = async (moment: LogEntry) => {
    setSelectedMoment(moment);
    setIsGeneratingReflection(true);
    setIsSelectingMoment(false);

    // Scroll to and highlight the moment
    setTimeout(() => {
      const momentElement = momentRefs.current.get(moment.id);
      if (momentElement) {
        momentElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedMomentId(moment.id);
        setTimeout(() => setHighlightedMomentId(null), 2000);
      }
    }, 100);

    try {
      // Prepare journal context - all previous moments except the current one
      const journalContext = logEntries
        .filter((e) => e.id !== moment.id)
        .map((e) => ({
          text: e.text,
          emotion: e.emotion,
          timestamp: e.timestamp,
        }));

      const { data, error } = await supabase.functions.invoke("generate-reflection", {
        body: {
          momentText: moment.text,
          journalType: journalType,
          journalContext: journalContext,
          conversationHistory: (moment.ai_reflections || []).flatMap((r) => [
            { role: "user", content: moment.text },
            { role: "assistant", content: r.ai_text },
            ...(r.user_reply ? [{ role: "user", content: r.user_reply }] : []),
          ]),
        },
      });

      if (error) {
        console.error("Error generating reflection:", error);
        if (error.message?.includes("429")) {
          toast.error("Too many requests. Please try again in a moment.");
        } else if (error.message?.includes("402")) {
          toast.error("AI credits exhausted. Please add credits to continue.");
        } else {
          toast.error("Failed to generate reflection. Please try again.");
        }
        return;
      }

      const reflection = data.reflection;
      const summary = data.summary || "Reflection";

      // Save AI reflection to database
      await journalStorage.addAIReflection(moment.id, reflection, summary);

      // Update local state
      setLogEntries((prev) =>
        prev.map((entry) => {
          if (entry.id === moment.id) {
            return {
              ...entry,
              ai_reflections: [
                ...(entry.ai_reflections || []),
                {
                  id: crypto.randomUUID(),
                  ai_text: reflection,
                  summary: summary,
                  timestamp: new Date().toISOString(),
                },
              ],
            };
          }
          return entry;
        }),
      );

      toast.success("AI reflection added to your moment");
    } catch (error) {
      console.error("Error in reflection generation:", error);
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

    const moment = logEntries.find((e) => e.id === momentId);
    if (!moment) return;

    try {
      // Save user reply to database
      await journalStorage.updateAIReflectionReply(momentId, reflectionId, replyText);

      // Update local state with user reply
      setLogEntries((prev) =>
        prev.map((entry) => {
          if (entry.id === momentId) {
            return {
              ...entry,
              ai_reflections: entry.ai_reflections?.map((r) =>
                r.id === reflectionId ? { ...r, user_reply: replyText } : r,
              ),
            };
          }
          return entry;
        }),
      );

      // Build conversation history including the new reply
      const conversationHistory = (moment.ai_reflections || []).flatMap((r) => {
        const messages: Array<{ role: "assistant" | "user"; content: string }> = [
          { role: "assistant", content: r.ai_text },
        ];
        if (r.id === reflectionId) {
          messages.push({ role: "user", content: replyText });
        } else if (r.user_reply) {
          messages.push({ role: "user", content: r.user_reply });
        }
        return messages;
      });

      // Generate follow-up AI response
      setIsGeneratingReflection(true);
      const { data, error } = await supabase.functions.invoke("generate-reflection", {
        body: {
          momentText: moment.text,
          journalType: journalType,
          conversationHistory: [{ role: "user", content: moment.text }, ...conversationHistory],
        },
      });

      if (error) {
        console.error("Error generating follow-up:", error);
        toast.error("Failed to generate follow-up. You can still continue manually.");
        return;
      }

      const followUp = data.reflection;
      const followUpSummary = data.summary;

      // Save follow-up AI reflection
      await journalStorage.addAIReflection(momentId, followUp, followUpSummary);

      // Update local state with follow-up
      setLogEntries((prev) =>
        prev.map((entry) => {
          if (entry.id === momentId) {
            return {
              ...entry,
              ai_reflections: [
                ...(entry.ai_reflections || []),
                {
                  id: crypto.randomUUID(),
                  ai_text: followUp,
                  summary: followUpSummary,
                  timestamp: new Date().toISOString(),
                },
              ],
            };
          }
          return entry;
        }),
      );

      setHoveredReflection(null);
      setPinnedReflection(null);
      setReplyText("");
    } catch (error) {
      console.error("Error submitting reply:", error);
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
          guidance={guidance}
        />

        {/* Header with back button and sidebar toggle */}
        <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button
              onClick={() => navigate("/journal")}
              variant="ghost"
              size="sm"
              className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-lg"
            >
              All Journals
            </Button>
          </div>
          <SidebarTrigger className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-lg">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
        </div>

        <div className="min-h-screen flex flex-col items-center p-8 pt-20">
          <div className="max-w-4xl w-full mx-auto">
            <h1 className="text-3xl font-serif font-bold mb-2 text-foreground text-center">{journalName}</h1>
            <p className="text-muted-foreground mb-6 text-center">Write freely, and watch your emotions come alive</p>

            {/* Centered layout with moments on the side */}
            <div className="flex gap-4 justify-center items-start relative">
              {/* Left column: Compact Moments */}
              <div
                className={`space-y-3 w-64 flex-shrink-0 ${isSelectingMoment ? "opacity-0 pointer-events-none" : ""}`}
              >
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

              {/* Enlarged centered moments during selection */}
              {isSelectingMoment && (
                <div
                  className="fixed inset-0 flex items-center justify-center z-50 pointer-events-auto"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setIsSelectingMoment(false);
                    }
                  }}
                >
                  <div className="max-h-[80vh] overflow-y-auto px-4 py-8">
                    <div className="space-y-6 max-w-2xl mx-auto">
                      <AnimatePresence>
                        {logEntries.map((entry, index) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              y: [0, -8, 0],
                            }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{
                              opacity: { duration: 0.4, delay: index * 0.08 },
                              scale: {
                                duration: 0.4,
                                delay: index * 0.08,
                                type: "spring",
                                stiffness: 200,
                                damping: 20,
                              },
                              y: {
                                duration: 3,
                                delay: index * 0.08 + 0.5,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut",
                              },
                            }}
                            whileHover={{
                              scale: 1.05,
                              transition: { duration: 0.2 },
                            }}
                            onClick={() => handleMomentSelect(entry)}
                            className="cursor-pointer group"
                          >
                            <Card
                              className="relative p-6 bg-background/95 backdrop-blur-xl transition-all border-2 shadow-2xl ring-4 group-hover:ring-8 group-hover:shadow-[0_0_40px_rgba(0,0,0,0.3)]"
                              style={{
                                borderColor: entry.color,
                                boxShadow: `0 0 30px ${entry.color}40, 0 10px 40px rgba(0,0,0,0.3)`,
                              }}
                            >
                              {/* Glow effect */}
                              <div
                                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                                style={{
                                  backgroundColor: entry.color,
                                  opacity: 0.2,
                                  filter: "blur(20px)",
                                }}
                              />

                              {/* Content */}
                              <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                  <span className="capitalize font-medium">{entry.emotion}</span>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {entry.timestamp.toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                  {entry.text}
                                </p>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}

              {/* Center: Writing Surface */}
              <motion.div
                className="bg-background/60 backdrop-blur-md rounded-lg p-8 shadow-md border border-border/10 relative min-h-[600px] w-[700px] flex-shrink-0"
                animate={
                  isSelectingMoment ? { filter: "blur(8px)", opacity: 0.5 } : { filter: "blur(0px)", opacity: 1 }
                }
                transition={{ duration: 0.3 }}
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
                        ref={(el) => {
                          if (el) momentRefs.current.set(entry.id, el);
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          boxShadow:
                            highlightedMomentId === entry.id
                              ? `0 0 40px ${entry.color}80, 0 0 20px ${entry.color}60`
                              : "none",
                        }}
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
                              className="w-full bg-transparent border-none outline-none resize-none text-foreground/90 leading-relaxed whitespace-pre-wrap text-lg p-0 m-0 focus:ring-0"
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
                                <Accordion
                                  type="single"
                                  collapsible
                                  className="pl-6 border-l-2 border-muted-foreground/10"
                                >
                                  <AccordionItem value="reflections" className="border-none">
                                    <AccordionTrigger
                                      className="text-sm italic text-muted-foreground/60 hover:text-muted-foreground/80 py-2"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {entry.ai_reflections[0]?.summary || "AI Conversation"}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="space-y-3">
                                        {entry.ai_reflections.map((reflection, index) => (
                                          <div
                                            key={reflection.id}
                                            className="space-y-2"
                                            onMouseEnter={() =>
                                              !reflection.user_reply &&
                                              setHoveredReflection({ momentId: entry.id, reflectionId: reflection.id })
                                            }
                                            onMouseLeave={() => setHoveredReflection(null)}
                                          >
                                            <p
                                              className="text-base italic text-muted-foreground/80 leading-relaxed hover:text-muted-foreground transition-colors"
                                              style={{ lineHeight: "30px" }}
                                            >
                                              {reflection.ai_text}
                                            </p>
                                            {reflection.user_reply && (
                                              <p
                                                className="text-base text-foreground/80 leading-relaxed pl-4"
                                                style={{ lineHeight: "30px" }}
                                              >
                                                {reflection.user_reply}
                                              </p>
                                            )}
                                            {/* Reply input - appears on hover or when pinned */}
                                            {((hoveredReflection?.momentId === entry.id &&
                                              hoveredReflection?.reflectionId === reflection.id) ||
                                              (pinnedReflection?.momentId === entry.id &&
                                                pinnedReflection?.reflectionId === reflection.id)) &&
                                              !reflection.user_reply && (
                                                <div
                                                  ref={replyContainerRef}
                                                  className="pl-4 animate-fade-in"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <input
                                                    ref={replyInputRef}
                                                    type="text"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setPinnedReflection({
                                                        momentId: entry.id,
                                                        reflectionId: reflection.id,
                                                      });
                                                    }}
                                                    onKeyDown={(e) => {
                                                      if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleReplySubmit(entry.id, reflection.id);
                                                      } else if (e.key === "Escape") {
                                                        setPinnedReflection(null);
                                                        setHoveredReflection(null);
                                                        setReplyText("");
                                                      }
                                                    }}
                                                    placeholder="Reply to continue the conversation..."
                                                    className="w-full px-3 py-2 bg-background/50 border border-border/20 rounded-md text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-muted-foreground/30 transition-colors"
                                                  />
                                                  <p className="text-xs text-muted-foreground/50 mt-1">
                                                    Press Enter to send, Esc to cancel
                                                  </p>
                                                </div>
                                              )}
                                          </div>
                                        ))}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
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
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <JournalSidebar logEntries={logEntries} onMomentClick={(id) => handleEditMoment(id, true)} />
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

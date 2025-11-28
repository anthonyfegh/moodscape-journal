import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import {
  getJournalById,
  getSubJournalById,
  getMoments,
  saveMoment,
  updateJournal,
  updateSubJournal,
} from "@/lib/localStorage";

// Import all existing journal components
import { LivingBackground } from "@/components/LivingBackground";
import { PersonaWithThoughts } from "@/components/PersonaWithThoughts";
import { LogTextArea } from "@/components/LogTextArea";
import { MicroComments } from "@/components/MicroComments";
import { EmotionalInkTrails } from "@/components/EmotionalInkTrails";
import { EmotionalRipple } from "@/components/EmotionalRipple";
import { JournalSidebar } from "@/components/JournalSidebar";

interface Moment {
  id: string;
  text: string;
  emotion: string;
  color: string;
  timestamp: string;
}

interface SubJournal {
  id: string;
  name: string;
}

interface Journal {
  id: string;
  name: string;
}

export default function Writing() {
  const { journalId, subJournalId } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [subJournal, setSubJournal] = useState<SubJournal | null>(null);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [currentColor, setCurrentColor] = useState("#FCD34D");
  const [currentEmotion, setCurrentEmotion] = useState("");
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [caretPosition, setCaretPosition] = useState<{ x: number; y: number } | null>(null);
  const [microComments] = useState<string[]>([
    "What a beautiful thought...",
    "I sense something deep here.",
    "This feels important.",
  ]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!journalId || !subJournalId) return;

    const journalData = getJournalById(journalId);
    setJournal(journalData);

    const subJournalData = getSubJournalById(subJournalId);
    setSubJournal(subJournalData);

    const momentsData = getMoments(subJournalId);
    setMoments(momentsData);
  }, [journalId, subJournalId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCurrentText(text);
    setIsTyping(true);

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to detect when typing stops
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
    setTypingTimeout(timeout);

    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      setRecentWords(words.slice(-10));
    }

    // Track caret position (simplified - center of textarea)
    const textarea = e.target;
    const rect = textarea.getBoundingClientRect();
    setCaretPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  const handleSaveMoment = () => {
    if (!currentText.trim() || !subJournalId || !journalId) return;

    const newMoment = saveMoment({
      sub_journal_id: subJournalId,
      text: currentText,
      emotion: currentEmotion,
      color: currentColor,
    });

    setMoments([...moments, newMoment]);
    setCurrentText("");
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 2000);

    // Update timestamps
    updateSubJournal(subJournalId, { updated_at: new Date().toISOString() });
    updateJournal(journalId, {
      updated_at: new Date().toISOString(),
      last_mood_color: currentColor,
    });

    toast.success("Moment saved");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveMoment();
    }
  };

  const handleMomentClick = (momentId: string) => {
    const moment = moments.find((m) => m.id === momentId);
    if (moment) {
      setCurrentText(moment.text);
      setCurrentColor(moment.color);
      setCurrentEmotion(moment.emotion);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <LivingBackground
        moodColor={currentColor}
        isTyping={isTyping}
        rippleActive={showRipple}
      />

      <EmotionalInkTrails
        isTyping={isTyping}
        moodColor={currentColor}
        caretPosition={caretPosition}
      />
      <EmotionalRipple isActive={showRipple} moodColor={currentColor} />

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(`/journal/${journalId}`)}
            className="gap-2 bg-background/20 backdrop-blur-md hover:bg-background/30"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="text-sm text-foreground/80 bg-background/20 backdrop-blur-md px-4 py-2 rounded-lg">
            {journal?.name} → {subJournal?.name}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-3xl">
            <div className="relative">
              <LogTextArea
                currentText={currentText}
                currentColor={currentColor}
                onTextChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Continue writing..."
              />
              <MicroComments
                comments={microComments}
                isTyping={isTyping}
              />
            </div>
          </div>
        </div>

        <PersonaWithThoughts
          isThinking={isTyping}
          recentWords={recentWords}
          moodColor={currentColor}
          personaState={currentEmotion || "neutral"}
          logEntries={moments.map((m) => ({
            id: m.id,
            text: m.text,
            emotion: m.emotion,
            color: m.color,
            timestamp: new Date(m.timestamp),
          }))}
          isTyping={isTyping}
        />

        <JournalSidebar
          logEntries={moments.map((m) => ({
            id: m.id,
            text: m.text,
            emotion: m.emotion,
            color: m.color,
            timestamp: new Date(m.timestamp),
          }))}
          onMomentClick={handleMomentClick}
        />
      </div>
    </div>
  );
}

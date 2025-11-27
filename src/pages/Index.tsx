import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MicroComments } from "@/components/MicroComments";
import { MemoryBubbles } from "@/components/MemoryBubbles";
import { ReadingSidebar } from "@/components/ReadingSidebar";
import { toast } from "sonner";
import { Save, CheckCircle } from "lucide-react";

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
      
      <div className="h-screen flex flex-col p-8">
        <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
          <h1 className="text-3xl font-serif font-bold mb-2 text-foreground">
            Your Journal
          </h1>
          <p className="text-muted-foreground mb-6">
            Write freely, and watch your emotions come alive
          </p>
          
          <div className="relative flex-1 mb-4">
            <Textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Start writing your thoughts..."
              className="w-full h-full resize-none bg-card/50 backdrop-blur-sm rounded-lg p-8 text-lg leading-relaxed transition-all duration-700 focus:outline-none"
              style={{
                borderWidth: '3px',
                borderColor: moodColor,
                boxShadow: `0 0 20px ${moodColor}20`,
              }}
            />
            
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
      </div>
    </div>
  );
};

export default Index;

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PersonaAvatar } from "@/components/PersonaAvatar";
import { MoodGradient } from "@/components/MoodGradient";
import { TraitSliders, Traits } from "@/components/TraitSliders";
import { RadarChart, RadarData } from "@/components/RadarChart";
import { MicroComments } from "@/components/MicroComments";
import { MemoryBubbles } from "@/components/MemoryBubbles";
import { PersonaStateLabel } from "@/components/PersonaStateLabel";
import { toast } from "sonner";
import { Save, CheckCircle } from "lucide-react";

const Index = () => {
  const [text, setText] = useState("");
  const [moodColor, setMoodColor] = useState("#4ade80");
  const [traits, setTraits] = useState<Traits>({
    calm: 50,
    open: 50,
    confident: 50,
    emotional: 50,
  });
  const [radarData, setRadarData] = useState<RadarData>({
    expression: 50,
    depth: 50,
    clarity: 50,
    introspection: 50,
    energy: 50,
  });
  const [microComments, setMicroComments] = useState<string[]>([]);
  const [memoryBubble, setMemoryBubble] = useState<string | null>(null);
  const [personaState, setPersonaState] = useState("neutral");
  const [wordFrequency, setWordFrequency] = useState<Map<string, number>>(new Map());

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

    // Update traits based on text characteristics
    const wordCount = words.length;
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / (wordCount || 1);
    const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const questionCount = (content.match(/\?/g) || []).length;
    const exclamationCount = (content.match(/!/g) || []).length;

    setTraits({
      calm: Math.min(100, Math.max(0, 70 - (exclamationCount * 10) - (angryScore * 15))),
      open: Math.min(100, Math.max(0, 30 + (questionCount * 10) + (avgWordLength * 5))),
      confident: Math.min(100, Math.max(0, 40 + (wordCount / 5) - (anxiousScore * 10))),
      emotional: Math.min(100, Math.max(0, 30 + (joyScore + sadScore) * 10 + exclamationCount * 5)),
    });

    // Update radar data
    setRadarData({
      expression: Math.min(100, 30 + wordCount / 2),
      depth: Math.min(100, avgWordLength * 8),
      clarity: Math.min(100, 50 + (sentenceCount / (wordCount || 1)) * 100),
      introspection: Math.min(100, 20 + questionCount * 15),
      energy: Math.min(100, 30 + exclamationCount * 10 + joyScore * 10),
    });

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
    
    if (newText.length > 10) {
      analyzeMood(newText);
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
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="h-screen flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-card border-r border-border overflow-y-auto">
          <div className="py-6 space-y-6">
            <PersonaAvatar moodColor={moodColor} />
            <MoodGradient moodColor={moodColor} />
            <PersonaStateLabel state={personaState} />
            <TraitSliders traits={traits} />
            <RadarChart data={radarData} />
          </div>
        </div>

        {/* Main Writing Area */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 p-8 overflow-hidden">
            <div className="max-w-4xl mx-auto h-full">
              <h1 className="text-3xl font-serif font-bold mb-2 text-foreground">
                Your Journal
              </h1>
              <p className="text-muted-foreground mb-6">
                Write freely, and watch your emotions come alive
              </p>
              
              <div className="relative h-[calc(100%-8rem)]">
                <Textarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Start writing your thoughts..."
                  className="w-full h-full resize-none bg-card/50 backdrop-blur-sm border-2 border-border/50 rounded-lg p-6 text-lg leading-relaxed focus:border-primary/50 transition-colors duration-300"
                />
                
                <MicroComments comments={microComments} />
                <MemoryBubbles memory={memoryBubble} />
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto flex justify-end gap-3">
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
    </div>
  );
};

export default Index;

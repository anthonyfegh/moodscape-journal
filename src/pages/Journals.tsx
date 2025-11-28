import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, Clock, BookText, Lightbulb, Users, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { journalStorage, Journal, JournalType } from "@/lib/journalStorage";
import { LivingBackground } from "@/components/LivingBackground";
import { JournalTypeSelector } from "@/components/JournalTypeSelector";
import { DailyLogWeekly } from "@/components/DailyLogWeekly";

const journalTypeIcons = {
  daily: BookText,
  themed: Lightbulb,
  people: Users,
  event: Zap,
  creative: Sparkles,
};

const journalTypeLabels: Record<JournalType, string> = {
  daily: "Daily Logs",
  themed: "Themed Journals",
  people: "People Journals",
  event: "Event Journals",
  creative: "Creative Journals",
};

const Journals = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newJournalName, setNewJournalName] = useState("");
  const [selectedType, setSelectedType] = useState<JournalType>("daily");

  useEffect(() => {
    journalStorage.getJournals().then(setJournals);
  }, []);

  // Group journals by type
  const journalsByType = journals.reduce((acc, journal) => {
    if (!acc[journal.type]) {
      acc[journal.type] = [];
    }
    acc[journal.type].push(journal);
    return acc;
  }, {} as Record<JournalType, Journal[]>);

  const handleCreateJournal = async () => {
    if (newJournalName.trim()) {
      const newJournal = await journalStorage.createJournal(newJournalName.trim(), selectedType);
      const updatedJournals = await journalStorage.getJournals();
      setJournals(updatedJournals);
      setNewJournalName("");
      setSelectedType("daily");
      setIsCreating(false);
      navigate(`/journal/${newJournal.id}`);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen flex w-full relative"
    >
      <LivingBackground moodColor="#fbbf24" isTyping={false} rippleActive={false} />

      <div className="flex-1 min-h-screen relative z-10">
        <div className="min-h-screen flex flex-col items-center p-8">
          <div className="max-w-4xl w-full">
            <div className="mb-8">
              <h1 className="text-4xl font-serif font-bold mb-2 text-foreground">Your Journals</h1>
              <p className="text-muted-foreground">Choose a journal to continue writing</p>
            </div>

            <div className="mb-6">
              {isCreating ? (
                <div className="bg-background/60 backdrop-blur-md rounded-lg p-6 shadow-md border border-border/10">
                  <h3 className="text-lg font-medium mb-4 text-foreground">Create New Journal</h3>
                  
                  <JournalTypeSelector
                    selectedType={selectedType}
                    onSelectType={setSelectedType}
                  />
                  
                  <Input
                    value={newJournalName}
                    onChange={(e) => setNewJournalName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateJournal();
                      if (e.key === "Escape") {
                        setIsCreating(false);
                        setNewJournalName("");
                        setSelectedType("daily");
                      }
                    }}
                    placeholder="Journal name..."
                    className="mb-4 bg-background/80 backdrop-blur-sm border-border/40"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateJournal} className="flex-1">
                      Create Journal
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false);
                        setNewJournalName("");
                        setSelectedType("daily");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setIsCreating(true)}
                  className="w-full bg-primary/10 hover:bg-primary/20 backdrop-blur-md border border-border/20"
                  variant="outline"
                  size="lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Journal
                </Button>
              )}
            </div>

            <div className="space-y-8">
              {(["daily", "themed", "people", "event", "creative"] as JournalType[]).map((type) => {
                const typeJournals = journalsByType[type] || [];
                if (typeJournals.length === 0) return null;

                const TypeIcon = journalTypeIcons[type];
                
                return (
                  <div key={type} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <TypeIcon className="h-5 w-5" />
                        <h2>{journalTypeLabels[type]}</h2>
                      </div>
                      <div className="flex-1 h-px bg-border/30"></div>
                    </div>
                    
                    <div className="grid gap-3">
                      {type === "daily" ? (
                        // Special weekly view for daily logs
                        typeJournals.map((journal) => (
                          <DailyLogWeekly
                            key={journal.id}
                            journalId={journal.id}
                            onLogToday={() => navigate(`/journal/${journal.id}`)}
                          />
                        ))
                      ) : (
                        // Regular cards for other journal types
                        typeJournals.map((journal) => {
                          const JournalTypeIcon = journalTypeIcons[journal.type] || BookOpen;
                          
                          return (
                            <Card
                              key={journal.id}
                              className="p-5 cursor-pointer hover:bg-background/70 transition-colors bg-background/60 backdrop-blur-md border-border/10"
                              onClick={() => navigate(`/journal/${journal.id}`)}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: journal.lastMoodColor }}
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base font-semibold truncate text-foreground mb-1">
                                    {journal.name}
                                  </h3>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>Updated {formatDate(journal.updatedAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}

              {journals.length === 0 && !isCreating && (
                <div className="text-center py-12 text-muted-foreground bg-background/40 backdrop-blur-md rounded-lg border border-border/10">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No journals yet</p>
                  <p className="text-sm">Create your first journal to start writing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Journals;

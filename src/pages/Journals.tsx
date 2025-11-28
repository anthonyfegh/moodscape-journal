import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, BookOpen, LogOut } from "lucide-react";
import { motion } from "framer-motion";

interface Journal {
  id: string;
  name: string;
  last_mood_color: string;
  updated_at: string;
}

export default function Journals() {
  const navigate = useNavigate();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newJournalName, setNewJournalName] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    fetchJournals();
  };

  const fetchJournals = async () => {
    try {
      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setJournals(data || []);
    } catch (error: any) {
      toast.error("Failed to load journals");
    } finally {
      setLoading(false);
    }
  };

  const createJournal = async () => {
    if (!newJournalName.trim()) return;

    try {
      const { data, error } = await supabase
        .from("journals")
        .insert({ name: newJournalName, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setJournals([data, ...journals]);
      setNewJournalName("");
      setIsCreating(false);
      toast.success("Journal created");
    } catch (error: any) {
      toast.error("Failed to create journal");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#c0b6ac" }}>
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#c0b6ac" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-foreground">My Journals</h1>
          <Button variant="ghost" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {isCreating ? (
          <Card className="mb-6 bg-background/80 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle>New Journal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Journal name..."
                value={newJournalName}
                onChange={(e) => setNewJournalName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createJournal()}
                autoFocus
                className="bg-card/50"
              />
              <div className="flex gap-2">
                <Button onClick={createJournal}>Create</Button>
                <Button variant="ghost" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setIsCreating(true)} className="mb-6 gap-2">
            <Plus className="h-4 w-4" />
            New Journal
          </Button>
        )}

        <div className="grid gap-4">
          {journals.map((journal) => (
            <motion.div
              key={journal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="cursor-pointer bg-background/80 backdrop-blur-xl border-border/50 hover:shadow-xl transition-all"
                onClick={() => navigate(`/journal/${journal.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-3 h-3 rounded-full shadow-lg"
                        style={{
                          backgroundColor: journal.last_mood_color,
                          boxShadow: `0 0 10px ${journal.last_mood_color}40`,
                        }}
                      />
                      <div>
                        <h3 className="text-xl font-medium text-foreground flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          {journal.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Last updated: {new Date(journal.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {journals.length === 0 && !isCreating && (
          <Card className="bg-background/80 backdrop-blur-xl border-border/50">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No journals yet. Create your first one!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

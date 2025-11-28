import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, ChevronLeft, Book } from "lucide-react";
import { motion } from "framer-motion";

interface SubJournal {
  id: string;
  name: string;
  updated_at: string;
}

interface Journal {
  id: string;
  name: string;
}

export default function JournalDetail() {
  const { journalId } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [subJournals, setSubJournals] = useState<SubJournal[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newSubJournalName, setNewSubJournalName] = useState("");
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
    fetchData();
  };

  const fetchData = async () => {
    try {
      // Fetch journal
      const { data: journalData, error: journalError } = await supabase
        .from("journals")
        .select("*")
        .eq("id", journalId)
        .single();

      if (journalError) throw journalError;
      setJournal(journalData);

      // Fetch sub-journals
      const { data: subJournalsData, error: subJournalsError } = await supabase
        .from("sub_journals")
        .select("*")
        .eq("journal_id", journalId)
        .order("updated_at", { ascending: false });

      if (subJournalsError) throw subJournalsError;
      setSubJournals(subJournalsData || []);
    } catch (error: any) {
      toast.error("Failed to load journal");
    } finally {
      setLoading(false);
    }
  };

  const createSubJournal = async () => {
    if (!newSubJournalName.trim()) return;

    try {
      const { data, error } = await supabase
        .from("sub_journals")
        .insert({
          name: newSubJournalName,
          journal_id: journalId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setSubJournals([data, ...subJournals]);
      setNewSubJournalName("");
      setIsCreating(false);
      toast.success("Sub-journal created");
    } catch (error: any) {
      toast.error("Failed to create sub-journal");
    }
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
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/journals")} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Journals
          </Button>
        </div>

        <h1 className="text-4xl font-serif text-foreground mb-8 flex items-center gap-3">
          <Book className="h-8 w-8" />
          {journal?.name}
        </h1>

        {isCreating ? (
          <Card className="mb-6 bg-background/80 backdrop-blur-xl border-border/50 p-6">
            <Input
              placeholder="Sub-journal name..."
              value={newSubJournalName}
              onChange={(e) => setNewSubJournalName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createSubJournal()}
              autoFocus
              className="mb-4 bg-card/50"
            />
            <div className="flex gap-2">
              <Button onClick={createSubJournal}>Create</Button>
              <Button variant="ghost" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        ) : (
          <Button onClick={() => setIsCreating(true)} className="mb-6 gap-2">
            <Plus className="h-4 w-4" />
            New Sub-Journal
          </Button>
        )}

        <div className="grid gap-4">
          {subJournals.map((subJournal) => (
            <motion.div
              key={subJournal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="cursor-pointer bg-background/80 backdrop-blur-xl border-border/50 hover:shadow-xl transition-all p-6"
                onClick={() => navigate(`/journal/${journalId}/${subJournal.id}`)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium text-foreground">{subJournal.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(subJournal.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {subJournals.length === 0 && !isCreating && (
          <Card className="bg-background/80 backdrop-blur-xl border-border/50 p-12 text-center">
            <p className="text-muted-foreground">No sub-journals yet. Create your first one!</p>
          </Card>
        )}
      </div>
    </div>
  );
}

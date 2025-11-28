import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, X } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { journalStorage, Journal } from "@/lib/journalStorage";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ManageJournalsSidebar = () => {
  const navigate = useNavigate();
  const { setOpen } = useSidebar();
  const [journals, setJournals] = useState<Journal[]>(journalStorage.getJournals());
  const [isCreating, setIsCreating] = useState(false);
  const [newJournalName, setNewJournalName] = useState("");

  const handleCreateJournal = () => {
    if (newJournalName.trim()) {
      const newJournal = journalStorage.createJournal(newJournalName.trim());
      setJournals(journalStorage.getJournals());
      setNewJournalName("");
      setIsCreating(false);
      navigate(`/journal/${newJournal.id}`);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Sidebar className="border-l border-border/20 bg-background/20 backdrop-blur-2xl" collapsible="offcanvas">
      <SidebarHeader className="p-4 border-b border-border/20">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">Journals</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-6 w-6 p-0 hover:bg-background/40"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="w-full bg-primary/10 hover:bg-primary/20 text-foreground"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Journal
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-muted-foreground px-4 py-2">
              Your Journals
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {isCreating && (
                <div className="px-4 py-2 space-y-2">
                  <Input
                    value={newJournalName}
                    onChange={(e) => setNewJournalName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateJournal();
                      if (e.key === "Escape") {
                        setIsCreating(false);
                        setNewJournalName("");
                      }
                    }}
                    placeholder="Journal name..."
                    className="bg-background/60 backdrop-blur-sm border-border/40"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCreateJournal} className="flex-1">
                      Create
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsCreating(false);
                        setNewJournalName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <SidebarMenu>
                {journals.map((journal) => (
                  <SidebarMenuItem key={journal.id}>
                    <SidebarMenuButton
                      onClick={() => navigate(`/journal/${journal.id}`)}
                      className="group hover:bg-background/40 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: journal.lastMoodColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                            <p className="font-medium text-sm truncate">{journal.name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(journal.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {journals.length === 0 && !isCreating && (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No journals yet. Create your first one!
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
};

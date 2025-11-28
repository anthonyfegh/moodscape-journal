import { supabase } from "@/integrations/supabase/client";

export type JournalType = "daily" | "themed" | "people" | "event" | "creative";

export interface Journal {
  id: string;
  name: string;
  type: JournalType;
  lastMoodColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubJournal {
  id: string;
  journalId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Moment {
  id: string;
  subJournalId: string;
  text: string;
  emotion: string;
  color: string;
  timestamp: string;
}

export const journalStorage = {
  // Journals
  async getJournals(): Promise<Journal[]> {
    const { data, error } = await supabase
      .from("journals")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching journals:", error);
      return [];
    }

    return (data || []).map((j) => ({
      id: j.id,
      name: j.name,
      type: (j.type || "daily") as JournalType,
      lastMoodColor: j.last_mood_color || "#fbbf24",
      createdAt: j.created_at || new Date().toISOString(),
      updatedAt: j.updated_at || new Date().toISOString(),
    }));
  },

  async getJournal(id: string): Promise<Journal | undefined> {
    const { data, error } = await supabase
      .from("journals")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      console.error("Error fetching journal:", error);
      return undefined;
    }

    return {
      id: data.id,
      name: data.name,
      type: (data.type || "daily") as JournalType,
      lastMoodColor: data.last_mood_color || "#fbbf24",
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
    };
  },

  async createJournal(name: string, type: JournalType = "daily"): Promise<Journal> {
    const { data, error } = await supabase
      .from("journals")
      .insert({
        name,
        type,
        last_mood_color: "#fbbf24",
        user_id: null,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Error creating journal:", error);
      throw new Error("Failed to create journal");
    }

    return {
      id: data.id,
      name: data.name,
      type: (data.type || "daily") as JournalType,
      lastMoodColor: data.last_mood_color || "#fbbf24",
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
    };
  },

  async updateJournal(id: string, updates: Partial<Journal>): Promise<void> {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.lastMoodColor) dbUpdates.last_mood_color = updates.lastMoodColor;

    const { error } = await supabase
      .from("journals")
      .update(dbUpdates)
      .eq("id", id);

    if (error) {
      console.error("Error updating journal:", error);
    }
  },

  async deleteJournal(id: string): Promise<void> {
    // Delete associated sub-journals first
    const subJournals = await this.getSubJournals(id);
    for (const sj of subJournals) {
      await this.deleteSubJournal(sj.id);
    }

    // Delete the journal
    const { error } = await supabase.from("journals").delete().eq("id", id);

    if (error) {
      console.error("Error deleting journal:", error);
    }
  },

  // Sub-Journals
  async getSubJournals(journalId: string): Promise<SubJournal[]> {
    const { data, error } = await supabase
      .from("sub_journals")
      .select("*")
      .eq("journal_id", journalId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching sub-journals:", error);
      return [];
    }

    return (data || []).map((sj) => ({
      id: sj.id,
      journalId: sj.journal_id,
      name: sj.name,
      createdAt: sj.created_at || new Date().toISOString(),
      updatedAt: sj.updated_at || new Date().toISOString(),
    }));
  },

  async getSubJournal(id: string): Promise<SubJournal | undefined> {
    const { data, error } = await supabase
      .from("sub_journals")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      console.error("Error fetching sub-journal:", error);
      return undefined;
    }

    return {
      id: data.id,
      journalId: data.journal_id,
      name: data.name,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
    };
  },

  async createSubJournal(journalId: string, name: string): Promise<SubJournal> {
    const { data, error } = await supabase
      .from("sub_journals")
      .insert({
        journal_id: journalId,
        name,
        user_id: null,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Error creating sub-journal:", error);
      throw new Error("Failed to create sub-journal");
    }

    return {
      id: data.id,
      journalId: data.journal_id,
      name: data.name,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
    };
  },

  async deleteSubJournal(id: string): Promise<void> {
    // Delete associated moments first
    const moments = await this.getMoments(id);
    for (const m of moments) {
      await this.deleteMoment(m.id);
    }

    // Delete the sub-journal
    const { error } = await supabase.from("sub_journals").delete().eq("id", id);

    if (error) {
      console.error("Error deleting sub-journal:", error);
    }
  },

  // Moments
  async getMoments(subJournalId: string): Promise<Moment[]> {
    const { data, error } = await supabase
      .from("moments")
      .select("*")
      .eq("sub_journal_id", subJournalId)
      .order("timestamp", { ascending: true });

    if (error) {
      console.error("Error fetching moments:", error);
      return [];
    }

    return (data || []).map((m) => ({
      id: m.id,
      subJournalId: m.sub_journal_id,
      text: m.text,
      emotion: m.emotion || "",
      color: m.color || "#fbbf24",
      timestamp: m.timestamp || new Date().toISOString(),
    }));
  },

  async createMoment(
    subJournalId: string,
    text: string,
    emotion: string,
    color: string
  ): Promise<Moment> {
    const { data, error } = await supabase
      .from("moments")
      .insert({
        sub_journal_id: subJournalId,
        text,
        emotion,
        color,
        user_id: null,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Error creating moment:", error);
      throw new Error("Failed to create moment");
    }

    return {
      id: data.id,
      subJournalId: data.sub_journal_id,
      text: data.text,
      emotion: data.emotion || "",
      color: data.color || "#fbbf24",
      timestamp: data.timestamp || new Date().toISOString(),
    };
  },

  async updateMoment(id: string, text: string): Promise<void> {
    const { error } = await supabase.from("moments").update({ text }).eq("id", id);

    if (error) {
      console.error("Error updating moment:", error);
    }
  },

  async deleteMoment(id: string): Promise<void> {
    const { error } = await supabase.from("moments").delete().eq("id", id);

    if (error) {
      console.error("Error deleting moment:", error);
    }
  },
};

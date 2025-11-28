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

const JOURNALS_KEY = "journals";
const SUB_JOURNALS_KEY = "subJournals";
const MOMENTS_KEY = "moments";

export const journalStorage = {
  // Journals
  getJournals(): Journal[] {
    const data = localStorage.getItem(JOURNALS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getJournal(id: string): Journal | undefined {
    return this.getJournals().find((j) => j.id === id);
  },

  createJournal(name: string, type: JournalType = "daily"): Journal {
    const journals = this.getJournals();
    const newJournal: Journal = {
      id: Date.now().toString(),
      name,
      type,
      lastMoodColor: "#fbbf24",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    journals.push(newJournal);
    localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
    return newJournal;
  },

  updateJournal(id: string, updates: Partial<Journal>): void {
    const journals = this.getJournals();
    const index = journals.findIndex((j) => j.id === id);
    if (index !== -1) {
      journals[index] = {
        ...journals[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
    }
  },

  deleteJournal(id: string): void {
    const journals = this.getJournals().filter((j) => j.id !== id);
    localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
    
    // Delete associated sub-journals and moments
    const subJournals = this.getSubJournals(id);
    subJournals.forEach((sj) => this.deleteSubJournal(sj.id));
  },

  // Sub-Journals
  getSubJournals(journalId: string): SubJournal[] {
    const data = localStorage.getItem(SUB_JOURNALS_KEY);
    const all: SubJournal[] = data ? JSON.parse(data) : [];
    return all.filter((sj) => sj.journalId === journalId);
  },

  getSubJournal(id: string): SubJournal | undefined {
    const data = localStorage.getItem(SUB_JOURNALS_KEY);
    const all: SubJournal[] = data ? JSON.parse(data) : [];
    return all.find((sj) => sj.id === id);
  },

  createSubJournal(journalId: string, name: string): SubJournal {
    const data = localStorage.getItem(SUB_JOURNALS_KEY);
    const subJournals: SubJournal[] = data ? JSON.parse(data) : [];
    const newSubJournal: SubJournal = {
      id: Date.now().toString(),
      journalId,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    subJournals.push(newSubJournal);
    localStorage.setItem(SUB_JOURNALS_KEY, JSON.stringify(subJournals));
    return newSubJournal;
  },

  deleteSubJournal(id: string): void {
    const data = localStorage.getItem(SUB_JOURNALS_KEY);
    const subJournals: SubJournal[] = data ? JSON.parse(data) : [];
    const filtered = subJournals.filter((sj) => sj.id !== id);
    localStorage.setItem(SUB_JOURNALS_KEY, JSON.stringify(filtered));
    
    // Delete associated moments
    const moments = this.getMoments(id);
    moments.forEach((m) => this.deleteMoment(m.id));
  },

  // Moments
  getMoments(subJournalId: string): Moment[] {
    const data = localStorage.getItem(MOMENTS_KEY);
    const all: Moment[] = data ? JSON.parse(data) : [];
    return all.filter((m) => m.subJournalId === subJournalId);
  },

  createMoment(subJournalId: string, text: string, emotion: string, color: string): Moment {
    const data = localStorage.getItem(MOMENTS_KEY);
    const moments: Moment[] = data ? JSON.parse(data) : [];
    const newMoment: Moment = {
      id: Date.now().toString(),
      subJournalId,
      text,
      emotion,
      color,
      timestamp: new Date().toISOString(),
    };
    moments.push(newMoment);
    localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments));
    return newMoment;
  },

  updateMoment(id: string, text: string): void {
    const data = localStorage.getItem(MOMENTS_KEY);
    const moments: Moment[] = data ? JSON.parse(data) : [];
    const index = moments.findIndex((m) => m.id === id);
    if (index !== -1) {
      moments[index].text = text;
      localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments));
    }
  },

  deleteMoment(id: string): void {
    const data = localStorage.getItem(MOMENTS_KEY);
    const moments: Moment[] = data ? JSON.parse(data) : [];
    const filtered = moments.filter((m) => m.id !== id);
    localStorage.setItem(MOMENTS_KEY, JSON.stringify(filtered));
  },
};

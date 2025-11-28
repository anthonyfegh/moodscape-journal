interface Journal {
  id: string;
  name: string;
  last_mood_color: string;
  updated_at: string;
}

interface SubJournal {
  id: string;
  journal_id: string;
  name: string;
  updated_at: string;
}

interface Moment {
  id: string;
  sub_journal_id: string;
  text: string;
  emotion: string;
  color: string;
  timestamp: string;
}

const JOURNALS_KEY = "journals";
const SUB_JOURNALS_KEY = "sub_journals";
const MOMENTS_KEY = "moments";

// Journals
export const getJournals = (): Journal[] => {
  const data = localStorage.getItem(JOURNALS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveJournal = (journal: Omit<Journal, "id" | "updated_at">): Journal => {
  const journals = getJournals();
  const newJournal: Journal = {
    id: Date.now().toString(),
    ...journal,
    updated_at: new Date().toISOString(),
  };
  journals.push(newJournal);
  localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
  return newJournal;
};

export const updateJournal = (id: string, updates: Partial<Journal>): void => {
  const journals = getJournals();
  const index = journals.findIndex((j) => j.id === id);
  if (index !== -1) {
    journals[index] = { ...journals[index], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
  }
};

export const getJournalById = (id: string): Journal | null => {
  const journals = getJournals();
  return journals.find((j) => j.id === id) || null;
};

// Sub-journals
export const getSubJournals = (journalId: string): SubJournal[] => {
  const data = localStorage.getItem(SUB_JOURNALS_KEY);
  const all: SubJournal[] = data ? JSON.parse(data) : [];
  return all.filter((sj) => sj.journal_id === journalId);
};

export const saveSubJournal = (subJournal: Omit<SubJournal, "id" | "updated_at">): SubJournal => {
  const data = localStorage.getItem(SUB_JOURNALS_KEY);
  const all: SubJournal[] = data ? JSON.parse(data) : [];
  const newSubJournal: SubJournal = {
    id: Date.now().toString(),
    ...subJournal,
    updated_at: new Date().toISOString(),
  };
  all.push(newSubJournal);
  localStorage.setItem(SUB_JOURNALS_KEY, JSON.stringify(all));
  return newSubJournal;
};

export const updateSubJournal = (id: string, updates: Partial<SubJournal>): void => {
  const data = localStorage.getItem(SUB_JOURNALS_KEY);
  const all: SubJournal[] = data ? JSON.parse(data) : [];
  const index = all.findIndex((sj) => sj.id === id);
  if (index !== -1) {
    all[index] = { ...all[index], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(SUB_JOURNALS_KEY, JSON.stringify(all));
  }
};

export const getSubJournalById = (id: string): SubJournal | null => {
  const data = localStorage.getItem(SUB_JOURNALS_KEY);
  const all: SubJournal[] = data ? JSON.parse(data) : [];
  return all.find((sj) => sj.id === id) || null;
};

// Moments
export const getMoments = (subJournalId: string): Moment[] => {
  const data = localStorage.getItem(MOMENTS_KEY);
  const all: Moment[] = data ? JSON.parse(data) : [];
  return all.filter((m) => m.sub_journal_id === subJournalId);
};

export const saveMoment = (moment: Omit<Moment, "id" | "timestamp">): Moment => {
  const data = localStorage.getItem(MOMENTS_KEY);
  const all: Moment[] = data ? JSON.parse(data) : [];
  const newMoment: Moment = {
    id: Date.now().toString(),
    ...moment,
    timestamp: new Date().toISOString(),
  };
  all.push(newMoment);
  localStorage.setItem(MOMENTS_KEY, JSON.stringify(all));
  return newMoment;
};

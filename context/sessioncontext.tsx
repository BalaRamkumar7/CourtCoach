import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { SessionSummary } from '../services/claude';

export interface SessionRecord {
  id: string;
  drill: string;
  skill: string;
  date: number;
  tips: string[];
  summary: SessionSummary | null;
}

interface SessionContextType {
  feedbackHistory: string[];
  sessionHistory: SessionRecord[];
  addFeedback: (feedback: string) => void;
  saveSession: (drill: string, skill: string, tips: string[]) => string;
  updateSessionSummary: (id: string, summary: SessionSummary) => void;
  resetSession: () => void;
}

const STORAGE_KEY = 'courtcoach_sessions';

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [feedbackHistory, setFeedbackHistory] = useState<string[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setSessionHistory(JSON.parse(raw));
    });
  }, []);

  function persist(records: SessionRecord[]) {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function addFeedback(feedback: string) {
    setFeedbackHistory((prev) => [...prev, feedback]);
  }

  function saveSession(drill: string, skill: string, tips: string[]): string {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const record: SessionRecord = {
      id,
      drill,
      skill,
      date: Date.now(),
      tips,
      summary: null,
    };
    setSessionHistory((prev) => {
      const updated = [record, ...prev];
      persist(updated);
      return updated;
    });
    return id;
  }

  function updateSessionSummary(id: string, summary: SessionSummary) {
    setSessionHistory((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, summary } : s));
      persist(updated);
      return updated;
    });
  }

  function resetSession() {
    setFeedbackHistory([]);
  }

  return (
    <SessionContext.Provider
      value={{
        feedbackHistory,
        sessionHistory,
        addFeedback,
        saveSession,
        updateSessionSummary,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider');
  return context;
}

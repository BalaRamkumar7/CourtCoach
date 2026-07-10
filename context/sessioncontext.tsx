import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { SessionSummary } from '../services/claude';
import { averageMetrics, computeRating, PoseMetrics, RatingLabel } from '../services/metrics';

export interface SessionRecord {
  id: string;
  drill: string;
  skill: string;
  date: number;
  tips: string[];
  summary: SessionSummary | null;
  avgMetrics: PoseMetrics | null;
  rating: RatingLabel | null;
}

interface SessionContextType {
  feedbackHistory: string[];
  sessionHistory: SessionRecord[];
  addFeedback: (tip: string, metrics: PoseMetrics) => void;
  saveSession: (drill: string, skill: string) => { id: string; rating: RatingLabel | null; avgMetrics: PoseMetrics | null };
  updateSessionSummary: (id: string, summary: SessionSummary) => void;
  resetSession: () => void;
}

const STORAGE_KEY = 'courtcoach_sessions';

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [feedbackHistory, setFeedbackHistory] = useState<string[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);
  const metricsListRef = useRef<PoseMetrics[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setSessionHistory(JSON.parse(raw));
    });
  }, []);

  function persist(records: SessionRecord[]) {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function addFeedback(tip: string, metrics: PoseMetrics) {
    setFeedbackHistory((prev) => [...prev, tip]);
    metricsListRef.current.push(metrics);
  }

  function saveSession(drill: string, skill: string): { id: string; rating: RatingLabel | null } {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const tips = [...feedbackHistory];
    const metricsList = [...metricsListRef.current];
    const avg = metricsList.length > 0 ? averageMetrics(metricsList) : null;
    const rating = avg ? computeRating(avg, drill) : null;
    const record: SessionRecord = {
      id,
      drill,
      skill,
      date: Date.now(),
      tips,
      summary: null,
      avgMetrics: avg,
      rating,
    };
    setSessionHistory((prev) => {
      const updated = [record, ...prev];
      persist(updated);
      return updated;
    });
    return { id, rating, avgMetrics: avg };
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
    metricsListRef.current = [];
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

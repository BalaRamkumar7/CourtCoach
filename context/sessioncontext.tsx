import {
    createContext,
    ReactNode,
    useContext,
    useState,
} from 'react';

interface SessionContextType {
  feedbackHistory: string[];

  addFeedback: (feedback: string) => void;

  resetSession: () => void;
}

const SessionContext = createContext<
  SessionContextType | undefined
>(undefined);

export function SessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [feedbackHistory, setFeedbackHistory] =
    useState<string[]>([]);

  function addFeedback(feedback: string) {
    setFeedbackHistory((prev) => [...prev, feedback]);
  }

  function resetSession() {
    setFeedbackHistory([]);
  }

  return (
    <SessionContext.Provider
      value={{
        feedbackHistory,
        addFeedback,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      'useSession must be used inside SessionProvider'
    );
  }

  return context;
}
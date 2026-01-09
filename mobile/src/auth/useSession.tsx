import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadSession, saveSession, clearSession, MobileSession } from "./session";
import { exchangeSession, refreshSession, revokeSession } from "./api";

type SessionContextValue = {
  session: MobileSession | null;
  loading: boolean;
  setSessionData: (next: MobileSession) => Promise<void>;
  exchange: () => Promise<MobileSession>;
  refresh: () => Promise<MobileSession | null>;
  revoke: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MobileSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession()
      .then((stored) => setSession(stored))
      .finally(() => setLoading(false));
  }, []);

  const setSessionData = async (next: MobileSession) => {
    await saveSession(next);
    setSession(next);
  };

  const exchange = async () => {
    const next = await exchangeSession();
    await setSessionData(next);
    return next;
  };

  const refresh = async () => {
    if (!session) {
      return null;
    }
    const next = await refreshSession(session.token);
    await setSessionData(next);
    return next;
  };

  const revoke = async () => {
    if (!session) {
      return;
    }
    await revokeSession(session.token);
    await clearSession();
    setSession(null);
  };

  const value = useMemo(
    () => ({
      session,
      loading,
      setSessionData,
      exchange,
      refresh,
      revoke
    }),
    [session, loading]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}

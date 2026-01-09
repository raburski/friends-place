import { useEffect, useState } from "react";
import { loadSession, saveSession, clearSession, MobileSession } from "./session";
import { exchangeSession, refreshSession, revokeSession } from "./api";

export function useSession() {
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

  return {
    session,
    loading,
    setSessionData,
    exchange,
    refresh,
    revoke
  };
}

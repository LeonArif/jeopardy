"use client";

import { useEffect, useState } from "react";
import type { Session } from "@/lib/types";
import { listenSession } from "@/lib/firestore/sessions";

const useSession = (sessionCode?: string, enabled: boolean = true) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sessionCode || !enabled) {
      setSession(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = listenSession(sessionCode, (data) => {
      setSession(data);
      setLoading(false);
    });
    return () => unsub();
  }, [sessionCode, enabled]);

  return { session, loading };
};

export default useSession;

"use client";

import { useEffect, useState } from "react";
import type { Player } from "@/lib/types";
import { listenPlayers } from "@/lib/firestore/sessions";

const usePlayers = (sessionCode?: string, enabled: boolean = true) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sessionCode || !enabled) {
      setPlayers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = listenPlayers(sessionCode, (data) => {
      setPlayers(data);
      setLoading(false);
    });
    return () => unsub();
  }, [sessionCode, enabled]);

  return { players, loading };
};

export default usePlayers;

"use client";

import { useEffect, useState } from "react";
import type { GameTemplate } from "@/lib/types";
import { listenTemplatesByOwner } from "@/lib/firestore/templates";

const useTemplates = (ownerUid?: string) => {
  const [templates, setTemplates] = useState<GameTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!ownerUid) {
      setTemplates([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = listenTemplatesByOwner(ownerUid, (data) => {
      setTemplates(data);
      setLoading(false);
    });
    return () => unsub();
  }, [ownerUid]);

  return { templates, loading };
};

export default useTemplates;

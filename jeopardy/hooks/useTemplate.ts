"use client";

import { useEffect, useState } from "react";
import type { GameTemplate } from "@/lib/types";
import { listenTemplate } from "@/lib/firestore/templates";

const useTemplate = (templateId?: string) => {
  const [template, setTemplate] = useState<GameTemplate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!templateId) {
      setTemplate(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = listenTemplate(templateId, (data) => {
      setTemplate(data);
      setLoading(false);
    });
    return () => unsub();
  }, [templateId]);

  return { template, loading };
};

export default useTemplate;

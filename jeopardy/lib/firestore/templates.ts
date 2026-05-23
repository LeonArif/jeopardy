import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { GameTemplate } from "@/lib/types";
import { buildEmptyCells, isBoardComplete } from "@/lib/utils/cellHelpers";

export const createTemplate = async (
  ownerUid: string,
  title: string,
  rows: number,
  cols: number
): Promise<string> => {
  const cells = buildEmptyCells(rows, cols);
  const docRef = await addDoc(collection(db, "gameTemplates"), {
    ownerUid,
    title,
    rows,
    cols,
    pointValues: Array.from({ length: rows }, (_, idx) => (idx + 1) * 100),
    categories: Array.from({ length: cols }, () => ""),
    cells,
    isComplete: isBoardComplete(cells, rows, cols),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const listenTemplate = (
  templateId: string,
  onData: (template: GameTemplate | null) => void
): Unsubscribe => {
  return onSnapshot(doc(db, "gameTemplates", templateId), (snap) => {
    if (!snap.exists()) {
      onData(null);
      return;
    }
    onData({ id: snap.id, ...(snap.data() as Omit<GameTemplate, "id">) });
  });
};

export const listenTemplatesByOwner = (
  ownerUid: string,
  onData: (templates: GameTemplate[]) => void
): Unsubscribe => {
  const q = query(collection(db, "gameTemplates"), where("ownerUid", "==", ownerUid));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<GameTemplate, "id">),
    }));
    onData(data);
  });
};

export const updateTemplate = async (
  templateId: string,
  template: Omit<GameTemplate, "id" | "createdAt" | "updatedAt">
): Promise<void> => {
  await updateDoc(doc(db, "gameTemplates", templateId), {
    ...template,
    isComplete: isBoardComplete(template.cells, template.rows, template.cols),
    updatedAt: serverTimestamp(),
  });
};

export const deleteTemplate = async (templateId: string): Promise<void> => {
  await deleteDoc(doc(db, "gameTemplates", templateId));
};

export const fetchTemplate = async (templateId: string): Promise<GameTemplate | null> => {
  const snap = await getDoc(doc(db, "gameTemplates", templateId));
  if (!snap.exists()) {
    return null;
  }
  return { id: snap.id, ...(snap.data() as Omit<GameTemplate, "id">) };
};

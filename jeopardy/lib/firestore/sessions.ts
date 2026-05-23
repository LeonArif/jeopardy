import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CellState, Player, Session } from "@/lib/types";
import { generateUniqueCode } from "@/lib/utils/generateCode";

const buildCellStates = (rows: number, cols: number): Record<string, CellState> => {
  const states: Record<string, CellState> = {};
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      states[`${r}-${c}`] = "hidden";
    }
  }
  return states;
};

export const createSession = async (
  templateId: string,
  hostUid: string,
  rows: number,
  cols: number
): Promise<string> => {
  const sessionCode = await generateUniqueCode(db);
  const cellStates = buildCellStates(rows, cols);
  await setDoc(doc(db, "sessions", sessionCode), {
    sessionCode,
    templateId,
    hostUid,
    status: "waiting",
    currentCell: null,
    cellStates,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return sessionCode;
};

export const fetchSession = async (sessionCode: string): Promise<Session | null> => {
  const snap = await getDoc(doc(db, "sessions", sessionCode));
  if (!snap.exists()) {
    return null;
  }
  return { sessionCode: snap.id, ...(snap.data() as Omit<Session, "sessionCode">) };
};

export const listenSession = (
  sessionCode: string,
  onData: (session: Session | null) => void
): Unsubscribe => {
  return onSnapshot(doc(db, "sessions", sessionCode), (snap) => {
    if (!snap.exists()) {
      onData(null);
      return;
    }
    onData({ sessionCode: snap.id, ...(snap.data() as Omit<Session, "sessionCode">) });
  });
};

export const updateSessionCell = async (
  sessionCode: string,
  cellKey: string,
  nextState: CellState
): Promise<void> => {
  await updateDoc(doc(db, "sessions", sessionCode), {
    [`cellStates.${cellKey}`]: nextState,
    currentCell: cellKey,
    status: "playing",
    updatedAt: serverTimestamp(),
  });
};

export const finishSession = async (sessionCode: string): Promise<void> => {
  await deleteDoc(doc(db, "sessions", sessionCode));
};

export const listenPlayers = (
  sessionCode: string,
  onData: (players: Player[]) => void
): Unsubscribe => {
  return onSnapshot(collection(db, "sessions", sessionCode, "players"), (snap) => {
    const data = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Player, "id">),
    }));
    onData(data);
  });
};

export const joinSession = async (
  sessionCode: string,
  uid: string,
  name: string
): Promise<string> => {
  const playersRef = collection(db, "sessions", sessionCode, "players");
  const existing = await getDocs(query(playersRef, where("uid", "==", uid)));
  if (!existing.empty) {
    return existing.docs[0].id;
  }
  const docRef = await addDoc(playersRef, {
    uid,
    name,
    score: 0,
    buzzerOrder: null,
    buzzedAt: null,
    joinedAt: serverTimestamp(),
    isHost: false,
  });
  return docRef.id;
};

export const updatePlayerScore = async (
  sessionCode: string,
  playerId: string,
  score: number
): Promise<void> => {
  await updateDoc(doc(db, "sessions", sessionCode, "players", playerId), {
    score,
  });
};

export const buzzPlayer = async (
  sessionCode: string,
  playerId: string
): Promise<void> => {
  await updateDoc(doc(db, "sessions", sessionCode, "players", playerId), {
    buzzedAt: serverTimestamp(),
  });
};

import type { Timestamp } from "firebase/firestore";

export type CellText = {
  text: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
};

export type Cell = {
  question: CellText;
  answer: CellText;
  isFilled: boolean;
};

export type GameTemplate = {
  id: string;
  ownerUid: string;
  title: string;
  rows: number;
  cols: number;
  pointValues: number[];
  categories: string[];
  cells: Record<string, Cell>;
  isComplete: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type SessionStatus = "waiting" | "playing" | "finished";
export type CellState = "hidden" | "question" | "answer";

export type Session = {
  sessionCode: string;
  templateId: string;
  hostUid: string;
  status: SessionStatus;
  currentCell: string | null;
  cellStates: Record<string, CellState>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type Player = {
  id: string;
  uid: string;
  name: string;
  score: number;
  buzzerOrder: number | null;
  buzzedAt: Timestamp | null;
  joinedAt: Timestamp;
  isHost: boolean;
};

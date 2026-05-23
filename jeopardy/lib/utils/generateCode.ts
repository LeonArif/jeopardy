import { doc, getDoc, type Firestore } from "firebase/firestore";

export const generateUniqueCode = async (db: Firestore): Promise<string> => {
  while (true) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const docRef = doc(db, "sessions", code);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return code;
    }
  }
};

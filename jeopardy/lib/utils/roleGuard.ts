import type { Session } from "@/lib/types";

export const isHostUser = (session: Session | null, uid?: string | null): boolean => {
  if (!session || !uid) {
    return false;
  }
  return session.hostUid === uid;
};

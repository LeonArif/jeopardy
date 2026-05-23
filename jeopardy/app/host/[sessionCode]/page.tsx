"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import Button from "@/components/ui/Button";
import JeopardyBoard from "@/components/game/JeopardyBoard";
import PlayerStrip from "@/components/game/PlayerStrip";
import SessionCodeBadge from "@/components/game/SessionCodeBadge";
import useAuth from "@/hooks/useAuth";
import useSession from "@/hooks/useSession";
import usePlayers from "@/hooks/usePlayers";
import useTemplate from "@/hooks/useTemplate";
import { updateSessionCell, updatePlayerScore, finishSession } from "@/lib/firestore/sessions";

const HostSessionPage = () => {
  const router = useRouter();
  const params = useParams<{ sessionCode: string }>();
  const sessionCode = params?.sessionCode;
  const { user, loading: authLoading } = useAuth();
  const ready = Boolean(user) && !authLoading;
  const { session, loading: sessionLoading } = useSession(sessionCode, ready);
  const { players } = usePlayers(sessionCode, ready);
  const { template } = useTemplate(session?.templateId);

  useEffect(() => {
    if (session && user && session.hostUid !== user.uid) {
      router.replace(`/player/${session.sessionCode}`);
    }
  }, [session, user, router]);

  if (sessionLoading || !session || !template) {
    return (
      <ProtectedRoute>
        <main className="page">
          <p className="muted">Loading session...</p>
        </main>
      </ProtectedRoute>
    );
  }

  const handleCellClick = async (row: number, col: number, currentState: string) => {
    const key = `${row}-${col}`;
    const next = currentState === "hidden" ? "question" : currentState === "question" ? "answer" : "hidden";
    await updateSessionCell(session.sessionCode, key, next);
  };

  return (
    <ProtectedRoute>
      <main className="page">
        <div className="page-inner">
          <header className="card card-compact">
            <div className="card-header">
              <div>
                <h2>Host room</h2>
                <p className="muted">Reveal questions and manage scores.</p>
              </div>
              <SessionCodeBadge code={session.sessionCode} />
            </div>
            <div className="card-actions">
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>Back</Button>
              <Button
                variant="danger"
                onClick={async () => {
                  await finishSession(session.sessionCode);
                  router.push("/dashboard");
                }}
              >
                Finish session
              </Button>
            </div>
          </header>

          <JeopardyBoard template={template} session={session} onCellClick={handleCellClick} />

          <section className="card">
            <h3>Players</h3>
            <PlayerStrip
              players={players}
              currentUid={user?.uid}
              hostUid={session.hostUid}
              onBuzz={(_playerId) => undefined}
              onScoreChange={(playerId, score) => updatePlayerScore(session.sessionCode, playerId, score)}
            />
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
};

export default HostSessionPage;

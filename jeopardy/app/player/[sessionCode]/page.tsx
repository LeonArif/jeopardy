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
import { buzzPlayer } from "@/lib/firestore/sessions";

const PlayerSessionPage = () => {
  const router = useRouter();
  const params = useParams<{ sessionCode: string }>();
  const sessionCode = params?.sessionCode;
  const { user, loading: authLoading } = useAuth();
  const ready = Boolean(user) && !authLoading;
  const { session, loading: sessionLoading } = useSession(sessionCode, ready);
  const { players } = usePlayers(sessionCode, ready);
  const { template } = useTemplate(session?.templateId);

  useEffect(() => {
    if (session && user && session.hostUid === user.uid) {
      router.replace(`/host/${session.sessionCode}`);
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

  const myPlayer = players.find((player) => player.uid === user?.uid);

  return (
    <ProtectedRoute>
      <main className="page">
        <div className="page-inner">
          <header className="card card-compact">
            <div className="card-header">
              <div>
                <h2>Player view</h2>
                <p className="muted">Buzz fast when the question appears.</p>
              </div>
              <SessionCodeBadge code={session.sessionCode} />
            </div>
            <div className="card-actions">
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>Back</Button>
            </div>
          </header>

          <JeopardyBoard template={template} session={session} />

          <section className="card">
            <h3>Players</h3>
            {myPlayer ? null : (
              <p className="muted">You are not registered in this session.</p>
            )}
            <PlayerStrip
              players={players}
              currentUid={user?.uid}
              hostUid={session.hostUid}
              onBuzz={(playerId) => buzzPlayer(session.sessionCode, playerId)}
              onScoreChange={(_playerId, _score) => undefined}
            />
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
};

export default PlayerSessionPage;

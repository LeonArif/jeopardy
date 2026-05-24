"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import TemplateCard from "@/components/dashboard/TemplateCard";
import EmptyState from "@/components/dashboard/EmptyState";
import useAuth from "@/hooks/useAuth";
import useTemplates from "@/hooks/useTemplates";
import { createSession, fetchSession, joinSession } from "@/lib/firestore/sessions";
import { deleteTemplate } from "@/lib/firestore/templates";

const DashboardPage = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [code, setCode] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState<boolean>(false);
  const canManageTemplates = Boolean(user && !user.isAnonymous);
  const { templates, loading } = useTemplates(canManageTemplates ? user?.uid : undefined);

  const sortedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => a.title.localeCompare(b.title));
  }, [templates]);

  const handlePlay = async (templateId: string, rows: number, cols: number) => {
    if (!user) {
      return;
    }
    const sessionCode = await createSession(templateId, user.uid, rows, cols);
    router.push(`/host/${sessionCode}`);
  };

  const handleJoin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    setJoinError(null);
    setJoining(true);
    try {
      const trimmed = code.trim();
      const session = await fetchSession(trimmed);
      if (!session) {
        setJoinError("Session code not found.");
        return;
      }
      if (session.hostUid === user.uid) {
        router.push(`/host/${trimmed}`);
        return;
      }
      await joinSession(trimmed, user.uid, displayName.trim() || user.displayName || "Player");
      router.push(`/player/${trimmed}`);
    } catch (err) {
      setJoinError("Unable to join session.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="page">
        <div className="page-inner">
          <header className="card card-compact">
            <div className="card-header">
              <div>
                <h2>Welcome, {user?.displayName || "Host"}</h2>
                <p className="muted">
                  {canManageTemplates
                    ? "Manage your boards or join a live session."
                    : "Guest mode: join a live session using a code."}
                </p>
              </div>
              <Button variant="ghost" onClick={logout}>
                Sign out
              </Button>
            </div>
          </header>

          <section className="grid-two">
            {canManageTemplates ? (
              <div className="card">
                <h3>Your templates</h3>
                {loading ? (
                  <p className="muted">Loading templates...</p>
                ) : sortedTemplates.length === 0 ? (
                  <EmptyState onCreate={() => router.push("/editor/new")} />
                ) : (
                  <div className="stack">
                    {sortedTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onEdit={() => router.push(`/editor/${template.id}`)}
                        onPlay={() => handlePlay(template.id, template.rows, template.cols)}
                        onDelete={() => deleteTemplate(template.id)}
                      />
                    ))}
                  </div>
                )}
                <Button onClick={() => router.push("/editor/new")}>Create new template</Button>
              </div>
            ) : (
              <div className="card">
                <h3>Guest access</h3>
                <p className="muted">
                  You can join a live session, but you cannot create or host boards as a guest.
                </p>
              </div>
            )}

            <div className="card">
              <h3>Join a session</h3>
              <p className="muted">Enter a 4-digit code from your host.</p>
              <form className="stack" onSubmit={handleJoin}>
                <Input
                  label="Session code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  maxLength={4}
                  required
                />
                <Input
                  label="Display name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Your name"
                />
                {joinError ? <p className="error-text">{joinError}</p> : null}
                <Button type="submit" disabled={joining}>
                  {joining ? "Joining..." : "Join session"}
                </Button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
};

export default DashboardPage;

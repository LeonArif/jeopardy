"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useAuth from "@/hooks/useAuth";
import { createTemplate } from "@/lib/firestore/templates";

const NewEditorPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState<string>("");
  const [rows, setRows] = useState<number>(5);
  const [cols, setCols] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user?.isAnonymous) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  if (user?.isAnonymous) {
    return (
      <ProtectedRoute>
        <main className="page">
          <p className="muted">Guest accounts can only join live sessions.</p>
        </main>
      </ProtectedRoute>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || user.isAnonymous) {
      return;
    }
    setLoading(true);
    const templateId = await createTemplate(user.uid, title || "Untitled board", rows, cols);
    router.push(`/editor/${templateId}`);
  };

  return (
    <ProtectedRoute>
      <main className="page">
        <div className="page-inner grid-two">
          <section className="hero">
            <h1>Create a new board</h1>
            <p>Pick a grid size, then fill out the questions and answers.</p>
          </section>
          <form className="card" onSubmit={handleSubmit}>
            <Input
              label="Board title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Friday Trivia"
            />
            <div className="grid-two">
              <Input
                label="Rows"
                type="number"
                min={1}
                max={8}
                value={rows}
                onChange={(event) => setRows(Number(event.target.value))}
              />
              <Input
                label="Columns"
                type="number"
                min={1}
                max={8}
                value={cols}
                onChange={(event) => setCols(Number(event.target.value))}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create board"}
            </Button>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
};

export default NewEditorPage;

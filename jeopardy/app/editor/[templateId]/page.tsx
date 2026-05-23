"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import BoardGrid from "@/components/editor/BoardGrid";
import CellEditModal from "@/components/editor/CellEditModal";
import useTemplate from "@/hooks/useTemplate";
import type { Cell, GameTemplate } from "@/lib/types";
import { createEmptyCell, getCellKey, isBoardComplete, isCellFilled } from "@/lib/utils/cellHelpers";
import { updateTemplate } from "@/lib/firestore/templates";

const EditorPage = () => {
  const router = useRouter();
  const params = useParams<{ templateId: string }>();
  const templateId = params?.templateId;
  const { template, loading } = useTemplate(templateId);
  const [draft, setDraft] = useState<GameTemplate | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const resizeBoard = (nextRows: number, nextCols: number) => {
    if (!draft) {
      return;
    }
    const rows = Math.min(8, Math.max(1, nextRows));
    const cols = Math.min(8, Math.max(1, nextCols));
    const nextCells: Record<string, Cell> = {};
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const key = getCellKey(row, col);
        nextCells[key] = draft.cells[key] ?? createEmptyCell();
      }
    }
    const nextCategories = Array.from({ length: cols }, (_, idx) => draft.categories[idx] ?? "");
    const nextPoints = Array.from(
      { length: rows },
      (_, idx) => draft.pointValues[idx] ?? (idx + 1) * 100
    );
    setDraft({
      ...draft,
      rows,
      cols,
      categories: nextCategories,
      pointValues: nextPoints,
      cells: nextCells,
      isComplete: isBoardComplete(nextCells, rows, cols),
    });
  };


  useEffect(() => {
    if (template) {
      setDraft(template);
    }
  }, [template]);

  const updateCell = (row: number, col: number, updater: (cell: Cell) => Cell) => {
    if (!draft) {
      return;
    }
    const key = getCellKey(row, col);
    const current = draft.cells[key] ?? createEmptyCell();
    const updated = updater(current);
    const nextCells = {
      ...draft.cells,
      [key]: {
        ...updated,
        isFilled: isCellFilled(updated),
      },
    };
    setDraft({
      ...draft,
      cells: nextCells,
      isComplete: isBoardComplete(nextCells, draft.rows, draft.cols),
    });
  };

  const handleSave = async () => {
    if (!draft || !templateId) {
      return;
    }
    setSaving(true);
    await updateTemplate(templateId, {
      ownerUid: draft.ownerUid,
      title: draft.title,
      rows: draft.rows,
      cols: draft.cols,
      pointValues: draft.pointValues,
      categories: draft.categories,
      cells: draft.cells,
      isComplete: draft.isComplete,
    });
    setSaving(false);
  };

  if (loading || !draft) {
    return (
      <ProtectedRoute>
        <main className="page">
          <p className="muted">Loading board...</p>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="page">
        <div className="page-inner">
          <header className="card card-compact">
            <div className="card-header">
              <div>
                <h2>{draft.title}</h2>
                <p className="muted">
                  {draft.isComplete ? "Ready to host" : "Draft in progress"}
                </p>
              </div>
              <div className="card-actions">
                <Button variant="ghost" onClick={() => router.push("/dashboard")}
                >
                  Back
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save board"}
                </Button>
              </div>
            </div>
          </header>

          <section className="card card-compact">
            <h3>Board details</h3>
            <div className="stack">
              <Input
                label="Board title"
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              />
            </div>
            <div className="grid-two">
              <Input
                label="Rows"
                type="number"
                min={1}
                max={8}
                value={draft.rows}
                onChange={(event) => resizeBoard(Number(event.target.value), draft.cols)}
              />
              <Input
                label="Columns"
                type="number"
                min={1}
                max={8}
                value={draft.cols}
                onChange={(event) => resizeBoard(draft.rows, Number(event.target.value))}
              />
            </div>
          </section>

          <BoardGrid
            categories={draft.categories}
            pointValues={draft.pointValues}
            cells={draft.cells}
            rows={draft.rows}
            cols={draft.cols}
            onCategoryChange={(col, value) => {
              const next = [...draft.categories];
              next[col] = value;
              setDraft({ ...draft, categories: next });
            }}
            onPointChange={(row, value) => {
              const next = [...draft.pointValues];
              next[row] = value;
              setDraft({ ...draft, pointValues: next });
            }}
            onCellClick={(row, col) => setSelected({ row, col })}
          />

          <CellEditModal
            isOpen={Boolean(selected)}
            cell={
              selected
                ? draft.cells[getCellKey(selected.row, selected.col)] ?? createEmptyCell()
                : null
            }
            onClose={() => setSelected(null)}
            onSave={(question, answer, questionImage, questionVideo, answerImage, answerVideo) => {
              if (!selected) {
                return;
              }
              updateCell(selected.row, selected.col, (cell) => ({
                ...cell,
                question: {
                  text: question.trim() || null,
                  imageUrl: questionImage.trim() || null,
                  videoUrl: questionVideo.trim() || null,
                },
                answer: {
                  text: answer.trim() || null,
                  imageUrl: answerImage.trim() || null,
                  videoUrl: answerVideo.trim() || null,
                },
              }));
              setSelected(null);
            }}
          />
        </div>
      </main>
    </ProtectedRoute>
  );
};

export default EditorPage;

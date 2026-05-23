"use client";

import type { GameTemplate } from "@/lib/types";
import Button from "@/components/ui/Button";

type TemplateCardProps = {
  template: GameTemplate;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const TemplateCard = ({ template, onPlay, onEdit, onDelete }: TemplateCardProps) => {
  return (
    <div className="card card-compact">
      <div className="card-header">
        <div>
          <h3>{template.title}</h3>
          <p className="muted">
            {template.rows} rows · {template.cols} cols
          </p>
        </div>
        <span className={`pill ${template.isComplete ? "pill-ready" : "pill-draft"}`}>
          {template.isComplete ? "Ready" : "Draft"}
        </span>
      </div>
      <div className="card-actions">
        <Button variant="soft" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="primary" size="sm" onClick={onPlay} disabled={!template.isComplete}>
          Host
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
};

export default TemplateCard;

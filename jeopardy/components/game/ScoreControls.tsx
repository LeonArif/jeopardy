"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type ScoreControlsProps = {
  score: number;
  onScoreChange?: (score: number) => void;
};

const ScoreControls = ({ score, onScoreChange }: ScoreControlsProps) => {
  const [localScore, setLocalScore] = useState<string>(score.toString());

  useEffect(() => {
    setLocalScore(score.toString());
  }, [score]);

  const commitScore = (value: number) => {
    if (onScoreChange) {
      onScoreChange(value);
    }
  };

  return (
    <div className="score-controls">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => commitScore(score - 100)}
      >
        -100
      </Button>
      <Input
        value={localScore}
        onChange={(event) => setLocalScore(event.target.value)}
        onBlur={() => {
          const parsed = Number(localScore);
          if (!Number.isNaN(parsed)) {
            commitScore(parsed);
          } else {
            setLocalScore(score.toString());
          }
        }}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => commitScore(score + 100)}
      >
        +100
      </Button>
    </div>
  );
};

export default ScoreControls;

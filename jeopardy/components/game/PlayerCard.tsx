"use client";

import type { Player } from "@/lib/types";
import Button from "@/components/ui/Button";
import ScoreControls from "@/components/game/ScoreControls";

type PlayerCardProps = {
  player: Player;
  isCurrentUser: boolean;
  buzzerOrder?: number | null;
  showControls: boolean;
  onBuzz?: () => void;
  onScoreChange?: (score: number) => void;
};

const PlayerCard = ({
  player,
  isCurrentUser,
  buzzerOrder,
  showControls,
  onBuzz,
  onScoreChange,
}: PlayerCardProps) => {
  return (
    <div className={`player-card ${isCurrentUser ? "player-active" : ""}`}>
      <div className="player-header">
        <div>
          <h4>{player.name}</h4>
          <p className="muted">Score: {player.score}</p>
        </div>
        {buzzerOrder ? <span className="badge">#{buzzerOrder}</span> : null}
      </div>
      {showControls ? (
        <ScoreControls score={player.score} onScoreChange={onScoreChange} />
      ) : (
        <Button
          variant="soft"
          onClick={onBuzz}
          disabled={!onBuzz || Boolean(player.buzzedAt)}
        >
          Buzz
        </Button>
      )}
    </div>
  );
};

export default PlayerCard;

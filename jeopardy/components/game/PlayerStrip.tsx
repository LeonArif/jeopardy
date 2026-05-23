"use client";

import type { Player } from "@/lib/types";
import PlayerCard from "@/components/game/PlayerCard";

type PlayerStripProps = {
  players: Player[];
  currentUid?: string | null;
  hostUid?: string | null;
  onBuzz: (playerId: string) => void;
  onScoreChange: (playerId: string, score: number) => void;
};

const PlayerStrip = ({ players, currentUid, hostUid, onBuzz, onScoreChange }: PlayerStripProps) => {
  const buzzed = players
    .filter((player) => player.buzzedAt)
    .sort((a, b) => a.buzzedAt!.toMillis() - b.buzzedAt!.toMillis());
  const orderMap = new Map<string, number>();
  buzzed.forEach((player, index) => orderMap.set(player.id, index + 1));

  return (
    <div className="player-strip">
      {players.map((player) => {
        const isHost = hostUid === currentUid;
        const isCurrentUser = player.uid === currentUid;
        const buzzHandler = !isHost && isCurrentUser ? () => onBuzz(player.id) : undefined;
        return (
          <PlayerCard
            key={player.id}
            player={player}
            isCurrentUser={isCurrentUser}
            buzzerOrder={orderMap.get(player.id) ?? null}
            showControls={isHost}
            onBuzz={buzzHandler}
            onScoreChange={isHost ? (score) => onScoreChange(player.id, score) : undefined}
          />
        );
      })}
    </div>
  );
};

export default PlayerStrip;

"use client";

type SessionCodeBadgeProps = {
  code: string;
};

const SessionCodeBadge = ({ code }: SessionCodeBadgeProps) => {
  return (
    <div className="session-code">
      <span>Session code</span>
      <strong>{code}</strong>
    </div>
  );
};

export default SessionCodeBadge;

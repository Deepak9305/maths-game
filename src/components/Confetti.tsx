import React, { useMemo } from 'react';

const EMOJIS = ['⭐', '🚀', '✨', '🌟'] as const;

const Confetti: React.FC = () => {
  const particles = useMemo(() =>
    [...Array(40)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${1 + Math.random() * 2}s`,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true" role="presentation">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute text-2xl"
          style={{ left: p.left, top: '-20px', animation: `fall ${p.duration} linear` }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
};

export default Confetti;

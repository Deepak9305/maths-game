import React from 'react';

const Confetti: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-20px',
            animation: `fall ${1 + Math.random() * 2}s linear`,
          }}
        >
          {['⭐', '🚀', '✨', '🌟'][Math.floor(Math.random() * 4)]}
        </div>
      ))}
    </div>
  );
};

export default Confetti;

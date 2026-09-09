import React from 'react';

export type PetEmotion = 'normal' | 'happy' | 'sad' | 'hungry' | 'eating' | 'playing';
export type PetStage = 'egg' | 'grub' | 'alien' | 'crawler' | 'dragon' | 'wolf_pup' | 'wolf' | 'shadow_wolf' | 'void_wolf' | 'alpha_wolf' | 'phoenix_egg' | 'phoenix_chick' | 'phoenix' | 'inferno_phoenix' | 'celestial_phoenix';

interface PetProps {
  stage: PetStage;
  emotion: PetEmotion;
  className?: string;
}

export const PetCharacter: React.FC<PetProps> = ({ stage, emotion, className = "w-32 h-32" }) => {
  // Helper to render cartoon faces with thick outlines and expressive features
  const renderCartoonFace = (yOffset = 0) => {
    const eyeY = 42 + yOffset;
    const leftEyeX = 35;
    const rightEyeX = 65;
    
    switch (emotion) {
      case 'happy':
        return (
          <g>
            {/* Happy closed eyes */}
            <path d={`M ${leftEyeX-8} ${eyeY} Q ${leftEyeX} ${eyeY-10} ${leftEyeX+8} ${eyeY}`} fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <path d={`M ${rightEyeX-8} ${eyeY} Q ${rightEyeX} ${eyeY-10} ${rightEyeX+8} ${eyeY}`} fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            {/* Big smile */}
            <path d={`M 40 ${eyeY+13} Q 50 ${eyeY+28} 60 ${eyeY+13} Z`} fill="#ef4444" stroke="#1e293b" strokeWidth="4" strokeLinejoin="round" />
            {/* Blushes */}
            <ellipse cx={leftEyeX-10} cy={eyeY+8} rx="6" ry="4" fill="#fca5a5" opacity="0.8" />
            <ellipse cx={rightEyeX+10} cy={eyeY+8} rx="6" ry="4" fill="#fca5a5" opacity="0.8" />
          </g>
        );
      case 'sad':
        return (
          <g>
            {/* Big sad eyes */}
            <circle cx={leftEyeX} cy={eyeY} r="8" fill="#1e293b" />
            <circle cx={rightEyeX} cy={eyeY} r="8" fill="#1e293b" />
            <circle cx={leftEyeX+2} cy={eyeY-2} r="3" fill="white" />
            <circle cx={rightEyeX+2} cy={eyeY-2} r="3" fill="white" />
            {/* Tears */}
            <path d={`M ${leftEyeX} ${eyeY+10} Q ${leftEyeX-5} ${eyeY+20} ${leftEyeX} ${eyeY+25} Q ${leftEyeX+5} ${eyeY+20} ${leftEyeX} ${eyeY+10}`} fill="#60a5fa" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
            <path d={`M ${rightEyeX} ${eyeY+10} Q ${rightEyeX-5} ${eyeY+20} ${rightEyeX} ${eyeY+25} Q ${rightEyeX+5} ${eyeY+20} ${rightEyeX} ${eyeY+10}`} fill="#60a5fa" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
            {/* Sad mouth */}
            <path d={`M 42 ${eyeY+18} Q 50 ${eyeY+10} 58 ${eyeY+18}`} fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      case 'hungry':
        return (
          <g>
            {/* Wide eyes */}
            <circle cx={leftEyeX} cy={eyeY} r="9" fill="#1e293b" />
            <circle cx={rightEyeX} cy={eyeY} r="9" fill="#1e293b" />
            <circle cx={leftEyeX+2} cy={eyeY-2} r="4" fill="white" />
            <circle cx={rightEyeX+2} cy={eyeY-2} r="4" fill="white" />
            {/* Drool */}
            <path d={`M 55 ${eyeY+15} Q 58 ${eyeY+25} 55 ${eyeY+30}`} fill="none" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
            {/* Open mouth */}
            <ellipse cx="50" cy={eyeY+15} rx="6" ry="8" fill="#1e293b" />
          </g>
        );
      case 'eating':
        return (
          <g>
            {/* Happy closed eyes */}
            <path d={`M ${leftEyeX-8} ${eyeY} Q ${leftEyeX} ${eyeY-10} ${leftEyeX+8} ${eyeY}`} fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <path d={`M ${rightEyeX-8} ${eyeY} Q ${rightEyeX} ${eyeY-10} ${rightEyeX+8} ${eyeY}`} fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            {/* Chewing mouth */}
            <path d={`M 40 ${eyeY+15} Q 50 ${eyeY+20} 60 ${eyeY+15} Q 50 ${eyeY+10} 40 ${eyeY+15}`} fill="#1e293b" />
            {/* Crumbs */}
            <circle cx="35" cy={eyeY+25} r="2" fill="#d97706" />
            <circle cx="65" cy={eyeY+22} r="2" fill="#d97706" />
            <circle cx="40" cy={eyeY+30} r="1.5" fill="#d97706" />
          </g>
        );
      case 'playing':
        return (
          <g>
            {/* Star eyes */}
            <path d={`M ${leftEyeX} ${eyeY-8} L ${leftEyeX+2} ${eyeY-2} L ${leftEyeX+8} ${eyeY} L ${leftEyeX+2} ${eyeY+2} L ${leftEyeX} ${eyeY+8} L ${leftEyeX-2} ${eyeY+2} L ${leftEyeX-8} ${eyeY} L ${leftEyeX-2} ${eyeY-2} Z`} fill="#1e293b" />
            <path d={`M ${rightEyeX} ${eyeY-8} L ${rightEyeX+2} ${eyeY-2} L ${rightEyeX+8} ${eyeY} L ${rightEyeX+2} ${eyeY+2} L ${rightEyeX} ${eyeY+8} L ${rightEyeX-2} ${eyeY+2} L ${rightEyeX-8} ${eyeY} L ${rightEyeX-2} ${eyeY-2} Z`} fill="#1e293b" />
            {/* Big open mouth */}
            <path d={`M 40 ${eyeY+15} Q 50 ${eyeY+35} 60 ${eyeY+15} Z`} fill="#1e293b" />
            <path d={`M 45 ${eyeY+20} Q 50 ${eyeY+30} 55 ${eyeY+20} Z`} fill="#ef4444" />
          </g>
        );
      case 'normal':
      default:
        return (
          <g>
            {/* Normal eyes */}
            <circle cx={leftEyeX} cy={eyeY} r="7" fill="#1e293b" />
            <circle cx={rightEyeX} cy={eyeY} r="7" fill="#1e293b" />
            <circle cx={leftEyeX+2} cy={eyeY-2} r="2.5" fill="white" />
            <circle cx={rightEyeX+2} cy={eyeY-2} r="2.5" fill="white" />
            {/* Small smile */}
            <path d={`M 45 ${eyeY+15} Q 50 ${eyeY+18} 55 ${eyeY+15}`} fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          </g>
        );
    }
  };

  const renderEgg = () => (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Egg Base */}
      <ellipse cx="50" cy="55" rx="35" ry="42" fill="#86efac" stroke="#1e293b" strokeWidth="4" />
      {/* Spots */}
      <circle cx="35" cy="40" r="8" fill="#22c55e" />
      <circle cx="65" cy="60" r="12" fill="#22c55e" />
      <circle cx="45" cy="75" r="6" fill="#22c55e" />
      <circle cx="60" cy="35" r="5" fill="#22c55e" />
      {/* Crack if playing/happy */}
      {(emotion === 'playing' || emotion === 'happy') && (
        <path d="M 40 15 L 45 25 L 35 30 L 45 40" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* Sweat drop if sad/hungry */}
      {(emotion === 'sad' || emotion === 'hungry') && (
        <path d="M 75 30 Q 80 40 75 45 Q 70 40 75 30" fill="#93c5fd" stroke="#1e293b" strokeWidth="2" />
      )}
    </svg>
  );

  const renderGrub = () => (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Body segments */}
      <circle cx="70" cy="70" r="15" fill="#a7f3d0" stroke="#1e293b" strokeWidth="4" />
      <circle cx="50" cy="70" r="18" fill="#6ee7b7" stroke="#1e293b" strokeWidth="4" />
      <circle cx="30" cy="65" r="22" fill="#34d399" stroke="#1e293b" strokeWidth="4" />
      {/* Antennae */}
      <path d="M 20 45 Q 15 30 25 20" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
      <circle cx="25" cy="20" r="4" fill="#fbbf24" stroke="#1e293b" strokeWidth="2" />
      <path d="M 40 45 Q 45 30 35 20" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
      <circle cx="35" cy="20" r="4" fill="#fbbf24" stroke="#1e293b" strokeWidth="2" />
      
      {/* Face */}
      <g transform="translate(-20, 20)">
        {renderCartoonFace()}
      </g>
    </svg>
  );

  const renderAlien = () => (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Antenna */}
      <path d="M 50 40 L 50 15" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="15" r="6" fill="#fbbf24" stroke="#1e293b" strokeWidth="3" />
      {/* Body */}
      <path d="M 35 85 Q 50 100 65 85 L 60 50 L 40 50 Z" fill="#34d399" stroke="#1e293b" strokeWidth="4" strokeLinejoin="round" />
      {/* Head */}
      <ellipse cx="50" cy="50" rx="30" ry="25" fill="#6ee7b7" stroke="#1e293b" strokeWidth="4" />
      {/* Face */}
      {renderCartoonFace(5)}
    </svg>
  );

  const renderCrawler = () => (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Tentacles */}
      <path d="M 30 60 Q 10 80 20 95" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
      <path d="M 40 60 Q 30 90 40 95" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
      <path d="M 60 60 Q 70 90 60 95" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
      <path d="M 70 60 Q 90 80 80 95" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="50" cy="55" rx="35" ry="30" fill="#34d399" stroke="#1e293b" strokeWidth="4" />
      {/* Spots */}
      <circle cx="30" cy="45" r="4" fill="#059669" opacity="0.5" />
      <circle cx="70" cy="45" r="5" fill="#059669" opacity="0.5" />
      <circle cx="25" cy="55" r="3" fill="#059669" opacity="0.5" />
      <circle cx="75" cy="55" r="4" fill="#059669" opacity="0.5" />
      {/* Face */}
      {renderCartoonFace(10)}
    </svg>
  );

  const renderDragon = () => (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Wings */}
      <path d="M 35 50 Q 10 30 15 10 Q 25 25 35 40 Z" fill="#fca5a5" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
      <path d="M 65 50 Q 90 30 85 10 Q 75 25 65 40 Z" fill="#fca5a5" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
      {/* Tail */}
      <path d="M 60 75 Q 80 80 90 70 Q 85 85 60 85 Z" fill="#f87171" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
      {/* Body */}
      <ellipse cx="50" cy="65" rx="25" ry="20" fill="#f87171" stroke="#1e293b" strokeWidth="4" />
      {/* Belly */}
      <ellipse cx="50" cy="68" rx="15" ry="12" fill="#fecaca" />
      {/* Head */}
      <circle cx="50" cy="40" r="22" fill="#f87171" stroke="#1e293b" strokeWidth="4" />
      {/* Horns */}
      <path d="M 35 25 Q 25 10 20 15" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
      <path d="M 65 25 Q 75 10 80 15" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
      {/* Face */}
      {renderCartoonFace(-5)}
    </svg>
  );

  // --- Wolf Evolution Chain ---
  const renderWolfPup = () => (
    <svg viewBox="0 0 100 100" className={className}>
      <ellipse cx="50" cy="72" rx="18" ry="14" fill="#c7d2fe" stroke="#1e293b" strokeWidth="4"/>
      <ellipse cx="50" cy="72" rx="10" ry="8" fill="#e0e7ff"/>
      <circle cx="50" cy="48" r="16" fill="#c7d2fe" stroke="#1e293b" strokeWidth="4"/>
      <path d="M 38 38 L 32 22 L 44 33 Z" fill="#a5b4fc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 62 38 L 68 22 L 56 33 Z" fill="#a5b4fc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <g transform="translate(-10, -2)">{renderCartoonFace()}</g>
    </svg>
  );

  const renderWolf = () => (
    <svg viewBox="0 0 100 100" className={className}>
      <path d="M 70 60 Q 90 50 85 70 Q 75 80 65 65 Z" fill="#818cf8" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <ellipse cx="50" cy="65" rx="25" ry="20" fill="#6366f1" stroke="#1e293b" strokeWidth="4"/>
      <ellipse cx="50" cy="68" rx="15" ry="12" fill="#c7d2fe"/>
      <circle cx="40" cy="40" r="20" fill="#6366f1" stroke="#1e293b" strokeWidth="4"/>
      <path d="M 25 30 L 20 10 L 35 25 Z" fill="#818cf8" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 55 30 L 60 10 L 45 25 Z" fill="#818cf8" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <g transform="translate(-10, -5)">{renderCartoonFace()}</g>
    </svg>
  );

  const renderShadowWolf = () => (
    <svg viewBox="0 0 100 100" className={className}>
      <path d="M 70 60 Q 93 48 88 72 Q 76 84 63 66 Z" fill="#4338ca" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <ellipse cx="50" cy="65" rx="27" ry="21" fill="#312e81" stroke="#1e293b" strokeWidth="4"/>
      <ellipse cx="50" cy="68" rx="16" ry="13" fill="#4f46e5"/>
      <circle cx="40" cy="39" r="21" fill="#312e81" stroke="#1e293b" strokeWidth="4"/>
      <path d="M 23 28 L 17 8 L 34 23 Z" fill="#4338ca" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 57 28 L 63 8 L 46 23 Z" fill="#4338ca" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      {/* Shadow aura */}
      <ellipse cx="50" cy="90" rx="28" ry="6" fill="#312e81" opacity="0.6"/>
      <g transform="translate(-10, -6)">{renderCartoonFace()}</g>
    </svg>
  );

  const renderVoidWolf = () => (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Cosmic swirls */}
      <circle cx="20" cy="20" r="5" fill="#7c3aed" opacity="0.5"/>
      <circle cx="80" cy="25" r="4" fill="#db2777" opacity="0.5"/>
      <circle cx="15" cy="75" r="3" fill="#2563eb" opacity="0.5"/>
      <path d="M 72 58 Q 96 44 90 70 Q 77 85 62 64 Z" fill="#6d28d9" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <ellipse cx="50" cy="64" rx="28" ry="22" fill="#4c1d95" stroke="#1e293b" strokeWidth="4"/>
      <ellipse cx="50" cy="68" rx="17" ry="13" fill="#7c3aed"/>
      <circle cx="40" cy="38" r="22" fill="#4c1d95" stroke="#1e293b" strokeWidth="4"/>
      <path d="M 21 27 L 14 5 L 33 22 Z" fill="#6d28d9" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 59 27 L 66 5 L 47 22 Z" fill="#6d28d9" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <g transform="translate(-10, -7)">{renderCartoonFace()}</g>
    </svg>
  );

  const renderAlphaWolf = () => (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Crown */}
      <path d="M 22 22 L 28 10 L 36 18 L 44 5 L 52 18 L 56 10 L 60 22 Z" fill="#fbbf24" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M 72 56 Q 97 42 91 68 Q 78 82 61 62 Z" fill="#7c3aed" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <ellipse cx="50" cy="63" rx="29" ry="23" fill="#5b21b6" stroke="#1e293b" strokeWidth="4"/>
      <ellipse cx="50" cy="67" rx="18" ry="14" fill="#8b5cf6"/>
      <circle cx="40" cy="37" r="23" fill="#5b21b6" stroke="#1e293b" strokeWidth="4"/>
      <path d="M 20 26 L 13 4 L 32 21 Z" fill="#7c3aed" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 60 26 L 67 4 L 48 21 Z" fill="#7c3aed" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      {/* Glowing eyes override */}
      <circle cx="28" cy="33" r="7" fill="#fbbf24"/>
      <circle cx="52" cy="33" r="7" fill="#fbbf24"/>
      <circle cx="30" cy="31" r="3" fill="white"/>
      <circle cx="54" cy="31" r="3" fill="white"/>
    </svg>
  );

  // --- Phoenix Evolution Chain ---
  const renderPhoenixEgg = () => (
    <svg viewBox="0 0 100 100" className={className}>
      <ellipse cx="50" cy="55" rx="35" ry="42" fill="#fed7aa" stroke="#1e293b" strokeWidth="4"/>
      {/* Flame markings */}
      <path d="M 40 30 Q 50 20 60 30 Q 55 40 50 35 Q 45 40 40 30 Z" fill="#f97316" opacity="0.8"/>
      <path d="M 32 50 Q 38 42 44 50 Q 38 55 32 50 Z" fill="#fb923c" opacity="0.7"/>
      <path d="M 56 55 Q 62 47 68 55 Q 62 60 56 55 Z" fill="#fb923c" opacity="0.7"/>
      {(emotion === 'playing' || emotion === 'happy') && (
        <path d="M 42 16 L 47 26 L 37 31 L 47 40" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  );

  const renderPhoenixChick = () => (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Tiny wings */}
      <path d="M 35 55 Q 18 45 22 30 Q 28 42 36 48 Z" fill="#fbbf24" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M 65 55 Q 82 45 78 30 Q 72 42 64 48 Z" fill="#fbbf24" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
      {/* Fluffy body */}
      <ellipse cx="50" cy="70" rx="20" ry="16" fill="#fbbf24" stroke="#1e293b" strokeWidth="3"/>
      {/* Head */}
      <circle cx="50" cy="48" r="18" fill="#fde68a" stroke="#1e293b" strokeWidth="3"/>
      {/* Tuft */}
      <path d="M 44 32 Q 50 22 56 32 Z" fill="#f59e0b" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
      {renderCartoonFace(3)}
    </svg>
  );

  const renderPhoenix = () => (
    <svg viewBox="0 0 100 100" className={className}>
      <path d="M 35 50 Q 10 30 15 10 Q 25 25 35 40 Z" fill="#fbbf24" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 65 50 Q 90 30 85 10 Q 75 25 65 40 Z" fill="#fbbf24" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 40 75 Q 50 95 60 75 Z" fill="#f59e0b" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 30 70 Q 40 90 50 70 Z" fill="#fbbf24" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 50 70 Q 60 90 70 70 Z" fill="#fbbf24" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <ellipse cx="50" cy="60" rx="20" ry="25" fill="#f59e0b" stroke="#1e293b" strokeWidth="4"/>
      <ellipse cx="50" cy="65" rx="12" ry="15" fill="#fef3c7"/>
      <circle cx="50" cy="35" r="18" fill="#f59e0b" stroke="#1e293b" strokeWidth="4"/>
      <path d="M 40 20 Q 50 5 60 20 Z" fill="#fbbf24" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <g transform="translate(0, -10)">{renderCartoonFace()}</g>
    </svg>
  );

  const renderInfernoPhoenix = () => (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Flame wings */}
      <path d="M 33 48 Q 5 28 12 5 Q 22 22 33 38 Z" fill="#ef4444" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 67 48 Q 95 28 88 5 Q 78 22 67 38 Z" fill="#ef4444" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 22 45 Q 8 35 14 18" fill="none" stroke="#f97316" strokeWidth="5" strokeLinecap="round"/>
      <path d="M 78 45 Q 92 35 86 18" fill="none" stroke="#f97316" strokeWidth="5" strokeLinecap="round"/>
      {/* Tail */}
      <path d="M 38 75 Q 50 98 62 75 Z" fill="#dc2626" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 28 68 Q 40 92 52 68 Z" fill="#ef4444" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 48 68 Q 60 92 72 68 Z" fill="#ef4444" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <ellipse cx="50" cy="58" rx="22" ry="26" fill="#dc2626" stroke="#1e293b" strokeWidth="4"/>
      <ellipse cx="50" cy="63" rx="13" ry="16" fill="#fca5a5"/>
      <circle cx="50" cy="33" r="20" fill="#dc2626" stroke="#1e293b" strokeWidth="4"/>
      <path d="M 37 17 Q 50 0 63 17 Z" fill="#ef4444" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
      <g transform="translate(0, -8)">{renderCartoonFace()}</g>
    </svg>
  );

  const renderCelestialPhoenix = () => (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Stars */}
      <circle cx="12" cy="15" r="2" fill="#fde68a" opacity="0.9"/>
      <circle cx="88" cy="12" r="2" fill="#fde68a" opacity="0.9"/>
      <circle cx="8" cy="70" r="1.5" fill="#fde68a" opacity="0.7"/>
      <circle cx="93" cy="65" r="1.5" fill="#fde68a" opacity="0.7"/>
      {/* Celestial wings */}
      <path d="M 32 46 Q 2 22 10 2 Q 20 20 32 36 Z" fill="#fef3c7" stroke="#fbbf24" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 68 46 Q 98 22 90 2 Q 80 20 68 36 Z" fill="#fef3c7" stroke="#fbbf24" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 20 42 Q 5 30 11 13" fill="none" stroke="#fde68a" strokeWidth="5" strokeLinecap="round"/>
      <path d="M 80 42 Q 95 30 89 13" fill="none" stroke="#fde68a" strokeWidth="5" strokeLinecap="round"/>
      {/* Crown */}
      <path d="M 32 22 L 38 10 L 46 18 L 50 8 L 54 18 L 62 10 L 68 22 Z" fill="#fbbf24" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
      {/* Tail */}
      <path d="M 36 74 Q 50 100 64 74 Z" fill="#fde68a" stroke="#fbbf24" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 25 68 Q 39 94 53 68 Z" fill="#fef3c7" stroke="#fbbf24" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 47 68 Q 61 94 75 68 Z" fill="#fef3c7" stroke="#fbbf24" strokeWidth="3" strokeLinejoin="round"/>
      <ellipse cx="50" cy="57" rx="22" ry="26" fill="#fbbf24" stroke="#1e293b" strokeWidth="4"/>
      <ellipse cx="50" cy="62" rx="13" ry="16" fill="#fef9c3"/>
      <circle cx="50" cy="31" r="20" fill="#fbbf24" stroke="#1e293b" strokeWidth="4"/>
      <g transform="translate(0, -9)">{renderCartoonFace()}</g>
    </svg>
  );

  switch (stage) {
    case 'egg': return renderEgg();
    case 'grub': return renderGrub();
    case 'alien': return renderAlien();
    case 'crawler': return renderCrawler();
    case 'dragon': return renderDragon();
    case 'wolf_pup': return renderWolfPup();
    case 'wolf': return renderWolf();
    case 'shadow_wolf': return renderShadowWolf();
    case 'void_wolf': return renderVoidWolf();
    case 'alpha_wolf': return renderAlphaWolf();
    case 'phoenix_egg': return renderPhoenixEgg();
    case 'phoenix_chick': return renderPhoenixChick();
    case 'phoenix': return renderPhoenix();
    case 'inferno_phoenix': return renderInfernoPhoenix();
    case 'celestial_phoenix': return renderCelestialPhoenix();
    default: return renderEgg();
  }
};

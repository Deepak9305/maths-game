import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types';
import { Heart, Activity, Star, Edit2, Check, Info, X, ShoppingBag } from 'lucide-react';
import { playSound } from '../services/audioService';
import { nativeService } from '../services/nativeService';
import { PetCharacter, PetStage, PetEmotion } from '../components/PetCharacters';

interface PetScreenProps {
  player: PlayerState;
  onFeed: () => void;
  onPlay: () => void;
  onClose: () => void;
  onRename?: (newName: string) => void;
  onBuyPet?: (petId: string, cost: number) => void;
  onEquipPet?: (petId: string) => void;
}

const AVAILABLE_PETS = [
  { id: 'alien', name: 'Alien', cost: 0, description: 'Evolves as it levels up!' },
  { id: 'wolf', name: 'Nebula Wolf', cost: 500, description: 'A loyal companion from the stars.' },
  { id: 'phoenix', name: 'Solar Phoenix', cost: 1000, description: 'A majestic bird of cosmic fire.' }
];

const PET_BACKSTORIES: Record<string, string> = {
  alien: 'Astro hatched from a star-seed drifting through Sector 7. Every correct answer sends a little more starlight into its shell.',
  wolf: 'Nebula Wolf crossed the comet belt alone until your signal reached it. Now it maps safe routes through the dark for its pilot.',
  phoenix: 'Solar Phoenix rose from a sunflare fragment that refused to burn out. It follows brave pilots and turns every setback into fuel.'
};

export const PetScreen: React.FC<PetScreenProps> = ({ player, onFeed, onPlay, onClose, onRename, onBuyPet, onEquipPet }) => {
  const activePetId = player.activePetId || 'alien';
  const pet = player.pets?.[activePetId] || { id: 'alien', name: 'Astro', happiness: 100, hunger: 0, level: 1, xp: 0, lastInteractionTime: Date.now() };
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'feed' | 'play' | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(pet.name);

  // Sync editName when the active pet changes
  useEffect(() => { setEditName(pet.name); }, [activePetId, pet.name]);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showBackstory, setShowBackstory] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const feedCooldown = pet.lastFedTime ? Math.max(0, 60000 - (now - pet.lastFedTime)) : 0;
  const playCooldown = pet.lastPlayedTime ? Math.max(0, 60000 - (now - pet.lastPlayedTime)) : 0;

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFeed = () => {
    if (feedCooldown > 0) return;
    if (player.coins >= 10 && pet.hunger > 0) {
      setAnimationType('feed');
      setIsAnimating(true);
      onFeed();
      setTimeout(() => setIsAnimating(false), 1000);
    } else if (player.coins < 10) {
      nativeService.haptics.notificationError();
      playSound.wrong();
    }
  };

  const handlePlay = () => {
    if (playCooldown > 0) return;
    if (player.coins >= 15 && pet.happiness < 100) {
      setAnimationType('play');
      setIsAnimating(true);
      onPlay();
      setTimeout(() => setIsAnimating(false), 1000);
    } else if (player.coins < 15) {
      nativeService.haptics.notificationError();
      playSound.wrong();
    }
  };

  const handleSaveName = () => {
    if (editName.trim() && onRename) {
      onRename(editName.trim());
    }
    setIsEditingName(false);
  };

  // Determine pet stage and species name based on pet ID and level
  let stage: PetStage = 'alien';
  let speciesName = 'Alien Baby';

  if (pet.id === 'wolf') {
    if (pet.level < 5)       { stage = 'wolf_pup';    speciesName = 'Wolf Pup'; }
    else if (pet.level < 10) { stage = 'wolf';         speciesName = 'Nebula Wolf'; }
    else if (pet.level < 20) { stage = 'shadow_wolf';  speciesName = 'Shadow Wolf'; }
    else if (pet.level < 30) { stage = 'void_wolf';    speciesName = 'Void Wolf'; }
    else                     { stage = 'alpha_wolf';   speciesName = 'Alpha Wolf'; }
  } else if (pet.id === 'phoenix') {
    if (pet.level < 5)       { stage = 'phoenix_egg';      speciesName = 'Flame Egg'; }
    else if (pet.level < 10) { stage = 'phoenix_chick';    speciesName = 'Fire Chick'; }
    else if (pet.level < 20) { stage = 'phoenix';           speciesName = 'Solar Phoenix'; }
    else if (pet.level < 30) { stage = 'inferno_phoenix';  speciesName = 'Inferno Phoenix'; }
    else                     { stage = 'celestial_phoenix'; speciesName = 'Celestial Phoenix'; }
  } else {
    if (pet.level < 5)       { stage = 'egg';     speciesName = 'Space Egg'; }
    else if (pet.level < 10) { stage = 'grub';    speciesName = 'Star Grub'; }
    else if (pet.level < 20) { stage = 'alien';   speciesName = 'Alien Baby'; }
    else if (pet.level < 30) { stage = 'crawler'; speciesName = 'Void Crawler'; }
    else                     { stage = 'dragon';  speciesName = 'Cosmic Dragon'; }
  }

  // Determine pet emotion based on stats
  let emotion: PetEmotion = 'normal';
  if (stage !== 'egg') { // Eggs don't show emotion
    if (isAnimating && animationType === 'feed') emotion = 'eating';
    else if (isAnimating && animationType === 'play') emotion = 'playing';
    else if (pet.happiness > 80 && pet.hunger < 20) emotion = 'happy';
    else if (pet.happiness < 30) emotion = 'sad';
    else if (pet.hunger > 80) emotion = 'hungry';
  }

  const isPerkActive = pet.happiness >= 80 && pet.hunger <= 20;
  const pilotName = player.name.trim() || 'captain';
  const petName = pet.name.trim() || 'Astro';
  const petDialogue = isAnimating && animationType === 'feed'
    ? `Mmm, thanks ${pilotName}! My fuel cells are glowing.`
    : isAnimating && animationType === 'play'
      ? `Zoomies! Race you around the galaxy, ${pilotName}!`
      : pet.hunger > 70
        ? 'My fuel cells are getting low... snack mission?'
        : pet.happiness < 35
          ? 'The stars feel quiet today. Want to play?'
          : isPerkActive
            ? `All systems bright, ${pilotName}! We make a great crew.`
            : `I found a new star to explore, ${pilotName}.`;
  const originStory = PET_BACKSTORIES[pet.id] || PET_BACKSTORIES.alien;

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-[#040b28] p-4 text-white flex flex-col"
      style={{
        paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))'
      }}
    >
      <style>{`
        @keyframes pet-breathe {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(0, -7px, 0) scale(1.025); }
        }
        @keyframes pet-orbit {
          to { transform: rotate(360deg); }
        }
        @keyframes pet-sparkle {
          0%, 100% { opacity: .25; transform: scale(.75) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.15) rotate(18deg); }
        }
        @keyframes pet-play {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          30% { transform: translateY(-16px) rotate(-6deg) scale(1.04); }
          65% { transform: translateY(2px) rotate(6deg) scale(.98); }
        }
        @keyframes pet-feed {
          0%, 100% { transform: scale(1) rotate(0deg); }
          45% { transform: scale(1.1) rotate(-2deg); }
          70% { transform: scale(1.04) rotate(2deg); }
        }
        .pet-idle { animation: pet-breathe 3.2s ease-in-out infinite; }
        .pet-orbit { animation: pet-orbit 16s linear infinite; }
        .pet-sparkle { animation: pet-sparkle 2.2s ease-in-out infinite; }
        .pet-play { animation: pet-play .9s cubic-bezier(.2,.8,.2,1); }
        .pet-feed { animation: pet-feed .9s ease-in-out; }
        @media (prefers-reduced-motion: reduce) {
          .pet-idle, .pet-orbit, .pet-sparkle, .pet-play, .pet-feed { animation: none; }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-32 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="relative z-10 flex justify-between items-center mb-4 bg-[#0a1942]/90 p-4 rounded-2xl backdrop-blur-md border border-cyan-200/20 shadow-[0_12px_35px_rgba(0,0,0,.22)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/30 bg-cyan-400/10">
              <Heart className="h-5 w-5 text-pink-300" fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-200/70">Companion deck</p>
              <h2 className="text-xl font-black tracking-tight text-white">Pet Lab</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-sm font-bold text-yellow-200">
              {player.coins} 💰
            </span>
            <button
              onClick={() => setShowShopModal(true)}
              className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 p-2 text-cyan-200 transition-colors hover:bg-cyan-400/20"
              title="Pet Shop"
              aria-label="Open pet shop"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 font-bold text-white transition-colors hover:bg-white/20"
            >
              Back
            </button>
          </div>
        </div>

        {/* Pet Display */}
        <div className="relative mb-4 flex-1 flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-gradient-to-b from-[#0b2362]/95 via-[#081944]/95 to-[#050c27] p-4 shadow-[0_18px_45px_rgba(0,0,0,.28)] backdrop-blur-sm sm:p-6">
          {/* Background decoration */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="pet-orbit h-64 w-64 rounded-full border border-cyan-200/30 border-dashed" />
            <Star className="absolute h-52 w-52 text-cyan-100/50" />
          </div>
          <span className="pet-sparkle pointer-events-none absolute left-8 top-28 text-2xl text-cyan-200/70">✦</span>
          <span className="pet-sparkle pointer-events-none absolute right-10 top-44 text-lg text-yellow-200/80" style={{ animationDelay: '0.8s' }}>✦</span>
          <span className="pet-sparkle pointer-events-none absolute bottom-32 left-16 text-sm text-fuchsia-200/70" style={{ animationDelay: '1.4s' }}>✦</span>

          {/* Active Perk Indicator */}
          <div className={`absolute left-4 right-4 top-4 rounded-xl border p-2 text-center text-xs font-bold uppercase tracking-wide transition-all ${isPerkActive ? 'border-yellow-400/50 bg-yellow-400/15 text-yellow-200' : 'border-white/10 bg-black/30 text-white/60'}`}>
            {isPerkActive ? '✨ Happy bonus: +20% coins & XP' : 'Keep happy + fed to activate your bonus'}
          </div>

          {/* Talking companion */}
          <div className="relative z-20 mt-12 min-h-[3.25rem] max-w-[19rem] rounded-2xl border border-cyan-200/25 bg-[#102b66]/90 px-4 py-3 text-center text-xs font-bold leading-relaxed text-cyan-50 shadow-lg shadow-cyan-950/30" aria-live="polite">
            <span>{petDialogue}</span>
            <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-cyan-200/25 bg-[#102b66]" />
          </div>

          <div className={`relative z-10 mb-3 mt-3 ${isAnimating && animationType === 'play' ? 'pet-play' : isAnimating && animationType === 'feed' ? 'pet-feed' : 'pet-idle'}`}>
            <PetCharacter stage={stage} emotion={emotion} className="w-48 h-48 drop-shadow-2xl" />
            {isAnimating && animationType === 'play' && <span className="absolute -top-4 -right-4 text-4xl animate-ping">✨</span>}
            {isAnimating && animationType === 'feed' && <span className="absolute -top-4 -right-4 text-4xl animate-pulse">🍖</span>}
          </div>

          <div className="flex items-center gap-2 z-10 mb-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <label htmlFor="petName" className="sr-only">Pet Name</label>
                <input
                  id="petName"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-black/50 text-white font-bold text-2xl rounded-lg px-2 py-1 w-32 outline-none border border-white/20"
                  autoFocus
                  maxLength={12}
                />
                <button onClick={handleSaveName} className="bg-green-500 p-1.5 rounded-lg text-white">
                  <Check className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-3xl font-black tracking-tight text-white">{petName}</h3>
                {onRename && (
                  <button onClick={() => setIsEditingName(true)} className="text-white/50 hover:text-white">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
          <div className="z-10 mb-5 flex items-center justify-center gap-2">
            <p className="rounded-full border border-purple-300/20 bg-purple-300/10 px-3 py-1 text-sm font-bold text-purple-200">Level {pet.level} · {speciesName}</p>
            <button
              onClick={() => setShowEvolutionModal(true)}
              className="text-purple-300 hover:text-white transition-colors"
              title="View Evolution Cycle"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Stats */}
          <div className="z-10 w-full space-y-4">
            <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
              <span>Condition report</span>
              <span>Bond level {pet.level}</span>
            </div>
            {/* XP Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white font-bold flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> XP</span>
                <span className="text-yellow-400 font-bold">{pet.xp} / {pet.level * 50}</span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${(pet.xp / (pet.level * 50)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white font-bold flex items-center gap-1"><Heart className="w-4 h-4 text-pink-400" /> Happiness</span>
                <span className="text-pink-400 font-bold">{pet.happiness}%</span>
              </div>
              <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, pet.happiness))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white font-bold flex items-center gap-1"><Activity className="w-4 h-4 text-orange-400" /> Hunger</span>
                <span className="text-orange-400 font-bold">{pet.hunger}%</span>
              </div>
              <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, pet.hunger))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Backstory */}
        <section className="relative z-10 mb-4 overflow-hidden rounded-2xl border border-purple-200/20 bg-[#0a1942]/90 shadow-lg shadow-black/10">
          <button
            type="button"
            onClick={() => setShowBackstory((visible) => !visible)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
            aria-expanded={showBackstory}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-400/15 text-purple-200">
                <Info className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-purple-200/60">Origin log</span>
                <span className="block truncate text-sm font-black text-white">{petName}'s backstory</span>
              </span>
            </span>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-cyan-200">{showBackstory ? 'Hide' : 'Read'}</span>
          </button>
          {showBackstory && (
            <div className="border-t border-white/10 px-4 pb-4 pt-3">
              <p className="text-sm leading-relaxed text-slate-200/85">{originStory}</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-cyan-200/55">Your bond grows with every mission</p>
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="relative z-10 mb-2">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Care actions</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200/60">Spend coins · earn bond XP</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <button
              onClick={handleFeed}
              disabled={pet.hunger === 0 || player.coins < 10 || feedCooldown > 0}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-2xl text-white font-bold flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-500/20 relative overflow-hidden"
            >
              {feedCooldown > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-20">
                  <span className="text-xl font-mono">{formatTime(feedCooldown)}</span>
                </div>
              )}
              <span className="text-2xl z-10">🍖</span>
              <span className="z-10">Feed (10 💰)</span>
            </button>
            {pet.hunger === 0 && feedCooldown === 0 && (
              <p className="text-xs text-white/50 text-center">Already full!</p>
            )}
            {player.coins < 10 && pet.hunger > 0 && feedCooldown === 0 && (
              <p className="text-xs text-red-400/80 text-center">Need 10 coins</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={handlePlay}
              disabled={pet.happiness === 100 || player.coins < 15 || playCooldown > 0}
              className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-2xl text-white font-bold flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-pink-500/20 relative overflow-hidden"
            >
              {playCooldown > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-20">
                  <span className="text-xl font-mono">{formatTime(playCooldown)}</span>
                </div>
              )}
              <span className="text-2xl z-10">🎾</span>
              <span className="z-10">Play (15 💰)</span>
            </button>
            {pet.happiness === 100 && playCooldown === 0 && (
              <p className="text-xs text-white/50 text-center">Already max happy!</p>
            )}
            {player.coins < 15 && pet.happiness < 100 && playCooldown === 0 && (
              <p className="text-xs text-red-400/80 text-center">Need 15 coins</p>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Shop Modal */}
      {showShopModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowShopModal(false)}
        >
          <div
            className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 w-full max-w-md relative max-h-[calc(100dvh-3rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowShopModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-2 text-center">Pet Shop</h3>
            <p className="text-slate-400 text-center text-sm mb-6">Adopt a new companion!</p>

            <div className="space-y-4">
              {AVAILABLE_PETS.map(p => {
                const isOwned = !!player.pets?.[p.id];
                const isEquipped = activePetId === p.id;
                const canAfford = player.coins >= p.cost;

                return (
                  <div key={p.id} className={`flex items-center gap-4 p-3 rounded-xl border ${isEquipped ? 'bg-blue-900/40 border-blue-500/50' : 'bg-black/40 border-white/5'}`}>
                    <div className="w-16 h-16 bg-black/50 rounded-lg flex items-center justify-center">
                    <PetCharacter stage={p.id === 'wolf' ? 'wolf_pup' : p.id === 'phoenix' ? 'phoenix_egg' : 'egg'} emotion="normal" className="w-12 h-12" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">{p.name}</p>
                      <p className="text-slate-400 text-xs mb-2">{p.description}</p>
                      {isEquipped ? (
                        <span className="text-blue-400 font-bold text-sm">Active</span>
                      ) : isOwned ? (
                        <button
                          onClick={() => {
                            if (onEquipPet) onEquipPet(p.id);
                            setShowShopModal(false);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold transition-colors"
                        >
                          Equip
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (onBuyPet && canAfford) onBuyPet(p.id, p.cost);
                          }}
                          disabled={!canAfford}
                          className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${canAfford ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                        >
                          Buy ({p.cost} 💰)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Evolution Modal */}
      {showEvolutionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowEvolutionModal(false)}
        >
          <div
            className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 w-full max-w-sm relative max-h-[calc(100dvh-3rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEvolutionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Evolution Cycle</h3>
            <div className="space-y-3">
              {(pet.id === 'wolf'
                ? [
                    { s: 'wolf_pup' as PetStage,   name: 'Wolf Pup',         levels: '1 - 4' },
                    { s: 'wolf' as PetStage,        name: 'Nebula Wolf',      levels: '5 - 9' },
                    { s: 'shadow_wolf' as PetStage, name: 'Shadow Wolf',      levels: '10 - 19' },
                    { s: 'void_wolf' as PetStage,   name: 'Void Wolf',        levels: '20 - 29' },
                    { s: 'alpha_wolf' as PetStage,  name: 'Alpha Wolf',       levels: '30+' },
                  ]
                : pet.id === 'phoenix'
                ? [
                    { s: 'phoenix_egg' as PetStage,       name: 'Flame Egg',         levels: '1 - 4' },
                    { s: 'phoenix_chick' as PetStage,     name: 'Fire Chick',        levels: '5 - 9' },
                    { s: 'phoenix' as PetStage,           name: 'Solar Phoenix',     levels: '10 - 19' },
                    { s: 'inferno_phoenix' as PetStage,   name: 'Inferno Phoenix',   levels: '20 - 29' },
                    { s: 'celestial_phoenix' as PetStage, name: 'Celestial Phoenix', levels: '30+' },
                  ]
                : [
                    { s: 'egg' as PetStage,     name: 'Space Egg',     levels: '1 - 4' },
                    { s: 'grub' as PetStage,    name: 'Star Grub',     levels: '5 - 9' },
                    { s: 'alien' as PetStage,   name: 'Alien Baby',    levels: '10 - 19' },
                    { s: 'crawler' as PetStage, name: 'Void Crawler',  levels: '20 - 29' },
                    { s: 'dragon' as PetStage,  name: 'Cosmic Dragon', levels: '30+' },
                  ]
              ).map(({ s, name, levels }) => (
                <div key={s} className={`flex items-center gap-4 p-3 rounded-xl border ${stage === s ? 'bg-purple-900/50 border-purple-500/60' : 'bg-black/40 border-white/5'}`}>
                  <PetCharacter stage={s} emotion="normal" className="w-12 h-12 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-white font-bold">{name}</p>
                    <p className="text-slate-400 text-sm">Levels {levels}</p>
                  </div>
                  {stage === s && <span className="text-yellow-400 text-xs font-bold">✦ Now</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetScreen;

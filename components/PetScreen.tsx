import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types';
import { Heart, Activity, Zap, Star, Edit2, Check, Info, X, ShoppingBag } from 'lucide-react';
import { playSound } from '../services/audioService';
import { nativeService } from '../services/nativeService';
import { PetCharacter, PetStage, PetEmotion } from './PetCharacters';

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

  // Determine pet base form based on level
  let stage: PetStage = 'alien';
  let speciesName = 'Alien Baby';
  
  if (pet.id === 'wolf') {
    stage = 'wolf';
    speciesName = 'Nebula Wolf';
  } else if (pet.id === 'phoenix') {
    stage = 'phoenix';
    speciesName = 'Solar Phoenix';
  } else {
    if (pet.level < 5) { stage = 'egg'; speciesName = 'Space Egg'; }
    else if (pet.level < 10) { stage = 'grub'; speciesName = 'Star Grub'; }
    else if (pet.level < 20) { stage = 'alien'; speciesName = 'Alien Baby'; }
    else if (pet.level < 30) { stage = 'crawler'; speciesName = 'Void Crawler'; }
    else { stage = 'dragon'; speciesName = 'Cosmic Dragon'; }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 pb-12 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-black/30 p-4 rounded-2xl backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Space Pet</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-yellow-400/20 px-3 py-1 rounded-lg text-yellow-300 font-bold border border-yellow-400/30">
              {player.coins} 💰
            </span>
            <button
              onClick={() => setShowShopModal(true)}
              className="bg-blue-500/20 hover:bg-blue-500/40 transition-colors p-2 rounded-xl text-blue-300 border border-blue-400/30"
              title="Pet Shop"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-xl text-white font-bold"
            >
              Back
            </button>
          </div>
        </div>

        {/* Pet Display */}
        <div className="flex-1 bg-black/20 rounded-3xl p-6 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center relative overflow-hidden mb-6">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10 flex items-center justify-center">
            <Star className="w-64 h-64 text-white animate-spin-slow" />
          </div>

          {/* Active Perk Indicator */}
          <div className={`absolute top-4 left-4 right-4 p-2 rounded-xl border text-center text-sm font-bold transition-all ${isPerkActive ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300' : 'bg-black/40 border-white/10 text-white/50'}`}>
            {isPerkActive ? '✨ Happy Bonus: +20% Coins & XP!' : 'Keep happy & fed for a bonus!'}
          </div>

          <div className={`mt-8 mb-4 relative z-10 transition-transform duration-300 ${isAnimating && animationType === 'play' ? 'animate-bounce' : ''} ${isAnimating && animationType === 'feed' ? 'scale-110' : ''}`}>
            <PetCharacter stage={stage} emotion={emotion} className="w-48 h-48 drop-shadow-2xl" />
            {isAnimating && animationType === 'play' && <span className="absolute -top-4 -right-4 text-4xl animate-ping">✨</span>}
            {isAnimating && animationType === 'feed' && <span className="absolute -top-4 -right-4 text-4xl animate-pulse">🍖</span>}
          </div>

          <div className="flex items-center gap-2 z-10 mb-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input 
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
                <h3 className="text-3xl font-bold text-white">{pet.name}</h3>
                {onRename && (
                  <button onClick={() => setIsEditingName(true)} className="text-white/50 hover:text-white">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 z-10 mb-6">
            <p className="text-purple-300 font-medium">Level {pet.level} {speciesName}</p>
            {pet.id === 'alien' && (
              <button 
                onClick={() => setShowEvolutionModal(true)} 
                className="text-purple-300 hover:text-white transition-colors"
                title="View Evolution Cycle"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="w-full space-y-4 z-10">
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

        {/* Actions */}
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

      {/* Shop Modal */}
      {showShopModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowShopModal(false)}
        >
          <div 
            className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 w-full max-w-md relative max-h-[80vh] overflow-y-auto"
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
                      <PetCharacter stage={p.id === 'alien' ? 'alien' : p.id as PetStage} emotion="normal" className="w-12 h-12" />
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
            className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 w-full max-w-sm relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowEvolutionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Evolution Cycle</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                <PetCharacter stage="egg" emotion="normal" className="w-12 h-12" />
                <div>
                  <p className="text-white font-bold">Space Egg</p>
                  <p className="text-slate-400 text-sm">Levels 1 - 4</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                <PetCharacter stage="grub" emotion="normal" className="w-12 h-12" />
                <div>
                  <p className="text-white font-bold">Star Grub</p>
                  <p className="text-slate-400 text-sm">Levels 5 - 9</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                <PetCharacter stage="alien" emotion="normal" className="w-12 h-12" />
                <div>
                  <p className="text-white font-bold">Alien Baby</p>
                  <p className="text-slate-400 text-sm">Levels 10 - 19</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                <PetCharacter stage="crawler" emotion="normal" className="w-12 h-12" />
                <div>
                  <p className="text-white font-bold">Void Crawler</p>
                  <p className="text-slate-400 text-sm">Levels 20 - 29</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                <PetCharacter stage="dragon" emotion="normal" className="w-12 h-12" />
                <div>
                  <p className="text-white font-bold">Cosmic Dragon</p>
                  <p className="text-slate-400 text-sm">Level 30+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetScreen;

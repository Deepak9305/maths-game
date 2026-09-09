import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { PlayerState } from '../types';

const STORAGE_KEY = 'math-quest-data-v1';
const FRIEND_CODE_KEY = 'math-quest-friend-code';

const finiteNumber = (value: unknown, fallback: number, min = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(min, value) : fallback;

const stringArray = (value: unknown, fallback: string[]) =>
  Array.isArray(value) && value.every(item => typeof item === 'string') ? value : fallback;

const defaultPet = () => ({
  id: 'alien', name: 'Astro', happiness: 100, hunger: 0, level: 1, xp: 0, lastInteractionTime: Date.now()
});

/**
 * Repairs older, partial, or malformed local saves without mutating the
 * original payload. Valid values are kept; only unsafe values fall back.
 */
export const normalizePlayerState = (raw: unknown): PlayerState => {
  const value = raw && typeof raw === 'object' ? raw as Partial<PlayerState> : {};
  const rawPowerUps: Partial<PlayerState['powerUps']> = value.powerUps && typeof value.powerUps === 'object'
    ? value.powerUps
    : {};
  const legacyPet = value.pet && typeof value.pet === 'object' ? value.pet : undefined;
  const rawPets = value.pets && typeof value.pets === 'object' ? value.pets : undefined;
  const pets = Object.entries(rawPets ?? (legacyPet ? { alien: legacyPet } : {})).reduce<NonNullable<PlayerState['pets']>>((result, [id, pet]) => {
    if (!pet || typeof pet !== 'object') return result;
    const candidate = pet as Partial<NonNullable<PlayerState['pets']>[string]>;
    result[id] = {
      id,
      name: typeof candidate.name === 'string' && candidate.name.trim() ? candidate.name.slice(0, 24) : id === 'alien' ? 'Astro' : id,
      happiness: finiteNumber(candidate.happiness, 100, 0) > 100 ? 100 : finiteNumber(candidate.happiness, 100, 0),
      hunger: finiteNumber(candidate.hunger, 0, 0) > 100 ? 100 : finiteNumber(candidate.hunger, 0, 0),
      level: Math.max(1, Math.floor(finiteNumber(candidate.level, 1, 1))),
      xp: finiteNumber(candidate.xp, 0),
      lastInteractionTime: finiteNumber(candidate.lastInteractionTime, Date.now()),
      ...(finiteNumber(candidate.lastFedTime, 0) > 0 ? { lastFedTime: finiteNumber(candidate.lastFedTime, 0) } : {}),
      ...(finiteNumber(candidate.lastPlayedTime, 0) > 0 ? { lastPlayedTime: finiteNumber(candidate.lastPlayedTime, 0) } : {})
    };
    return result;
  }, {});

  if (!Object.keys(pets).length) pets.alien = defaultPet();
  const activePetId = typeof value.activePetId === 'string' && pets[value.activePetId]
    ? value.activePetId
    : Object.keys(pets)[0];

  const modeStats = value.modeStats && typeof value.modeStats === 'object'
    ? Object.entries(value.modeStats).reduce<NonNullable<PlayerState['modeStats']>>((result, [mode, stats]) => {
        if (!stats || typeof stats !== 'object') return result;
        const candidate = stats as { bestScore?: number; bestStreak?: number; gamesPlayed?: number; bestTime?: number };
        result[mode as keyof NonNullable<PlayerState['modeStats']>] = {
          bestScore: finiteNumber(candidate.bestScore, 0),
          bestStreak: finiteNumber(candidate.bestStreak, 0),
          gamesPlayed: Math.floor(finiteNumber(candidate.gamesPlayed, 0)),
          ...(finiteNumber(candidate.bestTime, 0) > 0 ? { bestTime: finiteNumber(candidate.bestTime, 0) } : {})
        };
        return result;
      }, {})
    : {};

  const modeProgress = value.modeProgress && typeof value.modeProgress === 'object'
    ? Object.entries(value.modeProgress).reduce<NonNullable<PlayerState['modeProgress']>>((result, [mode, level]) => {
        if (typeof level === 'number' && Number.isFinite(level)) {
          result[mode as keyof NonNullable<PlayerState['modeProgress']>] = Math.min(50, Math.max(1, Math.floor(level)));
        }
        return result;
      }, {})
    : {};

  return {
    name: typeof value.name === 'string' ? value.name.slice(0, 24) : '',
    coins: finiteNumber(value.coins, 150),
    level: Math.max(1, Math.floor(finiteNumber(value.level, 1, 1))),
    xp: finiteNumber(value.xp, 0),
    totalScore: finiteNumber(value.totalScore, 0),
    achievements: stringArray(value.achievements, []),
    equippedRocket: typeof value.equippedRocket === 'string' ? value.equippedRocket : '🚀',
    ownedRockets: stringArray(value.ownedRockets, ['🚀']),
    powerUps: {
      hint: Math.floor(finiteNumber(rawPowerUps.hint, 3)),
      timeFreeze: Math.floor(finiteNumber(rawPowerUps.timeFreeze, 2))
    },
    lastRewardDate: typeof value.lastRewardDate === 'string' ? value.lastRewardDate : null,
    dailyChallenges: Array.isArray(value.dailyChallenges) ? value.dailyChallenges : [],
    lastChallengeDate: typeof value.lastChallengeDate === 'string' ? value.lastChallengeDate : null,
    pets,
    activePetId,
    showAnimations: typeof value.showAnimations === 'boolean' ? value.showAnimations : true,
    hapticsEnabled: typeof value.hapticsEnabled === 'boolean' ? value.hapticsEnabled : true,
    musicEnabled: typeof value.musicEnabled === 'boolean' ? value.musicEnabled : true,
    modeStats,
    modeProgress
  };
};

export const normalizeStoredData = (raw: unknown): { player: PlayerState; dailyStreak: number } | null => {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as { player?: unknown; dailyStreak?: unknown };
  if (!value.player) return null;
  return {
    player: normalizePlayerState(value.player),
    dailyStreak: Math.max(1, Math.floor(finiteNumber(value.dailyStreak, 1, 1)))
  };
};

export const storageService = {
  saveData: async (player: PlayerState, dailyStreak: number): Promise<boolean> => {
    const data = JSON.stringify({ player, dailyStreak });

    try {
      if (Capacitor.isNativePlatform()) {
        await Preferences.set({
          key: STORAGE_KEY,
          value: data,
        });
      } else {
        localStorage.setItem(STORAGE_KEY, data);
      }
      return true;
    } catch (e) {
      console.error('Failed to save game data', e);
      return false;
    }
  },

  loadDataResult: async (): Promise<{ data: { player: PlayerState; dailyStreak: number } | null; failed: boolean }> => {
    try {
      const rawData = Capacitor.isNativePlatform()
        ? (await Preferences.get({ key: STORAGE_KEY })).value
        : localStorage.getItem(STORAGE_KEY);
      if (!rawData) return { data: null, failed: false };
      return { data: normalizeStoredData(JSON.parse(rawData)), failed: false };
    } catch (error) {
      console.error('Failed to load game data; continuing with safe defaults', error);
      return { data: null, failed: true };
    }
  },

  loadData: async (): Promise<{ player: PlayerState; dailyStreak: number } | null> =>
    (await storageService.loadDataResult()).data,

  // Persist the friend code so it doesn't regenerate on every session
  getFriendCode: async (generateNew: () => string): Promise<string> => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { value } = await Preferences.get({ key: FRIEND_CODE_KEY });
        if (value) return value;
        const newCode = generateNew();
        await Preferences.set({ key: FRIEND_CODE_KEY, value: newCode });
        return newCode;
      } else {
        const existing = localStorage.getItem(FRIEND_CODE_KEY);
        if (existing) return existing;
        const newCode = generateNew();
        localStorage.setItem(FRIEND_CODE_KEY, newCode);
        return newCode;
      }
    } catch (e) {
      console.error('Failed to get/set friend code', e);
      return generateNew();
    }
  }
};

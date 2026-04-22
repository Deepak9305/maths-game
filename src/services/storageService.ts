import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { PlayerState } from '../types';

const STORAGE_KEY = 'math-quest-data-v1';
const FRIEND_CODE_KEY = 'math-quest-friend-code';

export const storageService = {
  saveData: async (player: PlayerState, dailyStreak: number) => {
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
    } catch (e) {
      console.error('Failed to save game data', e);
    }
  },

  loadData: async (): Promise<{ player: PlayerState; dailyStreak: number } | null> => {
    let rawData: string | null = null;

    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      rawData = value;
    } else {
      rawData = localStorage.getItem(STORAGE_KEY);
    }

    if (rawData) {
      try {
        return JSON.parse(rawData);
      } catch (e) {
        console.error('Error parsing save data', e);
        return null;
      }
    }
    return null;
  },

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
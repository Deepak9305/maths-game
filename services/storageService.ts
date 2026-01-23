import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { PlayerState } from '../types';

const STORAGE_KEY = 'math-quest-data-v1';

export const storageService = {
  saveData: async (player: PlayerState, dailyStreak: number) => {
    const data = JSON.stringify({ player, dailyStreak });
    
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({
        key: STORAGE_KEY,
        value: data,
      });
    } else {
      localStorage.setItem(STORAGE_KEY, data);
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
  }
};
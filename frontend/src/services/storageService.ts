import type { ProgressState } from '../types/progress';
import type { PlayerProfile } from '../types/profile';

const STORAGE_KEYS = {
  PROGRESS: 'pyquest_progress_state',
  PROFILE: 'pyquest_player_profile',
  SETTINGS: 'pyquest_settings',
};

const DEFAULT_PROFILE: PlayerProfile = {
  id: 'player-1',
  username: 'PyQuest Apprentice',
  title: 'Code Wanderer',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  coins: 25,
  energy: 100,
  badges: [
    {
      id: 'first-step',
      name: 'Novice Conjurer',
      description: 'Embarked on the PyQuest adventure',
      icon: 'Sparkles',
      unlockedAt: new Date().toISOString(),
    },
  ],
};

const DEFAULT_PROGRESS: ProgressState = {
  userId: 'player-1',
  activeWorldId: 'python-basics',
  currentLevelId: 'level-1-print',
  completedLevels: [],
  levelStates: {
    'level-1-print': {
      levelId: 'level-1-print',
      status: 'AVAILABLE',
      score: 0,
      stars: 0,
    },
    'level-2-variables': {
      levelId: 'level-2-variables',
      status: 'LOCKED',
      score: 0,
      stars: 0,
    },
    'level-3-input': {
      levelId: 'level-3-input',
      status: 'LOCKED',
      score: 0,
      stars: 0,
    },
  },
};

export const StorageService = {
  getProfile(): PlayerProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('[StorageService] Failed to save profile:', e);
    }
  },

  getProgress(): ProgressState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return data ? JSON.parse(data) : DEFAULT_PROGRESS;
    } catch {
      return DEFAULT_PROGRESS;
    }
  },

  saveProgress(progress: ProgressState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.warn('[StorageService] Failed to save progress:', e);
    }
  },

  resetAll(): void {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  },
};

import type { World, Level } from '../types/world';
import type { ProgressState } from '../types/progress';
import type { PlayerProfile } from '../types/profile';
import { DEFAULT_WORLD_1, ALL_DEFAULT_WORLDS } from '../data/defaultCurriculum';
import { StorageService } from './storageService';

const BASE_URL = '/api';

export const ApiService = {
  async checkHealth(): Promise<{ status: string; message: string; version: string }> {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return {
        status: 'offline-mode',
        version: '1.0.0',
        message: 'Backend server offline. Running in local browser sandbox mode.',
      };
    }
  },

  async getWorlds(): Promise<World[]> {
    try {
      const res = await fetch(`${BASE_URL}/worlds`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      // Fallback to offline bundled curriculum
      return ALL_DEFAULT_WORLDS;
    }
  },

  async getWorld(worldId: string): Promise<World> {
    try {
      const res = await fetch(`${BASE_URL}/worlds/${worldId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return ALL_DEFAULT_WORLDS.find((w) => w.id === worldId) || DEFAULT_WORLD_1;
    }
  },

  async getLevel(worldId: string, levelId: string): Promise<Level | undefined> {
    try {
      const res = await fetch(`${BASE_URL}/worlds/${worldId}/levels/${levelId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      const world = ALL_DEFAULT_WORLDS.find((w) => w.id === worldId) || DEFAULT_WORLD_1;
      return world.levels.find((l) => l.id === levelId);
    }
  },

  async getProgress(userId: string): Promise<ProgressState> {
    try {
      const res = await fetch(`${BASE_URL}/progress/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const local = StorageService.getProgress();
      if (local && local.completedLevels && local.completedLevels.length > data.completedLevels.length) {
        ApiService.saveProgress(local);
        return local;
      }
      StorageService.saveProgress(data);
      return data;
    } catch {
      return StorageService.getProgress();
    }
  },

  async saveProgress(progress: ProgressState): Promise<ProgressState> {
    StorageService.saveProgress(progress);
    try {
      const res = await fetch(`${BASE_URL}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[ApiService] Could not sync progress to backend, cached locally:', e);
    }
    return progress;
  },

  async getProfile(userId: string): Promise<PlayerProfile> {
    try {
      const res = await fetch(`${BASE_URL}/profile/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const local = StorageService.getProfile();
      if (local && local.xp > data.xp) {
        ApiService.saveProfile(local);
        return local;
      }
      StorageService.saveProfile(data);
      return data;
    } catch {
      return StorageService.getProfile();
    }
  },

  async saveProfile(profile: PlayerProfile): Promise<PlayerProfile> {
    StorageService.saveProfile(profile);
    try {
      const res = await fetch(`${BASE_URL}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[ApiService] Could not sync profile to backend, cached locally:', e);
    }
    return profile;
  },
};

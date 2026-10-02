import React, { useState, useEffect, useCallback } from 'react';
import type { World, Level } from './types/world';
import type { ProgressState, LevelProgress } from './types/progress';
import type { PlayerProfile } from './types/profile';
import { DEFAULT_WORLD_1 } from './data/defaultCurriculum';
import { StorageService } from './services/storageService';
import { ApiService } from './services/api';
import { useAudio } from './hooks/useAudio';
import { QuestHud } from './components/hud/QuestHud';
import { NavigationBar } from './components/hud/NavigationBar';
import type { NavTab } from './components/hud/NavigationBar';
import { HomePage } from './pages/HomePage';
import { AdventurePage } from './pages/AdventurePage';
import { PracticePage } from './pages/PracticePage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { QuestContainer } from './features/challenge/QuestContainer';
import { pyodideRunner } from './services/pyodideRunner';

export const App: React.FC = () => {
  const { muted, toggleMute, playSound } = useAudio();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeWorld, setActiveWorld] = useState<World>(DEFAULT_WORLD_1);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);

  const [profile, setProfile] = useState<PlayerProfile>(() => StorageService.getProfile());
  const [progress, setProgress] = useState<ProgressState>(() => StorageService.getProgress());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendStatus, setBackendStatus] = useState<string>('checking');

  // Initial data loading & backend health check
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const health = await ApiService.checkHealth();
        if (isMounted) setBackendStatus(health.status);

        const worlds = await ApiService.getWorlds();
        if (isMounted && worlds && worlds.length > 0) {
          setActiveWorld(worlds[0]);
        }

        const userProgress = await ApiService.getProgress(profile.id);
        if (isMounted && userProgress) {
          setProgress(userProgress);
        }

        const userProfile = await ApiService.getProfile(profile.id);
        if (isMounted && userProfile) {
          setProfile(userProfile);
        }
      } catch (err) {
        console.warn('[App] Offline fallback active:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    // Preload Pyodide in background for instant code trials
    pyodideRunner.initPyodide().catch(() => {
      // Background preload error silently handled
    });

    return () => {
      isMounted = false;
    };
  }, [profile.id]);

  // Handle Level Selection
  const handleSelectLevel = useCallback((level: Level) => {
    setActiveLevel(level);
  }, []);

  // Handle Level Completion & Progression Unlocking
  const handleLevelComplete = useCallback(
    (levelId: string, earnedXp: number, earnedCoins: number) => {
      // 1. Update Profile (XP, Coins, Level Calculation)
      setProfile((prev) => {
        const newXp = prev.xp + earnedXp;
        let newLevel = prev.level;
        let newXpToNext = prev.xpToNextLevel;

        if (newXp >= prev.xpToNextLevel) {
          newLevel += 1;
          newXpToNext = Math.round(prev.xpToNextLevel * 1.5);
        }

        const updatedProfile: PlayerProfile = {
          ...prev,
          xp: newXp,
          level: newLevel,
          xpToNextLevel: newXpToNext,
          coins: prev.coins + earnedCoins,
        };

        ApiService.saveProfile(updatedProfile);
        return updatedProfile;
      });

      // 2. Update Progress & Unlock Next Level
      setProgress((prev) => {
        const completedLevels = prev.completedLevels.includes(levelId)
          ? prev.completedLevels
          : [...prev.completedLevels, levelId];

        const updatedLevelStates: Record<string, LevelProgress> = {
          ...prev.levelStates,
          [levelId]: {
            levelId,
            status: 'COMPLETED',
            score: 100,
            stars: 3,
            completedAt: new Date().toISOString(),
          },
        };

        // Determine next level to unlock
        const currentLevelObj = activeWorld.levels.find((l) => l.id === levelId);
        if (currentLevelObj) {
          const nextLevelObj = activeWorld.levels.find(
            (l) => l.order === currentLevelObj.order + 1
          );
          if (nextLevelObj) {
            const existingState = updatedLevelStates[nextLevelObj.id];
            if (!existingState || existingState.status === 'LOCKED') {
              updatedLevelStates[nextLevelObj.id] = {
                levelId: nextLevelObj.id,
                status: 'AVAILABLE',
                score: 0,
                stars: 0,
              };
            }
          }
        }

        const updatedProgress: ProgressState = {
          ...prev,
          completedLevels,
          levelStates: updatedLevelStates,
        };

        ApiService.saveProgress(updatedProgress);
        return updatedProgress;
      });
    },
    [activeWorld.levels]
  );

  // Handle Full Progress Reset
  const handleResetProgress = useCallback(() => {
    StorageService.resetAll();
    const freshProfile = StorageService.getProfile();
    const freshProgress = StorageService.getProgress();
    setProfile(freshProfile);
    setProgress(freshProgress);
    setActiveLevel(null);
    setActiveTab('home');
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Quest HUD */}
      <QuestHud
        profile={profile}
        muted={muted}
        onToggleMute={toggleMute}
        onOpenProfile={() => {
          playSound('click');
          setActiveLevel(null);
          setActiveTab('profile');
        }}
      />

      {/* Main Navigation Bar */}
      <NavigationBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          playSound('click');
          setActiveLevel(null);
          setActiveTab(tab);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col items-center justify-start">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center my-auto py-20 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-sky-500/30 border-t-sky-400 animate-spin" />
            <span className="text-sm font-bold text-sky-300">
              Awakening PyQuest Realm...
            </span>
          </div>
        ) : activeLevel ? (
          /* Active Level Quest Container (Theory + Quiz + Editor) */
          <QuestContainer
            level={activeLevel}
            onBackToMap={() => {
              playSound('click');
              setActiveLevel(null);
              setActiveTab('adventure');
            }}
            onLevelComplete={handleLevelComplete}
            onPlaySound={playSound}
          />
        ) : (
          /* Tab Routing */
          <>
            {activeTab === 'home' && (
              <HomePage
                onStartAdventure={() => {
                  setActiveTab('adventure');
                }}
                onOpenPractice={() => {
                  setActiveTab('practice');
                }}
                onPlaySound={playSound}
              />
            )}

            {activeTab === 'adventure' && (
              <AdventurePage
                world={activeWorld}
                progress={progress}
                onSelectLevel={handleSelectLevel}
                onPlaySound={playSound}
              />
            )}

            {activeTab === 'practice' && (
              <PracticePage
                world={activeWorld}
                onSelectLevel={handleSelectLevel}
                onPlaySound={playSound}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressPage world={activeWorld} progress={progress} />
            )}

            {activeTab === 'profile' && (
              <ProfilePage
                profile={profile}
                progress={progress}
                onResetProgress={handleResetProgress}
                onPlaySound={playSound}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ⚔️ <strong className="text-slate-400">PyQuest</strong> — Learn Python. Complete Quests. Master Code.
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'ok' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="text-[11px] text-slate-400">
                {backendStatus === 'ok' ? 'FastAPI Connected' : 'Offline Sandbox'}
              </span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

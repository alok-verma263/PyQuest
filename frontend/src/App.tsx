import React, { useState, useEffect, useCallback } from 'react';
import type { World, Level } from './types/world';
import type { ProgressState, LevelProgress } from './types/progress';
import type { PlayerProfile } from './types/profile';
import { DEFAULT_WORLD_1, ALL_DEFAULT_WORLDS } from './data/defaultCurriculum';
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
import { ProfileCreationModal } from './features/profile/ProfileCreationModal';
import { SettingsModal } from './components/common/SettingsModal';
import { pyodideRunner } from './services/pyodideRunner';

export const App: React.FC = () => {
  const { muted, toggleMute, playSound } = useAudio();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [worlds, setWorlds] = useState<World[]>(ALL_DEFAULT_WORLDS);
  const [activeWorldId, setActiveWorldId] = useState<string>('python-basics');
  const activeWorld = worlds.find((w) => w.id === activeWorldId) || worlds[0] || DEFAULT_WORLD_1;
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);

  const [profile, setProfile] = useState<PlayerProfile>(() => StorageService.getProfile());
  const [progress, setProgress] = useState<ProgressState>(() => StorageService.getProgress());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendStatus, setBackendStatus] = useState<string>('checking');

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Initial data loading & backend health check
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const health = await ApiService.checkHealth();
        if (isMounted) setBackendStatus(health.status);

        const fetchedWorlds = await ApiService.getWorlds();
        if (isMounted && fetchedWorlds && fetchedWorlds.length > 0) {
          setWorlds(fetchedWorlds);
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
      // Handled silently
    });

    return () => {
      isMounted = false;
    };
  }, [profile.id]);

  // Handle Profile Creation / Update from Modal
  const handleSaveProfile = useCallback((updated: PlayerProfile) => {
    setProfile(updated);
    ApiService.saveProfile(updated);
    setIsProfileModalOpen(false);
    // Transition straight into Adventure Map
    setActiveLevel(null);
    setActiveTab('adventure');
  }, []);

  // Handle Level Selection
  const handleStartLevel = useCallback((level: Level) => {
    setActiveLevel(level);
  }, []);

  // Handle Intermediate Challenge Rewards
  const handleAwardReward = useCallback((earnedXp: number, earnedCoins: number) => {
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

        // Determine next level to unlock across worlds
        const parentWorld =
          worlds.find((w) => w.levels.some((l) => l.id === levelId)) || activeWorld;
        const currentLevelObj = parentWorld.levels.find((l) => l.id === levelId);
        if (currentLevelObj) {
          const nextLevelObj = parentWorld.levels.find(
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

        // When completing tutorial / world 1, unlock Data Cleaning realm quest 1
        const dataCleaningFirstLevel = worlds.find((w) => w.id === 'data-cleaning')?.levels[0];
        if (dataCleaningFirstLevel && !updatedLevelStates[dataCleaningFirstLevel.id]) {
          updatedLevelStates[dataCleaningFirstLevel.id] = {
            levelId: dataCleaningFirstLevel.id,
            status: 'AVAILABLE',
            score: 0,
            stars: 0,
          };
        }

        const updatedProgress: ProgressState = {
          ...prev,
          completedLevels,
          levelStates: updatedLevelStates,
        };

        ApiService.saveProgress(updatedProgress);
        return updatedProgress;
      });

      // Special Reward: If boss trial completed, bestow the "Master of Clean Data" badge
      if (levelId === 'quest-7-clean-data-boss' || levelId === 'data-cleaning-q7') {
        setProfile((prevProf) => {
          const hasBadge = prevProf.badges.some((b) => b.id === 'badge-clean-data-master');
          if (!hasBadge) {
            const updated = {
              ...prevProf,
              badges: [
                ...prevProf.badges,
                {
                  id: 'badge-clean-data-master',
                  name: 'Master of Clean Data',
                  description: 'Conquered the Clean Data Trial workflow and mastered Module 1.',
                  icon: 'crown',
                  unlockedAt: new Date().toISOString(),
                },
              ],
            };
            ApiService.saveProfile(updated);
            return updated;
          }
          return prevProf;
        });
      }
    },
    [activeWorld, worlds]
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
            onAwardReward={handleAwardReward}
            onLevelComplete={handleLevelComplete}
            onPlaySound={playSound}
          />
        ) : (
          /* Tab Routing */
          <>
            {activeTab === 'home' && (
              <HomePage
                profile={profile}
                progress={progress}
                onStartAdventure={() => {
                  setIsProfileModalOpen(true);
                }}
                onContinueAdventure={() => {
                  setActiveTab('adventure');
                }}
                onOpenProfile={() => {
                  setActiveTab('profile');
                }}
                onOpenSettings={() => {
                  setIsSettingsModalOpen(true);
                }}
                onPlaySound={playSound}
              />
            )}

            {activeTab === 'adventure' && (
              <AdventurePage
                world={activeWorld}
                worlds={worlds}
                onSelectWorld={(w) => setActiveWorldId(w.id)}
                progress={progress}
                profile={profile}
                onStartLevel={handleStartLevel}
                onPlaySound={playSound}
              />
            )}

            {activeTab === 'practice' && (
              <PracticePage
                world={activeWorld}
                worlds={worlds}
                onSelectLevel={handleStartLevel}
                onPlaySound={playSound}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressPage
                world={activeWorld}
                worlds={worlds}
                progress={progress}
              />
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

      {/* Profile Creation / Avatar Selection Modal */}
      <ProfileCreationModal
        isOpen={isProfileModalOpen}
        initialProfile={profile}
        onSaveProfile={handleSaveProfile}
        onPlaySound={playSound}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        muted={muted}
        onToggleMute={toggleMute}
        onResetProgress={handleResetProgress}
        onPlaySound={playSound}
      />

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

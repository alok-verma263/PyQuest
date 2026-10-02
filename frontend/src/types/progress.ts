export type LevelStatus = 
  | 'LOCKED'
  | 'AVAILABLE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'MASTERED';

export interface LevelProgress {
  levelId: string;
  status: LevelStatus;
  score: number;
  stars: number;
  completedAt?: string;
}

export interface ProgressState {
  userId: string;
  activeWorldId: string;
  currentLevelId: string;
  completedLevels: string[];
  levelStates: Record<string, LevelProgress>;
}

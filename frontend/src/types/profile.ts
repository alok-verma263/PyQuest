export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface PlayerProfile {
  id: string;
  username: string;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  energy: number;
  badges: Badge[];
}

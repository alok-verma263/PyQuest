export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface AvatarOption {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  border: string;
  bg: string;
  description: string;
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatarId?: string;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  energy: number;
  badges: Badge[];
}


export type ChallengeType = 
  | 'multiple-choice'
  | 'fill-blank'
  | 'predict-output'
  | 'fix-bug'
  | 'write-code';

export interface TestCase {
  input: string;
  expectedOutput: string;
  hidden?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  type: ChallengeType;
  instructions: string;
  question?: string;
  options?: string[];
  answer?: string | number | boolean;
  starterCode?: string;
  solution?: string;
  testCases?: TestCase[];
  hints: string[];
  explanation?: string;
  xpReward: number;
  coinReward: number;
}

export interface LessonSlide {
  title: string;
  content: string;
  codeExample?: string;
  tip?: string;
}

export interface Level {
  id: string;
  worldId: string;
  order: number;
  title: string;
  description: string;
  mapX: number;
  mapY: number;
  xpReward: number;
  coinReward: number;
  topics?: string[];
  lessons: LessonSlide[];
  challenges: Challenge[];
}

export interface World {
  id: string;
  title: string;
  tagline: string;
  description: string;
  order: number;
  themeColor: string;
  levels: Level[];
}

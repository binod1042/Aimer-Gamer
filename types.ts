export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}

export interface GameSettings {
  duration: number; // in seconds
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  targetSize: number; // radius in px
  spawnRate: number; // interval in ms
}

export interface Target {
  id: number;
  x: number;
  y: number;
  radius: number;
  createdAt: number;
  lifetime: number; // how long it stays on screen
  maxRadius: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface GameStats {
  score: number;
  totalTargets: number;
  clickedTargets: number;
  missedClicks: number; // Clicks on background
  targetsExpired: number; // Targets that faded away
  accuracy: number;
  avgReactionTime: number; // in ms
  reactionTimeHistory: { time: number; value: number }[]; // For charting
}

export const DEFAULT_SETTINGS: GameSettings = {
  duration: 60,
  difficulty: 'MEDIUM',
  targetSize: 30, // Reduced from 40 for better mobile compatibility by default
  spawnRate: 600
};
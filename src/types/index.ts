export interface Player {
  id: string;
  name: string;
  scores: (number | null)[];
  totalScore: number;
}

export interface GameState {
  holes: number;
  players: Player[];
  currentHole: number;
}

export type RoundType = 9 | 18;

// Auth types
export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

// Saved round types
export interface SavedRound {
  id: string;
  title: string;
  holes: RoundType;
  coursePar: number | null;
  playedAt: string;
  players: SavedPlayer[];
}

export interface SavedPlayer {
  id: string;
  name: string;
  totalScore: number;
  scores: number[];
  playerOrder: number;
}
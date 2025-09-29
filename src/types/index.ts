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
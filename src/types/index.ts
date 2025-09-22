export interface GameState {
  holes: number;
  scores: number[];
  currentHole: number;
  totalScore: number;
}

export type RoundType = 9 | 18;
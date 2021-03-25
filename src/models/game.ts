export const GameState = ["idle", "playing", "game-over", "win"] as const;
export type GameStateEnum = typeof GameState[number];

export type Level = {
  text: string;
  rows: number;
  columns: number;
  covidCells: number;
};

import { Level } from "./models/game";

export const DEFAULT_LEVEL = {
  text: "Beginner",
  columns: 9,
  rows: 9,
  covidCells: 10,
};

export const LEVELS: Level[] = [
  DEFAULT_LEVEL,
  {
    text: "Intermediate",
    columns: 16,
    rows: 16,
    covidCells: 40,
  },
  {
    text: "Expert",
    columns: 30,
    rows: 16,
    covidCells: 99,
  },
];

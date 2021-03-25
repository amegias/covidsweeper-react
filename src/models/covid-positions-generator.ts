import { Position } from "./position";

const shuffle = (positions: Position[]) => {
  let i = positions.length,
    j = 0,
    temp;

  while (i--) {
    j = Math.floor(Math.random() * (i + 1));

    // swap randomly chosen element with current element
    temp = positions[i];
    positions[i] = positions[j];
    positions[j] = temp;
  }

  return positions;
};

export type CovidPositionsGenerator = (
  rows: number,
  columns: number,
  covidCells: number
) => Position[];

const defaultCovidPositionsGenerator: CovidPositionsGenerator = (
  rows: number,
  columns: number,
  covidCells: number
): Position[] => {
  const potentialCovidPositions: Position[] = [];
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < columns; y++) {
      potentialCovidPositions.push({ x, y });
    }
  }

  return shuffle(potentialCovidPositions).slice(0, covidCells);
};

export default defaultCovidPositionsGenerator;

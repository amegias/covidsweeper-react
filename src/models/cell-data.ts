import covidPositionsGenerator, {
  CovidPositionsGenerator,
} from "./covid-positions-generator";
import { GameStateEnum, Level } from "./game";
import { Position } from "./position";

const DEFAULT_TEXT_COLOR = "black";
const COLORS = [
  DEFAULT_TEXT_COLOR,
  "#0000fd",
  "#017e00",
  "#fd0000",
  "#010180",
  "#830003",
  "#008080",
  "#000000",
  "#808080",
] as const;

export const CellState = ["vaccinated", "hidden", "visible"] as const;
export type CellStateEnum = typeof CellState[number];

export type CellData = {
  state: CellStateEnum;
  hasCovid: boolean;
  covidCellsAround: number;
};

export type CellsData = CellData[][];

// Helpers

const createCellData = (): CellData => ({
  state: "hidden",
  hasCovid: false,
  covidCellsAround: 0,
});

const initializeCellsData = (rows: number, columns: number): CellsData => {
  const cellsData: CellsData = [];
  for (let i = 0; i < rows; i++) {
    const rowsData = [];
    for (let j = 0; j < columns; j++) {
      rowsData.push(createCellData());
    }
    cellsData.push(rowsData);
  }

  return cellsData;
};

const addCovid = (cellsData: CellsData, position: Position) => {
  const { x, y } = position;
  cellsData[x][y].hasCovid = true;
  increaseCovidCountAround(cellsData, position);
};

const isIndexValid = (cellsData: CellsData, { x, y }: Position) =>
  cellsData.length > x && x >= 0 && cellsData[x].length > y && y >= 0;

const positionsAround = (cellsData: CellsData, { x, y }: Position) =>
  [
    { x: x - 1, y: y - 1 },
    { x: x - 1, y: y },
    { x: x - 1, y: y + 1 },
    { x: x, y: y - 1 },
    { x: x, y: y + 1 },
    { x: x + 1, y: y - 1 },
    { x: x + 1, y: y },
    { x: x + 1, y: y + 1 },
  ].filter((position) => isIndexValid(cellsData, position));

const increaseCovidCountAround = (cellsData: CellsData, position: Position) => {
  positionsAround(cellsData, position).forEach((positionAround) => {
    cellsData[positionAround.x][positionAround.y].covidCellsAround++;
  });
};

export const createCellsData = (
  { rows, columns, covidCells }: Level,
  generateCovidPositions: CovidPositionsGenerator = covidPositionsGenerator
): CellsData => {
  const cellsData = initializeCellsData(rows, columns);
  generateCovidPositions(rows, columns, covidCells).forEach((position) =>
    addCovid(cellsData, position)
  );
  return cellsData;
};

export const freeCells = ({ rows, columns, covidCells }: Level): number => {
  const cells = rows * columns - covidCells;
  return cells >= 0 ? cells : 0;
};

export type Content = {
  value: string;
  textColor: string;
  visible: boolean;
};

const contentColor = (covidCellsAround: number) => COLORS[covidCellsAround];

const content = (data: CellData): Content => {
  if (data.hasCovid)
    return { value: "🦠", textColor: DEFAULT_TEXT_COLOR, visible: true };
  else if (data.covidCellsAround === 0)
    return { value: " ", textColor: DEFAULT_TEXT_COLOR, visible: true };
  else
    return {
      value: data.covidCellsAround.toString(),
      textColor: contentColor(data.covidCellsAround),
      visible: true,
    };
};

export const contentToPresent = (
  gameState: GameStateEnum,
  data: CellData
): Content => {
  if (gameState === "game-over" && data.hasCovid)
    return { value: "🦠", textColor: DEFAULT_TEXT_COLOR, visible: true };

  switch (data.state) {
    case "vaccinated":
      return { value: "💉", textColor: DEFAULT_TEXT_COLOR, visible: false };
    case "hidden":
      return { value: " ", textColor: DEFAULT_TEXT_COLOR, visible: false };
    case "visible":
      return content(data);
  }
};

type OpenClickResult = {
  cellsData: CellsData;
  cellsOpenCount: number;
};

export const copy = (cellsData: CellsData): CellsData => {
  const cellsDataCopy: CellsData = [];
  for (let i = 0; i < cellsData.length; i++) {
    const rowsData: CellData[] = [];
    for (let j = 0; j < cellsData[i].length; j++) {
      const cellData = cellsData[i][j];
      rowsData.push({
        state: cellData.state,
        hasCovid: cellData.hasCovid,
        covidCellsAround: cellData.covidCellsAround,
      });
    }
    cellsDataCopy.push(rowsData);
  }

  return cellsDataCopy;
};

const openCell = (
  cellsData: CellsData,
  position: Position,
  cellsOpenCount: number,
  openCellsAround: boolean
): OpenClickResult => {
  const { x, y } = position;
  if (
    cellsData[x][y].state === "vaccinated" ||
    cellsData[x][y].state === "visible"
  )
    return { cellsData, cellsOpenCount };
  const cellsCopy = copy(cellsData);
  cellsCopy[x][y].state = "visible";
  const cellsOpenCountCopy = cellsOpenCount + 1;

  if (cellsCopy[x][y].covidCellsAround > 0 || !openCellsAround) {
    return { cellsData: cellsCopy, cellsOpenCount: cellsOpenCountCopy };
  }

  return positionsAround(cellsData, position).reduce(
    (previousOpenCellResult, positionAround) =>
      openCell(
        previousOpenCellResult.cellsData,
        positionAround,
        previousOpenCellResult.cellsOpenCount,
        true
      ),
    { cellsData: cellsCopy, cellsOpenCount: cellsOpenCountCopy }
  );
};

export const clickCell = (
  cellsData: CellsData,
  position: Position,
  isCovidHandler: () => void
): OpenClickResult => {
  const { x, y } = position;
  if (
    cellsData[x][y].state === "vaccinated" ||
    cellsData[x][y].state === "visible"
  )
    return { cellsData, cellsOpenCount: 0 };

  if (cellsData[x][y].hasCovid) {
    const result = openCell(cellsData, position, 0, false);
    isCovidHandler();
    return result;
  } else {
    return openCell(cellsData, position, 0, true);
  }
};

type VaccineResult = {
  updatedCellsData: CellsData;
  vaccineCells: number;
};

export const vaccineCell = (
  cellsData: CellsData,
  position: Position,
  pendingVaccineCells: number
): VaccineResult => {
  const { x, y } = position;
  if (cellsData[x][y].state === "visible")
    return { updatedCellsData: cellsData, vaccineCells: 0 };
  if (cellsData[x][y].state === "hidden" && pendingVaccineCells === 0)
    return { updatedCellsData: cellsData, vaccineCells: 0 };

  const cellsCopy = copy(cellsData);
  let newState: CellStateEnum;
  let vaccineCells;
  if (cellsCopy[x][y].state === "vaccinated") {
    newState = "hidden";
    vaccineCells = -1;
  } else {
    newState = "vaccinated";
    vaccineCells = 1;
  }
  cellsCopy[x][y].state = newState;
  return { updatedCellsData: cellsCopy, vaccineCells: vaccineCells };
};

import { LEVELS } from "./../../constants";
import {
  CellStateEnum,
  clickCell,
  contentToPresent,
  copy,
  createCellsData,
  freeCells,
  vaccineCell,
} from "./../cell-data";

const anyLevel = (rows: number, columns: number, covidCells: number) => ({
  rows,
  columns,
  covidCells,
  text: "whatever",
});

const anyCellData = (
  state: CellStateEnum = "hidden",
  hasCovid = false,
  covidCellsAround = 3
) => ({
  state: state,
  hasCovid: hasCovid,
  covidCellsAround: covidCellsAround,
});

describe("createCellsData", () => {
  test("creates cells with dimensions and covid cells expected", () => {
    const level = anyLevel(23, 32, 11);

    const cells = createCellsData(level);

    expect(cells.length).toBe(23);
    cells.forEach((row) => expect(row.length).toBe(32));
    const covid = cells.flatMap((row) => row.filter((cell) => cell.hasCovid));
    expect(covid.length).toBe(11);
  });

  test("given less cells than covid cells, creates cells with dimensions expected", () => {
    const level = anyLevel(3, 2, 7);

    const cells = createCellsData(level);

    expect(cells.length).toBe(3);
    cells.forEach((row) => expect(row.length).toBe(2));
    const covid = cells.flatMap((row) => row.filter((cell) => cell.hasCovid));
    expect(covid.length).toBe(6);
  });

  test("createCellsData sets covidAroundCount properly", () => {
    const stubbedCovidPositionsGenerator = () => [
      { x: 0, y: 6 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 4 },
      { x: 4, y: 8 },
      { x: 5, y: 2 },
      { x: 5, y: 8 },
      { x: 6, y: 0 },
      { x: 7, y: 0 },
      { x: 8, y: 8 },
    ];

    const cellsData = createCellsData(
      LEVELS[0],
      stubbedCovidPositionsGenerator
    );

    // Fist row
    expect(cellsData[0][0].covidCellsAround).toBe(1);
    expect(cellsData[0][1].covidCellsAround).toBe(1);
    expect(cellsData[0][2].covidCellsAround).toBe(1);
    expect(cellsData[0][3].covidCellsAround).toBe(0);
    expect(cellsData[0][4].covidCellsAround).toBe(0);
    expect(cellsData[0][5].covidCellsAround).toBe(1);
    expect(cellsData[0][7].covidCellsAround).toBe(1);
    expect(cellsData[0][8].covidCellsAround).toBe(0);

    expect(cellsData[6][1].covidCellsAround).toBe(3);
    expect(cellsData[7][1].covidCellsAround).toBe(2);

    // Last row
    expect(cellsData[8][0].covidCellsAround).toBe(1);
    expect(cellsData[8][1].covidCellsAround).toBe(1);
    expect(cellsData[8][2].covidCellsAround).toBe(0);
    expect(cellsData[8][3].covidCellsAround).toBe(0);
    expect(cellsData[8][4].covidCellsAround).toBe(0);
    expect(cellsData[8][5].covidCellsAround).toBe(0);
    expect(cellsData[8][6].covidCellsAround).toBe(0);
    expect(cellsData[8][7].covidCellsAround).toBe(1);
  });
});

describe("freeCells", () => {
  test("returns cells minus the covid ones", () => {
    const rows = 5;
    const columns = 6;
    const covidCells = 7;
    const level = anyLevel(rows, columns, covidCells);

    const free = freeCells(level);

    expect(free).toBe(23);
  });

  test("returns cells minus the covid ones even covidCells is greater", () => {
    const rows = 5;
    const columns = 6;
    const covidCells = 99;
    const level = anyLevel(rows, columns, covidCells);

    const free = freeCells(level);

    expect(free).toBe(0);
  });
});

describe("contentToPresent", () => {
  test("data without covid, game is not ended and is visible, returns covid around (0)", () => {
    const cellData = anyCellData("visible", false, 0);

    const content = contentToPresent("win", cellData);

    expect(content.value).toBe(" ");
    expect(content.visible).toBe(true);
    expect(content.textColor).toBe("black");
  });

  test("data without covid, game is not ended and is visible, returns covid around (N)", () => {
    const cellData = anyCellData("visible", false, 3);

    const content = contentToPresent("win", cellData);

    expect(content.value).toBe("3");
    expect(content.visible).toBe(true);
    expect(content.textColor).toBe("#fd0000");
  });

  test("data with covid, game is not ended and is visible, returns 🦠", () => {
    const cellData = anyCellData("visible", true);

    const content = contentToPresent("win", cellData);

    expect(content.value).toBe("🦠");
    expect(content.visible).toBe(true);
    expect(content.textColor).toBe("black");
  });

  test("data with covid, game is over and is not visible, returns 🦠", () => {
    const cellData = anyCellData("hidden", true);

    const content = contentToPresent("game-over", cellData);

    expect(content.value).toBe("🦠");
    expect(content.visible).toBe(true);
    expect(content.textColor).toBe("black");
  });

  test("data with vaccine, returns 💉", () => {
    const cellData = anyCellData("vaccinated", false);

    const content = contentToPresent("win", cellData);

    expect(content.value).toBe("💉");
    expect(content.visible).toBe(false);
    expect(content.textColor).toBe("black");
  });

  test("data is hidden and game is not ended, returns nothing", () => {
    const cellData = anyCellData("hidden", false);

    const content = contentToPresent("win", cellData);

    expect(content.value).toBe(" ");
    expect(content.visible).toBe(false);
    expect(content.textColor).toBe("black");
  });
});

describe("vaccineCell", () => {
  test("vaccine on visible cell does nothing", () => {
    const cellsData = [[anyCellData("visible")]];

    const result = vaccineCell(cellsData, { x: 0, y: 0 }, 1);

    expect(result.updatedCellsData).toStrictEqual(cellsData);
    expect(result.vaccineCells).toBe(0);
  });

  test("vaccine on hidden cell but pending vaccines is zero, does nothing", () => {
    const cellsData = [[anyCellData("hidden")]];

    const result = vaccineCell(cellsData, { x: 0, y: 0 }, 0);

    expect(result.updatedCellsData).toStrictEqual(cellsData);
    expect(result.vaccineCells).toBe(0);
  });

  test("vaccine on hidden cell but it is already vaccinated, removes vaccine", () => {
    const cellsData = [[anyCellData("vaccinated")]];

    const result = vaccineCell(cellsData, { x: 0, y: 0 }, 0);

    expect(result.updatedCellsData).toStrictEqual([[anyCellData("hidden")]]);
    expect(result.vaccineCells).toBe(-1);
  });

  test("vaccine on hidden cell adds vaccine", () => {
    const cellsData = [[anyCellData("hidden")]];

    const result = vaccineCell(cellsData, { x: 0, y: 0 }, 1);

    expect(result.updatedCellsData).toStrictEqual([
      [anyCellData("vaccinated")],
    ]);
    expect(result.vaccineCells).toBe(1);
  });
});

describe("clickCell", () => {
  /*
  | 0 | | 0 | | 0 | | 💉 |
  | 0 | | 1 | | 2 | | 2 |
  | 1 | | 2 | | 🦠 | | 🦠 |
  | 🦠 | | [2] | | 🦠 | | 🦠 |
  | 1 | | 2 | | 2 | | 2 |
  */
  const cellsData = [
    [
      anyCellData("hidden", false, 0),
      anyCellData("hidden", false, 0),
      anyCellData("hidden", false, 0),
      anyCellData("vaccinated", false, 0),
    ],
    [
      anyCellData("hidden", false, 0),
      anyCellData("hidden", false, 1),
      anyCellData("hidden", false, 2),
      anyCellData("hidden", false, 2),
    ],
    [
      anyCellData("hidden", false, 1),
      anyCellData("hidden", false, 2),
      anyCellData("hidden", true, 2),
      anyCellData("hidden", true, 2),
    ],
    [
      anyCellData("hidden", true, 0),
      anyCellData("visible", false, 2),
      anyCellData("hidden", true, 2),
      anyCellData("hidden", true, 2),
    ],
    [
      anyCellData("hidden", false, 1),
      anyCellData("visible", false, 2),
      anyCellData("visible", false, 2),
      anyCellData("visible", false, 2),
    ],
  ];

  test("click on vaccinated does nothing", () => {
    const result = clickCell(cellsData, { x: 0, y: 3 }, () =>
      expect(false).toBeTruthy()
    );

    expect(result.cellsOpenCount).toBe(0);
    expect(result.cellsData).toStrictEqual(cellsData);
  });

  test("click on visible does nothing", () => {
    const result = clickCell(cellsData, { x: 3, y: 1 }, () =>
      expect(false).toBeTruthy()
    );

    expect(result.cellsOpenCount).toBe(0);
    expect(result.cellsData).toStrictEqual(cellsData);
  });

  test("click on covid calls handler", () => {
    let called = false;
    clickCell(cellsData, { x: 2, y: 2 }, () => {
      called = true;
    });

    expect(called).toBeTruthy();
  });

  test("click on covid opens only this cell", () => {
    const result = clickCell(cellsData, { x: 2, y: 2 }, () => {});

    expect(result.cellsOpenCount).toBe(1);
    const expected = copy(cellsData);
    expected[2][2].state = "visible";
    expect(result.cellsData).toStrictEqual(expected);
  });

  test("click on free cell with some covid around opens only this cell", () => {
    const result = clickCell(cellsData, { x: 1, y: 1 }, () =>
      expect(false).toBeTruthy()
    );

    expect(result.cellsOpenCount).toBe(1);
    const expected = copy(cellsData);
    expected[1][1].state = "visible";
    expect(result.cellsData).toStrictEqual(expected);
  });

  test("click on free cell with any covid around opens this cell and the around ones", () => {
    const result = clickCell(cellsData, { x: 0, y: 0 }, () =>
      expect(false).toBeTruthy()
    );

    expect(result.cellsOpenCount).toBe(9);
    const expected = copy(cellsData);
    expected[0][0].state = "visible";
    expected[0][1].state = "visible";
    expected[0][2].state = "visible";
    expected[1][0].state = "visible";
    expected[1][1].state = "visible";
    expected[1][2].state = "visible";
    expected[1][3].state = "visible";
    expected[2][0].state = "visible";
    expected[2][1].state = "visible";
    expect(result.cellsData).toStrictEqual(expected);
  });
});

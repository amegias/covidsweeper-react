import React, { FC } from "react";
import { useInterval } from "react-timers-hooks";
import Gameboard from "./Gameboard";
import {
  CellsData,
  createCellsData,
  clickCell,
  freeCells,
  vaccineCell,
} from "../models/cell-data";
import { GameStateEnum, Level } from "../models/game";
import { Position } from "../models/position";
import Score from "./Score";
import LevelSelector from "./LevelSelector";
import { DEFAULT_LEVEL, LEVELS } from "../constants";
import { Button, createStyles, makeStyles } from "@material-ui/core";
import useGlobalStyle from "./global-style";
import classNames from "classnames/bind";

const MemoizedScore = React.memo(Score);
const MemoizedGameboard = React.memo(Gameboard);
const MemoizedLevelSelector = React.memo(LevelSelector);

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      marginTop: 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    main: {
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      padding: 8,
    },
    spacer: {
      height: 10,
    },
  })
);

const Spacer: FC = () => {
  const classes = useStyles();
  return <div className={classes.spacer}> </div>;
};

const App: FC = () => {
  const [vaccineModeEnabled, setVaccineModeEnabled] = React.useState<boolean>(
    false
  );
  const [level, setLevel] = React.useState<Level>(DEFAULT_LEVEL);
  const [hiddenCells, setHiddenCells] = React.useState<number>(0);
  const [gameState, setGameState] = React.useState<GameStateEnum>("idle");
  const [cellsData, setCellsData] = React.useState<CellsData>([]);
  const [openCellsCount, setOpenCellsCount] = React.useState<number>(0);
  const [pendingVaccineCells, setPendingVaccineCells] = React.useState<number>(
    0
  );
  const [seconds, setSeconds] = React.useState<number>(0);

  useInterval(
    () => {
      setSeconds(seconds + 1);
    },
    gameState === "playing" ? 1000 : null
  );

  const resetGame = React.useCallback(
    (level: Level) => {
      setVaccineModeEnabled(false);
      setLevel(level);
      setGameState("idle");
      setCellsData(createCellsData(level));
      setHiddenCells(freeCells(level));
      setSeconds(0);
      setOpenCellsCount(0);
      setPendingVaccineCells(level.covidCells);
    },
    [
      setVaccineModeEnabled,
      setLevel,
      setGameState,
      setCellsData,
      setSeconds,
      setOpenCellsCount,
      setHiddenCells,
      setPendingVaccineCells,
    ]
  );

  const startGame = React.useCallback(() => {
    setGameState("playing");
  }, [setGameState]);

  const onClick = React.useCallback(
    (position: Position) => {
      if (gameState === "idle") startGame();
      if (vaccineModeEnabled) {
        const { vaccineCells, updatedCellsData } = vaccineCell(
          cellsData,
          position,
          pendingVaccineCells
        );
        setCellsData(updatedCellsData);
        setPendingVaccineCells(pendingVaccineCells - vaccineCells);
      } else {
        const isCovidHandler = () => setGameState("game-over");
        const { cellsData: updated, cellsOpenCount } = clickCell(
          cellsData,
          position,
          isCovidHandler
        );
        setCellsData(updated);

        const totalOpenCellsCount = openCellsCount + cellsOpenCount;
        setOpenCellsCount(totalOpenCellsCount);

        if (totalOpenCellsCount === hiddenCells) setGameState("win");
      }
    },
    [
      startGame,
      setCellsData,
      setGameState,
      setOpenCellsCount,
      vaccineModeEnabled,
      openCellsCount,
      cellsData,
      gameState,
      hiddenCells,
      pendingVaccineCells,
    ]
  );

  const onLevel = React.useCallback(
    (level: Level) => {
      resetGame(level);
    },
    [resetGame]
  );

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === "f") setVaccineModeEnabled((prev) => !prev);
  };

  React.useEffect(() => {
    resetGame(DEFAULT_LEVEL);

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resetGame]);
  const classes = useStyles();
  const globalClasses = useGlobalStyle();

  return (
    <div className={classes.root}>
      <div className={classNames(globalClasses.raised, classes.main)}>
        <MemoizedScore
          pendingVaccineCells={pendingVaccineCells}
          seconds={seconds}
          gameState={gameState}
          onButton={() => resetGame(level)}
        />
        <Spacer />
        <MemoizedGameboard
          cellsData={cellsData}
          gameState={gameState}
          onClick={onClick}
        />
        <Spacer />
        <MemoizedLevelSelector levels={LEVELS} onLevel={onLevel} />
        <Button onClick={() => setVaccineModeEnabled(!vaccineModeEnabled)}>
          {vaccineModeEnabled ? "Vaccine enabled" : "Vaccine disabled"}
        </Button>
      </div>
    </div>
  );
};

export default App;

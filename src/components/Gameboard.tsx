import { createStyles, makeStyles } from "@material-ui/core";
import { FC } from "react";
import Cell from "./cell";
import { CellsData } from "../models/cell-data";
import { GameStateEnum } from "../models/game";
import { Position } from "../models/position";
import useGlobalStyle from "./global-style";
import classNames from "classnames/bind";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
    },
    column: {
      display: "flex",
      flexDirection: "column",
    },
    row: {
      display: "flex",
      flexDirection: "row",
    },
  })
);

type GameboardProps = {
  cellsData: CellsData;
  gameState: GameStateEnum;
  onClick: (position: Position) => void;
};

const Gameboard: FC<GameboardProps> = ({ cellsData, gameState, onClick }) => {
  const classes = useStyles();
  const globalClasses = useGlobalStyle();

  return (
    <div className={classNames(globalClasses.sunken, classes.root)}>
      {cellsData.map((row, x) => (
        <div key={`${x}`} className={classes.row}>
          {row.map((cellData, y) => (
            <div key={`${x}-${y}`} className={classes.column}>
              <Cell
                gameState={gameState}
                data={cellData}
                onClick={() => onClick({ x: x, y: y })}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Gameboard;

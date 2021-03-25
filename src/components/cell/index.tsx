import { createStyles, Grid, makeStyles, Theme } from "@material-ui/core";
import React, { FC } from "react";
import { CellData, contentToPresent } from "../../models/cell-data";
import { GameStateEnum } from "../../models/game";
import classNames from "classnames/bind";

const useStyles = makeStyles<Theme, { textColor: string }, string>(() =>
  createStyles({
    common: {
      height: 30,
      width: 30,
      borderStyle: "solid",
      backgroundColor: "lightgray",
      fontFamily: "Lato-Black",
      fontSize: 16,
    },
    hidden: {
      borderWidth: 2,
      borderColor: "white grey grey white",
    },
    visible: {
      borderLeftWidth: 1,
      borderTopWidth: 1,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderColor: "grey",
      color: (props) => props.textColor,
    },
  })
);

export type CellProps = {
  gameState: GameStateEnum;
  data: CellData;
  onClick: () => void;
};

const Cell: FC<CellProps> = ({ gameState, data, onClick: clickHandler }) => {
  const { value, textColor, visible } = contentToPresent(gameState, data);
  const styles = useStyles({
    textColor: textColor,
  });

  const getStyle = () =>
    visible
      ? classNames(styles.common, styles.visible)
      : classNames(styles.common, styles.hidden);

  return (
    <Grid item xs={4}>
      <button
        onClick={
          gameState === "win" || gameState === "game-over"
            ? undefined
            : clickHandler
        }
        className={getStyle()}
      >
        {value}
      </button>
    </Grid>
  );
};

export default Cell;

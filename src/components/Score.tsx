import { createStyles, makeStyles } from "@material-ui/core";
import React, { FC } from "react";
import { GameStateEnum } from "../models/game";
import Counter from "./Counter";
import useGlobalStyle from "./global-style";
import classNames from "classnames/bind";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 2,
    },
    button: {
      fontSize: 20,
    },
  })
);

const buttonIcon = (gameState: GameStateEnum) => {
  switch (gameState) {
    case "idle":
    case "playing":
      return "😷";
    case "game-over":
      return "🤒";
    case "win":
      return "😎";
  }
};

type ScoreProps = {
  pendingVaccineCells: number;
  seconds: number;
  gameState: GameStateEnum;
  onButton: () => void;
};

const Score: FC<ScoreProps> = ({
  pendingVaccineCells,
  seconds,
  gameState,
  onButton,
}) => {
  const classes = useStyles();
  const globalClasses = useGlobalStyle();

  return (
    <div className={classNames(globalClasses.sunken, classes.root)}>
      <Counter value={pendingVaccineCells} />
      <button
        className={classNames(globalClasses.raised, classes.button)}
        onClick={onButton}
      >
        {buttonIcon(gameState)}
      </button>
      <Counter value={seconds} />
    </div>
  );
};

export default Score;

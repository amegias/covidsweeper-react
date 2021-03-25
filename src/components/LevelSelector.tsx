import { createStyles, makeStyles } from "@material-ui/core";
import React, { FC } from "react";
import { Level } from "../models/game";
import useGlobalStyle from "./global-style";
import classNames from "classnames/bind";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
    },
    button: {
      padding: 4,
    },
  })
);

type LevelSelectorProps = {
  levels: Level[];
  onLevel: (level: Level) => void;
};

const LevelSelector: FC<LevelSelectorProps> = ({ levels, onLevel }) => {
  const classes = useStyles();
  const globalClasses = useGlobalStyle();

  return (
    <div className={classNames(globalClasses.sunken, classes.root)}>
      {levels.map((level, i) => (
        <button
          className={classNames(globalClasses.raised, classes.button)}
          key={i}
          onClick={() => onLevel(level)}
        >
          {level.text}
        </button>
      ))}
    </div>
  );
};

export default LevelSelector;

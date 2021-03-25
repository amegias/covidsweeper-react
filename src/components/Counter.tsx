import { createStyles, makeStyles } from "@material-ui/core";
import React, { FC } from "react";
import useGlobalStyle from "./global-style";
import classNames from "classnames/bind";

const COUNTER_BACKGROUND = 888;

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      fontFamily: "DSEG7ClassicRegular",
      fontSize: 30,
      backgroundColor: "black",
      position: "relative",
    },
    counter: {
      color: "red",
      position: "absolute",
      top: 0,
      right: 0,
    },
    counterBackground: {
      color: "darkred",
    },
  })
);

type CounterProps = {
  value: number;
};

const Counter: FC<CounterProps> = ({ value }) => {
  const classes = useStyles();
  const globalClasses = useGlobalStyle();

  return (
    <div className={classNames(globalClasses.sunken, classes.root)}>
      <div className={classes.counterBackground}>{COUNTER_BACKGROUND}</div>
      <div className={classes.counter}>{value}</div>
    </div>
  );
};

export default Counter;

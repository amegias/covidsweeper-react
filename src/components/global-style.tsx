import { createStyles, makeStyles } from "@material-ui/core";

const useGlobalStyle = makeStyles(() =>
  createStyles({
    sunken: {
      borderStyle: "solid",
      borderWidth: 2,
      borderColor: "grey white white grey",
      backgroundColor: "lightgray",
    },
    raised: {
      borderStyle: "solid",
      borderWidth: 2,
      borderColor: "white grey grey white",
      backgroundColor: "lightgray",
    },
  })
);

export default useGlobalStyle;

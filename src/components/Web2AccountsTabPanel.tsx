import { signIn, signOut, useSession } from "next-auth/client";
import {
  createStyles,
  makeStyles,
  Theme,
  Typography,
  Button,
  Grid,
  IconButton,
} from "@material-ui/core";
import TwitterIcon from "@material-ui/icons/Twitter";
import GithubIcon from "@material-ui/icons/GitHub";
import RedditIcon from "@material-ui/icons/Reddit";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import React from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    web2Platforms: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(3),
    },
    button: {
      minWidth: 200,
    },
    rightArrowButton: {
      position: "absolute",
      right: 10,
    },
  })
);

type Properties = {
  onArrowClick: (direction: -1 | 1) => void;
};

export default function Web2AccountsTabPanel({
  onArrowClick,
}: Properties): JSX.Element {
  const classes = useStyles();
  const [session] = useSession();

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Web2 Accounts
      </Typography>
      <Typography variant="body1" gutterBottom>
        Sign in with one of our supported platforms.
      </Typography>
      <Grid
        className={classes.web2Platforms}
        container
        justifyContent="center"
        spacing={2}
      >
        <Grid item>
          <IconButton color="primary">
            <TwitterIcon fontSize="large" />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton disabled color="primary">
            <GithubIcon fontSize="large" />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton disabled color="primary">
            <RedditIcon fontSize="large" />
          </IconButton>
        </Grid>
      </Grid>
      <Button
        className={classes.button}
        onClick={() => (session ? signOut() : signIn("twitter"))}
        variant="outlined"
        color="primary"
        size="large"
      >
        {session ? "Sign out" : "Sign in"}
      </Button>
      {session && (
        <IconButton
          onClick={() => onArrowClick(1)}
          className={classes.rightArrowButton}
          color="secondary"
        >
          <KeyboardArrowRightIcon fontSize="large" />
        </IconButton>
      )}
    </>
  );
}

import {
  AppBar,
  createStyles,
  Link,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { useRouter } from "next/router";
import GithubIcon from "@material-ui/icons/GitHub";
import React from "react";

const useStyles = makeStyles(() =>
  createStyles({
    footer: {
      top: "auto",
      bottom: 0,
    },
    githubLink: {
      flexGrow: 1,
    },
  })
);

export default function Footer(): JSX.Element {
  const classes = useStyles();
  const router = useRouter();

  return (
    <AppBar
      className={classes.footer}
      position="fixed"
      elevation={0}
      color="inherit"
    >
      <Toolbar variant="dense">
        <Typography className={classes.githubLink}>
          <Link
            href="https://github.com/InterRep"
            target="_blank"
            rel="noreferrer"
            color="inherit"
          >
            <GithubIcon fontSize="small" />
          </Link>
        </Typography>
        <Typography>
          <Link
            href={router.route === "/" ? "/reputation/twitter" : "/"}
            target="_blank"
            rel="noreferrer"
            color="inherit"
          >
            {router.route === "/" ? "Reputation Service >" : "InterRep >"}
          </Link>
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

import {
  createStyles,
  makeStyles,
  Box,
  FormHelperText,
  Button,
  IconButton,
  Typography,
  LinearProgress,
} from "@material-ui/core";
import { useSession } from "next-auth/client";
import React from "react";
import TwitterIcon from "@material-ui/icons/Twitter";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";

const useStyles = makeStyles(() =>
  createStyles({
    description: {
      textAlign: "center",
      maxWidth: 400,
    },
    message: {
      textAlign: "center",
      maxWidth: 250,
      fontSize: 13,
    },
    button: {
      minWidth: 250,
    },
    web2AccountInformation: {
      position: "absolute",
      left: 15,
      bottom: 10,
      fontSize: 13,
      opacity: 0.8,
      display: "flex",
      justifyContent: "center",
    },
    spinner: {
      position: "absolute",
      top: 10,
      width: "95%",
      height: 1,
    },
    leftArrowButton: {
      position: "absolute",
      left: 10,
    },
    rightArrowButton: {
      position: "absolute",
      right: 10,
    },
  })
);

type Properties = {
  onRightArrowClick?: (direction: 1) => void;
  onLeftArrowClick?: (direction: -1) => void;
  title: string;
  description: string;
  message?: string;
  children?: React.ReactElement;
  loading?: boolean;
  buttonText: string;
  onButtonClick: () => void;
  buttonDisabled?: boolean;
};

export default function TabPanelContent({
  onRightArrowClick,
  onLeftArrowClick,
  title,
  description,
  message = "",
  children,
  loading = false,
  buttonText,
  onButtonClick,
  buttonDisabled = false,
}: Properties): JSX.Element {
  const classes = useStyles();
  const [session] = useSession();

  return (
    <>
      {loading && <LinearProgress className={classes.spinner} />}
      {onLeftArrowClick && (
        <IconButton
          onClick={() => onLeftArrowClick(-1)}
          className={classes.leftArrowButton}
          color="secondary"
        >
          <KeyboardArrowLeftIcon fontSize="large" />
        </IconButton>
      )}
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Typography className={classes.description} variant="body1" gutterBottom>
        {description}
      </Typography>
      {children || <Box height={25} />}
      <Button
        className={classes.button}
        onClick={onButtonClick}
        variant="outlined"
        color="primary"
        size="large"
        disabled={buttonDisabled}
      >
        {buttonText}
      </Button>
      <FormHelperText className={classes.message} error>
        {message}
      </FormHelperText>
      {onRightArrowClick && (
        <IconButton
          onClick={() => onRightArrowClick(1)}
          className={classes.rightArrowButton}
          color="secondary"
        >
          <KeyboardArrowRightIcon fontSize="large" />
        </IconButton>
      )}
      {session && (
        <Box className={classes.web2AccountInformation}>
          <TwitterIcon fontSize="small" color="primary" />
          <Typography variant="caption">
            &nbsp;{session.twitter.username}
          </Typography>
        </Box>
      )}
    </>
  );
}

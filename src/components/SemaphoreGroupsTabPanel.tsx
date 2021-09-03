import {
  createStyles,
  makeStyles,
  Theme,
  Button,
  IconButton,
  Typography,
  LinearProgress,
} from "@material-ui/core";
import React from "react";
import semethid from "semethid";
import { addIdentityCommitment, checkIdentity } from "src/utils/frontend/api";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import Snackbar from "./Snackbar";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    description: {
      textAlign: "center",
    },
    button: {
      marginTop: theme.spacing(3),
      minWidth: 200,
    },
    spinner: {
      position: "absolute",
      bottom: 10,
      width: "95%",
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
  onArrowClick: (direction: -1 | 1) => void;
  reputation: string;
  web2AccountId: string;
};

export default function SemaphoreGroupsTabPanel({
  onArrowClick,
  reputation,
  web2AccountId,
}: Properties): JSX.Element {
  const classes = useStyles();
  const [_identityCommitment, setIdentityCommitment] = React.useState<string>();
  const [_idAlreadyExists, setIdAlreadyExists] = React.useState<boolean>();
  const [_loading, setLoading] = React.useState<boolean>(false);
  const [_message, setMessage] = React.useState<string>("");
  const [_openSnackbar, setOpenSnackbar] = React.useState<boolean>(false);

  async function createSemaphoreIdentity(): Promise<void> {
    setLoading(true);

    const groupId = `TWITTER_${reputation}`;
    const identityCommitment = (await semethid(groupId)).toString();
    const alreadyExist = await checkIdentity({ groupId, identityCommitment });

    if (alreadyExist === null) {
      setMessage("Sorry, there was an unexpected error");
      setOpenSnackbar(true);
      setLoading(false);
      return;
    }

    if (alreadyExist) {
      setMessage("It seems you already joined this group!");
      setOpenSnackbar(true);
    }

    setIdentityCommitment(identityCommitment);
    setIdAlreadyExists(alreadyExist);
    setLoading(false);
  }

  async function joinGroup(): Promise<void> {
    setLoading(true);

    const groupId = `TWITTER_${reputation}`;
    const rootHash = await addIdentityCommitment({
      groupId,
      identityCommitment: _identityCommitment as string,
      web2AccountId: web2AccountId,
    });

    if (rootHash) {
      setMessage("You joined the group with success");
    } else {
      setMessage("Sorry, there was an unexpected error");
    }

    setLoading(false);
    setOpenSnackbar(true);
    setIdAlreadyExists(true);
  }

  return (
    <>
      <IconButton
        onClick={() => onArrowClick(-1)}
        className={classes.leftArrowButton}
        color="secondary"
      >
        <KeyboardArrowLeftIcon fontSize="large" />
      </IconButton>
      <Typography variant="h5" gutterBottom>
        Semaphore Groups
      </Typography>
      <Typography className={classes.description} variant="body1" gutterBottom>
        Create your Semaphore identity and join your <br />
        {`TWITTER_${reputation}`} Semaphore group.
      </Typography>
      <Button
        className={classes.button}
        onClick={!_identityCommitment ? createSemaphoreIdentity : joinGroup}
        variant="outlined"
        color="primary"
        size="large"
        disabled={!!(_identityCommitment && _idAlreadyExists)}
      >
        {!_identityCommitment ? "Create Semaphore id" : "Join group"}
      </Button>
      <Snackbar open={_openSnackbar} message={_message} />
      {_loading && <LinearProgress className={classes.spinner} />}
      <IconButton
        onClick={() => onArrowClick(1)}
        className={classes.rightArrowButton}
        color="secondary"
      >
        <KeyboardArrowRightIcon fontSize="large" />
      </IconButton>
    </>
  );
}

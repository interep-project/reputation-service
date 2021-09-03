import React from "react";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { Snackbar as OriginalSnackbar } from "@material-ui/core";

type Properties = {
  message?: string;
  duration?: number;
};

export default function Snackbar({
  message = "",
  duration = 6000,
}: Properties): JSX.Element {
  const [_message, setMessage] = React.useState<string>();

  React.useEffect(() => {
    setMessage(message);
  }, [message]);

  function close(
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ): void {
    if (reason === "clickaway") {
      return;
    }

    setMessage("");
  }

  return (
    <div>
      <OriginalSnackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={!!_message}
        onClose={close}
        autoHideDuration={duration}
        message={message}
        action={
          <React.Fragment>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={close}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  );
}

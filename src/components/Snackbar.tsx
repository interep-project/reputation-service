import React from "react";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { Snackbar as OriginalSnackbar } from "@material-ui/core";

type Properties = {
  message: string;
  duration?: number;
  open?: boolean;
};

export default function Snackbar({
  message,
  duration = 6000,
  open = false,
}: Properties): JSX.Element {
  const [_open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(open);
  }, [open]);

  function close(
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ): void {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  }

  return (
    <div>
      <OriginalSnackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={_open}
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

import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  createStyles,
  makeStyles,
  Theme,
  Typography,
  Box,
} from "@material-ui/core";
import React from "react";
import { TokenStatus } from "src/models/tokens/Token.types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listBox: {
      width: "100%",
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    list: {
      width: "100%",
    },
    item: {
      paddingRight: 90,
    },
  })
);

type Properties = {
  tokens: any[];
  mintFunction: (tokenId: string) => void;
  burnFunction: (web2Provider: any, tokenDecimalId: number) => void;
  unlinkFunction: (token: any) => void;
};

export default function Badges({
  tokens,
  mintFunction,
  burnFunction,
  unlinkFunction,
}: Properties): JSX.Element | null {
  const classes = useStyles();

  return tokens.length > 0 ? (
    <Box className={classes.listBox}>
      <Typography variant="body1">Badges</Typography>
      <List className={classes.list} component="nav" dense>
        {tokens.map((token) => (
          <ListItem key={token.decimalId} className={classes.item}>
            <ListItemText
              primary={
                <React.Fragment>
                  <Typography
                    component="span"
                    variant="body2"
                    color="textPrimary"
                    title={token.decimalId}
                    gutterBottom
                  >
                    {`${token.decimalId.substr(1, 20)}...`}
                  </Typography>
                </React.Fragment>
              }
              secondary={`Status: ${token.status}`}
            />
            <ListItemSecondaryAction>
              {token.status === TokenStatus.NOT_MINTED ? (
                <Button
                  onClick={() => mintFunction(token._id)}
                  size="small"
                  color="primary"
                >
                  Mint
                </Button>
              ) : token.status === TokenStatus.MINTED ? (
                <Button
                  onClick={() =>
                    burnFunction(token.web2Provider, token.decimalId)
                  }
                  size="small"
                  color="primary"
                >
                  Burn
                </Button>
              ) : (
                token.status === TokenStatus.BURNED && (
                  <Button
                    onClick={() => unlinkFunction(token)}
                    size="small"
                    color="primary"
                  >
                    Unlink
                  </Button>
                )
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  ) : null;
}

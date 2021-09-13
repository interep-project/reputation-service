import { Reputation } from "@interrep/reputation-criteria";
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Container,
  makeStyles,
  createStyles,
  Theme,
} from "@material-ui/core";
import Head from "next/head";
import { FormEvent, useState } from "react";
import { AccountReputationByAccount } from "src/models/web2Accounts/Web2Account.types";
import { getTwitterReputation } from "src/utils/frontend/api";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      flex: 1,
      paddingBottom: theme.spacing(4),
    },
    form: {
      display: "flex",
      flexDirection: "column",
      width: 450,
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(3),
    },
    input: {
      paddingBottom: theme.spacing(2),
    },
    cardContent: {
      textAlign: "center",
      padding: theme.spacing(3),
    },
  })
);

export default function TwitterReputation(): JSX.Element {
  const classes = useStyles();
  const [twitterUsername, setTwitterUsername] = useState<string>("");
  const [
    twitterUserData,
    setTwitterUserData,
  ] = useState<AccountReputationByAccount>();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();

    if (!twitterUsername) return;

    setIsLoading(true);

    const reputation = await getTwitterReputation({
      username: twitterUsername,
    });

    if (reputation) {
      setTwitterUserData(reputation);
    }

    setIsLoading(false);
  }

  return (
    <>
      <Head>
        <title>Reputation Service</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container className={classes.container} maxWidth="sm">
        <Typography variant="h4" gutterBottom>
          Reputation Service
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Enter a twitter username to check if a user is reputable.
        </Typography>

        <form className={classes.form} onSubmit={onSubmit} noValidate>
          <TextField
            className={classes.input}
            label="Username"
            variant="outlined"
            value={twitterUsername}
            onChange={(event) => setTwitterUsername(event.target.value)}
          />
          <Button
            variant="outlined"
            color="primary"
            type="submit"
            disabled={isLoading}
          >
            Check
          </Button>
        </form>

        {!isLoading && (
          <>
            {twitterUserData?.basicReputation && (
              <Typography variant="h6" gutterBottom>
                Reputation: {twitterUserData.basicReputation}
              </Typography>
            )}

            {twitterUserData?.basicReputation === Reputation.UNCLEAR && (
              <Card>
                <CardContent className={classes.cardContent}>
                  <Typography color="textSecondary">Bot Score</Typography>
                  <Typography variant="h5" component="h2">
                    {
                      twitterUserData.botometer?.display_scores?.universal
                        .overall
                    }
                    /5
                  </Typography>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Container>
    </>
  );
}

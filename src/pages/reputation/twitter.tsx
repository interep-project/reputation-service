import {
    Button,
    Card,
    CardContent,
    Container,
    createStyles,
    makeStyles,
    TextField,
    Theme,
    Typography
} from "@material-ui/core"
import Head from "next/head"
import React, { FormEvent, useState } from "react"
import { getTwitterReputation } from "src/utils/frontend/api"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            flex: 1,
            paddingBottom: theme.spacing(4)
        },
        form: {
            display: "flex",
            flexDirection: "column",
            width: 450,
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(3)
        },
        input: {
            paddingBottom: theme.spacing(2)
        },
        cardContent: {
            textAlign: "center",
            padding: theme.spacing(3)
        }
    })
)

export default function TwitterReputation(): JSX.Element {
    const classes = useStyles()
    const [_twitterUsername, setTwitterUsername] = useState<string>("")
    const [_twitterReputation, setTwitterReputation] = useState<any>()
    const [_isLoading, setIsLoading] = useState(false)

    async function onSubmit(event: FormEvent): Promise<void> {
        event.preventDefault()

        if (!_twitterUsername) return

        setIsLoading(true)

        const reputation = await getTwitterReputation({
            username: _twitterUsername
        })

        if (reputation) {
            setTwitterReputation(reputation)
        }

        setIsLoading(false)
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
                        value={_twitterUsername}
                        onChange={(event) => setTwitterUsername(event.target.value)}
                    />
                    <Button variant="outlined" color="primary" type="submit" disabled={_isLoading}>
                        Check
                    </Button>
                </form>

                {!_isLoading && _twitterReputation && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Reputation: {_twitterReputation.reputation}
                        </Typography>
                        <Card>
                            <CardContent className={classes.cardContent}>
                                <Typography color="textSecondary">Bot Score</Typography>
                                <Typography variant="h5" component="h2">
                                    {_twitterReputation.parameters.botometerOverallScore}
                                    /5
                                </Typography>
                            </CardContent>
                        </Card>
                    </>
                )}
            </Container>
        </>
    )
}

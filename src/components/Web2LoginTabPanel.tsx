import { createStyles, Grid, IconButton, makeStyles, Theme } from "@material-ui/core"
import GithubIcon from "@material-ui/icons/GitHub"
import RedditIcon from "@material-ui/icons/Reddit"
import TwitterIcon from "@material-ui/icons/Twitter"
import { signIn, signOut, useSession } from "next-auth/client"
import React from "react"
import TabPanelContent from "./TabPanelContent"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        web2Platforms: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(3)
        },
        button: {
            minWidth: 200
        },
        rightArrowButton: {
            position: "absolute",
            right: 10
        }
    })
)

type Properties = {
    onArrowClick?: (direction: 1) => void
    reputation?: string
}

export default function Web2LoginTabPanel({ onArrowClick, reputation }: Properties): JSX.Element {
    const classes = useStyles()
    const [session] = useSession()

    return (
        <>
            <TabPanelContent
                title="Web2 Login"
                description={
                    !session
                        ? "Sign in with one of our supported platforms."
                        : `You are logged in as ${session.user?.name} on Twitter.`
                }
                onRightArrowClick={onArrowClick}
                buttonText={session ? "Sign out" : "Sign in"}
                onButtonClick={() => (session ? signOut() : signIn("twitter"))}
                reputation={reputation}
            >
                <Grid className={classes.web2Platforms} container justifyContent="center" spacing={2}>
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
            </TabPanelContent>
        </>
    )
}

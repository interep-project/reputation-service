import { createStyles, Grid, IconButton, makeStyles, Theme } from "@material-ui/core"
import GithubIcon from "@material-ui/icons/GitHub"
import RedditIcon from "@material-ui/icons/Reddit"
import TwitterIcon from "@material-ui/icons/Twitter"
import { signIn, signOut, useSession } from "next-auth/client"
import React from "react"
import TabPanelContent from "./TabPanelContent"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        web2Providers: {
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
                        ? "Sign in with one of our supported Web2 providers."
                        : `You are logged in as ${session.user?.name} on Twitter.`
                }
                onRightArrowClick={onArrowClick}
                buttonText="Sign out"
                onButtonClick={session ? () => signOut() : undefined}
                reputation={reputation}
            >
                <Grid className={classes.web2Providers} container justifyContent="center" spacing={2}>
                    <Grid item>
                        <IconButton onClick={() => signIn("twitter")} disabled={!!session}>
                            <TwitterIcon style={{ color: "#79BAC3" }} fontSize="large" />
                        </IconButton>
                    </Grid>
                    <Grid item>
                        <IconButton onClick={() => signIn("github")} disabled={!!session}>
                            <GithubIcon style={{ color: "#E0E0E0" }} fontSize="large" />
                        </IconButton>
                    </Grid>
                    <Grid item>
                        <IconButton disabled>
                            <RedditIcon fontSize="large" />
                        </IconButton>
                    </Grid>
                </Grid>
            </TabPanelContent>
        </>
    )
}

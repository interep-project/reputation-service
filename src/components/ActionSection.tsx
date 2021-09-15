import React from "react"
import {
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Button,
    Typography,
    makeStyles,
    createStyles
} from "@material-ui/core"

const useStyles = makeStyles(() =>
    createStyles({
        item: {
            paddingRight: 100,
            paddingLeft: 0
        }
    })
)

type Properties = {
    title: string
    description: string
    feedbackMessage?: string
    buttonText: string
    buttonDisabled?: boolean
    divider?: boolean
    onClick: () => void
}

export default function ActionSection({
    title,
    description,
    feedbackMessage = "",
    buttonText,
    buttonDisabled,
    divider,
    onClick
}: Properties): JSX.Element {
    const classes = useStyles()

    return (
        <ListItem className={classes.item} divider={divider}>
            <ListItemText
                primary={
                    <React.Fragment>
                        <Typography component="h2" variant="h6" color="textPrimary" gutterBottom>
                            {title}
                        </Typography>
                    </React.Fragment>
                }
                secondary={
                    <React.Fragment>
                        <Typography component="span" variant="body2" color="textPrimary">
                            {description}
                        </Typography>
                        <br />
                        {feedbackMessage}
                    </React.Fragment>
                }
            />
            <ListItemSecondaryAction>
                <Button onClick={onClick} color="primary" disabled={buttonDisabled}>
                    {buttonText}
                </Button>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

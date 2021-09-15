import { Box, createStyles, makeStyles } from "@material-ui/core"
import React from "react"

const useStyles = makeStyles(() =>
    createStyles({
        tabPanelContainer: {
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
        }
    })
)

type Properties = {
    children?: React.ReactNode
    index: number
    value: number
}

export default function TabPanelContainer({ children, value, index }: Properties): JSX.Element {
    const classes = useStyles()

    return <>{value === index && <Box className={classes.tabPanelContainer}>{children}</Box>}</>
}

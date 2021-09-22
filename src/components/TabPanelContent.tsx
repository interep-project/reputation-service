import {
    createStyles,
    makeStyles,
    Box,
    FormHelperText,
    Button,
    IconButton,
    Typography,
    LinearProgress,
    Link
} from "@material-ui/core"
import { useSession } from "next-auth/client"
import React from "react"
import TwitterIcon from "@material-ui/icons/Twitter"
import GitHubIcon from "@material-ui/icons/GitHub"
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft"
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight"
import { DeployedContracts, getDeployedContractAddress } from "src/utils/crypto/deployedContracts"
import shortenAddress from "src/utils/frontend/shortenAddress"
import { ExplorerDataType, getExplorerLink } from "src/utils/frontend/getExplorerLink"

const useStyles = makeStyles(() =>
    createStyles({
        description: {
            textAlign: "center",
            maxWidth: 400
        },
        message: {
            textAlign: "center",
            maxWidth: 250,
            fontSize: 13
        },
        button: {
            minWidth: 250
        },
        web2AccountInformation: {
            position: "absolute",
            left: 15,
            bottom: 10,
            fontSize: 13,
            opacity: 0.8,
            display: "flex",
            justifyContent: "center"
        },
        contractLink: {
            position: "absolute",
            right: 15,
            bottom: 10,
            fontSize: 13,
            opacity: 0.8
        },
        spinner: {
            position: "absolute",
            top: 10,
            width: "95%",
            height: 1
        },
        leftArrowButton: {
            position: "absolute",
            left: 10
        },
        rightArrowButton: {
            position: "absolute",
            right: 10
        }
    })
)

type Properties = {
    onRightArrowClick?: (direction: 1) => void
    onLeftArrowClick?: (direction: -1) => void
    title: string
    description: string
    warningMessage?: string
    children?: React.ReactElement
    loading?: boolean
    buttonText: string
    onButtonClick?: () => void
    buttonDisabled?: boolean
    reputation?: string
    contractName?: DeployedContracts
}

export default function TabPanelContent({
    onRightArrowClick,
    onLeftArrowClick,
    title,
    description,
    warningMessage = "",
    children,
    loading = false,
    buttonText,
    onButtonClick,
    buttonDisabled = false,
    reputation,
    contractName
}: Properties): JSX.Element {
    const classes = useStyles()
    const [session] = useSession()

    return (
        <>
            {loading && <LinearProgress className={classes.spinner} />}
            {onLeftArrowClick && (
                <IconButton onClick={() => onLeftArrowClick(-1)} className={classes.leftArrowButton} color="secondary">
                    <KeyboardArrowLeftIcon fontSize="large" />
                </IconButton>
            )}
            <Typography variant="h5" gutterBottom>
                {title}
            </Typography>
            <Typography className={classes.description} variant="body1">
                {description}
            </Typography>
            {children || <Box height={25} />}
            {onButtonClick && (
                <Button
                    className={classes.button}
                    onClick={onButtonClick}
                    variant="outlined"
                    color="primary"
                    size="large"
                    disabled={buttonDisabled}
                >
                    {buttonText}
                </Button>
            )}
            <FormHelperText className={classes.message} error>
                {warningMessage}
            </FormHelperText>
            {onRightArrowClick && (
                <IconButton onClick={() => onRightArrowClick(1)} className={classes.rightArrowButton} color="secondary">
                    <KeyboardArrowRightIcon fontSize="large" />
                </IconButton>
            )}
            {session && (
                <Box className={classes.web2AccountInformation}>
                    {session.web2Provider === "twitter" ? (
                        <TwitterIcon fontSize="small" />
                    ) : (
                        <GitHubIcon fontSize="small" />
                    )}
                    <Typography style={{ marginLeft: 5 }} variant="caption">
                        &nbsp;{session.user.name}
                        &nbsp;{reputation ? `(${reputation})` : ""}
                    </Typography>
                </Box>
            )}
            {contractName && (
                <Box className={classes.contractLink}>
                    <Typography variant="caption">
                        Contract:{" "}
                        <Link
                            href={getExplorerLink(getDeployedContractAddress(contractName), ExplorerDataType.ADDRESS)}
                            target="_blank"
                            rel="noreferrer"
                            color="inherit"
                        >
                            {shortenAddress(getDeployedContractAddress(contractName))}
                        </Link>
                    </Typography>
                </Box>
            )}
        </>
    )
}

import { AppBar, Box, Button, createStyles, makeStyles, Theme, Toolbar, Typography } from "@material-ui/core"
import { useRouter } from "next/router"
import React, { useContext } from "react"
import { isBrowser } from "react-device-detect"
import { isDefaultNetworkId } from "src/utils/crypto/getDefaultNetwork"
import { getChainNameFromNetworkId, shortenAddress } from "src/utils/frontend/evm"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        title: {
            flexGrow: 1
        },
        walletDataBox: {
            display: "flex",
            alignItems: "center"
        },
        networkName: {
            fontWeight: "bold",
            marginRight: theme.spacing(2)
        },
        address: {
            fontWeight: "bold",
            padding: "8px 16px",
            borderRadius: 4,
            backgroundColor: theme.palette.background.default
        }
    })
)

export default function NavBar(): JSX.Element {
    const classes = useStyles()
    const { connect, check, _networkId, _address } = useContext(EthereumWalletContext) as EthereumWalletContextType
    const router = useRouter()

    return (
        <AppBar position="fixed" elevation={0} color="inherit">
            <Toolbar>
                <Typography className={classes.title} variant="h6">
                    InterRep
                </Typography>
                {router.route === "/" && (
                    <>
                        {isBrowser && _address && _networkId ? (
                            <Box className={classes.walletDataBox}>
                                <Typography
                                    style={{ fontWeight: "bold" }}
                                    className={classes.networkName}
                                    color="secondary"
                                    variant="body1"
                                >
                                    {_networkId && getChainNameFromNetworkId(_networkId)}
                                </Typography>
                                {!isDefaultNetworkId(_networkId) && (
                                    <Typography className={classes.networkName} variant="body1">
                                        (wrong network)
                                    </Typography>
                                )}
                                {isDefaultNetworkId(_networkId) ? (
                                    <Typography className={classes.address} variant="body1">
                                        {shortenAddress(_address)}
                                    </Typography>
                                ) : (
                                    <Button onClick={check} variant="outlined">
                                        Switch
                                    </Button>
                                )}
                            </Box>
                        ) : (
                            <Button onClick={connect} variant="outlined">
                                Connect
                            </Button>
                        )}
                    </>
                )}
            </Toolbar>
        </AppBar>
    )
}

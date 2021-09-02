import {
  createStyles,
  makeStyles,
  Theme,
  IconButton,
  Button,
  Typography,
  LinearProgress,
} from "@material-ui/core";
import React, { useEffect } from "react";
import { getChecksummedAddress } from "src/utils/crypto/address";
import Snackbar from "./Snackbar";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import ReputationBadge from "contracts/artifacts/contracts/ReputationBadge.sol/ReputationBadge.json";
import TwitterIcon from "@material-ui/icons/Twitter";
import { BasicReputation } from "src/models/web2Accounts/Web2Account.types";
import useEncryption from "src/hooks/useEncryption";
import { ethers, Signer } from "ethers";
import { createUserAttestationMessage } from "src/core/signing/createUserAttestationMessage";
import {
  checkLink,
  getMyTokens,
  linkAccounts,
  mintToken,
  unlinkAccounts,
} from "src/utils/frontend/api";
import { getBadgeAddressByProvider } from "src/utils/crypto/deployedContracts";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    description: {
      textAlign: "center",
    },
    button: {
      marginTop: theme.spacing(3),
      minWidth: 200,
    },
    spinner: {
      position: "absolute",
      bottom: 10,
      width: "95%",
    },
    leftArrowButton: {
      position: "absolute",
      left: 10,
    },
  })
);

type Properties = {
  onArrowClick: (direction: -1 | 1) => void;
  reputation: string;
  networkId: number;
  address: string;
  signer: Signer;
  web2AccountId: string;
};

export default function ReputationBadgesTabPanel({
  onArrowClick,
  reputation,
  networkId,
  address,
  signer,
  web2AccountId,
}: Properties): JSX.Element {
  const classes = useStyles();
  const { getPublicKey, decrypt } = useEncryption();
  const [_loading, setLoading] = React.useState<boolean>(false);
  const [_message, setMessage] = React.useState<string>("");
  const [_openSnackbar, setOpenSnackbar] = React.useState<boolean>(false);
  const [_accountLinked, setAccountLinked] = React.useState<boolean>();
  const [_token, setToken] = React.useState<any>();

  useEffect(() => {
    (async () => {
      if (reputation !== BasicReputation.CONFIRMED) {
        setMessage(
          "Sorry, you can create a badge only if your reputation is CONFIRMED"
        );
        setOpenSnackbar(true);
        return;
      }

      setLoading(true);

      const accountLinked = await checkLink();

      if (accountLinked === null) {
        setMessage("Sorry, there was an unexpected error");
        setOpenSnackbar(true);
        setLoading(false);
        return;
      }

      if (accountLinked) {
        setMessage("It seems you already have a linked account");
        setOpenSnackbar(true);

        const tokens = await getMyTokens({ ownerAddress: address });

        setToken(tokens[tokens.length - 1]);
      }

      setAccountLinked(accountLinked);
      setLoading(false);
    })();
  }, [reputation, address]);

  async function mint(token: any): Promise<void> {
    setLoading(true);

    const response = await mintToken({ tokenId: token._id });

    if (response === null) {
      setMessage("Sorry, there was an unexpected error");
      setOpenSnackbar(true);
      setLoading(false);
      return;
    }

    const tokens = await getMyTokens({ ownerAddress: address });

    setToken(tokens[tokens.length - 1]);
    setLoading(false);
  }

  async function burn(token: any): Promise<void> {
    setLoading(true);

    const badgeAddress = getBadgeAddressByProvider(token.web2Provider);

    if (badgeAddress === null) {
      setMessage("Cannot retrieve the badge's address");
      setOpenSnackbar(true);
      return;
    }

    const badge = new ethers.Contract(badgeAddress, ReputationBadge.abi);
    const tx = await badge.connect(signer).burn(token.decimalId);

    await tx.wait();

    const tokens = await getMyTokens({ ownerAddress: address });

    setToken(tokens[tokens.length - 1]);
    setLoading(false);
  }

  async function unlinkAccount(token: any): Promise<void> {
    setLoading(true);

    const decryptedAttestation = await decrypt(token.encryptedAttestation);
    const response = await unlinkAccounts({ decryptedAttestation });

    if (response === null) {
      setMessage("Cannot retrieve the badge's address");
      setOpenSnackbar(true);
      return;
    }

    setAccountLinked(false);
    setLoading(false);
  }

  async function linkAccount(): Promise<void> {
    const checksummedAddress = getChecksummedAddress(address);

    if (!checksummedAddress) {
      setMessage("Sorry, the address is not valid");
      setOpenSnackbar(true);
      return;
    }

    const publicKey = await getPublicKey();

    if (!publicKey) {
      setMessage("Public key is needed to link accounts");
      setOpenSnackbar(true);
      return;
    }

    const message = createUserAttestationMessage({
      checksummedAddress,
      web2AccountId,
    });

    const userSignature = await signer.signMessage(message);

    if (!userSignature) {
      setMessage(
        "Your signature is needed to register your intent to link the accounts"
      );
      setOpenSnackbar(true);
      return;
    }

    const token = await linkAccounts({
      chainId: networkId,
      address,
      web2AccountId,
      userSignature,
      userPublicKey: publicKey,
    });

    if (token) {
      setMessage("Success");
      setAccountLinked(true);
      setToken(token);
    } else {
      setMessage("Sorry there was an error while linking your accounts.");
    }

    setOpenSnackbar(true);
  }

  return (
    <>
      <IconButton
        onClick={() => onArrowClick(-1)}
        className={classes.leftArrowButton}
        color="secondary"
      >
        <KeyboardArrowLeftIcon fontSize="large" />
      </IconButton>
      <Typography variant="h5" gutterBottom>
        Reputation badges
      </Typography>
      <Typography className={classes.description} variant="body1" gutterBottom>
        Link your Web2 account with your Ethereum address <br />
        and mint your badge to prove your reputation.
      </Typography>
      {_token && _token.status === "MINTED" && (
        <div>
          <TwitterIcon style={{ color: "#D4D08E" }} fontSize="large" />
        </div>
      )}
      <Button
        className={classes.button}
        onClick={() =>
          !_accountLinked || _loading
            ? linkAccount()
            : _token.status === "NOT_MINTED"
            ? mint(_token)
            : _token.status === "MINTED"
            ? burn(_token)
            : unlinkAccount(_token)
        }
        variant="outlined"
        color="primary"
        size="large"
        disabled={reputation !== BasicReputation.CONFIRMED || _loading}
      >
        {!_accountLinked || _loading
          ? "Link your accounts"
          : _token.status === "NOT_MINTED"
          ? "Mint token"
          : _token.status === "MINTED"
          ? "Burn token"
          : "Unlink your accounts"}
      </Button>
      <Snackbar open={_openSnackbar} message={_message} />
      {_loading && <LinearProgress className={classes.spinner} />}
    </>
  );
}

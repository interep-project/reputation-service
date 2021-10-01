<p align="center">
    <h1 align="center">
        InterRep reputation service
    </h1>
    <p align="center">InterRep back-end and front-end.</p>
</p>

<p align="center">
    <a href="https://github.com/InterRep" target="_blank">
        <img src="https://img.shields.io/badge/project-InterRep-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/InterRep/reputation-service/actions/workflows/test.yaml">
        <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/interrep/reputation-service/test?label=test&logo=github">
    </a>
    <a href="https://eslint.org/" target="_blank">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/" target="_blank">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
    <img alt="Repository top language" src="https://img.shields.io/github/languages/top/InterRep/reputation-service?style=flat-square">
</p>

<div align="center">
    <h4>
        <a href="https://docs.interrep.link/contributing">
            👥 Contributing
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://docs.interrep.link/code-of-conduct">
            🤝 Code of conduct
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://t.me/interrep">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

If you want an overwiew of InterRep, read our announcement post: https://jaygraber.medium.com/introducing-interrep-255d3f56682. For more details, please see our [documentation website](https://docs.interrep.link).

⚠️ **Notice**: [interrep.link](https://interrep.link) and [ropsten.interrep.link](https://ropsten.interrep.link) still refer to the old MVP version of interRep. They will soon be updated. You can find an updated version at [kovan.interrep.link](https://kovan.interrep.link) (staging env).

---

## Install

Clone this repository and install the dependencies:

```bash
$ git clone --recurse-submodules https://github.com/InterRep/reputation-service.git
$ cd reputation-service && yarn
```

## Usage

Copy the `.env.example` file and rename it `.env`.

All environment variables need to be provided. The format for the MongoDB URI is described [here](https://docs.mongodb.com/manual/reference/connection-string/).

### Running tests

```bash
$ yarn test
```

### Seeding

To seed the database (optional) you can run:

```bash
$ yarn seed:twitterUsers
$ yarn seed:zeroHashes
```

### Running InterRep locally

**NODE_ENV === 'development'**

```bash
$ yarn dev
```

The pages auto-update as you edit files.

To test all the features, you will need to run and deploy InterRep smart contracts locally. Here's how:

1. Start a local network in one terminal:

```bash
$ cd contracts && yarn start
```

2. In another terminal, deploy the interRep badge contract:

```bash
$ cd contracts && yarn deploy:mocks --network localhost
```

3. If it is necessary give your address some ETH for gas:

```bash
$ npx hardhat faucet YOUR_ADDRESS --network localhost
```

### Production

**NODE_ENV === 'production'**

**Build**

```bash
$ yarn build
```

**Start the server**

```bash
$ yarn start
```

## APIs

### Providers

Get all the InterRep providers:

```
/api/providers
```

Check whether an identity commitment belongs to any provider group:

```
/api/providers/:provider/:identityCommitment/check
```

### Semaphore groups

Get all the InterRep groups:

```
/api/groups
```

Get a Merkle tree path:

```
/api/groups/:groupId/:identityCommitment/path
```

Check whether an identity commitment belongs to a group:

```
/api/groups/:groupId/:identityCommitment/check
```

### Reputation

**By Twitter account**

Get Twitter reputation by username:

```
/api/reputation/twitter/:username
```

### Tokens

Get tokens by ethereum address:

```
/api/tokens?userAddress=0xba36...
```

Get specific token by id:

```
/api/tokens/:tokenId
```

**Notice**: The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

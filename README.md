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
$ git clone https://github.com/InterRep/reputation-service.git
$ cd reputation-service
$ yarn
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

### Running InterRep (development)

```bash
$ yarn dev
```

The pages auto-update as you edit files.

To test all the features, you will need to run and deploy the InterRep contracts locally. Here's how:

1. Clone the `contracts` repository:

```bash
$ git clone https://github.com/InterRep/contracts.git
$ cd contracts
```

1. Start a local network in one terminal:

```bash
$ yarn start
```

2. In another terminal, deploy the contracts on the local network:

```bash
$ yarn deploy:mocks --network localhost
```

### Running InterRep (production)

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

### Semaphore groups

Get the list of groups:

```
/api/groups
```

Get a specific group:

```
/api/groups/:groupId
```

Get a Merkle tree path:

```
/api/groups/:groupId/:identityCommitment/path
```

Check whether an identity commitment exists:

```
/api/groups/:groupId/:identityCommitment/check
```

### Reputation

**By Twitter account**

Query by username:

```
/api/reputation/twitter?username=
```

Query by Twitter id:

```
/api/reputation/twitter?id=
```

Query currently connected account:

```
/api/reputation/twitter/me
```

### Tokens

Get tokens by ethereum address:

```
/api/tokens?owner=0xba36...
```

Get token by contract address and id:

```
/api/tokens/0x99FCf805C468977e0F8Ceae21935268EEceadC07/93874287420912438946...
```

**Notice**: The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Subgraph
The subgraph allows groups and group members to be queried using graphql.

The subgraph is available at https://thegraph.com/hosted-service/subgraph/glamperd/interrep-groups-kovan, currently only for testnet data.

The hosting service provided by the graph protocol community is used, so that data is updated soon after a smart contract event is emitted. Only `addRootHash` events are currently supported.

### Authorisation

Prior to code generation or deployment, set the authorisation code that links your account on thegraph.com with this deployment.

```bash
$ graph auth  --product hosted-service <auth code>
```

### Build the subgraph

Useful for discovering compile errors before deploying

```bash
$ yarn graph:build
````

### Code Generation

Required if the schema has changed. 

```bash
$ yarn graph:codegen
```

### Deploy

To deploy code changes to either the smart contract, mapping code or the subgraph schema. Redeploying will trigger a refresh of indexed data, starting at the block number specified in `subgraph.yaml`. Allow time for the indexer to synchronise. The example query will be reset. 

```bash
$ yarn graph:deploy
```

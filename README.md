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
git clone https://github.com/InterRep/reputation-service.git
cd reputation-service
yarn
```

## Usage

Copy the `.env.example` file and rename it `.env`.

All environment variables need to be provided. The format for the MongoDB URI is described [here](https://docs.mongodb.com/manual/reference/connection-string/).

### Running tests

```bash
yarn test
```

### Seeding

To seed the database (optional) you can run:

```bash
yarn seed:twitterUsers
yarn seed:zeroHashes
```

### Running InterRep (development)

```bash
yarn dev
```

The pages auto-update as you edit files.

To test all the features, you will need to deploy the InterRep contracts in a local network. Here's how:

1. Clone the `contracts` repository:

```bash
git clone https://github.com/InterRep/contracts.git
cd contracts
```

2. Start a local network in one terminal:

```bash
yarn start
```

3. In another terminal, deploy mocked contracts and groups:

```bash
yarn mocks --network localhost
```

### Running InterRep (production)

**NODE_ENV === 'production'**

**Build**

```bash
yarn build
```

**Start the server**

```bash
yarn start
```

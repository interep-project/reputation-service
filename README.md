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
    <a href="https://coveralls.io/github/InterRep/reputation-service">
        <img alt="Coveralls" src="https://img.shields.io/coveralls/github/InterRep/reputation-service?style=flat-square&logo=coveralls">
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

Please, visit our [documentation website](https://docs.interrep.link) for more details.

⚠️ **Notice**: [interrep.link](https://interrep.link) and [ropsten.interrep.link](https://ropsten.interrep.link) still refer to the old MVP version of interRep. They will soon be updated. You can find an updated version at [kovan.interrep.link](https://kovan.interrep.link) (staging env).

---

## Code overview

This repository contains the frontend and backend code of the InterRep application.

The backend code consists mainly of api, controllers and core functions. Next.js maps the application's [page](https://nextjs.org/docs/basic-features/pages) and [api routes](https://nextjs.org/docs/api-routes/introduction) to files in the `src/pages` directory. Each API is associated with a handler/controller in the `src/controllers` directory, which checks that the request parameters are correct. If the checks are passed and the request is not trivial, the core functions are used, otherwise the db methods are called directly.

The frontend consists of the pages defined in the `src/pages` directory. These pages are React components that in turn use the shared components in the `components` directory. The style of the Web application is defined in the `src/styles` directory, while `src/context` and `src/hooks` contain React contexts and hooks respectively.

The services in the `src/services` folder usually contain external services APIs, while the `src/tasks` folder contains tasks that run externally to Next.js. Finally, the `src/config.ts` file contains the environment variables and data about the Ethereum network and contracts.

The code is usually organized in modules (e.g. `src/core/groups`), where each function corresponds to a file with the same name, and an `index.ts` file exports all the functions of the module. Each module also contains an `index.test.ts` file where Jest tests are defined for each function in the module. Test files follow a standard structure for each module.

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

To seed the db you can run:

```bash
yarn db:seed-zero-hashes # required
```

If you want to reset the db you can run:

```bash
yarn db:reset # it will insert the zero hashes
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

3. In another terminal, deploy the `Groups.sol` contract:

```bash
yarn deploy:groups --network localhost
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

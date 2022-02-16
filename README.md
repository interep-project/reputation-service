<p align="center">
    <h1 align="center">
        Interep reputation service
    </h1>
    <p align="center">Interep back-end and front-end.</p>
</p>

<p align="center">
    <a href="https://github.com/interep-project" target="_blank">
        <img src="https://img.shields.io/badge/project-Interep-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/interep-project/reputation-service/actions/workflows/test.yaml">
        <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/interep-project/reputation-service/test?label=test&logo=github">
    </a>
    <a href="https://coveralls.io/github/interep-project/reputation-service">
        <img alt="Coveralls" src="https://img.shields.io/coveralls/github/interep-project/reputation-service?style=flat-square&logo=coveralls">
    </a>
    <a href="https://deepscan.io/dashboard#view=project&tid=16502&pid=19780&bid=519858">
        <img alt="DeepScan grade" src="https://deepscan.io/api/teams/16502/projects/19780/branches/519858/badge/grade.svg">
    </a>
    <a href="https://eslint.org/" target="_blank">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/" target="_blank">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
    <img alt="Repository top language" src="https://img.shields.io/github/languages/top/interep-project/reputation-service?style=flat-square">
</p>

<div align="center">
    <h4>
        <a href="https://docs.interep.link/contributing">
            👥 Contributing
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://docs.interep.link/code-of-conduct">
            🤝 Code of conduct
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://t.me/interrep">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

Please, visit our [web app](https://kovan.interep.link) or our [documentation website](https://docs.interep.link) for more details.

---

## Code overview

This repository contains the frontend and backend code of the Interep application.

The backend code consists mainly of APIs, controllers and core functions. Next.js maps the application's [page](https://nextjs.org/docs/basic-features/pages) and [api routes](https://nextjs.org/docs/api-routes/introduction) to files in the `src/pages` directory. Each API is associated with a handler/controller in the `src/controllers` directory, which checks that the request parameters are correct. If these checks are passed and the request needs more complex logic, the core functions are used, otherwise the db methods are called directly.

The frontend consists of the pages defined in the `src/pages` directory. These pages are React components that in turn use the shared components in the `components` directory. The style of the Web application is defined in the `src/styles` directory, while `src/context` and `src/hooks` contain React contexts and hooks respectively.

The services in the `src/services` folder usually contain external services APIs, while the `src/tasks` folder contains tasks that run externally to Next.js. Finally, the `src/config.ts` file contains the environment variables and data about the Ethereum network and contracts.

The code is usually organized in modules (e.g. `src/core/groups`), where each function corresponds to a file with the same name, and an `index.ts` file exports all the functions of the module. Each module also contains an `index.test.ts` file where Jest tests are defined for each function in the module. Test files follow a standard structure for each module.

## Install

Clone this repository and install the dependencies:

```bash
git clone https://github.com/interep-project/reputation-service.git
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

### Running Interep (development)

```bash
yarn dev
```

The pages auto-update as you edit files.

To test all the features, you will need to deploy the Interep contracts in a local network. Here's how:

1. Clone the `contracts` repository:

```bash
git clone https://github.com/interep-project/contracts.git
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

### Running Interep (production)

**NODE_ENV === 'production'**

**Build**

```bash
yarn build
```

**Start the server**

```bash
yarn start
```

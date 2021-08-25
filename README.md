## Prerequisites

- Node.js
- Yarn

## Getting Started

Run `yarn` to install dependencies.

Copy the `.env.example` file and rename it `.env`.

All environment variables need to be provided. The format for the MongoDB URI is described [here](https://docs.mongodb.com/manual/reference/connection-string/).

To seed the database from seedTwitterUsers.ts (optional):

```
yarn seed:twitterUsers
```

## Running tests

`yarn test`

`yarn eth:test` (for smart contracts)

## Running InterRep locally

**NODE_ENV === 'development'**

```bash
yarn dev
```

The pages auto-update as you edit files.

To test all the features, you will need to run and deploy InterRep smart contracts locally. Here's how:

1. Start a local network in one terminal

`npx hardhat node`

2. In another terminal, deploy the interRep badge contract

` npx hardhat run scripts/ethereum/deploy-reputation-badge.ts --network localhost`

3. Give your address some ETH for gas

`npx hardhat faucet YOUR_ADDRESS --network localhost`

## Production

**NODE_ENV === 'production'**

**Build**

```bash
yarn build
```

**Start the server**

```bash
yarn start
```

## Reputation Scale

There are 3 possible values for the `basicReputation` associated with a Web 2 account:

- NOT_SUFFICIENT
- UNCLEAR
- CONFIRMED

### Twitter Criteria

- Any of the following will result in a `NOT_SUFFICIENT` reputation:
  - Default profile picture
  - 0 tweets
  - 2 followers or less
- Any of the following will result in a `CONFIRMED` reputation:

  - Verified by Twitter
  - More than 7000 followers
  - Is among the list of seed users

- Otherwise the reputation is `UNCLEAR` and data from [botometer](https://botometer.osome.iu.edu/) is provided

## API Routes

### Fetch the reputation

**By Twitter account**

Query by username

```
/api/reputation/twitter?username=
```

Query by Twitter id

```
/api/reputation/twitter?id=
```

Query currently connected account

```
/api/reputation/twitter/me
```

### Tokens

Get tokens by ethereum address

```
/api/tokens?owner=0xba36...
```

Get token by contract address and id

```
/api/tokens/0x99FCf805C468977e0F8Ceae21935268EEceadC07/93874287420912438946...
```

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

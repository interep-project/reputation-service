## Prerequisites

- Node.js
- Yarn

## Getting Started

Run `yarn` to install dependencies.

Copy the `.env.example` file and rename it `.env`.

All environment variables need to be provided. The format for the MongoDB URI is described [here](https://docs.mongodb.com/manual/reference/connection-string/).

To seed the database from seedTwitterUsers.ts (optional):

```
yarn run seedDB
```

**Run the development server**:

```bash
yarn dev
```

The pages auto-update as you edit files.

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

**By Ethereum Address**

```
/api/reputation/address/0x4e2B...
```

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

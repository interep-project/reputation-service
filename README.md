## Prerequisites

- Node.js
- Yarn

## Getting Started

Copy the `.env.example` file and rename it `.env`.

All environment variables need to be provided. The format for the MongoDB URI is described [here](https://docs.mongodb.com/manual/reference/connection-string/).

To seed the database (optional):

```
yarn script seedDatabase
```

Run the development server:

```bash
yarn dev
```

The pages auto-updates as you edit files.

## API Routes

The only API Route available for now is `/api/twitter/[twitterHandle]` which returns botometer data.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

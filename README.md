# reputation-service

To run:

`flask run`

To run in dev mode and reload as code changes:

`export FLASK_ENV=development`

You need a Twitter API key, and a Rapid API key for Botometer. Should create a `secrets.py` file with the consumer key/secret and access token/secret for Twitter, and your Rapid API key:

```
C_KEY = ""
C_SECRET = ""
ACCESS_TOKEN = ""
ACCESS_TOKEN_SECRET = ""
RAPIDAPI_KEY = ""
```

## FEATURE: Twitter bot check

Build a db of known real people, starting with a seed list. Purpose of this is to avoid hitting botometer API too much, since requests are limited on free tier, and to start building our own reputation filters.
TODO: Make criteria of obvious bots we will eliminate without running past botometer.

- Start a seed list of users we accept as real without a bot check
- Trust who seed users follow - add them to db
- Trust members of lists created by trusted curators
  - Note: We don't strictly care that this account is a real person in a KYC sense - they simply must a reputable, non-bot identity. So pseudonymous influencers count as "real"
- Save users to db. dedupe as you add users
  - Index users by username I guess, since that's what we'll be getting as input

Create an api endpoint for services to check if a given user is a bot.

- /api/v1/twitter/users?name=arcalinea
- check if this user is in our db
- if yes, return. if not, check botometer
  - Why does botometer require user Oauth to do a lookup? We probably should too, to prevent our Twitter API key from getting spammed.
- return bot or not

Create a form that takes a username and returns bot score

## FEATURE: Pubkey account association

Save pubkey-account associations

- Take a user pubkey  
  - MVP: Paste in pubkey? Do a check to see if key is valid.
  - Better UX: take from metamask, wallet integrations?
- Give option to link to Twitter or Github
  - Twitter: Can post a tweet or Oauth
  - Github: Must Oauth so we can get access to more data
- check those accounts to see if user bot or not.
- Save association of pubkey with this account + service in our db for now

Convert pubkey-account db to merkle tree

- associate pubkey, service, account id so only one account is used for one pubkey
- de-linking and re-linking with another account?
- semaphore groups?
- anchor on chain.

Research questions:

- L2: matics? Keep proofs there.
- Chainlink Oauth?
- Non-transferable token in account as reputation score?

Similar

- https://uniswap.org/blog/sybil/
- BrightID

## FEATURE: Github integration

For Twitter we're using Botometer to start. Github has no such thing, so we'll have to make it.

# DBs needed:

keyvalue. one keyed by pubkey, other one by twitter id

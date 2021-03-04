# reputation-service

To run:

`flask run`

To run in dev mode and reload as code changes:

`export FLASK_ENV=development`

## FEATURE: Twitter bot check

- Save users to db. dedupe
- check twitter account query against it
- check botometer if not on it
- return if bot or not

## FEATURE: Pubkey account association

- Take a user pubkey
- Give option to link to github or Twitter
- check those accounts to see if user bot or not.
- Save association of pubkey with this account in our db for now
- Later, put into merkle tree, semaphore groups, anchor on chain.

# DBs needed:

keyvalue. one keyed by pubkey, other one by twitter id

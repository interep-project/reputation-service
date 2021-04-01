import botometer
from secrets import *

rapidapi_key = RAPIDAPI_KEY
twitter_app_auth = {
    'consumer_key': C_KEY,
    'consumer_secret': C_SECRET,
    'access_token': ACCESS_TOKEN,
    'access_token_secret': ACCESS_TOKEN_SECRET,
  }

bom = botometer.Botometer(wait_on_ratelimit=True,
                          rapidapi_key=rapidapi_key,
                          **twitter_app_auth)

def check_twitter(name):
    # Check a single account by screen name
    result = bom.check_account('@' + name)
    # Do something with results
    print(result)

# # Check a single account by id
# result = bom.check_account(1548959833)
#
# # Check a sequence of accounts
# accounts = ['@clayadavis', '@onurvarol', '@jabawack']
# for screen_name, result in bom.check_accounts_in(accounts):
    # Do stuff with `screen_name` and `result`

import json
import tweepy

from secrets import *

import plyvel

tdb = plyvel.DB('/tmp/twitterdb/', create_if_missing=True)

# TODO: save to db

#### SUMMARY #####
# Start a seed list of users we accept as real without a bot check
# Decide to trust who seed users follow - add them to db
# Decide to trust members of lists created by trusted curators
# Note: We don't strictly care that this account is a real person in a KYC sense -
# they simply must a reputable, non-bot identity. So pseudonymous influencers count as "real"
##################

def get_list():
    text_file = open("seedusers.txt", "r")
    list = []
    for line in text_file:
      stripped_line = line.rstrip()
      list.append(stripped_line)
    text_file.close()
    list.sort()
    return list

def list_creator_members(list_creators):
    # Who are on lists of good list creators
    for name in list_creators:
        # lists of a user
        # lists = api.lists_ownerships(screen_name='twobitidiot', user_id=user.id_str)
        lists = api.lists_ownerships(screen_name=name)

        # members of their lists
        for l in lists:
            # print("L", l)
            members = api.list_members(list_id=l.id)
            # Do something with these ids
            for m in members:
                print(m.id)

def seed_user_friends(seed_users):
    # Who seed users follow
    for name in seed_users:
        friends = api.friends_ids(screen_name=name)
        # Save these ids. Dedupe as added.
        for friend in friends:
            # tdb.set('id', 'user')
            # id = tdb.get('k')
            print(id)
        for f in friends:
            print(f)

def save_user_by_name(users):
    for name in users:
        user = api.get_user(screen_name=name)
        # tdb.set(user.id, name)
        # print(tdb.get(user.id))

if __name__ == "__main__":
    auth = tweepy.OAuthHandler(C_KEY, C_SECRET)
    auth.set_access_token(ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
    api = tweepy.API(auth)
    # print(dir(api))

    # this works
    # lists = api.lists_subscriptions("arcalinea")
    # user = api.get_user('arcalinea')
    # print(user.id_str)

    # Building the db: We know these ppl are real. let's assume they follow real ppl too.
    # Pull seed users from seedusers.txt into an array
    seed_users = get_list()
    # save seed users to DB
    # save_user_by_name(seed_users)
    # print(seed_user_friends(seed_users))
    # print(seed_users)
    # user = api.get_user(screen_name='arcalinea')
    # print(user.id)

    tdb.put('key', 'value')
    print(tdb.get('key'))

    # these people make good lists
    list_creators = ['twobitidiot']

    # TODO: Pull members just from these lists
    selected_lists = []

    # user = api.get_user(screen_name='arcalinea')
    # print(user)

    # seed_user_friends(seed_users)
    # list_creator_members(list_creators)

    # FEATURE: Twitter bot check:
    # Save users to db. dedupe
    # check twitter account query against it
    # check botometer if not on it
    # return if bot or not

    # FEATURE: Pubkey account association
    # Take a user pubkey
    # Give option to link to github or Twitter
    # check those accounts to see if user bot or not.
    # Save association of pubkey with this account in our db for now
    # Later, put into merkle tree, sempaphore groups, anchor on chain.

    # db: keyvalue. keyed by pubkey, other one by twitter id


    # subscriptions = api.lists_subscriptions(screen_name='arcalinea', user_id=user.id_str)
    # json = json.dumps(subscriptions[0])
    # memberships = api.lists_memberships(screen_name='twobitidiot', user_id=user.id_str)

    # for sub in subscriptions:
    #     print(json.dumps(sub._json))
    # print(subscriptions.length)
    # print(json.dumps(memberships[0]._json))

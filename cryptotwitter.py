import json
import tweepy

from secrets import *

# TODO: save to db

#### SUMMARY #####
# Start a seed list of users we accept as real without a bot check
# Decide to trust who seed users follow - add them to db
# Decide to trust members of lists created by trusted curators
# Note: We don't strictly care that this account is a real person in a KYC sense -
# they simply must a reputable, non-bot identity. So pseudonymous influencers count as "real"
##################

def get_list():
    text_file = open("people.txt", "r")
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
        # Do something with these ids. Returns an array
        for f in friends:
            print(f)

if __name__ == "__main__":
    auth = tweepy.OAuthHandler(C_KEY, C_SECRET)
    auth.set_access_token(ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
    api = tweepy.API(auth)
    # print(dir(api))

    # this works
    # lists = api.lists_subscriptions("arcalinea")
    # user = api.get_user('arcalinea')
    # print(user.id_str)

    # we know these people are real. let's assume their followers are real too.
    seed_users = get_list()
    print(seed_user_friends(seed_users))
    # print(seed_users)

    # these people make good lists
    list_creators = ['twobitidiot']

    # TODO: Pull members just from these lists
    selected_lists = []

    # user = api.get_user(screen_name='arcalinea')
    # print(user)

    # seed_user_friends(seed_users)
    # list_creator_members(list_creators)



    # subscriptions = api.lists_subscriptions(screen_name='arcalinea', user_id=user.id_str)
    # json = json.dumps(subscriptions[0])
    # memberships = api.lists_memberships(screen_name='twobitidiot', user_id=user.id_str)

    # for sub in subscriptions:
    #     print(json.dumps(sub._json))
    # print(subscriptions.length)
    # print(json.dumps(memberships[0]._json))

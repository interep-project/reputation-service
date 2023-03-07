export const getUserQuery = `query getUser($login: String!) {
    user(login: $login) {
        repositories(first: 100) {
            nodes {
                stars: stargazerCount
            }
        }
        sponsoring {
            sponsoringCount: totalCount
        }
        sponsors {
            sponsorCount: totalCount
        }
    }
}`

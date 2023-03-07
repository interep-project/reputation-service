export const getUserQuery = `
query getUser($login: String!, $cursor: String) {
    user(login: $login) {
        repositories(first: 100, after: $cursor) {
            nodes {
                stars: stargazerCount
            }
            pageInfo {
                endCursor
                hasNextPage
            }
        }
        sponsoring {
            sponsoringCount: totalCount
        }
        sponsors {
            sponsorsCount: totalCount
        }
    }
}`

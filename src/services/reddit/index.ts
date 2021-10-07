const url = "https://oauth.reddit.com/api/v1"

export async function getRedditUserByToken(token: string) {
    const headers = new Headers({
        Authorization: token
    })

    const userResponse = await fetch(`${url}/me`, {
        headers
    })

    return userResponse.json()
}

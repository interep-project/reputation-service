const url = "https://oauth.reddit.com/api/v1"

export async function getRedditUser(token: string) {
    const headers = new Headers()

    headers.append("Authorization", `baerer ${token}`)

    const reposResponse = await fetch(`${url}/me`, {
        headers
    })

    return reposResponse.json()
}

const url = "https://api.github.com"

export async function getGithubUser(token: string) {
    const headers = new Headers()

    headers.append("Authorization", `token ${token}`)

    const reposResponse = await fetch(`${url}/user`, {
        headers
    })

    return reposResponse.json()
}

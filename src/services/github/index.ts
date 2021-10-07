const url = "https://api.github.com"

export async function getGithubUserByToken(token: string) {
    const headers = new Headers({
        Authorization: token
    })

    const userResponse = await fetch(`${url}/user`, {
        headers
    })
    const userData = await userResponse.json()
    const reposResponse = await fetch(userData.repos_url)
    const reposData = await reposResponse.json()
    const receivedStars = reposData.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0)

    return { ...userData, receivedStars }
}

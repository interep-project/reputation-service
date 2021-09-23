import { GithubParameters } from "@interrep/reputation-criteria"

export async function getGithubUser(token: string): Promise<GithubParameters> {
    const userResponse = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `token ${token}`
        }
    })
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { plan, repos_url, followers } = await userResponse.json()
    const reposResponse = await fetch(repos_url)
    const reposData = await reposResponse.json()
    const receivedStars = reposData.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0)

    return { verifiedProfile: plan.name === "pro", followers, receivedStars }
}

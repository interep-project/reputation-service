/* istanbul ignore file */
import { GithubParameters } from "@interep/reputation"
import { User } from "src/types/next-auth"

export default async function mapGithubProfile({
    id,
    name,
    login,
    plan,
    repos_url,
    followers
}: User): Promise<User & GithubParameters> {
    const reposResponse = await fetch(repos_url)
    const reposData = await reposResponse.json()
    const receivedStars = reposData.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0)

    return { id, name, username: login, proPlan: plan.name === "pro", followers, receivedStars }
}

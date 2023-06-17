import { Octokit } from "@octokit/core"
import { paginateGraphql } from "@octokit/plugin-paginate-graphql"
import { ok } from "assert"
import { GithubParameters } from "@interep/reputation"
import { getUserQuery } from "./get-user-query"

const GH_REST_API_URL = "https://api.github.com"

ok(process.env.GH_PAT, "GH_PAT is not defined")
const PaginatedOctokit = Octokit.plugin(paginateGraphql)
const octokit = new PaginatedOctokit({ auth: process.env.GH_PAT })

async function getGithubLoginAndId(token: string) {
    const headers = new Headers({ Authorization: token })
    const userResponse = await fetch(`${GH_REST_API_URL}/user`, { headers })
    const { id, login } = await userResponse.json()
    return { id: String(id), login }
}

async function getGithubReputationParams(login: string) {
    const { user } = await octokit.graphql.paginate(getUserQuery, { login })
    const {
        sponsors: { sponsorsCount },
        sponsoring: { sponsoringCount }
    } = user
    const receivedStars = (user.repositories?.nodes ?? []).reduce(
        (receivedStars: number, repo: { stargazerCount: number }) => receivedStars + repo.stargazerCount,
        0
    )

    return { receivedStars, sponsoringCount, sponsorsCount }
}

export async function getGithubUserByToken(token: string): Promise<{ id: string; reputationParams: GithubParameters }> {
    const { login, id } = await getGithubLoginAndId(token)
    const reputationParams = await getGithubReputationParams(login)
    return { id, reputationParams }
}

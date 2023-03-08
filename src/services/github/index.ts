import { Octokit } from "@octokit/core"
import { paginateGraphql } from "@octokit/plugin-paginate-graphql"
import * as url from "url"
import { ok } from "assert"
import { getUserQuery } from "./get-user-query"
import { GithubParameters } from "@interep/reputation"

ok(process.env.GH_PAT, "GH_PAT is not defined")

const PaginatedOctokit = Octokit.plugin(paginateGraphql)
const octokit = new PaginatedOctokit({ auth: process.env.GH_PAT })

export async function getGhLoginByToken(token: string) {
    const headers = new Headers({ Authorization: token })

    const userResponse = await fetch(`${url}/user`, {
        headers
    })

    const { login } = await userResponse.json()
    return login
}

async function getReputationParamsByGhLogin(login: string) {
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

export async function getGhReputationParams(token: string): Promise<GithubParameters> {
    const login = await getGhLoginByToken(token)
    return getReputationParamsByGhLogin(login)
}

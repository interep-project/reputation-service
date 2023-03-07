import { Octokit } from "@octokit/core"
import { paginateGraphql } from "@octokit/plugin-paginate-graphql"
import * as url from "url"
import { ok } from "assert"
import { getUserQuery } from "./get-user-query"

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
    const stars = (user.repositories?.nodes ?? []).reduce(
        (stars: number, repo: { stars: number }) => stars + repo.stars,
        0
    )

    return { stars, sponsoringCount, sponsorsCount }
}

export async function getReputationParamsByToken(token: string) {
    const login = await getGhLoginByToken(token)
    return getReputationParamsByGhLogin(login)
}

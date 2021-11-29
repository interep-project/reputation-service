import { createMocks, Mocks, RequestMethod, RequestOptions } from "node-mocks-http"
import { NextApiRequest, NextApiResponse } from "next"

export default function createNextMocks(reqOptions?: RequestOptions): Mocks<NextApiRequest, NextApiResponse> {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET" as RequestMethod,
        ...reqOptions
    })

    req.body = JSON.stringify(req.body)

    return { req, res }
}

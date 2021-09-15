import { createMocks, Mocks, RequestMethod, RequestOptions } from "node-mocks-http"
import { NextApiRequest, NextApiResponse } from "next"

const createNextMocks = (reqOptions?: RequestOptions): Mocks<NextApiRequest, NextApiResponse> => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET" as RequestMethod,
        ...reqOptions
    })
    req.body = JSON.stringify(req.body)

    return { req, res }
}

export default createNextMocks

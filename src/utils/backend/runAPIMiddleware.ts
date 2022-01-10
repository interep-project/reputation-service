import { NextApiRequest, NextApiResponse } from "next"

/**
 * Helper method to wait for a middleware to execute before continuing
 * and to throw an error when an error happens in a middleware.
 */
export default async function runAPIMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    fn: (req: NextApiRequest, res: NextApiResponse, next: (result?: any) => any) => void
): Promise<any> {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result)
            }

            return resolve(result)
        })
    })
}

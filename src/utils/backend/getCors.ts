import Cors, { CorsOptions } from "cors"
import { NextApiRequest, NextApiResponse } from "next"
import config from "src/config"

export default function getCors(
    options: CorsOptions = {}
): (req: NextApiRequest, res: NextApiResponse, next: (result?: any) => any) => void {
    return Cors({
        origin(origin, callback) {
            if (!origin || config.API_WHITELIST.some((domain) => domain.test(origin))) {
                callback(null, config.API_WHITELIST)
            } else {
                callback(new Error(`CORS blocked request from '${origin}'`))
            }
        },
        ...options
    })
}

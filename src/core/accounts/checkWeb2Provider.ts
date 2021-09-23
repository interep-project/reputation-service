import { Web2Provider } from "@interrep/reputation-criteria"

export default function checkWeb2Provider(web2Provider: Web2Provider): boolean {
    const web2Providers = Object.values(Web2Provider)

    return web2Providers.includes(web2Provider)
}

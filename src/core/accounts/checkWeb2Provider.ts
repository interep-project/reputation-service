import { Web2Providers } from "src/models/web2Accounts/Web2Account.types"

export default function checkWeb2Provider(web2Provider: Web2Providers): boolean {
    const web2Providers = Object.values(Web2Providers)

    return web2Providers.includes(web2Provider)
}

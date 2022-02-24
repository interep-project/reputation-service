const CONTEXT = "interrep"

export function getBrightIdLink(userAddress: string): string {
    const nodeUrl = 'http:%2f%2fnode.brightid.org'
    const deepLink = `brightid://link-verification/${nodeUrl}/${CONTEXT}/${userAddress}`
    return deepLink
}
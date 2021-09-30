export async function getPoapTokens(ethereumAddress: string) {
    const response = await fetch(`https://api.poap.xyz/actions/scan/${ethereumAddress}`)

    return response.json()
}

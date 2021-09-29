export async function getPOAPtokens(ethereumAddress: string) {
    const response = await fetch(`https://api.poap.xyz/actions/scan/${ethereumAddress}`)

    return response.json()
}

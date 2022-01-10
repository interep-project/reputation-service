const url = "https://api.twitter.com/1.1"

export const getTwitterUserByToken = async (token: string) => {
    const headers = new Headers({
        Authorization: token
    })

    const userResponse = await fetch(`${url}/account/verify_credentials.json`, {
        headers
    })

    return userResponse.json()
}

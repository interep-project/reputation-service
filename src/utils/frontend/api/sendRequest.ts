export default async function sendRequest(
    url: string,
    body?: any,
    method = body ? "POST" : "GET"
): Promise<any | null | number> {
    const response = await fetch(url, {
        method,
        body: JSON.stringify(body)
    })

    if (response.status !== 200 && response.status !== 201) {
        const error = await response.text()

        console.error(error || `HTTP method ${method} failed`)

        return response.status
    }

    try {
        const { data } = await response.json()

        return data
    } catch {
        return 500
    }
}

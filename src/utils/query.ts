export function getQueryParameter(requestUrl: string | undefined, name: string): string {
    const url = new URL("http://dummy" + requestUrl)
    const queryParams = url.searchParams
    let value = queryParams.get(name)
    if (!value) {
        throw new Error(`Query ${name} not included in query`)
    }
    return value
}
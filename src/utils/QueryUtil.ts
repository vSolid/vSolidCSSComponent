import { BadRequestHttpError } from "@solid/community-server"

export function getQueryParameter(requestUrl: string | undefined, name: string): string {
    const url = new URL("http://dummy" + requestUrl)
    const queryParams = url.searchParams
    const value = queryParams.get(name)
    if (!value) {
        throw new BadRequestHttpError(`Query ${name} not included in query`)
    }
    return value
}
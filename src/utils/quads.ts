import { readableToString } from "@solid/community-server"
import { Parser, Store, } from "n3"
import { Readable } from "stream"

export async function readableToQuads(stream: Readable): Promise<Store> {
    let str = await readableToString(stream)
    const parser = new Parser()
    let existingQuads = parser.parse(str)
    let store = new Store()
    store.addQuads(existingQuads)
    return store
}
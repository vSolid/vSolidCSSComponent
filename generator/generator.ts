import { DataFactory } from "n3";
const { namedNode, literal, quad, blankNode } = DataFactory;
import fs, { createWriteStream } from "fs"
import { v4 as uuid } from "uuid";
import type * as RDF from "@rdfjs/types";
import { dirname } from 'path';
import { mkdirp } from 'mkdirp';
import rdfSerializer from 'rdf-serialize';
import { type Writable, PassThrough } from 'stream';
import { inspect } from "util";
import streamifyArray = require("streamify-array");

export const VS_PREFIX = "https://vsolid.org/properties#" as const;

export const VS = {
    operation: `${VS_PREFIX}operation`,
    delete: `${VS_PREFIX}delete`,
    insert: `${VS_PREFIX}insert`,
    delta_date: `${VS_PREFIX}delta_date`,
    delta_author: `${VS_PREFIX}delta_author`,
    next_delta: `${VS_PREFIX}next_delta`,
    contains_operation: `${VS_PREFIX}contains_operation`,
} as const;

export type VS = typeof VS;

const historyLengths = {
    "scale1": 1,
    "scale10": 10,
    "scale100": 100,
    "scale1_000": 1_000,
    "scale10_000": 10_000,
    "scale100_000": 100_000,
} as const;

const iriToPath = {
    "http://localhost:3000": "./.data"
};

async function generateTestData() {
    for (const [key, value] of Object.entries(historyLengths)) {
        const iri = `http://localhost:3000/test/${key}#data`;
        const baseFilePath = getFilePath(iri);
        const documentFilePath = baseFilePath + "$.ttl";
        const documentWriteStream = await getWriteStream(documentFilePath);

        const deltaFilePath = baseFilePath + ".vSolid";
        const metaFilePath = baseFilePath + ".meta";

        let headDeltaId = "";

        const quads : RDF.Quad[] = [];
        const deltas : RDF.Quad[] = [];

        for (let i = 0; i < value; i++) {
            const thing = quad(
                namedNode(iri),
                namedNode("http://example.org/property"),
                literal(`test ${i}`)
            );

            quads.push(thing);

            const _deltas = await createDelta(iri, thing, VS.insert, headDeltaId);
            for (const delta of _deltas) {
                deltas.push(delta);
            }
            headDeltaId = _deltas[0]?.subject.value;

        }

        await writeQuadsAsync(documentFilePath, quads);
        await writeQuadsAsync(deltaFilePath, deltas);

        const metadataQuad = quad(
            namedNode(iri),
            namedNode(VS.next_delta),
            literal(headDeltaId)
        )

        await writeQuadsAsync(metaFilePath, [metadataQuad]);

        console.log("");
        console.log("Generated test data for", key);
    }
}

async function writeQuadsAsync(path: string, quads: RDF.Quad[]) {
    return new Promise((res, rej) => {

      const fileStream = createWriteStream(path);
      rdfSerializer
        .serialize(streamifyArray(quads), { contentType: "text/turtle" })
        .pipe(fileStream);

      fileStream.on("finish", res);
      fileStream.on("err", rej);
    });
  }

async function getWriteStream(path: string, contentType: string = "text/turtle") {
    const writeStream: RDF.Stream & Writable = <any> new PassThrough({ objectMode: true });
    const folder = dirname(path);
    await mkdirp(folder);
    const fileStream = fs.createWriteStream(path, { flags: 'a' });
    rdfSerializer.serialize(writeStream, { contentType }).pipe(fileStream);
    return writeStream;
}

function getFilePath(iri: string): string {
    // Find base path from the first matching baseIRI
    let path: string | undefined;
    for (const [ baseIRI, basePath ] of Object.entries(iriToPath)) {
      if (iri.startsWith(baseIRI)) {
        path = basePath + iri.slice(baseIRI.length);
        break;
      }
    }
    // Crash if we did not find a matching baseIRI
    if (!path) {
        throw new Error(`No IRI mapping found for ${iri}`);
    }

    const posHash = path.indexOf("#");
    if (posHash >= 0) {
        path = path.slice(0, posHash);
    }

    // Escape illegal directory names
    path = path.replace(/[*|"<>?:]/ug, '_');
    return path;
}

async function createDelta(iri: string, operationQuad: RDF.Quad, operation: VS["insert"] | VS["delete"] = VS["insert"], headDeltaId: string | null = null): Promise<RDF.Quad[]> {
    const id = uuid();

    const deltaDate = quad(
        namedNode(id),
        namedNode(VS.delta_date),
        literal(new Date().toISOString())
    );

    const metadataId = headDeltaId;
    const nextDeltaID = !metadataId ? blankNode() : literal(metadataId);

    const nextDelta = quad(namedNode(id), namedNode(VS.next_delta), nextDeltaID);

    const operations: RDF.Quad[] = [
        quad(
            namedNode(id),
            namedNode(VS.contains_operation),
            createOperation(operationQuad, operation)
        ),
    ];

    const delta: RDF.Quad[] = [deltaDate, nextDelta, ...operations];

    return delta;
}

function createOperation(subject: RDF.Quad, type: string): RDF.Quad {
    return quad(subject, namedNode(VS.operation), namedNode(type));
}

generateTestData()

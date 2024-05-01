import {add, complete, cycle, save, suite} from 'benny';
import { QueryableServer } from "./runner";
import { IsoBench } from "iso-bench";

type Delegate<TReturn = unknown> = () => Promise<TReturn>;

export class Benchmark {
   
    private setup: Delegate | undefined;
    private servers: QueryableServer[];
    private suiteName: string;
    private benchmarkFn: (server: QueryableServer) => Promise<unknown>;
    constructor(suiteName: string, benchmarkFn: (server: QueryableServer) => Promise<unknown>, servers: QueryableServer[], setup?: Delegate) {
        this.suiteName = suiteName;
        this.benchmarkFn = benchmarkFn;
        this.servers = servers;
        this.setup = setup;
    }

    public async run() {
     
        await this.setup?.();

        const bench = new IsoBench(this.suiteName);
        this.addForAllServersIso(bench, this.servers, this.benchmarkFn);
        return bench
            .consoleLog()
            .run();



        // return await suite(
        //     this.suiteName,
        //     ...this.addForAllServers(this.servers, this.benchmarkFn),
        //     cycle(),
        //     complete(),
        //     save({ file: this.suiteName, version: '1.0.0' }),
        //     save({ file: this.suiteName, format: 'chart.html' }),
        //     {name: "config", entries: {cases: {minSamples: 5}}}
        //   )
    }

    private addForAllServersIso(bench: IsoBench, servers: QueryableServer[], fn: (server: QueryableServer) => Promise<unknown>, universalName?: string) {
        for (const server of servers) {
            bench.add(`${universalName ? universalName + " " : ""}${server.name}`, () => fn(server));
        }
    }

    private addForAllServers(servers: QueryableServer[], fn: (server: QueryableServer) => Promise<unknown>, universalName?: string) {
        return servers?.map(server => add(`${universalName ? universalName + " " : ""}${server.name}`, () =>  fn(server))) ?? []
    }

}
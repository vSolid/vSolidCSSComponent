import {Benchmark} from './Benchmark';
import { pingServer, queryDocument } from './benchmark_functions';
import {ConfigTemplate, Server} from './server'
import { App } from '@solid/community-server';

type ServerSetup = {
    name: ConfigTemplate;
    port: number;
}

export type QueryableServer = {
    name: string;
    url: string;
    app: App;
}

async function main() {
    const serverSetups : ServerSetup[] = [
        {
            name: "standard",
            port: 8990,
        },
        // {
        //     name: "vSolid",
        //     port: 8989,
        // },
    ];

    const servers : QueryableServer[] = await startServers(serverSetups);
    console.log(servers);

    const pingBenchmark = new Benchmark('Ping server', pingServer, servers);
    await pingBenchmark.run();

    await stopServers(servers);

    // const serverSetups1 : ServerSetup[] = [
    //     {
    //         name: "vSolid",
    //         port: 8989,
    //     },
    //     // {
    //     //     name: "vSolid",
    //     //     port: 8990,
    //     // },
    // ];

    // const servers1 : QueryableServer[] = await startServers(serverSetups1);

    // const queryBenchmark = new Benchmark('Query document', queryDocument, servers1);

    // await queryBenchmark.run();

    // await stopServers(servers1);
}

async function startServers(serverSetups: ServerSetup[]) {
    console.log("Starting servers")
    const servers : QueryableServer[] = [];
    for (const serverSetup of serverSetups) {
        const serverProvider = new Server(serverSetup.name, serverSetup.port);
        const server = await serverProvider.start();
        servers.push({
            name: serverSetup.name,
            url: `http://localhost:${serverSetup.port}`,
            app: server
        });
    }
    return servers;
}

async function stopServers(servers: QueryableServer[]) {
    for (const server of servers) {
        await server.app.stop();
    }
}

main();
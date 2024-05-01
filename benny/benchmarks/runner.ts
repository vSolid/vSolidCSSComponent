import {runSuite} from './bench'
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
            name: "vSolid",
            port: 8989,
        },
        {
            name: "standard",
            port: 8990,
        }
    ];

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
    
    await runSuite(servers);
}

main();
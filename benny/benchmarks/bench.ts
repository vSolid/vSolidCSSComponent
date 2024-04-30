/* benchmark.js */
import {add, complete, cycle, save, suite} from 'benny';
import { App } from '@solid/community-server';
import { inspect } from 'util';
import { QueryableServer } from './runner';

export const runSuite = async (servers: QueryableServer[]) => await suite(
  'Query server suite',

  ...servers.map(server => add(`Query server ${server.name}`, async () => {
    const response = await fetch(server.url);
    })
  ),

  cycle(),
  complete(async (summary) => {
    await Promise.all(servers.map(server => server.app.stop))
    console.log("Stopped servers")
  }),
  save({ file: 'reduce', version: '1.0.0' }),
  save({ file: 'reduce', format: 'chart.html' }),
)
/* benchmark.js */
import {add, complete, cycle, save, suite} from 'benny';
import { QueryableServer } from './runner';

export async function pingServer(server: QueryableServer) {
  return await fetch(server.url);
}

export async function queryDocument(server: QueryableServer) {
  return await fetch(`${server.url}/richardpod/mycontainer/mything`);
}

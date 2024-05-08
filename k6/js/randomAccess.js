import http from 'k6/http';
import { group, check} from 'k6';
import {getRandomURL} from '../helpers/random-file-accessor.js';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  group("Simple random query", () => {
    const res = http.get(getRandomURL());
    check(res, {
      "is status 200": (r) => r.status === 200,
    });
  });
}
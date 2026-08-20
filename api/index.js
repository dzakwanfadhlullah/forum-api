import createServer from '../src/Infrastructures/http/createServer.js';
import container from '../src/Infrastructures/container.js';

let appPromise = null;

export default async function handler(req, res) {
  if (!appPromise) {
    appPromise = createServer(container);
  }
  const app = await appPromise;
  return app(req, res);
}

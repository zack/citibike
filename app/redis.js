import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;
const client = redisUrl ? createClient({ url: redisUrl }) : createClient();

// If there's no redisUrl then that means we're in a GitHub workflow, and redis
// calls will never actually be made since the api calls are mocked out anyway.
// So we don't need to worry about the fact that we have a nonworking redis client.

if (redisUrl) {
  // eslint-disable-next-line
  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();
}

export default client;

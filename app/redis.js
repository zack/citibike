import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;
const client = redisUrl ? createClient({ url: redisUrl }) : createClient();

// eslint-disable-next-line
client.on('error', (err) => console.log('Redis Client Error', err));

await client.connect();

export default client;

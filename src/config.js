export const timeout = process.env.TIMEOUT || 100;

export const redis = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  channels: {
    pending: process.env.REDIS_PENDING || 'redis-watcher:pending',
    watching: process.env.REDIS_WATCHING || 'redis-watcher:watching:',
  },
};

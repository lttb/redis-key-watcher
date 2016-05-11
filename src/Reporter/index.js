import { redis as redisConfig } from '../config';

export default redisClient => ({
  async report(key, expire) {
    return await redisClient.set(redisConfig.channels.watching + key, 1, 'PX', expire);
  },
});

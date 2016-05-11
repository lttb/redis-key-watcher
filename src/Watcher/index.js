import EventEmitter from 'events';
import { timeout, redis as redisConfig } from '../config';

import EventTypes from '../const/EventTypes';

export default (redisClient, watchingKeys = new Map) => {
  async function watch(key, watcherEmitter = new EventEmitter) {
    if (watchingKeys.has(key)) {
      throw Error(`The key: ${key} is already watching!`);
    }
    watchingKeys.set(key, null);

    (async function keyCheck(wasPending) {
      const keyPttl = await redisClient.pttl(redisConfig.channels.watching + key);
      let isPending = wasPending;

      if (keyPttl > 0 && isPending) {
        if (!!await redisClient.srem(redisConfig.channels.pending, key)) {
          watcherEmitter.emit(EventTypes.RECOVER, key);
        }

        isPending = false;
      } else if (!isPending) {
        if (!!await redisClient.sadd(redisConfig.channels.pending, key)) {
          watcherEmitter.emit(EventTypes.CRASH, key);
        } else {
          watcherEmitter.emit(EventTypes.ERROR, `The key: ${key} has been already handled!`);
        }

        isPending = true;
      }

      watchingKeys.set(key, setTimeout(() => keyCheck(isPending), keyPttl + timeout));
    }(!!await redisClient.sismember(redisConfig.channels.pending, key)));

    return watcherEmitter;
  }

  async function unwatch(key) {
    const timeOutId = await watchingKeys.get(key);
    if (!timeOutId) {
      throw Error(`The key: ${key} hasn't been watched`);
    }

    clearTimeout(timeOutId);
    watchingKeys.delete(key);

    return `The key: ${key} has been unwatched`;
  }

  return { watch, unwatch };
};

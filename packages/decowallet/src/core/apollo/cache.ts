import { InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { CachePersistor } from 'apollo3-cache-persist';
import { MMKV } from 'react-native-mmkv';
import FSStorage from 'redux-persist-fs-storage';
import { SCHEMA_VERSION, SCHEMA_VERSION_KEY } from '../constants';

export const Storage = new MMKV({ id: 'deco' });

const setVersionKeyToStorage = async (persistor: CachePersistor<NormalizedCacheObject>) => {
  try {
    const currentVersion = Storage.getString(SCHEMA_VERSION_KEY);

    if (currentVersion === SCHEMA_VERSION) {
      // If the current version matches the latest version,
      // we're good to go and can restore the cache.
      Storage.set(SCHEMA_VERSION_KEY, SCHEMA_VERSION);
      await persistor.restore();
    } else {
      // Otherwise, we'll want to purge the outdated persisted cache
      // and mark ourselves as having updated to the latest version.
      await persistor.purge();
      Storage.set(SCHEMA_VERSION_KEY, SCHEMA_VERSION);
    }
  } catch (error) {
    console.error('Error during apollo initialization', error);
    await persistor.purge();
    Storage.set(SCHEMA_VERSION_KEY, SCHEMA_VERSION);
  }
};

export const createApolloCache = async (): Promise<InMemoryCache> => {
  const cache = new InMemoryCache({});

  const persistor = await new CachePersistor({
    cache,
    storage: FSStorage(),
    trigger: 'write',
    debug: true,
    debounce: 1000,
  });

  await setVersionKeyToStorage(persistor);

  return cache;
};

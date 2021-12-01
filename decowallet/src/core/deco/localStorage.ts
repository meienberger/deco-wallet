import RNFS from 'react-native-fs';

const errUtil = (error: unknown, methodName: string) => {
  console.error(error, methodName);

  if (error instanceof Error) {
    throw new Error(`${methodName}: ${error?.message}`);
  }

  throw new Error(`${methodName}: ${error}`);
};

class LocalStorage {
  name: string;

  fileName: string;

  initDone: boolean;

  constructor(name: string) {
    this.name = name;
    this.initDone = false;
    this.fileName = `${RNFS.DocumentDirectoryPath}/${this.name}.json`;
  }

  async init(): Promise<void> {
    if (this.initDone) {
      return;
    }

    try {
      const file = await RNFS.exists(this.fileName);

      if (file) {
        return;
      }

      this.initDone = true;

      await RNFS.writeFile(this.fileName, '{}');
    } catch (error) {
      errUtil(error, 'init');
    }
  }

  async removeStore(): Promise<void> {
    try {
      const fileExists = await RNFS.exists(this.fileName);

      if (fileExists) {
        await RNFS.unlink(this.fileName);
      }
    } catch (error) {
      errUtil(error, 'removeFile');
    }
  }

  async writeStore(content: Record<string, unknown>): Promise<void> {
    const stringified = JSON.stringify(content);

    // Remove everything before
    await this.removeStore();

    return RNFS.writeFile(this.fileName, stringified);
  }

  async getStore(): Promise<Record<string, unknown>> {
    await this.init();

    try {
      const file = await RNFS.readFile(this.fileName);

      return JSON.parse(file || '{}');
    } catch (error) {
      errUtil(error, 'getStore');
    }

    return {};
  }

  async getItem<T>(key: string): Promise<T> {
    await this.init();

    try {
      const fileContent = await this.getStore();

      return fileContent?.[key] as T;
    } catch (error) {
      errUtil(error, 'getItem');
    }

    throw new Error('Unable to find object');
  }

  async removeItem(key: string): Promise<void> {
    await this.init();

    try {
      const fileContent = await this.getStore();

      // Delete key if it exists
      if (fileContent?.[key]) {
        delete fileContent[key];
      }

      await this.writeStore(fileContent);
    } catch (error) {
      errUtil(error, 'removeItem');
    }
  }

  async setItem(key: string, value: unknown): Promise<void> {
    await this.init();

    try {
      const fileContent = await this.getStore();

      // Add or replace content for key
      fileContent[key] = value;

      await this.writeStore(fileContent);
    } catch (error) {
      errUtil(error, 'setItem');
    }
  }
}

export default LocalStorage;

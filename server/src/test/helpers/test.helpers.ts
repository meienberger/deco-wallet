/* eslint-disable no-promise-executor-return */
/* eslint-disable promise/param-names */
const wait = (seconds: number): Promise<unknown> => new Promise(res => setTimeout(res, seconds * 1000));

export { wait };

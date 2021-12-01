/* eslint-disable unicorn/no-process-exit */
/* eslint-disable promise/catch-or-return */
import { testConn } from './testConn';

testConn(true).then(() => process.exit());

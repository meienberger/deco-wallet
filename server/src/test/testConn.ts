import { Connection, createConnection } from 'typeorm';
import ChainAddress from '../modules/chain-address/chain-address.entity';
import Invoice from '../modules/invoice/invoice.entity';
import User from '../modules/user/user.entity';

export const testConn = (drop = false): Promise<Connection> => {
  return createConnection({
    name: 'default',
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'deco-test',
    dropSchema: drop,
    logging: false,
    synchronize: drop,
    entities: [User, Invoice, ChainAddress],
  });
};

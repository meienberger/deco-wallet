import config from '../config';
import url from 'url';
import * as jayson from 'jayson/promise';

const rpc = url.parse(config.bitcoind.rpc);

const bitcoin = jayson.client.http(rpc);

export default bitcoin;

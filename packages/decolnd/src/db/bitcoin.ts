import config from '../config';
import url from 'url';
import jayson from 'jayson/promise';

const rpc = url.parse(config.bitcoind.rpc);

export default jayson.Client.http(rpc);

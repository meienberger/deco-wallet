import fs from 'fs';
import path from 'path';

const getInvoiceQuery = fs.readFileSync(path.join(__dirname, './getInvoice.graphql')).toString('utf-8');
const meQuery = fs.readFileSync(path.join(__dirname, './me.graphql')).toString('utf-8');
const balanceQuery = fs.readFileSync(path.join(__dirname, './balance.graphql')).toString('utf-8');

export { getInvoiceQuery, meQuery, balanceQuery };

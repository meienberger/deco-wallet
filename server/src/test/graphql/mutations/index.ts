import fs from 'fs';
import path from 'path';

const createInvoiceMutation = fs.readFileSync(path.join(__dirname, './createInvoice.graphql')).toString('utf-8');
const registerMutation = fs.readFileSync(path.join(__dirname, './register.graphql')).toString('utf-8');
const loginMutation = fs.readFileSync(path.join(__dirname, './login.graphql')).toString('utf-8');
const getChainAddressMutation = fs.readFileSync(path.join(__dirname, './getChainAddress.graphql')).toString('utf-8');

export { createInvoiceMutation, registerMutation, loginMutation, getChainAddressMutation };

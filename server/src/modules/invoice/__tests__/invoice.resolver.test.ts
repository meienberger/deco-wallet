/* eslint-disable max-lines */
import { Connection } from 'typeorm';
import validator from 'validator';
import { add, sub } from 'date-fns';
import faker from 'faker';
import { gcall } from '../../../test/gcall';
import { testConn } from '../../../test/testConn';
import User from '../../user/user.entity';
import { bitcoin, lightning } from '../../../services';
import InvoiceHelpers from '../invoice.helpers';
import Invoice from '../invoice.entity';
import ERROR_CODES from '../../../config/constants/error.codes';
import { MAXIMUM_INVOICE_DESCRIPTION_LENGTH, PLATFORM_FEE } from '../../../config/constants/constants';
import { InvoiceTypeEnum } from '../invoice.types';
import { balanceQuery, getInvoiceQuery, paginatedInvoicesQuery } from '../../../test/graphql/queries';
import { createInvoiceMutation, getChainAddressMutation, payInvoiceMutation } from '../../../test/graphql/mutations';
import { GraphQLError } from 'graphql';
import { forEach } from 'p-iteration';

let conn: Connection | null = null;

beforeAll(async () => {
  faker.seed(Math.floor(1_000_000_000 * Math.random()));
  conn = await testConn();
});

afterAll(async () => {
  if (conn) {
    await conn.close();
  }
});

describe('Create invoice', () => {
  it('Can create an invoice', async () => {
    const input = { amount: 1000, description: 'test' };

    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    const res = await gcall({
      source: createInvoiceMutation,
      variableValues: {
        input,
      },
      userId: user.id,
    });

    expect(res).toMatchObject({
      data: { createInvoice: { errors: null, invoice: { userId: user.id, confirmedAt: null } } },
    });

    const dbInvoice = await Invoice.findOne({ where: { id: res.data?.createInvoice.invoice.id } });

    expect(dbInvoice).toBeDefined();

    // description contains userId
    const nativeInvoice = await lightning.decodeInvoice(res.data?.createInvoice.invoice.request);

    expect(dbInvoice?.amount).toBe(input.amount);
    expect(nativeInvoice.tokens).toBe(input.amount);

    expect(dbInvoice?.nativeId).toBe(nativeInvoice.id);
    expect(dbInvoice?.type).toBe(InvoiceTypeEnum.RECEIVE);
    expect(dbInvoice?.isCanceled).toBe(false);
    expect(dbInvoice?.isConfirmed).toBe(false);
  });

  it('Correctly adds userId inside invoice description', async () => {
    const input = { amount: 1000, description: 'test' };

    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    const res = await gcall({
      source: createInvoiceMutation,
      variableValues: {
        input,
      },
      userId: user.id,
    });

    const nativeInvoice = await lightning.decodeInvoice(res.data?.createInvoice.invoice.request);

    await expect(await InvoiceHelpers.isInvoiceOwner(user.id, nativeInvoice)).toBe(true);
    await expect(await InvoiceHelpers.isInvoiceOwner(user.id, res.data?.createInvoice.invoice)).toBe(true);
  });

  it('Correctly set expiresAt in one hour time', async () => {
    const input = { amount: 1000, description: 'test' };

    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    const res = await gcall({
      source: createInvoiceMutation,
      variableValues: {
        input,
      },
      userId: user.id,
    });

    expect(res.data?.createInvoice.invoice.expiresAt).toBeDefined();

    const dbInvoice = await Invoice.findOne({ where: { id: res.data?.createInvoice.invoice.id } });

    expect(dbInvoice?.expiresAt).toBeDefined();
    expect(validator.isAfter(dbInvoice?.expiresAt.toString() || '', new Date().toString())).toBe(true);

    const inOneHour = add(new Date(), { hours: 1 });

    // 1000ms security margin
    expect(dbInvoice?.expiresAt.getTime()).toBeGreaterThan(inOneHour.getTime() - 1000);
    expect(dbInvoice?.expiresAt.getTime()).toBeLessThanOrEqual(inOneHour.getTime() + 1000);
  });

  it('Should not be able to create an invoice with a negative amount', async () => {
    const input = { amount: -1000, description: 'test' };

    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    const res = await gcall({
      source: createInvoiceMutation,
      variableValues: {
        input,
      },
      userId: user.id,
    });

    expect(res).toMatchObject({
      data: { createInvoice: { errors: [{ field: 'amount', code: ERROR_CODES.invoice.amountTooLow }] } },
    });
  });

  it('Should not be able to create an invoice below the minimum amount', async () => {
    const input = { amount: 1, description: 'test' };

    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    const res = await gcall({
      source: createInvoiceMutation,
      variableValues: {
        input,
      },
      userId: user.id,
    });

    expect(res).toMatchObject({
      data: { createInvoice: { errors: [{ field: 'amount', code: ERROR_CODES.invoice.amountTooLow }] } },
    });
  });

  it('Cannot create an invoice with a description longer than 256 characters', async () => {
    const input = { amount: 1000, description: 'a'.repeat(MAXIMUM_INVOICE_DESCRIPTION_LENGTH + 1) };

    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    const res = await gcall({
      source: createInvoiceMutation,
      variableValues: {
        input,
      },
      userId: user.id,
    });

    expect(res).toMatchObject({
      data: { createInvoice: { errors: [{ field: 'description', code: ERROR_CODES.invoice.descriptionTooLong }] } },
    });
  });
});

describe('Get invoice', () => {
  it('Can get an invoice created by user', async () => {
    const input = { amount: 1000, description: 'test' };
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    const res = await gcall({
      source: createInvoiceMutation,
      variableValues: {
        input,
      },
      userId: user.id,
    });

    const invoice = res.data?.createInvoice.invoice;

    const res2 = await gcall({
      source: getInvoiceQuery,
      variableValues: {
        id: Number(invoice.id),
      },
      userId: user.id,
    });

    expect(res2).toMatchObject({
      data: { getInvoice: { errors: null, invoice: { id: invoice.id, user: { username: user.username, id: user.id.toString() } } } },
    });
  });

  it('Cannot get invoice if user is not logged in', async () => {
    const input = { amount: 1000, description: 'test' };
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    const res = await gcall({
      source: createInvoiceMutation,
      variableValues: {
        input,
      },
      userId: user.id,
    });

    const invoice = res.data?.createInvoice.invoice;

    const res2 = await gcall({
      source: getInvoiceQuery,
      variableValues: {
        id: Number(invoice.id),
      },
    });

    expect(res2.errors).toBeDefined();
    expect(res2.errors?.[0]).toBeInstanceOf(GraphQLError);
    expect(res2.errors?.[0].message).toBe('Access denied! You need to be authorized to perform this action!');
    expect(res2.data).toBeNull();
  });

  it('Cannot get an invoice if not owner', async () => {
    const input = { amount: 1000, description: 'test' };
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();
    const user2 = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    const res = await gcall({
      source: createInvoiceMutation,
      variableValues: {
        input,
      },
      userId: user.id,
    });

    const invoice = res.data?.createInvoice.invoice;

    const res2 = await gcall({
      source: getInvoiceQuery,
      variableValues: {
        id: Number(invoice.id),
      },
      userId: user2.id,
    });

    expect(res2).toMatchObject({
      data: { getInvoice: { errors: [{ code: ERROR_CODES.invoice.notFound }], invoice: null } },
    });
  });

  it('Returns not found error when invoice does not exist', async () => {
    const res = await gcall({
      source: getInvoiceQuery,
      variableValues: {
        id: 1000,
      },
      userId: 1,
    });

    expect(res).toMatchObject({
      data: { getInvoice: { errors: [{ code: ERROR_CODES.invoice.notFound }], invoice: null } },
    });
  });
});

describe('Paginated invoices', () => {
  it('Can get invoices created by user', async () => {
    const input = { amount: 1000, description: 'test' };
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();
    const res = await gcall({
      source: createInvoiceMutation,
      variableValues: {
        input,
      },
      userId: user.id,
    });
    const invoice = res.data?.createInvoice.invoice;

    const res2 = await gcall({
      source: paginatedInvoicesQuery,
      variableValues: {
        pagination: {
          page: 1,
          pageSize: 10,
        },
      },
      userId: user.id,
    });

    expect(res2.data?.paginatedInvoices.invoices).toHaveLength(1);
    expect(res2).toMatchObject({
      data: { paginatedInvoices: { errors: null, invoices: [{ id: invoice.id }] } },
    });
  });

  it('Cannot get invoices if user is not logged in', async () => {
    const res = await gcall({
      source: paginatedInvoicesQuery,
      variableValues: {
        pagination: {
          page: 1,
          pageSize: 10,
        },
      },
    });

    expect(res.errors).toBeDefined();
    expect(res.errors?.[0]).toBeInstanceOf(GraphQLError);
    expect(res.errors?.[0].message).toBe('Access denied! You need to be authorized to perform this action!');
    expect(res.data).toBeNull();
  });

  it('Correctly paginates invoices', async () => {
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    // Create 10 invoices
    await forEach(Array.from({ length: 10 }), async (_, index) => {
      await Invoice.create({
        amount: 1000,
        description: 'test',
        nativeId: faker.datatype.uuid(),
        userId: user.id,
        createdAt: add(new Date(), { minutes: -index }),
        updatedAt: new Date(),
        request: faker.datatype.uuid(),
        type: InvoiceTypeEnum.RECEIVE,
        expiresAt: InvoiceHelpers.createExpirationDate(),
      }).save();
    });

    const res = await gcall({
      source: paginatedInvoicesQuery,
      variableValues: {
        pagination: {
          page: 1,
          pageSize: 2,
        },
      },
      userId: user.id,
    });

    expect(res.data?.paginatedInvoices.invoices).toHaveLength(2);
    expect(res.data?.paginatedInvoices.pagination).toMatchObject({
      page: 1,
      totalDocuments: 10,
      totalPages: 5,
      nextPage: 2,
    });

    const res2 = await gcall({
      source: paginatedInvoicesQuery,
      variableValues: {
        pagination: {
          page: 2,
          pageSize: 2,
        },
      },
      userId: user.id,
    });

    expect(res2.data?.paginatedInvoices.invoices).toHaveLength(2);
    expect(res2.data?.paginatedInvoices.pagination).toMatchObject({
      page: 2,
      totalDocuments: 10,
      totalPages: 5,
      nextPage: 3,
    });
  });

  it('Correctly returns invoices by date desc', async () => {
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    // Create 10 invoices
    await forEach(Array.from({ length: 10 }), async (_, index) => {
      await Invoice.create({
        amount: 1000,
        description: 'test',
        nativeId: faker.datatype.uuid(),
        userId: user.id,
        createdAt: add(new Date(), { minutes: -index }),
        updatedAt: new Date(),
        request: faker.datatype.uuid(),
        type: InvoiceTypeEnum.RECEIVE,
        expiresAt: InvoiceHelpers.createExpirationDate(),
      }).save();
    });

    const res = await gcall({
      source: paginatedInvoicesQuery,
      variableValues: {
        pagination: {
          page: 1,
          pageSize: 10,
        },
      },
      userId: user.id,
    });

    expect(res.data?.paginatedInvoices.invoices).toHaveLength(10);

    const date1 = new Date(res.data?.paginatedInvoices.invoices[0].createdAt);
    const date2 = new Date(res.data?.paginatedInvoices.invoices[9].createdAt);

    expect(date1.getTime()).toBeGreaterThan(date2.getTime());
  });

  it('Page 0 does not exist', async () => {
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    const res = await gcall({
      source: paginatedInvoicesQuery,
      variableValues: {
        pagination: {
          page: 0,
          pageSize: 10,
        },
      },
      userId: user.id,
    });

    expect(res.data?.paginatedInvoices.errors).toMatchObject([{ code: ERROR_CODES.common.invalidPaginationParams }]);
  });

  it('Does not return expired invoices', async () => {
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    await Invoice.create({
      amount: 1000,
      description: 'test',
      nativeId: faker.datatype.uuid(),
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      request: faker.datatype.uuid(),
      type: InvoiceTypeEnum.RECEIVE,
      expiresAt: sub(new Date(), { minutes: 1 }),
    }).save();

    const res = await gcall({
      source: paginatedInvoicesQuery,
      variableValues: {
        pagination: {
          page: 1,
          pageSize: 10,
        },
      },
      userId: user.id,
    });

    expect(res.data?.paginatedInvoices.invoices).toHaveLength(0);
  });

  it('Does return expired invoices if confirmed', async () => {
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    await Invoice.create({
      amount: 1000,
      description: 'test',
      nativeId: faker.datatype.uuid(),
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      request: faker.datatype.uuid(),
      type: InvoiceTypeEnum.RECEIVE,
      expiresAt: sub(new Date(), { minutes: 1 }),
      confirmedAt: new Date(),
    }).save();

    const res = await gcall({
      source: paginatedInvoicesQuery,
      variableValues: {
        pagination: {
          page: 1,
          pageSize: 10,
        },
      },
      userId: user.id,
    });

    expect(res.data?.paginatedInvoices.invoices).toHaveLength(1);
  });
});

describe('Pay invoice', () => {
  it('Can pay an invoice', async () => {
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    // Arbitrary invoice
    const invoice = await lightning.createInvoice({ amount: 101, description: 'test', expirationDate: add(new Date(), { days: 1 }) });

    const res = await gcall({
      source: getChainAddressMutation,
      userId: user.id,
    });

    expect(res).toMatchObject({ data: { getChainAddress: { address: expect.any(String) } } });

    const address = res.data?.getChainAddress.address;

    await bitcoin.sendToAddress(address || '', 0.000_01);

    const res2 = await gcall({
      source: payInvoiceMutation,
      variableValues: {
        request: invoice.request,
      },
      userId: user.id,
    });

    expect(res2).toMatchObject({ data: { payInvoice: { success: true } } });

    const dbInvoice = await Invoice.findOne({ where: { nativeId: invoice.id } });

    expect(dbInvoice?.confirmedAt).toBeDefined();
    expect(dbInvoice?.type).toBe(InvoiceTypeEnum.SEND);
  });

  it('Balance is correct after invoice is paid', async () => {
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    // Arbitrary invoice
    const invoice = await lightning.createInvoice({ amount: 101, description: 'test', expirationDate: add(new Date(), { days: 1 }) });

    const res = await gcall({
      source: getChainAddressMutation,
      userId: user.id,
    });

    expect(res).toMatchObject({ data: { getChainAddress: { address: expect.any(String) } } });

    const address = res.data?.getChainAddress.address;

    const amountReceived = 1000;

    await bitcoin.sendToAddress(address || '', 0.000_01);

    const res2 = await gcall({
      source: payInvoiceMutation,
      variableValues: {
        request: invoice.request,
      },
      userId: user.id,
    });

    expect(res2).toMatchObject({ data: { payInvoice: { success: true } } });

    const dbInvoice = await Invoice.findOne({ where: { nativeId: invoice.id } });

    expect(dbInvoice?.confirmedAt).toBeDefined();

    const res3 = await gcall({
      source: balanceQuery,
      userId: user.id,
    });

    expect(res3.data?.balance).toBe(amountReceived - Number(dbInvoice?.amount) - PLATFORM_FEE);
  });

  it('Cannot pay invoice to self', async () => {
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    // Arbitrary invoice
    const resInvoice = await gcall({
      source: createInvoiceMutation,
      variableValues: {
        input: {
          amount: 1000,
          description: 'test',
        },
      },
      userId: user.id,
    });

    expect(resInvoice.data?.createInvoice.invoice).toBeDefined();

    const res = await gcall({
      source: payInvoiceMutation,
      variableValues: {
        request: resInvoice.data?.createInvoice.invoice.request,
      },
      userId: user.id,
    });

    expect(res).toMatchObject({ data: { payInvoice: { success: false, errors: [{ code: ERROR_CODES.invoice.payToSelf }] } } });
  });

  it('Cannot pay an invoice which is already paid', async () => {
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    const res = await gcall({
      source: getChainAddressMutation,
      userId: user.id,
    });

    expect(res).toMatchObject({ data: { getChainAddress: { address: expect.any(String) } } });

    const address = res.data?.getChainAddress.address;

    // Arbitrary invoice
    const invoice = await lightning.createInvoice({ amount: 100, description: 'test', expirationDate: add(new Date(), { days: 1 }) });

    await bitcoin.sendToAddress(address, 0.000_01);

    await gcall({
      source: payInvoiceMutation,
      variableValues: {
        request: invoice.request,
      },
      userId: user.id,
    });

    const res2 = await gcall({
      source: payInvoiceMutation,
      variableValues: {
        request: invoice.request,
      },
      userId: user.id,
    });

    expect(res2).toMatchObject({ data: { payInvoice: { success: null, errors: [{ code: ERROR_CODES.invoice.alreadyPaid }] } } });
  });

  it('Cannot pay an invoice if balance is too low', async () => {
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    // Arbitrary invoice
    const invoice = await lightning.createInvoice({ amount: 100, description: 'test', expirationDate: add(new Date(), { days: 1 }) });

    const res2 = await gcall({
      source: payInvoiceMutation,
      variableValues: {
        request: invoice.request,
      },
      userId: user.id,
    });

    expect(res2).toMatchObject({ data: { payInvoice: { success: false, errors: [{ code: ERROR_CODES.invoice.balanceTooLow }] } } });
  });

  it('Receipient balance is correct after invoice is paid', async () => {
    const user = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();
    const user2 = await User.create({ username: faker.internet.email(), password: faker.internet.password() }).save();

    const invoice = await gcall({
      source: createInvoiceMutation,
      variableValues: {
        input: {
          amount: 101,
          description: 'test',
        },
      },
      userId: user2.id,
    });

    const res = await gcall({
      source: getChainAddressMutation,
      userId: user.id,
    });

    expect(res).toMatchObject({ data: { getChainAddress: { address: expect.any(String) } } });

    const address = res.data?.getChainAddress.address;

    await bitcoin.sendToAddress(address || '', 0.000_01);

    const res2 = await gcall({
      source: payInvoiceMutation,
      variableValues: {
        request: invoice.data?.createInvoice.invoice.request,
      },
      userId: user.id,
    });

    expect(res2).toMatchObject({ data: { payInvoice: { success: true } } });

    const res3 = await gcall({
      source: balanceQuery,
      userId: user2.id,
    });

    expect(res3.data?.balance).toBe(101);
  });
});

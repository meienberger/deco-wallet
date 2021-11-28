/* eslint-disable max-lines */
import { Connection } from 'typeorm';
import validator from 'validator';
import { add, sub } from 'date-fns';
import faker from 'faker';
import { gcall } from '../../../test/gcall';
import { testConn } from '../../../test/testConn';
import User from '../../user/user.entity';
import { lightning } from '../../../services';
import InvoiceHelpers from '../invoice.helpers';
import Invoice from '../invoice.entity';
import ERROR_CODES from '../../../config/constants/error.codes';
import { MAXIMUM_INVOICE_DESCRIPTION_LENGTH } from '../../../config/constants/constants';
import { InvoiceTypeEnum } from '../invoice.types';
import { getInvoiceQuery, paginatedInvoicesQuery } from '../../../test/graphql/queries';
import { createInvoiceMutation } from '../../../test/graphql/mutations';
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
  it.todo('Can pay an invoice');

  it.todo('Cannot pay an invoice which already expired');

  it.todo('Cannot pay an invoice which is already paid');

  it.todo('Cannot pay an invoice if balance is too low');

  it.todo('Balance is correct after invoice is paid');

  it.todo('Receipient balance is correct after invoice is paid');
});

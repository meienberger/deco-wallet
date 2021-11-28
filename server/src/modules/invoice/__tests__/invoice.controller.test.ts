import { Connection } from 'typeorm';
import faker from 'faker';
import { testConn } from '../../../test/testConn';
import User from '../../user/user.entity';
import InvoiceController from '../invoice.controller';
import ERROR_CODES from '../../../config/constants/error.codes';
import { MAXIMUM_INVOICE_DESCRIPTION_LENGTH, MINIMUM_INVOICE_AMOUNT } from '../../../config/constants/constants';
import { InvoiceTypeEnum } from '../invoice.types';
import { add, sub } from 'date-fns';
import InvoiceHelpers from '../invoice.helpers';
import { forEach } from 'p-iteration';
import Invoice from '../invoice.entity';

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
    const user = await User.create({ username: faker.internet.email(), password: 'test' }).save();

    const input = { amount: 1000, description: 'test', userId: user.id };

    const { errors, invoice } = await InvoiceController.createInvoice(input);

    expect(errors).toBeUndefined();
    expect(invoice).toBeDefined();
    expect(invoice?.amount).toBe(input.amount);
    expect(invoice?.id).toBeDefined();
    expect(invoice?.type).toBe(InvoiceTypeEnum.RECEIVE);
    expect(invoice?.isCanceled).toBe(false);
    expect(invoice?.isConfirmed).toBe(false);

    const inOneHour = add(new Date(), { hours: 1 });

    // 1000ms security margin
    expect(invoice?.expiresAt.getTime()).toBeGreaterThan(inOneHour.getTime() - 1000);
    expect(invoice?.expiresAt.getTime()).toBeLessThanOrEqual(inOneHour.getTime() + 1000);
  });

  it('Cannot create an invoice if description is longer than the maximum allowed', async () => {
    const user = await User.create({ username: faker.internet.email(), password: 'test' }).save();

    const input = { amount: 1000, description: 'a'.repeat(MAXIMUM_INVOICE_DESCRIPTION_LENGTH + 1), userId: user.id };

    const { errors, invoice } = await InvoiceController.createInvoice(input);

    expect(errors).toBeDefined();
    expect(errors?.length).toBe(1);
    expect(errors?.[0].code).toBe(ERROR_CODES.invoice.descriptionTooLong);
    expect(invoice).toBeUndefined();
  });

  it('Cannot create an invoice if user does not exist', async () => {
    const input = { amount: 1000, description: 'test', userId: faker.datatype.number() };

    const { errors, invoice } = await InvoiceController.createInvoice(input);

    expect(errors).toBeDefined();
    expect(errors?.length).toBe(1);
    expect(errors?.[0].code).toBe(ERROR_CODES.auth.userNotFound);
    expect(invoice).toBeUndefined();
  });

  it('Cannot create an invoice if amount is lower than the minimum allowed', async () => {
    const user = await User.create({ username: faker.internet.email(), password: 'test' }).save();

    const input = { amount: MINIMUM_INVOICE_AMOUNT - 1, description: 'test', userId: user.id };

    const { errors, invoice } = await InvoiceController.createInvoice(input);

    expect(errors).toBeDefined();
    expect(errors?.length).toBe(1);
    expect(errors?.[0].code).toBe(ERROR_CODES.invoice.amountTooLow);
    expect(invoice).toBeUndefined();
  });

  it('Correctly sets the hashed userId in the description', async () => {
    const user = await User.create({ username: faker.internet.email(), password: 'test' }).save();

    const input = { amount: 1000, description: 'test', userId: user.id };

    const { invoice } = await InvoiceController.createInvoice(input);

    expect(invoice).toBeDefined();

    if (invoice) {
      const isOwner = await InvoiceHelpers.isInvoiceOwner(user.id, invoice);
      expect(isOwner).toBe(true);
    } else {
      expect(true).toBe(false);
    }
  });
});

describe('Get Invoice And Update', () => {
  it('Can get an invoice and updates it', async () => {
    const user = await User.create({ username: faker.internet.email(), password: 'test' }).save();

    const input = { amount: 1000, description: 'test', userId: user.id };

    const { invoice } = await InvoiceController.createInvoice(input);

    const { errors, invoice: invoice2 } = await InvoiceController.getInvoiceAndUpdate(invoice?.id || 0, user.id);

    expect(errors).toBeUndefined();
    expect(invoice2).toBeDefined();
    expect(invoice2?.amount).toBe(input.amount);

    expect(invoice2?.updatedAt.getTime()).toBeGreaterThan(invoice?.updatedAt.getTime() || Number.MAX_SAFE_INTEGER);
  });

  it('Cannot get an invoice if it does not exist', async () => {
    const user = await User.create({ username: faker.internet.email(), password: 'test' }).save();

    const { errors, invoice } = await InvoiceController.getInvoiceAndUpdate(faker.datatype.number(), user.id);

    expect(errors).toBeDefined();
    expect(errors?.length).toBe(1);
    expect(errors?.[0].code).toBe(ERROR_CODES.invoice.notFound);
    expect(invoice).toBeUndefined();
  });

  it('Cannot get an invoice if user does not own it', async () => {
    const user = await User.create({ username: faker.internet.email(), password: 'test' }).save();

    const input = { amount: 1000, description: 'test', userId: user.id };

    const { invoice } = await InvoiceController.createInvoice(input);

    const { errors, invoice: invoice2 } = await InvoiceController.getInvoiceAndUpdate(invoice?.id || 0, faker.datatype.number());

    expect(errors).toBeDefined();
    expect(errors?.length).toBe(1);
    expect(errors?.[0].code).toBe(ERROR_CODES.invoice.notFound);
    expect(invoice2).toBeUndefined();
  });
});

describe('Get user invoices', () => {
  it('Can get user invoices', async () => {
    const user = await User.create({ username: faker.internet.email(), password: 'test' }).save();

    // Create 3 invoices
    await forEach(Array.from({ length: 4 }), async () => {
      await Invoice.create({
        amount: 1000,
        description: 'test',
        nativeId: faker.datatype.uuid(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        request: faker.datatype.uuid(),
        type: InvoiceTypeEnum.RECEIVE,
        expiresAt: InvoiceHelpers.createExpirationDate(),
      }).save();
    });

    const { errors, invoices } = await InvoiceController.getUserInvoices(user.id, { page: 1, pageSize: 10 });

    expect(errors).toBeUndefined();
    expect(invoices).toBeDefined();
    expect(invoices?.length).toBe(4);
  });

  it('Correctly paginates user invoices', async () => {
    const user = await User.create({ username: faker.internet.email(), password: 'test' }).save();

    // Create 3 invoices
    await forEach(Array.from({ length: 4 }), async () => {
      await Invoice.create({
        amount: 1000,
        description: 'test',
        nativeId: faker.datatype.uuid(),
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        request: faker.datatype.uuid(),
        type: InvoiceTypeEnum.RECEIVE,
        expiresAt: InvoiceHelpers.createExpirationDate(),
      }).save();
    });

    const { errors, invoices } = await InvoiceController.getUserInvoices(user.id, { page: 1, pageSize: 2 });

    expect(errors).toBeUndefined();
    expect(invoices).toBeDefined();
    expect(invoices?.length).toBe(2);
  });

  it('Cannot get page 0', async () => {
    const user = await User.create({ username: faker.internet.email(), password: 'test' }).save();
    const { errors, invoices } = await InvoiceController.getUserInvoices(user.id, { page: 0, pageSize: 10 });

    expect(errors).toBeDefined();
    expect(errors?.length).toBe(1);
    expect(errors?.[0].code).toBe(ERROR_CODES.common.invalidPaginationParams);
    expect(invoices).toBeUndefined();
  });

  it('Cannot get with pageSize lower than 1', async () => {
    const user = await User.create({ username: faker.internet.email(), password: 'test' }).save();
    const { errors, invoices } = await InvoiceController.getUserInvoices(user.id, { page: 1, pageSize: 0 });

    expect(errors).toBeDefined();
    expect(errors?.length).toBe(1);
    expect(errors?.[0].code).toBe(ERROR_CODES.common.invalidPaginationParams);
    expect(invoices).toBeUndefined();
  });

  it('Correctly returns pagination info', async () => {
    const user = await User.create({ username: faker.internet.email(), password: 'test' }).save();

    // Create 3 invoices
    await forEach(Array.from({ length: 4 }), async () => {
      await Invoice.create({
        amount: 1000,
        description: 'test',
        nativeId: faker.datatype.uuid(),
        userId: user.id,
        request: faker.datatype.uuid(),
        type: InvoiceTypeEnum.RECEIVE,
        expiresAt: InvoiceHelpers.createExpirationDate(),
      }).save();
    });

    const { errors, invoices, pagination } = await InvoiceController.getUserInvoices(user.id, { page: 1, pageSize: 2 });

    expect(errors).toBeUndefined();
    expect(invoices).toBeDefined();
    expect(invoices?.length).toBe(2);
    expect(pagination).toBeDefined();
    expect(pagination?.page).toBe(1);
    expect(pagination?.totalDocuments).toBe(4);
    expect(pagination?.totalPages).toBe(2);
    expect(pagination?.nextPage).toBe(2);
    expect(pagination?.hasNextPage).toBeTruthy();
  });

  it('Correctly order invoices by createdAt desc', async () => {
    const user = await User.create({ username: faker.internet.email(), password: 'test' }).save();

    // Create 4 invoices
    await forEach(Array.from({ length: 4 }), async (_, index) => {
      await Invoice.create({
        amount: 1000,
        description: 'test',
        nativeId: faker.datatype.uuid(),
        userId: user.id,
        createdAt: sub(new Date(), { minutes: index }),
        updatedAt: new Date(),
        request: faker.datatype.uuid(),
        type: InvoiceTypeEnum.RECEIVE,
        expiresAt: InvoiceHelpers.createExpirationDate(),
      }).save();
    });

    const { errors, invoices } = await InvoiceController.getUserInvoices(user.id, { page: 1, pageSize: 10 });

    console.log(invoices);

    expect(errors).toBeUndefined();
    expect(invoices).toBeDefined();
    expect(invoices?.length).toBe(4);

    invoices?.forEach((invoice, index) => {
      if (invoices[index + 1]) {
        expect(invoice.createdAt.getTime() > invoices[index + 1]?.createdAt.getTime()).toBe(true);
      }
    });
  });
});

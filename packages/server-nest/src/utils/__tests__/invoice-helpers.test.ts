import argon2 from 'argon2';
import InvoiceHelpers from '../invoice-helpers';

describe('InvoiceHelpers', () => {
  test('createExpirationDate returns a date one hour in the future', () => {
    const expirationDate = InvoiceHelpers.createExpirationDate();

    expect(expirationDate).toBeInstanceOf(Date);
    expect(expirationDate.getTime()).toBeGreaterThan(Date.now());

    // expect expirationDate to be in one hour
    expect(Math.floor(expirationDate.getTime() / (1000 * 60 * 60)) - Math.floor(Date.now() / (1000 * 60 * 60))).toEqual(1);
  });

  test('isInvoiceOwner function with an invalid hash', async () => {
    const userId = 1;
    const userIdHash = await argon2.hash('2', { hashLength: 10 });

    const invoice: any = {
      description: userIdHash,
    };

    const result = await InvoiceHelpers.isInvoiceOwner(userId, invoice);

    expect(result).toBe(false);
  });

  test('isInvoiceOwner function with a valid hash', async () => {
    const userId = 1;
    const userIdHash = await argon2.hash(userId.toString(), { hashLength: 10 });

    const invoice: any = {
      description: userIdHash,
    };

    const result = await InvoiceHelpers.isInvoiceOwner(userId, invoice);

    expect(result).toBe(true);
  });
});

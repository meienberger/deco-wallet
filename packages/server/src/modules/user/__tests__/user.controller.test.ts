import faker from 'faker';
import argon2 from 'argon2';
import UserController from '../user.controller';
import User from '../user.entity';
import UserHelpers from '../user.helpers';
import { testConn } from '../../../test/testConn';
import { Connection } from 'typeorm';
import ERROR_CODES from '../../../config/constants/error.codes';

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

/**
 * Test: Login
 */
describe('Login', () => {
  it('Can login if user exists', async () => {
    const password = faker.internet.password();
    const email = faker.internet.email();

    const input = {
      username: UserHelpers.formatUsername(email),
      password: await argon2.hash(password),
    };

    await User.create(input).save();

    const { errors, user } = await UserController.login({ password, username: email });

    expect(errors).toBeUndefined();
    expect(user).toBeDefined();
    expect(user?.username).toBe(input.username);
    expect(user?.id).toBeDefined();
  });

  it('Cannot login if user does not exist', async () => {
    const password = faker.internet.password();
    const email = faker.internet.email();

    const { errors, user } = await UserController.login({ password, username: email });

    expect(errors).toBeDefined();
    expect(errors?.[0]).toMatchObject({ code: ERROR_CODES.auth.userNotFound });
    expect(user).toBeUndefined();
  });

  it('Cannot login if password is incorrect', async () => {
    const password = faker.internet.password();
    const email = faker.internet.email();
    const input = {
      username: UserHelpers.formatUsername(email),
      password: await argon2.hash(password),
    };

    await User.create(input).save();

    const { errors, user } = await UserController.login({ password: 'wrong', username: email });

    expect(errors).toBeDefined();
    expect(errors?.[0]).toMatchObject({ code: ERROR_CODES.auth.invalidPassword });
    expect(user).toBeUndefined();
  });

  it('Can login with untrimmed username', async () => {
    const password = faker.internet.password();
    const email = ` ${faker.name.firstName()}.${faker.name.lastName()}@${faker.internet.domainName()}.com `;

    const input = {
      username: UserHelpers.formatUsername(email),
      password: await argon2.hash(password),
    };

    await User.create(input).save();

    const { errors, user } = await UserController.login({ password, username: email });

    expect(errors).toBeUndefined();
    expect(user).toBeDefined();
    expect(user?.username).toBe(input.username);
    expect(user?.id).toBeDefined();
  });

  it('can login with uppercase username', async () => {
    const password = faker.internet.password();
    const email = faker.internet.email();

    const input = {
      username: UserHelpers.formatUsername(email),
      password: await argon2.hash(password),
    };

    await User.create(input).save();

    const { errors, user } = await UserController.login({ password, username: email.toUpperCase() });

    expect(errors).toBeUndefined();
    expect(user).toBeDefined();
    expect(user?.username).toBe(input.username);
    expect(user?.id).toBeDefined();
  });
});

describe('Signup', () => {
  it('Can signup if input is valid', async () => {
    const password = faker.internet.password();
    const email = faker.internet.email();

    const { errors, user } = await UserController.signup({
      username: email,
      password,
    });

    expect(errors).toBeUndefined();
    expect(user).toBeDefined();
    expect(user?.username).toBe(UserHelpers.formatUsername(email));
    expect(user?.id).toBeDefined();
  });

  it('Cannot signup if password is too short', async () => {
    const email = faker.internet.email();

    const { errors, user } = await UserController.signup({
      username: email,
      password: 'short',
    });

    expect(errors).toBeDefined();
    expect(errors?.[0]).toMatchObject({ code: ERROR_CODES.auth.passwordTooShort });
    expect(user).toBeUndefined();
  });

  it('Cannot signup with invalid email', async () => {
    const password = faker.internet.password();

    const { errors, user } = await UserController.signup({
      username: 'invalid',
      password,
    });

    expect(errors).toBeDefined();
    expect(errors?.[0]).toMatchObject({ code: ERROR_CODES.auth.emailBadlyFormatted });
    expect(user).toBeUndefined();
  });

  it('Cannot signup if username is already taken', async () => {
    const password = faker.internet.password();
    const email = faker.internet.email();

    const input = {
      username: UserHelpers.formatUsername(email),
      password: await argon2.hash(password),
    };

    await User.create(input).save();

    const { errors, user } = await UserController.signup({
      username: email,
      password,
    });

    expect(errors).toBeDefined();
    expect(errors?.[0]).toMatchObject({ code: ERROR_CODES.auth.emailAlreadyExists });
    expect(user).toBeUndefined();
  });

  it('Can signup with email containing spaces', async () => {
    const password = faker.internet.password();
    const email = ` ${faker.name.firstName()}.${faker.name.lastName()}@${faker.internet.domainName()}.com `;

    const { errors, user } = await UserController.signup({
      username: email,
      password,
    });

    expect(errors).toBeUndefined();
    expect(user).toBeDefined();
    expect(user?.username).toBe(UserHelpers.formatUsername(email));
    expect(user?.id).toBeDefined();
  });

  it('Can signup with uppercase email', async () => {
    const password = faker.internet.password();
    const email = faker.internet.email();

    const { errors, user } = await UserController.signup({
      username: email.toUpperCase(),
      password,
    });

    expect(errors).toBeUndefined();
    expect(user).toBeDefined();
    expect(user?.username).toBe(UserHelpers.formatUsername(email));
    expect(user?.id).toBeDefined();
  });
});

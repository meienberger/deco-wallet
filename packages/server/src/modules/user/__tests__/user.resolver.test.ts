/* eslint-disable max-lines */
import { Connection } from 'typeorm';
import faker from 'faker';
import { gcall } from '../../../test/gcall';
import { testConn } from '../../../test/testConn';
import UserHelpers from '../user.helpers';
import User from '../user.entity';
import argon2 from 'argon2';
import ERROR_CODES from '../../../config/constants/error.codes';
import { bitcoin } from '../../../services';

let conn: Connection | null = null;

beforeAll(async () => {
  conn = await testConn();
});

afterAll(async () => {
  if (conn) {
    await conn.close();
  }
});

const meQuery = `
  query {
    me {
      id
      username
    }
  }
`;

const registerMutation = `
mutation Register($options: UsernamePasswordInput!) {
  register(input: $options) {
    errors {
      code
    }
    user {
      id
      username
    }
  }
}
`;

const loginMutation = `
mutation($input: UsernamePasswordInput!) {
  login(input: $input) {
    errors {
      code
    }
    user {
      id
      username
    }
  }
}
`;

const balanceQuery = `
  query {
    balance
  }
`;

const getChainAddressMutation = `
mutation {
  getChainAddress {
    address
    userId
  }
}
`;

/**
 * Test: Register Mutation
 */
describe('Register', () => {
  it('can register a user', async () => {
    const input = {
      username: faker.internet.email(),
      password: faker.internet.password(),
    };

    const res = await gcall({
      source: registerMutation,
      variableValues: {
        options: input,
      },
    });

    expect(res).toMatchObject({
      data: { register: { errors: null, user: { id: expect.any(String), username: UserHelpers.formatUsername(input.username) } } },
    });

    const dbUser = await User.findOne({ where: { username: UserHelpers.formatUsername(input.username) } });

    expect(dbUser).toBeDefined();
  });

  it('cannot register a user with an existing email', async () => {
    const input = {
      username: faker.internet.email(),
      password: faker.internet.password(),
    };

    await User.create(input).save();

    const res = await gcall({
      source: registerMutation,
      variableValues: {
        options: input,
      },
    });

    expect(res).toMatchObject({
      data: { register: { errors: [{ code: ERROR_CODES.auth.emailAlreadyExists }], user: null } },
    });
  });

  it('cannot register with a falsy email', async () => {
    const input = {
      username: '',
      password: faker.internet.password(),
    };

    const res = await gcall({
      source: registerMutation,
      variableValues: {
        options: input,
      },
    });

    expect(res).toMatchObject({
      data: { register: { errors: [{ code: ERROR_CODES.auth.emailBadlyFormatted }], user: null } },
    });
  });

  it('cannot register with a short password', async () => {
    const input = {
      username: faker.internet.email(),
      password: '123',
    };

    const res = await gcall({
      source: registerMutation,
      variableValues: {
        options: input,
      },
    });

    expect(res).toMatchObject({
      data: { register: { errors: [{ code: ERROR_CODES.auth.passwordTooShort }], user: null } },
    });
  });

  it('correctly decapitalize email', async () => {
    const input = {
      username: faker.internet.email().toUpperCase(),
      password: faker.internet.password(),
    };

    const res = await gcall({
      source: registerMutation,
      variableValues: {
        options: input,
      },
    });

    expect(res).toMatchObject({
      data: { register: { errors: null, user: { id: expect.any(String), username: UserHelpers.formatUsername(input.username) } } },
    });

    const dbUser = await User.findOne({ where: { username: UserHelpers.formatUsername(input.username) } });

    expect(dbUser).toBeDefined();
  });
});

/**
 * Test: Login Mutation
 */
describe('Login', () => {
  it('can login if user exists', async () => {
    const password = faker.internet.password();
    const input = {
      username: UserHelpers.formatUsername(faker.internet.email()),
      password: await argon2.hash(password),
    };

    const user = await User.create(input).save();

    const res = await gcall({
      source: loginMutation,
      variableValues: {
        input: {
          username: input.username,
          password,
        },
      },
    });

    expect(res).toMatchObject({
      data: { login: { errors: [], user: { id: String(user.id), username: UserHelpers.formatUsername(input.username) } } },
    });
  });

  it('cannot login if user does not exist', async () => {
    const input = {
      username: faker.internet.email(),
      password: faker.internet.password(),
    };

    const res = await gcall({
      source: loginMutation,
      variableValues: {
        input,
      },
    });

    expect(res).toMatchObject({
      data: { login: { errors: [{ code: ERROR_CODES.auth.userNotFound }], user: null } },
    });
  });

  it('cannot login if password is incorrect', async () => {
    const password = faker.internet.password();
    const input = {
      username: UserHelpers.formatUsername(faker.internet.email()),
      password: await argon2.hash(password),
    };

    await User.create(input).save();

    const res = await gcall({
      source: loginMutation,
      variableValues: {
        input: {
          username: input.username,
          password: 'wrong password',
        },
      },
    });

    expect(res).toMatchObject({
      data: { login: { errors: [{ code: ERROR_CODES.auth.invalidPassword }], user: null } },
    });
  });
});

/**
 * Test: Me Query
 */
describe('Me', () => {
  it('returns null if no token is present', async () => {
    const res = await gcall({ source: meQuery });

    expect(res).toMatchObject({ data: { me: null } });
  });

  it('returns the correct user if a session id is present', async () => {
    const user = await User.create({
      username: faker.internet.email(),
      password: faker.internet.password(),
    }).save();

    const res = await gcall({
      source: meQuery,
      userId: user.id,
    });

    expect(res).toMatchObject({ data: { me: { id: String(user.id), username: user.username } } });
  });

  it('returns null if the session id is invalid', async () => {
    const res = await gcall({
      source: meQuery,
      userId: faker.datatype.number(),
    });

    expect(res).toMatchObject({ data: { me: null } });
  });

  it('returns null if the user is deleted', async () => {
    const user = await User.create({
      username: faker.internet.email(),
      password: faker.internet.password(),
    }).save();

    await User.delete({ id: user.id });

    const res = await gcall({
      source: meQuery,
      userId: user.id,
    });

    expect(res).toMatchObject({ data: { me: null } });
  });
});

/**
 * Test: Balance Query
 */
describe('Balance', () => {
  it('user has zero balance upon creation', async () => {
    const user = await User.create({
      username: faker.internet.email(),
      password: faker.internet.password(),
    }).save();

    const res = await gcall({
      source: balanceQuery,
      userId: user.id,
    });

    expect(res).toMatchObject({ data: { balance: 0 } });
  });

  it('user has correct balance after a deposit', async () => {
    const user = await User.create({
      username: faker.internet.email(),
      password: faker.internet.password(),
    }).save();

    const res = await gcall({
      source: getChainAddressMutation,
      userId: user.id,
    });

    if (res?.data?.getChainAddress) {
      const { address } = res.data.getChainAddress;

      await bitcoin.sendToAddress(address, 0.000_01);

      const balance = await gcall({
        source: balanceQuery,
        userId: user.id,
      });

      expect(balance).toMatchObject({ data: { balance: 1000 } });
    } else {
      throw new Error('No address returned');
    }
  });
});

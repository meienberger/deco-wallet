import { Connection, QueryFailedError } from 'typeorm';
import validator from 'validator';
import faker from 'faker';
import { testConn } from '../../../test/testConn';
import User from '../user.entity';

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

describe('User entity', () => {
  it('should be defined', () => {
    expect(new User()).toBeDefined();
  });

  it('Should not be able to create a user without a username', async () => {
    await expect(async () => {
      await User.create({}).save();
    }).rejects.toBeInstanceOf(QueryFailedError);

    await expect(async () => {
      await User.create({}).save();
    }).rejects.toHaveProperty('code', '23502');

    await expect(async () => {
      await User.create({}).save();
    }).rejects.toHaveProperty('column', 'username');
  });

  it('Should have an id after creation', async () => {
    const user = await User.create({
      username: faker.internet.userName(),
      password: faker.internet.password(),
    }).save();

    expect(user.id).toBeDefined();
    expect(user.id).toBeGreaterThan(0);
  });

  it('Should have a createdAt property', async () => {
    const user = await User.create({ username: faker.internet.email() }).save();

    expect(user.createdAt).toBeDefined();
    expect(validator.isBefore(user.createdAt.toISOString(), new Date().toISOString())).toBe(true);
  });

  it('Should have a updatedAt property', async () => {
    const user = await User.create({ username: faker.internet.email() }).save();

    expect(user.updatedAt).toBeDefined();
    expect(user.updatedAt).toEqual(user.createdAt);
  });

  it('Should update the updatedAt property', async () => {
    const user = await User.create({ username: faker.internet.email() }).save();

    user.username = faker.internet.email();

    const oldUpdatedAt = user.updatedAt;

    await user.save();

    expect(user.updatedAt).not.toBe(oldUpdatedAt);
    expect(oldUpdatedAt.getTime()).toBeLessThan(user.updatedAt.getTime());
    expect(user.createdAt.getTime()).toBeLessThan(user.updatedAt.getTime());
  });
});

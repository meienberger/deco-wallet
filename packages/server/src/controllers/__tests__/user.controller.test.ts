import connection from '../../test/dbConnection';
import UserController from '../user.controller';

beforeAll(async () => {
  await connection.create();
});

afterAll(async () => {
  await connection.close();
});

beforeEach(async () => {
  await connection.clear();
});

describe('UserController', () => {
  it('should return a user after signup', async () => {
    const username = 'rico@yopmail.com';

    const { user } = await UserController.signup({
      username,
      password: '123456',
    });

    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('username');
    expect(user?.username).toBe(username);
  });
});

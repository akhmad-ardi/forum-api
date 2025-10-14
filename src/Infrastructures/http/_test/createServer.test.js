require('dotenv').config();
const Jwt = require('@hapi/jwt');
const createServer = require('../createServer');

describe('HTTP server', () => {
  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({}); // fake injection

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });

  it('should verify JWT configuration correctly', async () => {
    // Arrange
    process.env.NODE_ENV = 'test';
    process.env.ACCESS_TOKEN_KEY = 'secret_key';
    process.env.ACCESS_TOKEN_AGE = '3600';

    const server = await createServer({});

    // Buat token valid
    const validToken = Jwt.token.generate(
      { id: 'user-123' },
      process.env.ACCESS_TOKEN_KEY,
    );

    // Action: request without token
    const responseWithoutToken = await server.inject({
      method: 'GET',
      url: '/test-auth',
    });

    // Action: request with token invalid
    const responseInvalidToken = await server.inject({
      method: 'GET',
      url: '/test-auth',
      headers: {
        Authorization: 'Bearer invalid_token',
      },
    });

    // Action: request with token valid
    const responseValidToken = await server.inject({
      method: 'GET',
      url: '/test-auth',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });

    // Assert
    expect(responseWithoutToken.statusCode).toEqual(401);
    expect(responseInvalidToken.statusCode).toEqual(401);

    const json = JSON.parse(responseValidToken.payload);
    expect(responseValidToken.statusCode).toEqual(200);
    expect(json.status).toBe('success');
    expect(json.userId).toBe('user-123');
  });
});

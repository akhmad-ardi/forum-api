const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201', async () => {
      // Arrange
      const server = await createServer(container);
      const userPayload = {
        username: 'test_user',
        fullname: 'Test User',
        password: '123456',
      };

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userPayload,
      });

      // login user
      const responseLoginUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: userPayload.username,
          password: userPayload.password,
        },
      });
      const responseLoginUserJson = JSON.parse(responseLoginUser.payload);
      const { accessToken } = responseLoginUserJson.data;

      // Action
      const responseAddThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'test title thread',
          body: 'test body thread',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseAddThreadJson = JSON.parse(responseAddThread.payload);
      expect(responseAddThread.statusCode).toEqual(201);
      expect(responseAddThreadJson.status).toEqual('success');
      expect(responseAddThreadJson.data.addedThread).toBeDefined();
      expect(responseAddThreadJson.data.addedThread.id).toBeDefined();
      expect(responseAddThreadJson.data.addedThread.title).toBeDefined();
      expect(responseAddThreadJson.data.addedThread.owner).toBeDefined();
    });

    it('should response 400', async () => {
      // Arrange
      const server = await createServer(container);
      const userPayload = {
        username: 'test_user',
        fullname: 'Test User',
        password: '123456',
      };

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userPayload,
      });

      // login user
      const responseLoginUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: userPayload.username,
          password: userPayload.password,
        },
      });
      const responseLoginUserJson = JSON.parse(responseLoginUser.payload);
      const { accessToken } = responseLoginUserJson.data;

      // Action
      const responseAddThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: '',
          body: '',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responnseAddThreadJson = JSON.parse(responseAddThread.payload);
      expect(responseAddThread.statusCode).toEqual(400);
      expect(responnseAddThreadJson.status).toEqual('fail');
      expect(responnseAddThreadJson.message).toBeDefined();
    });

    it('should response 401', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const responseAddThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: '',
          body: '',
        },
        headers: {
          Authorization: `Bearer ${'xxx'}`,
        },
      });

      const responnseAddThreadJson = JSON.parse(responseAddThread.payload);
      expect(responseAddThread.statusCode).toEqual(401);
      expect(responnseAddThreadJson.error).toEqual('Unauthorized');
      expect(responnseAddThreadJson.message).toEqual('Invalid token structure');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 404', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const responseGetThread = await server.inject({
        method: 'GET',
        url: '/threads/not-found-thread',
      });

      // Assert
      const responseGetThreadJson = JSON.parse(responseGetThread.payload);
      expect(responseGetThread.statusCode).toEqual(404);
      expect(responseGetThreadJson.status).toEqual('fail');
      expect(responseGetThreadJson.message).toEqual('thread not found');
    });

    it('should response 200', async () => {
      // Arrange
      const server = await createServer(container);

      const idUser = 'user-123';
      const idThread = 'thread-123';
      const idComment = 'comment-123';
      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        threadId: idThread,
        owner: idUser,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        comment_id: idComment,
        owner: idUser,
      });

      // Action
      const responseGetThread = await server.inject({
        method: 'GET',
        url: `/threads/${idThread}`,
      });

      // Assert
      const responseGetThreadJson = JSON.parse(responseGetThread.payload);
      expect(responseGetThread.statusCode).toEqual(200);
      expect(responseGetThreadJson.status).toEqual('success');
      expect(responseGetThreadJson.data).toBeDefined();
      expect(responseGetThreadJson.data.thread).toBeDefined();
      expect(responseGetThreadJson.data.thread.id).toBeDefined();
      expect(responseGetThreadJson.data.thread.title).toBeDefined();
      expect(responseGetThreadJson.data.thread.body).toBeDefined();
      expect(responseGetThreadJson.data.thread.date).toBeDefined();
      expect(responseGetThreadJson.data.thread.username).toBeDefined();
      expect(responseGetThreadJson.data.thread.comments).toBeDefined();
      expect(
        responseGetThreadJson.data.thread.comments[0].replies,
      ).toBeDefined();
    });
  });
});

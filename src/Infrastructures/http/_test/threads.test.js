const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    let accessTokenUser = '';

    beforeEach(async () => {
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
      accessTokenUser = accessToken;
    });

    it('should response 201', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const responseAddThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'test title thread',
          body: 'test body thread',
        },
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
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

      // Action
      const responseAddThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: '',
          body: '',
        },
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
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

    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200', async () => {
      // Arrange
      const server = await createServer(container);

      const idUser1 = 'user-123';
      const idUser2 = 'user-456';
      const idThread = 'thread-123';
      const idCommentLike1 = 'comment_like-123';
      const idCommentLike2 = 'comment_like-456';
      const idComment = 'comment-123';
      await UsersTableTestHelper.addUser({
        id: idUser1,
        username: 'test_user1',
      });
      await UsersTableTestHelper.addUser({
        id: idUser2,
        username: 'test_user2',
      });
      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser1 });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        threadId: idThread,
        owner: idUser1,
      });
      await CommentLikesTableTestHelper.addCommentLike({
        id: idCommentLike1,
        userId: idUser1,
        commentId: idComment,
      });
      await CommentLikesTableTestHelper.addCommentLike({
        id: idCommentLike2,
        userId: idUser2,
        commentId: idComment,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        comment_id: idComment,
        owner: idUser1,
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
      expect(
        responseGetThreadJson.data.thread.comments[0].likeCount,
      ).toBeDefined();
    });

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

    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
    });
  });
});

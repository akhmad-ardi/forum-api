const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });

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
      const responseAddThreadJson = JSON.parse(responseAddThread.payload);

      const responseAddComment = await server.inject({
        method: 'POST',
        url: `/threads/${responseAddThreadJson.data.addedThread.id}/comments`,
        payload: {
          content: 'test content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseAddCommentJson = JSON.parse(responseAddComment.payload);

      // Action
      const responseAddReply = await server.inject({
        method: 'POST',
        url: `/threads/${responseAddThreadJson.data.addedThread.id}/comments/${responseAddCommentJson.data.addedComment.id}/replies`,
        payload: {
          content: 'test content reply',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseAddReplyJson = JSON.parse(responseAddReply.payload);
      expect(responseAddReply.statusCode).toEqual(201);
      expect(responseAddReplyJson.status).toEqual('success');
      expect(responseAddReplyJson.data).toBeDefined();
      expect(responseAddReplyJson.data.addedReply).toBeDefined();
      expect(responseAddReplyJson.data.addedReply.id).toBeDefined();
      expect(responseAddReplyJson.data.addedReply.content).toBeDefined();
      expect(responseAddReplyJson.data.addedReply.owner).toBeDefined();
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
      const responseAddThreadJson = JSON.parse(responseAddThread.payload);

      const responseAddComment = await server.inject({
        method: 'POST',
        url: `/threads/${responseAddThreadJson.data.addedThread.id}/comments`,
        payload: {
          content: 'test content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseAddCommentJson = JSON.parse(responseAddComment.payload);

      // Action
      const responseAddReply = await server.inject({
        method: 'POST',
        url: `/threads/${responseAddThreadJson.data.addedThread.id}/comments/${responseAddCommentJson.data.addedComment.id}/replies`,
        payload: {
          content: '',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseAddReplyJson = JSON.parse(responseAddReply.payload);
      expect(responseAddReply.statusCode).toEqual(400);
      expect(responseAddReplyJson.status).toEqual('fail');
      expect(responseAddReplyJson.message).toBeDefined();
    });

    it('should response 404', async () => {
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
      const responseAddThreadJson = JSON.parse(responseAddThread.payload);

      const responseAddComment = await server.inject({
        method: 'POST',
        url: `/threads/${responseAddThreadJson.data.addedThread.id}/comments`,
        payload: {
          content: 'test content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseAddCommentJson = JSON.parse(responseAddComment.payload);

      // Action
      const responseAddReply = await server.inject({
        method: 'POST',
        url: `/threads/${responseAddThreadJson.data.addedThread.id}/comments/comment-not-found/replies`,
        payload: {
          content: 'test content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseAddReplyJson = JSON.parse(responseAddReply.payload);
      expect(responseAddReply.statusCode).toEqual(404);
      expect(responseAddReplyJson.status).toEqual('fail');
      expect(responseAddReplyJson.message).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    let accessTokenUser = '';
    let idThread = '';
    let idComment = '';
    let idReply = '';

    beforeEach(async () => {
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
      accessTokenUser = accessToken;

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
      const responseAddThreadJson = JSON.parse(responseAddThread.payload);
      idThread = responseAddThreadJson.data.addedThread.id;

      const responseAddComment = await server.inject({
        method: 'POST',
        url: `/threads/${idThread}/comments`,
        payload: {
          content: 'test content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseAddCommentJson = JSON.parse(responseAddComment.payload);
      idComment = responseAddCommentJson.data.addedComment.id;

      const responseAddReply = await server.inject({
        method: 'POST',
        url: `/threads/${idThread}/comments/${idComment}/replies`,
        payload: {
          content: 'test content reply',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseAddReplyJson = JSON.parse(responseAddReply.payload);
      idReply = responseAddReplyJson.data.addedReply.id;
    });

    it('should response 200', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const responseDeleteReply = await server.inject({
        method: 'DELETE',
        url: `/threads/${idThread}/comments/${idComment}/replies/${idReply}`,
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
        },
      });

      // Assert
      const responseDeleteReplyJson = JSON.parse(responseDeleteReply.payload);
      expect(responseDeleteReply.statusCode).toEqual(200);
      expect(responseDeleteReplyJson.status).toEqual('success');
    });

    it('should response 404', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const responseDeleteReply = await server.inject({
        method: 'DELETE',
        url: `/threads/${idThread}/comments/${idComment}/replies/reply-not-found`,
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
        },
      });

      // Assert
      const responseDeleteReplyJson = JSON.parse(responseDeleteReply.payload);
      expect(responseDeleteReply.statusCode).toEqual(404);
      expect(responseDeleteReplyJson.status).toEqual('fail');
      expect(responseDeleteReplyJson.message).toBeDefined();
    });

    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });
  });
});

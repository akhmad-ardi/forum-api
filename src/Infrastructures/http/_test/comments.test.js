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

  describe('when POST /threads/{threadId}/comments', () => {
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

      // Action
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

      // Assert
      const responseAddCommentJson = JSON.parse(responseAddComment.payload);
      expect(responseAddComment.statusCode).toEqual(201);
      expect(responseAddCommentJson.status).toEqual('success');
      expect(responseAddCommentJson.data).toBeDefined();
      expect(responseAddCommentJson.data.addedComment).toBeDefined();
      expect(responseAddCommentJson.data.addedComment.id).toBeDefined();
      expect(responseAddCommentJson.data.addedComment.content).toBeDefined();
      expect(responseAddCommentJson.data.addedComment.owner).toBeDefined();
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

      // Action
      const responseAddComment = await server.inject({
        method: 'POST',
        url: `/threads/${responseAddThreadJson.data.addedThread.id}/comments`,
        payload: {
          content: '',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseAddCommentJson = JSON.parse(responseAddComment.payload);
      expect(responseAddComment.statusCode).toEqual(400);
      expect(responseAddCommentJson.status).toEqual('fail');
      expect(responseAddCommentJson.message).toBeDefined();
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

      // Action
      const responseAddComment = await server.inject({
        method: 'POST',
        url: '/threads/thread-not-found-xxx/comments',
        payload: {
          content: 'test content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseAddCommentJson = JSON.parse(responseAddComment.payload);
      expect(responseAddComment.statusCode).toEqual(404);
      expect(responseAddCommentJson.status).toEqual('fail');
      expect(responseAddCommentJson.message).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });

    it('should response 200', async () => {
      // Arrange
      const server = await createServer(container);

      const userPayload = {
        username: 'test_user',
        password: '123456',
        fullname: 'Test User',
      };
      const idThread = 'thread-123';
      const idComment = 'comment-123';

      /* add user */
      const responseAddUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: userPayload,
      });
      const responseAddUserJson = JSON.parse(responseAddUser.payload);
      const idUser = responseAddUserJson.data.addedUser.id;

      /* login */
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

      await ThreadsTableTestHelper.addThread({
        id: idThread,
        owner: idUser,
      });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        threadId: idThread,
        owner: idUser,
      });

      // Action
      const responseDeletedComment = await server.inject({
        method: 'DELETE',
        url: `/threads/${idThread}/comments/${idComment}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseDeletedCommentJson = JSON.parse(
        responseDeletedComment.payload,
      );

      // Assert
      expect(responseDeletedComment.statusCode).toEqual(200);
      expect(responseDeletedCommentJson.status).toEqual('success');
    });

    it('should response 403', async () => {
      // Arrange
      const server = await createServer(container);

      const userPayloadNotOwner = {
        username: 'test_user',
        password: '123456',
        fullname: 'Test User',
      };
      const idUserOwner = 'user-321';
      const idThread = 'thread-123';
      const idComment = 'comment-123';

      /* add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userPayloadNotOwner,
      });

      /* login */
      const responseLoginUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: userPayloadNotOwner.username,
          password: userPayloadNotOwner.password,
        },
      });
      const responseLoginUserJson = JSON.parse(responseLoginUser.payload);
      const { accessToken } = responseLoginUserJson.data;

      await UsersTableTestHelper.addUser({ id: idUserOwner });
      await ThreadsTableTestHelper.addThread({
        id: idThread,
        owner: idUserOwner,
      });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        threadId: idThread,
        owner: idUserOwner,
      });

      // Action
      const responseDeletedComment = await server.inject({
        method: 'DELETE',
        url: `/threads/${idThread}/comments/${idComment}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseDeletedCommentJson = JSON.parse(
        responseDeletedComment.payload,
      );

      // Assert
      expect(responseDeletedComment.statusCode).toEqual(403);
      expect(responseDeletedCommentJson.status).toEqual('fail');
      expect(responseDeletedCommentJson.message).toEqual('forbidden');
    });

    it('should response 404 thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      const userPayload = {
        username: 'test_user',
        password: '123456',
        fullname: 'Test User',
      };
      const idThread = 'thread-123';
      const idComment = 'comment-123';

      /* add user */
      const responseAddUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: userPayload,
      });
      const responseAddUserJson = JSON.parse(responseAddUser.payload);
      const idUser = responseAddUserJson.data.addedUser.id;

      /* login */
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

      await ThreadsTableTestHelper.addThread({
        id: idThread,
        owner: idUser,
      });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        threadId: idThread,
        owner: idUser,
      });

      // Action
      const responseDeletedComment = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-not-found/comments/${idComment}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseDeletedCommentJson = JSON.parse(
        responseDeletedComment.payload,
      );

      // Assert
      expect(responseDeletedComment.statusCode).toEqual(404);
      expect(responseDeletedCommentJson.status).toEqual('fail');
      expect(responseDeletedCommentJson.message).toEqual('thread not found');
    });

    it('should response 404 comment not found', async () => {
      // Arrange
      const server = await createServer(container);

      const userPayload = {
        username: 'test_user',
        password: '123456',
        fullname: 'Test User',
      };
      const idThread = 'thread-123';
      const idComment = 'comment-123';

      /* add user */
      const responseAddUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: userPayload,
      });
      const responseAddUserJson = JSON.parse(responseAddUser.payload);
      const idUser = responseAddUserJson.data.addedUser.id;

      /* login */
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

      await ThreadsTableTestHelper.addThread({
        id: idThread,
        owner: idUser,
      });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        threadId: idThread,
        owner: idUser,
      });

      // Action
      const responseDeletedComment = await server.inject({
        method: 'DELETE',
        url: `/threads/${idThread}/comments/comment-not-found`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseDeletedCommentJson = JSON.parse(
        responseDeletedComment.payload,
      );

      // Assert
      expect(responseDeletedComment.statusCode).toEqual(404);
      expect(responseDeletedCommentJson.status).toEqual('fail');
      expect(responseDeletedCommentJson.message).toEqual('comment not found');
    });
  });
});

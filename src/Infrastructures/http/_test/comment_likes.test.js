const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');

describe('CommentLikes API', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    let accessTokenUser = '';
    let idThread = '';
    let idComment = '';

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
          Authorization: `Bearer ${accessTokenUser}`,
        },
      });
      const responseAddCommentJson = JSON.parse(responseAddComment.payload);
      idComment = responseAddCommentJson.data.addedComment.id;
    });

    it('should response 200', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${idThread}/comments/${idComment}/likes`,
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const commentLike = await CommentLikesTableTestHelper.findByCommentId(
        idComment,
      );
      expect(commentLike[0]).toBeDefined();
      expect(commentLike[0].id).toBeDefined();
      expect(commentLike[0].username).toEqual('test_user');
      expect(commentLike[0].comment_id).toBeDefined();
    });

    it('should response 200 when user unlike', async () => {
      // Arrange
      const server = await createServer(container);
      await server.inject({
        method: 'PUT',
        url: `/threads/${idThread}/comments/${idComment}/likes`,
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${idThread}/comments/${idComment}/likes`,
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const commentLike = await CommentLikesTableTestHelper.findByCommentId(
        idComment,
      );
      expect(commentLike).toHaveLength(0);
    });

    afterEach(async () => {
      await CommentLikesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });
  });
});

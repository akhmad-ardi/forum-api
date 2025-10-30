const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentLikeRepositoryPostgre = require('../CommentLikeRepositoryPostgre');

describe('CommentLikeRepositoryPostgre', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('addCommentLike function', () => {
    const idUser = 'user-123';
    const idThread = 'thread-123';
    const idComment = 'comment-123';

    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        owner: idUser,
        threadId: idThread,
      });
    });

    it('should persist add comment', async () => {
      // Arrange
      const commentLikeRepository = new CommentLikeRepositoryPostgre(
        pool,
        () => '123',
      );

      // Action
      await commentLikeRepository.addCommentLike(idUser, idComment);

      // Assert
      const commentLikes = await CommentLikesTableTestHelper.findById('comment_like-123');
      expect(commentLikes).toHaveLength(1);
      expect(commentLikes[0].id).toEqual('comment_like-123');
      expect(commentLikes[0].comment_id).toEqual(idComment);
      expect(commentLikes[0].owner).toEqual(idUser);
    });

    afterEach(async () => {
      await CommentLikesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });
  });

  describe('deleteCommentLike function', () => {
    const idUser = 'user-123';
    const idThread = 'thread-123';
    const idComment = 'comment-123';

    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        owner: idUser,
        threadId: idThread,
      });
      await CommentLikesTableTestHelper.addCommentLike({
        userId: idUser,
        commentId: idComment,
      });
    });

    it('should delete comment like', async () => {
      // Arrange
      const commentLikeRepository = new CommentLikeRepositoryPostgre(
        pool,
        () => '123',
      );

      // Action
      await commentLikeRepository.deleteCommentLike(idUser, idComment);

      // Assert
      const commentLikes = await CommentLikesTableTestHelper.findById('comment_like-123');
      expect(commentLikes).toHaveLength(0);
    });

    afterEach(async () => {
      await CommentLikesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });
  });

  describe('getCommentLike function', () => {
    const idUser = 'user-123';
    const idThread = 'thread-123';
    const idComment = 'comment-123';
    const idCommentLike = 'comment_like-123';

    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        owner: idUser,
        threadId: idThread,
      });
    });

    it('should return comment like correctly', async () => {
      // Arrange
      await CommentLikesTableTestHelper.addCommentLike({
        id: idCommentLike,
        userId: idUser,
        commentId: idComment,
      });
      const commentLikeRepositoryPostgre = new CommentLikeRepositoryPostgre(
        pool,
        () => '123',
      );

      // Action
      const commentLike = await commentLikeRepositoryPostgre.getCommentLike(
        idUser,
        idComment,
      );

      // Assert
      expect(commentLike).toStrictEqual(
        expect.objectContaining({
          id: idCommentLike,
          comment_id: idComment,
          owner: idUser,
          created_at: expect.any(Date),
        }),
      );
    });

    it('should return undefined if comment like not found', async () => {
      // Arrange
      const commentLikeRepositoryPostgre = new CommentLikeRepositoryPostgre(
        pool,
        () => '123',
      );

      // Action
      const commentLike = await commentLikeRepositoryPostgre.getCommentLike(
        idUser,
        idComment,
      );

      // Assert
      expect(commentLike).toBeUndefined();
    });

    afterEach(async () => {
      await CommentLikesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });
  });

  describe('getCommentLikeCount function', () => {
    const idUser1 = 'user-123';
    const idUser2 = 'user-456';
    const idThread = 'thread-123';
    const idComment = 'comment-123';

    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: idUser1, username: 'user1' });
      await UsersTableTestHelper.addUser({ id: idUser2, username: 'user2' });
      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser1 });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        owner: idUser1,
        threadId: idThread,
      });
      await CommentLikesTableTestHelper.addCommentLike({
        id: 'comment_like-123',
        userId: idUser1,
        commentId: idComment,
      });
      await CommentLikesTableTestHelper.addCommentLike({
        id: 'comment_like-456',
        userId: idUser2,
        commentId: idComment,
      });
    });

    it('should return the number of comment likes', async () => {
      // Arrange
      const commentLikeRepository = new CommentLikeRepositoryPostgre(
        pool,
        () => '123',
      );

      // Action
      const count = await commentLikeRepository.getCommentLikeCount(idComment);

      // Assert
      expect(count).toBe(2);
    });

    afterEach(async () => {
      await CommentLikesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });
  });
});

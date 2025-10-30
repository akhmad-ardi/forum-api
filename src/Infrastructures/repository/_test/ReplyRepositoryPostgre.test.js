const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgre = require('../ReplyRepositoryPostgre');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgre', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await RepliesTableTestHelper.cleanTable();
    });

    it('should persist add reply', async () => {
      // Arrange
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

      const replyRepositoryPostgre = new ReplyRepositoryPostgre(
        pool,
        () => '123',
      );

      // Action
      const addedReply = await replyRepositoryPostgre.addReply(
        idUser,
        idComment,
        { content: 'test content reply' },
      );

      // Assert
      const replies = await RepliesTableTestHelper.findById(addedReply.id);
      expect(replies).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
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

      const replyRepositoryPostgre = new ReplyRepositoryPostgre(
        pool,
        () => '123',
      );

      // Action
      const addedReply = await replyRepositoryPostgre.addReply(
        idUser,
        idComment,
        { content: 'test content reply' },
      );

      // Assert
      expect(addedReply).toStrictEqual({
        id: 'reply-123',
        content: 'test content reply',
        owner: 'user-123',
      });
    });
  });

  describe('getReplies function', () => {
    const idUser = 'user-123';
    const idThread = 'thread-123';
    const idComment = 'comment-123';

    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await RepliesTableTestHelper.cleanTable();
    });

    it('should return array', async () => {
      // Arrange
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
      const replyRepositoryPostgre = new ReplyRepositoryPostgre(
        pool,
        () => '123',
      );

      // Action
      const replies = await replyRepositoryPostgre.getReplies(idComment);

      // Assert
      expect(Array.isArray(replies)).toEqual(true);
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toBeDefined();
      expect(replies[0].content).toBeDefined();
      expect(replies[0].username).toBeDefined();
      expect(replies[0].date).toBeDefined();
    });

    it('should return array', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        threadId: idThread,
        owner: idUser,
      });
      const replyRepositoryPostgre = new ReplyRepositoryPostgre(
        pool,
        () => '123',
      );

      // Action
      const replies = await replyRepositoryPostgre.getReplies(idComment);

      // Assert
      expect(Array.isArray(replies)).toEqual(true);
      expect(replies).toHaveLength(0);
      expect(replies).toEqual([]);
    });
  });

  describe('softDeleteReply function', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await RepliesTableTestHelper.cleanTable();
    });

    it('should soft delete reply correctly', async () => {
      // Arrange
      const idUser = 'user-123';
      const idThread = 'thread-123';
      const idComment = 'comment-123';
      const idReply = 'reply-123';

      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        threadId: idThread,
        owner: idUser,
      });
      await RepliesTableTestHelper.addReply({
        id: idReply,
        comment_id: idComment,
        owner: idUser,
      });

      const replyRepositoryPostgre = new ReplyRepositoryPostgre(
        pool,
        () => '123',
      );

      // Action
      await replyRepositoryPostgre.softDeleteReply(idReply);

      // Assert
      const replies = await RepliesTableTestHelper.findById(idReply);
      expect(replies[0].is_delete).toEqual(true);
    });
  });

  describe('verifyReplyExist function', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await RepliesTableTestHelper.cleanTable();
    });

    it('should throw reply not found', async () => {
      // Arrange
      const replyRepositoryPostgre = new ReplyRepositoryPostgre(
        pool,
        () => '123',
      );

      // Action and Assert
      await expect(
        replyRepositoryPostgre.verifyReplyExist('reply-not-found'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should reply found', async () => {
      // Arrange
      const idUser = 'user-123';
      const idThread = 'thread-123';
      const idComment = 'comment-123';
      const idReply = 'reply-123';

      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        threadId: idThread,
        owner: idUser,
      });
      await RepliesTableTestHelper.addReply({
        id: idReply,
        comment_id: idComment,
        owner: idUser,
      });

      const replyRepositoryPostgre = new ReplyRepositoryPostgre(
        pool,
        () => '123',
      );

      // Action and Assert
      await expect(
        replyRepositoryPostgre.verifyReplyExist(idReply),
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await RepliesTableTestHelper.cleanTable();
    });

    it('should throw forbidden', async () => {
      // Arrange
      const idUserOwner = 'user-123';
      const idUserNotOwner = 'user-321';
      const idThread = 'thread-123';
      const idComment = 'comment-123';
      const idReply = 'reply-123';

      await UsersTableTestHelper.addUser({
        id: idUserOwner,
        username: 'user 1',
      });
      await UsersTableTestHelper.addUser({
        id: idUserNotOwner,
        username: 'user 2',
      });
      await ThreadsTableTestHelper.addThread({
        id: idThread,
        owner: idUserOwner,
      });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        threadId: idThread,
        owner: idUserOwner,
      });
      await RepliesTableTestHelper.addReply({
        id: idReply,
        comment_id: idComment,
        owner: idUserOwner,
      });

      const replyRepositoryPostgre = new ReplyRepositoryPostgre(
        pool,
        () => '123',
      );

      // Action and Assert
      await expect(
        replyRepositoryPostgre.verifyReplyOwner(idReply, idUserNotOwner),
      ).rejects.toThrow(AuthorizationError);
    });

    it('should not throw forbidden', async () => {
      // Arrange
      const idUserOwner = 'user-123';
      const idThread = 'thread-123';
      const idComment = 'comment-123';
      const idReply = 'reply-123';

      await UsersTableTestHelper.addUser({
        id: idUserOwner,
        username: 'user 1',
      });
      await ThreadsTableTestHelper.addThread({
        id: idThread,
        owner: idUserOwner,
      });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        threadId: idThread,
        owner: idUserOwner,
      });
      await RepliesTableTestHelper.addReply({
        id: idReply,
        comment_id: idComment,
        owner: idUserOwner,
      });

      const replyRepositoryPostgre = new ReplyRepositoryPostgre(
        pool,
        () => '123',
      );

      // Action and Assert
      await expect(
        replyRepositoryPostgre.verifyReplyOwner(idReply, idUserOwner),
      ).resolves.not.toThrow(AuthorizationError);
    });
  });
});

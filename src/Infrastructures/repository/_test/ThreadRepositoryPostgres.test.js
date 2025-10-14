const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
    });

    it('should persist add thread', async () => {
      // Arrange
      const idUser = 'user-123';
      await UsersTableTestHelper.addUser({ id: idUser });

      const addThread = new AddThread({
        title: 'test title thread',
        body: 'test body thread',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await threadRepositoryPostgres.addThread(idUser, addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const idUser = 'user-123';
      await UsersTableTestHelper.addUser({ id: idUser });

      const addThread = new AddThread({
        title: 'test title thread',
        body: 'test body thread',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(
        idUser,
        addThread,
      );

      // Assert
      expect(addedThread).toStrictEqual({
        id: 'thread-123',
        title: addThread.title,
        owner: idUser,
      });
    });
  });

  describe('getThread function', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
    });

    it('should return get thread correctly', async () => {
      // Arrange
      const idUser = 'user-123';
      const idThread = 'thread-123';

      const dataThread = {
        id: idThread,
        owner: idUser,
        title: 'test title thread',
        body: 'test body thread',
      };

      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({ ...dataThread });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'test content comment',
        owner: idUser,
        threadId: idThread,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-321',
        content: 'test content comment',
        owner: idUser,
        threadId: idThread,
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const getThread = await threadRepositoryPostgres.getThread(idThread);

      // Assert
      expect(getThread.id).toBeDefined();
      expect(getThread.title).toBeDefined();
      expect(getThread.body).toBeDefined();
      expect(getThread.date).toBeDefined();
      expect(getThread.username).toBeDefined();
      expect(getThread.comments).toBeDefined();
    });
  });

  describe('verifyThreadExist function', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
    });

    it('should thread not found error', async () => {
      // Arrange
      const idUser = 'user-123';
      await UsersTableTestHelper.addUser({ id: idUser });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action and Assert
      expect(
        threadRepositoryPostgres.verifyThreadExist('thread-xxx'),
      ).rejects.toThrow('thread not found');
    });
  });
});

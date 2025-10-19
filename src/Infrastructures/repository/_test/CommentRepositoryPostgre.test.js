const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const AddThread = require("../../../Domains/threads/entities/AddThread");
const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgre = require("../CommentRepositoryPostgre");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");

describe("CommentRepositoryPostgre", () => {
  afterAll(async () => {
    await pool.end();
  });

  describe("addComment function", () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
    });

    it("should return added comment correctly", async () => {
      // Arrange
      const idUser = "user-123";
      await UsersTableTestHelper.addUser({ id: idUser });

      const addThread = new AddThread({
        title: "test title thread",
        body: "test body thread",
      });
      const fakeIdGenerator = () => "123";

      /* create instance repositories */
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        fakeIdGenerator
      );

      const addedThread = await threadRepositoryPostgres.addThread(
        idUser,
        addThread
      );

      // Action
      const addedComment = await commentRepositoryPostgre.addComment(
        idUser,
        addedThread.id,
        { content: "test content" }
      );

      // Assert
      expect(addedComment).toEqual({
        id: "comment-123",
        content: "test content",
        owner: "user-123",
      });
    });
  });

  describe("getComments function", () => {
    const idUser = "user-123";
    const idThread = "thread-123";

    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser });
    });

    it("should return array", async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: idThread,
        owner: idUser,
      });

      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        fakeIdGenerator
      );

      // Action
      const comments = await commentRepositoryPostgre.getComments(idThread);

      // Assert
      expect(Array.isArray(comments)).toBe(true);
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toBeDefined();
      expect(comments[0].content).toBeDefined();
      expect(comments[0].username).toBeDefined();
      expect(comments[0].date).toBeDefined();
    });
    
    it("should return empty array", async () => {
      // Arrange
      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        fakeIdGenerator
      );

      // Action
      const comments = await commentRepositoryPostgre.getComments("thread-xxx");

      // Assert
      expect(Array.isArray(comments)).toBe(true);
      expect(comments).toHaveLength(0);
      expect(comments).toStrictEqual([]);
    });

    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });
  });

  describe("softDeleteComment function", () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
    });

    it("should persisnt soft delete correctly", async () => {
      // Arrange
      const idUser = "user-123";
      await UsersTableTestHelper.addUser({ id: idUser });

      const addThread = new AddThread({
        title: "test title thread",
        body: "test body thread",
      });
      const fakeIdGenerator = () => "123";

      /* create instance repositories */
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        fakeIdGenerator
      );

      const addedThread = await threadRepositoryPostgres.addThread(
        idUser,
        addThread
      );
      const addedComment = await commentRepositoryPostgre.addComment(
        idUser,
        addedThread.id,
        { content: "test content" }
      );

      // Action
      await commentRepositoryPostgre.softDeleteComment(addedComment.id);

      // Assert
      const comment = await CommentsTableTestHelper.findById(addedComment.id);
      expect(comment.is_delete).toEqual(true);
    });
  });

  describe("verifyCommentExist function", () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
    });

    it("should throw comment not found", async () => {
      // Arrange
      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        fakeIdGenerator
      );

      // Action and Assert
      await expect(
        commentRepositoryPostgre.verifyCommentExist("xxx")
      ).rejects.toThrow("comment not found");
    });

    it("should comment found", async () => {
      // Arrange
      const idUser = "user-123";
      await UsersTableTestHelper.addUser({ id: idUser });

      const idThread = "thread-123";
      await ThreadsTableTestHelper.addThread({
        id: idThread,
        owner: idUser,
        title: "test title thread",
        body: "test body thread",
      });

      const idComment = "comment-123";
      await CommentsTableTestHelper.addComment({
        id: idComment,
        owner: idUser,
        content: "test content",
        threadId: idThread,
      });

      const fakeIdGenerator = () => "123";

      /* create instance repository */
      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        fakeIdGenerator
      );

      // Action and Assert
      await expect(
        commentRepositoryPostgre.verifyCommentExist(idComment)
      ).resolves.not.toThrow("comment not found");
    });
  });

  describe("verifyCommentOwner function", () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
    });

    it("should throw fobidden", async () => {
      // Arrange
      const idUser = "user-123";
      await UsersTableTestHelper.addUser({ id: idUser });

      const idThread = "thread-123";
      await ThreadsTableTestHelper.addThread({
        id: idThread,
        owner: idUser,
        title: "test title thread",
        body: "test body thread",
      });

      const idComment = "comment-123";
      await CommentsTableTestHelper.addComment({
        id: idComment,
        owner: idUser,
        content: "test content",
        threadId: idThread,
      });

      const fakeIdGenerator = () => "123";

      /* create instance repository */
      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        fakeIdGenerator
      );

      // Action and Assert
      await expect(
        commentRepositoryPostgre.verifyCommentOwner("comment-xxx", "user-xxx")
      ).rejects.toThrow("forbidden");
    });

    it("should not forbidden", async () => {
      // Arrange
      const idUser = "user-123";
      await UsersTableTestHelper.addUser({ id: idUser });

      const idThread = "thread-123";
      await ThreadsTableTestHelper.addThread({
        id: idThread,
        owner: idUser,
        title: "test title thread",
        body: "test body thread",
      });

      const idComment = "comment-123";
      await CommentsTableTestHelper.addComment({
        id: idComment,
        owner: idUser,
        content: "test content",
        threadId: idThread,
      });

      const fakeIdGenerator = () => "123";

      /* create instance repository */
      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        fakeIdGenerator
      );

      // Action and Assert
      await expect(
        commentRepositoryPostgre.verifyCommentOwner(idComment, idUser)
      ).resolves.not.toThrow("forbidden");
    });
  });
});

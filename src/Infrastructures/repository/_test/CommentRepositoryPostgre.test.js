const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgre = require("../CommentRepositoryPostgre");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("CommentRepositoryPostgre", () => {
  afterAll(async () => {
    await pool.end();
  });

  describe("addComment function", () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
    });

    it("should persist add comment", async () => {
      // Arrange
      const idUser = "user-123";
      const idThread = "thread-123";

      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser });

      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        () => "123"
      );

      // Action
      const addedComment = await commentRepositoryPostgre.addComment(
        idUser,
        idThread,
        { content: "test comment content" }
      );

      // Assert
      const comments = await CommentsTableTestHelper.findById(addedComment.id);
      expect(comments).toHaveLength(1);
    });

    it("should return added comment correctly", async () => {
      // Arrange
      const idUser = "user-123";
      const idThread = "thread-123";

      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser });

      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        () => "123"
      );

      // Action
      const addedComment = await commentRepositoryPostgre.addComment(
        idUser,
        idThread,
        { content: "test content" }
      );

      // Assert
      expect(addedComment).toStrictEqual({
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
      await UsersTableTestHelper.addUser({
        id: idUser,
        username: "test_username",
      });
      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser });
    });

    it("should return array of comments with correct values", async () => {
      // Arrange
      const dataComment = {
        id: "comment-123",
        threadId: idThread,
        owner: idUser,
        content: "test content comment",
        date: new Date().toISOString(),
      };
      await CommentsTableTestHelper.addComment(dataComment);
      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        () => "123"
      );

      // Action
      const comments = await commentRepositoryPostgre.getComments(idThread);

      // Assert
      expect(Array.isArray(comments)).toBe(true);
      expect(comments).toHaveLength(1);
      expect(comments).toStrictEqual([
        {
          id: "comment-123",
          content: "test content comment",
          username: "test_username",
          date: new Date(dataComment.date),
          is_delete: false,
        },
      ]);
    });

    it("should return empty array", async () => {
      // Arrang
      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        () => "123"
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

    it("should persist soft delete correctly", async () => {
      // Arrange
      const idUser = "user-123";
      const idThread = "thread-123";
      const idComment = "comment-123";

      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        threadId: idThread,
        owner: idUser,
      });

      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        () => "123"
      );

      // Action
      await commentRepositoryPostgre.softDeleteComment(idComment);

      // Assert
      const comments = await CommentsTableTestHelper.findById(idComment);
      expect(comments[0].is_delete).toEqual(true);
    });
  });

  describe("verifyCommentExist function", () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
    });

    it("should throw comment not found", async () => {
      // Arrang
      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        () => "123"
      );

      // Action and Assert
      await expect(
        commentRepositoryPostgre.verifyCommentExist("xxx")
      ).rejects.toThrow(NotFoundError);
    });

    it("should comment found", async () => {
      // Arrange
      const idUser = "user-123";
      const idThread = "thread-123";
      const idComment = "comment-123";

      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({
        id: idThread,
        owner: idUser,
        title: "test title thread",
        body: "test body thread",
      });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        owner: idUser,
        content: "test content",
        threadId: idThread,
      });

      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        () => "123"
      );

      // Action and Assert
      await expect(
        commentRepositoryPostgre.verifyCommentExist(idComment)
      ).resolves.not.toThrow(NotFoundError);
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
      const idThread = "thread-123";
      const idComment = "comment-123";

      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({
        id: idThread,
        owner: idUser,
        title: "test title thread",
        body: "test body thread",
      });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        owner: idUser,
        content: "test content",
        threadId: idThread,
      });

      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        () => "123"
      );

      // Action and Assert
      await expect(
        commentRepositoryPostgre.verifyCommentOwner("comment-xxx", "user-xxx")
      ).rejects.toThrow("forbidden");
    });

    it("should not forbidden", async () => {
      // Arrange
      const idUser = "user-123";
      const idThread = "thread-123";
      const idComment = "comment-123";

      await UsersTableTestHelper.addUser({ id: idUser });
      await ThreadsTableTestHelper.addThread({
        id: idThread,
        owner: idUser,
        title: "test title thread",
        body: "test body thread",
      });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        owner: idUser,
        content: "test content",
        threadId: idThread,
      });

      const commentRepositoryPostgre = new CommentRepositoryPostgre(
        pool,
        () => "123"
      );

      // Action and Assert
      await expect(
        commentRepositoryPostgre.verifyCommentOwner(idComment, idUser)
      ).resolves.not.toThrow(AuthorizationError);
    });
  });
});

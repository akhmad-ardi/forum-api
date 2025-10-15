const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const pool = require("../../database/postgres/pool");

describe("/threads endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  describe("when POST /threads/{threadId}/comments/{commentId}/replies", () => {
    let accessTokenUser = "";
    let idUser = "";
    let idThread = "thread-123";
    let idComment = "comment-123";

    beforeEach(async () => {
      const server = await createServer(container);
      const userPayload = {
        username: "test_user",
        fullname: "Test User",
        password: "123456",
      };

      // add user
      const responseAddUser = await server.inject({
        method: "POST",
        url: "/users",
        payload: userPayload,
      });
      const responseAddUserJson = JSON.parse(responseAddUser.payload);
      idUser = responseAddUserJson.data.addedUser.id;

      // login user
      const responseLoginUser = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: userPayload.username,
          password: userPayload.password,
        },
      });
      const responseLoginUserJson = JSON.parse(responseLoginUser.payload);
      const { accessToken } = responseLoginUserJson.data;
      accessTokenUser = accessToken;

      await ThreadsTableTestHelper.addThread({ id: idThread, owner: idUser });
      await CommentsTableTestHelper.addComment({
        id: idComment,
        threadId: idThread,
        owner: idUser,
      });
    });

    it("should response 201", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const responseAddReply = await server.inject({
        method: "POST",
        url: `/threads/${idThread}/comments/${idComment}/replies`,
        payload: {
          content: "test content reply",
        },
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
        },
      });

      // Assert
      const responseAddReplyJson = JSON.parse(responseAddReply.payload);
      expect(responseAddReply.statusCode).toEqual(201);
      expect(responseAddReplyJson.status).toEqual("success");
      expect(responseAddReplyJson.data).toBeDefined();
      expect(responseAddReplyJson.data.addedReply).toBeDefined();
      expect(responseAddReplyJson.data.addedReply.id).toBeDefined();
      expect(responseAddReplyJson.data.addedReply.content).toBeDefined();
      expect(responseAddReplyJson.data.addedReply.owner).toBeDefined();
    });

    it("should response 400", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const responseAddReply = await server.inject({
        method: "POST",
        url: `/threads/${idThread}/comments/${idComment}/replies`,
        payload: {
          content: "",
        },
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
        },
      });

      // Assert
      const responseAddReplyJson = JSON.parse(responseAddReply.payload);
      expect(responseAddReply.statusCode).toEqual(400);
      expect(responseAddReplyJson.status).toEqual("fail");
      expect(responseAddReplyJson.message).toBeDefined();
    });

    it("should response 404 thread not found", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const responseAddReply = await server.inject({
        method: "POST",
        url: `/threads/thread-not-found/comments/${idComment}/replies`,
        payload: {
          content: "test content",
        },
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
        },
      });

      // Assert
      const responseAddReplyJson = JSON.parse(responseAddReply.payload);
      expect(responseAddReply.statusCode).toEqual(404);
      expect(responseAddReplyJson.status).toEqual("fail");
      expect(responseAddReplyJson.message).toBeDefined();
      expect(responseAddReplyJson.message).toEqual("thread not found");
    });

    it("should response 404 comment not found", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const responseAddReply = await server.inject({
        method: "POST",
        url: `/threads/${idThread}/comments/comment-not-found/replies`,
        payload: {
          content: "test content",
        },
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
        },
      });

      // Assert
      const responseAddReplyJson = JSON.parse(responseAddReply.payload);
      expect(responseAddReply.statusCode).toEqual(404);
      expect(responseAddReplyJson.status).toEqual("fail");
      expect(responseAddReplyJson.message).toBeDefined();
      expect(responseAddReplyJson.message).toEqual("comment not found");
    });

    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}", () => {
    let accessTokenUser = "";
    let idUser = "";
    let idThread = "thread-123";
    let idComment = "comment-123";
    let idReply = "reply-123";

    beforeEach(async () => {
      // Arrange
      const server = await createServer(container);
      const userPayload = {
        username: "test_user",
        fullname: "Test User",
        password: "123456",
      };

      // add user
      const responseAddUser = await server.inject({
        method: "POST",
        url: "/users",
        payload: userPayload,
      });
      const responseAddUserJson = JSON.parse(responseAddUser.payload);
      idUser = responseAddUserJson.data.addedUser.id;

      // login user
      const responseLoginUser = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: userPayload.username,
          password: userPayload.password,
        },
      });
      const responseLoginUserJson = JSON.parse(responseLoginUser.payload);
      const { accessToken } = responseLoginUserJson.data;
      accessTokenUser = accessToken;

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
    });

    it("should response 200", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const responseDeleteReply = await server.inject({
        method: "DELETE",
        url: `/threads/${idThread}/comments/${idComment}/replies/${idReply}`,
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
        },
      });

      // Assert
      const responseDeleteReplyJson = JSON.parse(responseDeleteReply.payload);
      expect(responseDeleteReply.statusCode).toEqual(200);
      expect(responseDeleteReplyJson.status).toEqual("success");
    });

    it("should response 404 thread not found", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const responseDeleteReply = await server.inject({
        method: "DELETE",
        url: `/threads/thread-not-found/comments/${idComment}/replies/${idReply}`,
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
        },
      });

      // Assert
      const responseDeleteReplyJson = JSON.parse(responseDeleteReply.payload);
      expect(responseDeleteReply.statusCode).toEqual(404);
      expect(responseDeleteReplyJson.status).toEqual("fail");
      expect(responseDeleteReplyJson.message).toBeDefined();
      expect(responseDeleteReplyJson.message).toEqual("thread not found");
    });

    it("should response 404 comment not found", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const responseDeleteReply = await server.inject({
        method: "DELETE",
        url: `/threads/${idThread}/comments/comment-not-found/replies/${idReply}`,
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
        },
      });

      // Assert
      const responseDeleteReplyJson = JSON.parse(responseDeleteReply.payload);
      expect(responseDeleteReply.statusCode).toEqual(404);
      expect(responseDeleteReplyJson.status).toEqual("fail");
      expect(responseDeleteReplyJson.message).toBeDefined();
      expect(responseDeleteReplyJson.message).toEqual("comment not found");
    });

    it("should response 404 reply not found", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const responseDeleteReply = await server.inject({
        method: "DELETE",
        url: `/threads/${idThread}/comments/${idComment}/replies/reply-not-found`,
        headers: {
          Authorization: `Bearer ${accessTokenUser}`,
        },
      });

      // Assert
      const responseDeleteReplyJson = JSON.parse(responseDeleteReply.payload);
      expect(responseDeleteReply.statusCode).toEqual(404);
      expect(responseDeleteReplyJson.status).toEqual("fail");
      expect(responseDeleteReplyJson.message).toBeDefined();
      expect(responseDeleteReplyJson.message).toEqual("reply not found");
    });

    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });
  });
});

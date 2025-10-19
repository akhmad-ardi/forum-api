const GetDetailThreadUseCase = require("../GetDetailThreadUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");

describe("GetDetailThreadUseCase", () => {
  it("should orchestrate the get detail thread action correctly", async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockThreadRepository.getThread = jest.fn().mockResolvedValue({
      id: "thread-123",
      title: "thread title",
      body: "thread body",
      date: "2025-10-05",
      username: "dicoding",
    });

    mockCommentRepository.getComments = jest.fn().mockResolvedValue([
      {
        id: "comment-123",
        username: "userA",
        date: "2025-10-05",
        content: "a comment",
      },
    ]);

    mockReplyRepository.getReplies = jest.fn().mockResolvedValue([
      {
        id: "reply-123",
        content: "a reply",
        date: "2025-10-05",
        username: "userB",
        comment_id: "comment-123",
      },
    ]);

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await getDetailThreadUseCase.execute("thread-123");

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(
      "thread-123"
    );
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledTimes(1);

    expect(mockThreadRepository.getThread).toHaveBeenCalledWith("thread-123");
    expect(mockThreadRepository.getThread).toHaveBeenCalledTimes(1);

    expect(mockCommentRepository.getComments).toHaveBeenCalledWith(
      "thread-123"
    );
    expect(mockCommentRepository.getComments).toHaveBeenCalledTimes(1);

    expect(mockReplyRepository.getReplies).toHaveBeenCalledWith("comment-123");
    expect(mockReplyRepository.getReplies).toHaveBeenCalledTimes(1);
  });
});

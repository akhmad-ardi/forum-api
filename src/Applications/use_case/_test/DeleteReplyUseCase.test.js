const DeleteReplyUseCase = require("../DeleteReplyUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");

describe("DeleteReplyUseCase", () => {
  it("should orchestrate the delete reply action correctly", async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** Mocking only behavior (tanpa expected value) */
    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExist = jest.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyExist = jest.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyOwner = jest.fn().mockResolvedValue();
    mockReplyRepository.softDeleteReply = jest.fn().mockResolvedValue();

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(
      "thread-123",
      "comment-123",
      "reply-123",
      "user-123"
    );

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(
      "thread-123"
    );
    expect(mockCommentRepository.verifyCommentExist).toHaveBeenCalledWith(
      "comment-123"
    );
    expect(mockReplyRepository.verifyReplyExist).toHaveBeenCalledWith(
      "reply-123"
    );
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(
      "reply-123",
      "user-123"
    );
    expect(mockReplyRepository.softDeleteReply).toHaveBeenCalledWith(
      "reply-123"
    );

    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExist).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.verifyReplyExist).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.softDeleteReply).toHaveBeenCalledTimes(1);
  });
});

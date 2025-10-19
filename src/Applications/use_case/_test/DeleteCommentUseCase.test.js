const DeleteCommentUseCase = require("../DeleteCommentUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

describe("DeleteCommentUseCase", () => {
  it("should orchestrate the soft delete comment action correctly", async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExist = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentOwner = jest.fn().mockResolvedValue();
    mockCommentRepository.softDeleteComment = jest.fn().mockResolvedValue();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute("thread-123", "comment-123", "user-123");

    // Assert (verify orchestration, not values)
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(
      "thread-123"
    );
    expect(mockCommentRepository.verifyCommentExist).toHaveBeenCalledWith(
      "comment-123"
    );
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(
      "comment-123",
      "user-123"
    );
    expect(mockCommentRepository.softDeleteComment).toHaveBeenCalledWith(
      "comment-123"
    );

    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExist).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.softDeleteComment).toHaveBeenCalledTimes(1);
  });
});

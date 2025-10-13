const DeleteCommentUseCase = require("../DeleteCommentUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

describe("DeleteCommentUseCase", () => {
  it("should orchestrate the soft delete comment action correctly", async () => {
    // Arrange
    /** create dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

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

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith("thread-123");
    expect(mockThreadRepository.verifyThreadExist).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith(
      "comment-123"
    );
    expect(mockCommentRepository.verifyCommentExist).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      "comment-123",
      "user-123"
    );
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledTimes(1);
    expect(mockCommentRepository.softDeleteComment).toBeCalledWith(
      "comment-123"
    );
    expect(mockCommentRepository.softDeleteComment).toBeCalledTimes(1);
  });
});

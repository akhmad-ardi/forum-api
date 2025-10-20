const AddCommentUseCase = require("../AddCommentUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");

describe("AddCommentUseCase", () => {
  it("should orchestrate the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "test content",
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.addComment = jest.fn().mockResolvedValue({
      id: "comment-123",
      content: useCasePayload.content,
      owner: "user-123",
    });

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const result = await addCommentUseCase.execute(
      "user-123",
      "thread-123",
      useCasePayload
    );

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(
      "thread-123"
    );
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(
      "user-123",
      "thread-123",
      useCasePayload
    );
    expect(result).toStrictEqual(
      expect.objectContaining({
        id: expect.any(String),
        content: useCasePayload.content,
        owner: "user-123",
      })
    );
  });
});

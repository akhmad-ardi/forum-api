const AddCommentUseCase = require('../AddCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'test content',
    };

    const mockAddedComment = {
      id: 'comment-123',
      thread_id: 'thread-123',
      content: useCasePayload.content,
    };

    /** create dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // mocking needed function
    mockCommentRepository.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));
    mockThreadRepository.verifyThreadExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve('thread-123'));
    /** create instance use case */
    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(
      'user-123',
      'thread-123',
      useCasePayload,
    );

    // Assert
    expect(mockCommentRepository.addComment).toBeCalledWith(
      'user-123',
      'thread-123',
      useCasePayload,
    );
    expect(addedComment).toStrictEqual(mockAddedComment);
  });
});

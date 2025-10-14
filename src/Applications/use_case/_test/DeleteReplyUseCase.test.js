const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    /** create dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve('thread-123'));
    mockCommentRepository.verifyCommentExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve('comment-123'));
    mockReplyRepository.verifyReplyExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve('reply-123'));
    mockReplyRepository.verifyReplyOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve('reply-123', 'user-123'));
    mockReplyRepository.softDeleteReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve('reply-123'));

    /** create instance use case */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(
      'thread-123',
      'comment-123',
      'reply-123',
      'user-123',
    );

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
    expect(mockThreadRepository.verifyThreadExist).toBeCalledTimes(1);

    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith(
      'comment-123',
    );
    expect(mockCommentRepository.verifyCommentExist).toBeCalledTimes(1);

    expect(mockReplyRepository.verifyReplyExist).toBeCalledWith('reply-123');
    expect(mockReplyRepository.verifyReplyExist).toBeCalledTimes(1);

    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(
      'reply-123',
      'user-123',
    );
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledTimes(1);

    expect(mockReplyRepository.softDeleteReply).toBeCalledWith('reply-123');
    expect(mockReplyRepository.softDeleteReply).toBeCalledTimes(1);
  });
});

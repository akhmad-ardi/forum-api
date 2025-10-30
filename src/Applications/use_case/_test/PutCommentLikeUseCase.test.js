const PutCommentLikeUseCase = require('../PutCommentLikeUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentLikeRepository = require('../../../Domains/comment_likes/CommentLikeRepository');

describe('PutCommentLikeUseCase', () => {
  it('should add comment like when like does not exist', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExist = jest.fn().mockResolvedValue();
    mockCommentLikeRepository.getCommentLike = jest
      .fn()
      .mockResolvedValue(null);
    mockCommentLikeRepository.addCommentLike = jest.fn().mockResolvedValue();
    mockCommentLikeRepository.deleteCommentLike = jest.fn();

    const putCommentLikeUseCase = new PutCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    await putCommentLikeUseCase.execute(
      'user-123',
      'thread-123',
      'comment-456',
    );

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(
      'thread-123',
    );
    expect(mockCommentRepository.verifyCommentExist).toHaveBeenCalledWith(
      'comment-456',
    );
    expect(mockCommentLikeRepository.getCommentLike).toHaveBeenCalledWith(
      'user-123',
      'comment-456',
    );
    expect(mockCommentLikeRepository.addCommentLike).toHaveBeenCalledWith(
      'user-123',
      'comment-456',
    );
    expect(mockCommentLikeRepository.deleteCommentLike).not.toHaveBeenCalled();
  });

  it('should delete comment like when like already exists', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExist = jest.fn().mockResolvedValue();
    mockCommentLikeRepository.getCommentLike = jest.fn().mockResolvedValue({
      id: 'like-123',
      user_id: 'user-123',
      comment_id: 'comment-456',
    });
    mockCommentLikeRepository.deleteCommentLike = jest.fn().mockResolvedValue();
    mockCommentLikeRepository.addCommentLike = jest.fn();

    const putCommentLikeUseCase = new PutCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    await putCommentLikeUseCase.execute(
      'user-123',
      'thread-123',
      'comment-456',
    );

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(
      'thread-123',
    );
    expect(mockCommentRepository.verifyCommentExist).toHaveBeenCalledWith(
      'comment-456',
    );
    expect(mockCommentLikeRepository.getCommentLike).toHaveBeenCalledWith(
      'user-123',
      'comment-456',
    );
    expect(mockCommentLikeRepository.deleteCommentLike).toHaveBeenCalledWith(
      'user-123',
      'comment-456',
    );
    expect(mockCommentLikeRepository.addCommentLike).not.toHaveBeenCalled();
  });
});

const AddReplyUseCase = require('../AddReplyUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'test content reply',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExist = jest.fn().mockResolvedValue();
    mockReplyRepository.addReply = jest.fn().mockResolvedValue({
      id: 'reply-123',
      comment_id: 'comment-123',
      content: 'test content reply',
      owner: 'user-123',
    });

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await addReplyUseCase.execute(
      'user-123',
      'thread-123',
      'comment-123',
      useCasePayload,
    );

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(
      'thread-123',
    );
    expect(mockCommentRepository.verifyCommentExist).toHaveBeenCalledWith(
      'comment-123',
    );
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      'user-123',
      'comment-123',
      useCasePayload,
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        comment_id: 'comment-123',
        content: useCasePayload.content,
        owner: 'user-123',
      }),
    );
  });
});

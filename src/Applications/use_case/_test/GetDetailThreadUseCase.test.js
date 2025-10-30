const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentLikeRepository = require('../../../Domains/comment_likes/CommentLikeRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrate the get detail thread action correctly and cover all branches', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockThreadRepository.getThread = jest.fn().mockResolvedValue({
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      date: '2025-10-05',
      username: 'dicoding',
    });

    mockCommentRepository.getComments = jest.fn().mockResolvedValue([
      {
        id: 'comment-123',
        username: 'userA',
        date: '2025-10-05',
        content: 'a comment',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'userB',
        date: '2025-10-06',
        content: 'deleted comment',
        is_delete: true,
      },
    ]);

    mockCommentLikeRepository.getCommentLikeCount = jest
      .fn()
      .mockImplementation(async (commentId) => {
        if (commentId === 'comment-123') return 2;
        if (commentId === 'comment-456') return 0;
        return 0;
      });

    mockReplyRepository.getReplies = jest
      .fn()
      .mockImplementation(async (commentId) => {
        if (commentId === 'comment-123') {
          return [
            {
              id: 'reply-123',
              content: 'a reply',
              date: '2025-10-05',
              username: 'userC',
              is_delete: false,
            },
          ];
        }
        return [
          {
            id: 'reply-456',
            content: 'deleted reply',
            date: '2025-10-06',
            username: 'userD',
            is_delete: true,
          },
        ];
      });

    const useCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await useCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(
      'thread-123',
    );
    expect(mockThreadRepository.getThread).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getComments).toHaveBeenCalledWith(
      'thread-123',
    );
    expect(mockReplyRepository.getReplies).toHaveBeenCalledWith('comment-123');
    expect(mockReplyRepository.getReplies).toHaveBeenCalledWith('comment-456');
    expect(mockCommentLikeRepository.getCommentLikeCount).toHaveBeenCalledWith(
      'comment-123',
    );
    expect(mockCommentLikeRepository.getCommentLikeCount).toHaveBeenCalledWith(
      'comment-456',
    );

    expect(result).toStrictEqual({
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      date: '2025-10-05',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'userA',
          date: '2025-10-05',
          content: 'a comment',
          likeCount: 2,
          replies: [
            {
              id: 'reply-123',
              date: '2025-10-05',
              username: 'userC',
              content: 'a reply',
            },
          ],
        },
        {
          id: 'comment-456',
          username: 'userB',
          date: '2025-10-06',
          content: '**komentar telah dihapus**',
          likeCount: 0,
          replies: [
            {
              id: 'reply-456',
              date: '2025-10-06',
              username: 'userD',
              content: '**balasan telah dihapus**',
            },
          ],
        },
      ],
    });
  });
});

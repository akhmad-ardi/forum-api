const CommentLikeRepository = require('../CommentLikeRepository');

describe('CommentLikeRepository', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const commentLikeRepository = new CommentLikeRepository();

    // Act & Assert
    await expect(
      commentLikeRepository.addCommentLike('', ''),
    ).rejects.toThrowError('COMMENT_LIKES_RESPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(
      commentLikeRepository.deleteCommentLike('', ''),
    ).rejects.toThrowError('COMMENT_LIKES_RESPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(
      commentLikeRepository.getCommentLike('', ''),
    ).rejects.toThrowError('COMMENT_LIKES_RESPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(
      commentLikeRepository.getCommentLikeCount(''),
    ).rejects.toThrowError('COMMENT_LIKES_RESPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});

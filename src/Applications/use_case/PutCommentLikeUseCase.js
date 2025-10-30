class PutCommentLikeUseCase {
  constructor({ threadRepository, commentRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentLikesRepository = commentLikeRepository;
  }

  async execute(owner, threadId, commentId) {
    await this._threadRepository.verifyThreadExist(threadId);
    await this._commentRepository.verifyCommentExist(commentId);

    const commentLike = await this._commentLikesRepository.getCommentLike(
      owner,
      commentId,
    );
    if (commentLike) {
      await this._commentLikesRepository.deleteCommentLike(owner, commentId);
      return;
    }

    await this._commentLikesRepository.addCommentLike(owner, commentId);
  }
}

module.exports = PutCommentLikeUseCase;

class GetDetaillThreadUseCase {
  constructor({
    threadRepository, commentRepository, commentLikeRepository, replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExist(threadId);

    const thread = await this._threadRepository.getThread(threadId);
    const commentsData = await this._commentRepository.getComments(thread.id);

    const comments = await Promise.all(
      commentsData.map(async (comment) => {
        const replies = await this._replyRepository.getReplies(comment.id);
        const likeCount = await this._commentLikeRepository.getCommentLikeCount(comment.id);

        const content = comment.is_delete
          ? '**komentar telah dihapus**'
          : comment.content;
        const repliesMap = replies.map((reply) => {
          const replyContent = reply.is_delete
            ? '**balasan telah dihapus**'
            : reply.content;
          return {
            id: reply.id,
            date: reply.date,
            username: reply.username,
            content: replyContent,
          };
        });

        return {
          id: comment.id,
          date: comment.date,
          username: comment.username,
          replies: repliesMap,
          likeCount,
          content,
        };
      }),
    );

    return { ...thread, comments };
  }
}

module.exports = GetDetaillThreadUseCase;

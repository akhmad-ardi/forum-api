const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(owner, threadId, useCasePayload) {
    const addComment = new AddComment(useCasePayload);
    await this._threadRepository.verifyThreadExist(threadId);

    const addedComment = await this._commentRepository.addComment(
      owner,
      threadId,
      addComment,
    );

    return addedComment;
  }
}

module.exports = AddCommentUseCase;

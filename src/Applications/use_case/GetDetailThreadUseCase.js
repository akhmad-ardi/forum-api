class GetDetaillThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExist(threadId);
    return await this._threadRepository.getThread(threadId);
  }
}

module.exports = GetDetaillThreadUseCase;

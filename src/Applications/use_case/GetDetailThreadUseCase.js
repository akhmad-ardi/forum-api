class GetDetaillThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExist(threadId);

    const getThread = await this._threadRepository.getThread(threadId);

    return getThread;
  }
}

module.exports = GetDetaillThreadUseCase;

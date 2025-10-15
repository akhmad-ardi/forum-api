const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(owner, useCasePayload) {
    const addThread = new AddThread(useCasePayload);

    const addedThread = await this._threadRepository.addThread(owner, addThread);

    return addedThread;
  }
}

module.exports = AddThreadUseCase;

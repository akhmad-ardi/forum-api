const GetDetaillThreadUseCase = require('../GetDetailThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('GetDetaillThreadUseCase', () => {
  it('should orchestrate the get detail thread action correctly', async () => {
    // Arrange
    /** create dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockThreadRepository.getThread = jest.fn().mockResolvedValue();

    const getDetailThreadUseCase = new GetDetaillThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    await getDetailThreadUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
    expect(mockThreadRepository.verifyThreadExist).toBeCalledTimes(1);
    expect(mockThreadRepository.getThread).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThread).toBeCalledTimes(1);
  });
});

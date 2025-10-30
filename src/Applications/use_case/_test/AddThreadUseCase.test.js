const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrate add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'test title thread',
      body: 'test body thread',
    };

    const mockThreadRepository = new ThreadRepository();

    // Mock hanya untuk memastikan fungsi berjalan, bukan hasilnya
    mockThreadRepository.addThread = jest.fn().mockResolvedValue({
      id: 'thread-123',
      title: 'test title thread',
      owner: 'user-123',
    });

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const result = await addThreadUseCase.execute('user-123', useCasePayload);

    // Assert
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      'user-123',
      useCasePayload,
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: useCasePayload.title,
        owner: 'user-123',
      }),
    );
  });
});

const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddThreadUseCase = require("../AddThreadUseCase");

describe("AddThreadUseCase", () => {
  it("should orchestrating the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "test title thread",
      body: "test body thread",
    };

    const mockAddedThread = {
      id: "thread-123",
      title: useCasePayload.title,
      owner: "user-123",
    };

    /** create dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    // mocking needed function
    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    /** create instance use case */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(
      "user-123",
      useCasePayload
    );

    // Assert
    expect(mockThreadRepository.addThread).toBeCalledWith(
      "user-123",
      useCasePayload
    );
    expect(addedThread).toStrictEqual(mockAddedThread);
  });
});

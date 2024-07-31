const ReactionRepositoryMock = {
  react: jest.fn(),
  unreact: jest.fn(),
  likesByPost: jest.fn(),
  retweetsByPost: jest.fn(),
  likesByUser: jest.fn(),
  retweetsByUser: jest.fn(),
  getReaction: jest.fn()
}

export default ReactionRepositoryMock

export const UserRepositoryMock = {
  create: jest.fn(),
  delete: jest.fn(),
  getRecommendedUsersPaginated: jest.fn(),
  getById: jest.fn(),
  getUsersByUsername: jest.fn(),
  updateUser: jest.fn(),
  getByEmailOrUsername: jest.fn(),
  getProfilePicture: jest.fn(),
  uploadProfilePicture: jest.fn(),
  userHasProfilePicture: jest.fn()
}

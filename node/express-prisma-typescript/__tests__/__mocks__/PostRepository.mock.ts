const PostRepositoryMock = {
  create: jest.fn(),
  getAllByDatePaginated: jest.fn(),
  delete: jest.fn(),
  getById: jest.fn(),
  getByAuthorId: jest.fn()
}

export default PostRepositoryMock

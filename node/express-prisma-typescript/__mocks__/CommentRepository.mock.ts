const CommentRepositoryMock = {
  comment: jest.fn(),
  deleteComment: jest.fn(),
  getComment: jest.fn(),
  getPostComments: jest.fn(),
  getPostCommentsPaginated: jest.fn(),
  getCommentsByUserId: jest.fn(),
};

export default CommentRepositoryMock;

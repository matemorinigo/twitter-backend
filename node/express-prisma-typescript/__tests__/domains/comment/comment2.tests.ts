import { CommentServiceImpl } from '@domains/comment/service/comment.service.impl'
import { CommentRepositoryImpl } from '@domains/comment/repository/comment.repository.impl'
import { PostRepositoryImpl } from '@domains/post/repository'
import { db, NotFoundException, ValidatePostVisibility } from '@utils';
import { FollowRepositoryImpl } from '@domains/follower/repository/follow.repository.impl';
import { UserRepositoryImpl } from '@domains/user/repository';

jest.mock('@domains/comment/repository/comment.repository.impl')
jest.mock('@utils')


const PostRepositoryMock = PostRepositoryImpl as jest.MockedClass<typeof PostRepositoryImpl>
const CommentRepositoryMock = CommentRepositoryImpl as jest.MockedClass<typeof CommentRepositoryImpl>
const UserRepositoryMock = UserRepositoryImpl as jest.MockedClass<typeof UserRepositoryImpl>
const FollowRepositoryMock = FollowRepositoryImpl as jest.MockedClass<typeof FollowRepositoryImpl>
const ValidatePostVisibilityMock = ValidatePostVisibility as jest.MockedClass<typeof ValidatePostVisibility>

const postRepository = new PostRepositoryMock(db)
const commentRepository = new CommentRepositoryMock(db)
const userRepository = new UserRepositoryMock(db)
const followRepository = new FollowRepositoryMock(db)
const validatePostVisibility = new ValidatePostVisibilityMock(followRepository, userRepository, postRepository)

describe('comment', () => {
  describe('post comment service', () => {
    describe('user can\'t see post', () => {
      it('should throw a NotFoundException', async () => {
        ValidatePostVisibilityMock.mockResolvedValue(false)

        await expect(commentService.comment('941b2c01-e8b6-484f-a2e9-e9fd3720f35d', 'e16acd20-30c5-458a-a637-85b92d470a37', {
          content: 'comment'
        })).rejects.toThrow(NotFoundException)
      })
    })

    describe('user can see post', () => {
      it('should create a new comment, and return it', async () => {
        validateUserCanSeePostMocked.mockResolvedValueOnce(true)

        commentMocked.mockResolvedValueOnce({
          id: 'e16exc20-31r5-458a-a637-85b92d470b13',
          postId: '941b2c01-e8b6-484f-a2e9-e9fd3720f35d',
          authorId: 'e16acd20-30c5-458a-a637-85b92d470a37',
          content: 'comment',
          images: [],
          createdAt: new Date()
        })

        await expect(commentService.comment('941b2c01-e8b6-484f-a2e9-e9fd3720f35d', 'e16acd20-30c5-458a-a637-85b92d470a37', {
          content: 'comment'
        })).resolves.toStrictEqual({
          id: 'e16exc20-31r5-458a-a637-85b92d470b13',
          postId: '941b2c01-e8b6-484f-a2e9-e9fd3720f35d',
          authorId: 'e16acd20-30c5-458a-a637-85b92d470a37',
          content: 'comment',
          images: [],
          createdAt: new Date()
        })
      })
    })
  })
})

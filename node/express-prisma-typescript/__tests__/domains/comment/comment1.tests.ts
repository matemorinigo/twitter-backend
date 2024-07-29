import { CommentServiceImpl } from '@domains/comment/service/comment.service.impl'
import { CommentRepositoryImpl } from '@domains/comment/repository/comment.repository.impl'
import { PostRepositoryImpl } from '@domains/post/repository'
import { db, NotFoundException, UnauthorizedException, ValidatePostVisibility } from '@utils';
import { FollowRepositoryImpl } from '@domains/follower/repository/follow.repository.impl';
import { UserRepositoryImpl } from '@domains/user/repository';

const postRepository = new PostRepositoryImpl(db)
const commentRepository = new CommentRepositoryImpl(db)
const validatePostVisibility = new ValidatePostVisibility(new FollowRepositoryImpl(db), new UserRepositoryImpl(db), postRepository)

const commentService = new CommentServiceImpl(commentRepository, postRepository, validatePostVisibility)

const validateUserCanSeePostMocked = jest.spyOn(validatePostVisibility, 'validateUserCanSeePost')
const validateUserCanSeePostsMocked = jest.spyOn(validatePostVisibility, 'validateUserCanSeePosts')
const commentMocked = jest.spyOn(commentRepository, 'comment')
const getCommentMocked = jest.spyOn(commentRepository, 'getComment')
const deleteCommentMocked = jest.spyOn(commentRepository, 'deleteComment')


// this date is because it doesn't matter the value, but if I call
// new Date() on every "comment" could lead to non expected results
const date = new Date()

describe('comment', () => {
  describe('post comment service', () => {
    describe('user can\'t see post', () => {
      it('should throw a NotFoundException', async () => {

        validateUserCanSeePostMocked.mockResolvedValueOnce(false)

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
          createdAt: date
        })

        await expect(commentService.comment('941b2c01-e8b6-484f-a2e9-e9fd3720f35d', 'e16acd20-30c5-458a-a637-85b92d470a37', {
          content: 'comment'
        })).resolves.toStrictEqual({
          id: 'e16exc20-31r5-458a-a637-85b92d470b13',
          postId: '941b2c01-e8b6-484f-a2e9-e9fd3720f35d',
          authorId: 'e16acd20-30c5-458a-a637-85b92d470a37',
          content: 'comment',
          images: [],
          createdAt: date
        })
      })
    })
  })

  describe('delete comment service', () => {
    describe('post doesn\'t exists', () => {
      it('should throw a NotFoundException', async () => {
        getCommentMocked.mockResolvedValueOnce(null)

        await expect(commentService.deleteComment('941b2c01-e8b6-484f-a2e9-e9fd3720f35d', 'e16acd20-30c5-458a-a637-85b92d470a37', 'e16acd20-30c5-458a-a637-85b92d470a37')).rejects.toThrow(NotFoundException)
      })
    })

    describe('user isn\'t comment author', () => {
      it('should throw an UnauthorizedException', async () => {
        getCommentMocked.mockResolvedValueOnce({
          id: 'e16exc20-31r5-458a-a637-85b92d470b13',
          postId: '941b2c01-e8b6-484f-a2e9-e9fd3720f35d',
          authorId: 'e16acd20-30c5-458a-a637-85b92d470a37',
          content: 'comment',
          images: [],
          createdAt: date
        })

        await expect(commentService.deleteComment('941b2c01-e8b6-484f-a2e9-e9fd3720f35d', 'e16acd20-30c5-458a-a637-85b92d470a37', '941b2c01-e8b6-484f-a2e9-e9fd3720f35d')).rejects.toThrow(UnauthorizedException)
      })
    })

    describe('Post exists and user is comment author', () => {
      it('should delete the comment and return it', async () => {
        getCommentMocked.mockResolvedValueOnce({
          id: 'e16exc20-31r5-458a-a637-85b92d470b13',
          postId: '941b2c01-e8b6-484f-a2e9-e9fd3720f35d',
          authorId: 'e16acd20-30c5-458a-a637-85b92d470a37',
          content: 'comment',
          images: [],
          createdAt: date
        })

        deleteCommentMocked.mockResolvedValueOnce({
          id: 'e16exc20-31r5-458a-a637-85b92d470b13',
          postId: '941b2c01-e8b6-484f-a2e9-e9fd3720f35d',
          authorId: 'e16acd20-30c5-458a-a637-85b92d470a37',
          content: 'comment',
          images: [],
          createdAt: date
        })

        await expect(commentService.deleteComment('941b2c01-e8b6-484f-a2e9-e9fd3720f35d', 'e16acd20-30c5-458a-a637-85b92d470a37', 'e16acd20-30c5-458a-a637-85b92d470a37')).resolves.toStrictEqual({
          id: 'e16exc20-31r5-458a-a637-85b92d470b13',
          postId: '941b2c01-e8b6-484f-a2e9-e9fd3720f35d',
          authorId: 'e16acd20-30c5-458a-a637-85b92d470a37',
          content: 'comment',
          images: [],
          createdAt: date
        })
      })
    })
  })
})

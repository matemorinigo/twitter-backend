import { CommentServiceImpl } from '@domains/comment/service/comment.service.impl'
import { ForbiddenException, NotFoundException } from '@utils'

import ValidatePostVisibilityMock from '../../../__mocks__/ValidatePostVisibility.mock'
import PostRepositoryMock from '../../../__mocks__/PostRepository.mock'
import CommentRepositoryMock from '../../../__mocks__/CommentRepository.mock'
import { UserRepositoryMock } from '../../../__mocks__/UserRepository.mock'
import ReactionRepositoryMock from '../../../__mocks__/ReactionRepository.mock'

const commentService = new CommentServiceImpl(CommentRepositoryMock, PostRepositoryMock, UserRepositoryMock, ReactionRepositoryMock, ValidatePostVisibilityMock)

const commentToExtendedPostDTOMocked = jest.spyOn(commentService, 'commentToExtendedPostDTO')

// this date is because it doesn't matter the value, but if I call
// new Date() on every "comment" could lead to non expected results
const date = new Date()

describe('comment', () => {
  describe('post comment service', () => {
    describe('user can\'t see post', () => {
      it('should throw a NotFoundException', async () => {

        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(false)

        await expect(commentService.comment('1', '1', {
          content: 'comment'
        })).rejects.toThrow(NotFoundException)
      })
    })

    describe('user can see post', () => {
      it('should create a new comment, and return it', async () => {
        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(true)

        CommentRepositoryMock.comment.mockResolvedValueOnce({
          id: '1',
          postId: '1',
          authorId: '1',
          content: 'comment',
          images: [],
          createdAt: date
        })

        await expect(commentService.comment('1', '1', {
          content: 'comment'
        })).resolves.toStrictEqual({
          id: '1',
          postId: '1',
          authorId: '1',
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
        CommentRepositoryMock.getComment.mockResolvedValueOnce(null)

        await expect(commentService.deleteComment('2', '1', '1')).rejects.toThrow(NotFoundException)
      })
    })

    describe('user isn\'t comment author', () => {
      it('should throw an UnauthorizedException', async () => {
        CommentRepositoryMock.getComment.mockResolvedValueOnce({
          id: '1',
          postId: '1',
          authorId: '99',
          content: 'comment',
          images: [],
          createdAt: date
        })

        await expect(commentService.deleteComment('1', '1', '1')).rejects.toThrow(ForbiddenException)
      })
    })

    describe('Post exists and user is comment author', () => {
      it('should delete the comment and return it', async () => {
        CommentRepositoryMock.getComment.mockResolvedValueOnce({
          id: '1',
          postId: '1',
          authorId: '1',
          content: 'comment',
          images: [],
          createdAt: date
        })

        CommentRepositoryMock.deleteComment.mockResolvedValueOnce({
          id: '1',
          postId: '1',
          authorId: '1',
          content: 'comment',
          images: [],
          createdAt: date
        })

        await expect(commentService.deleteComment('1', '1', '1')).resolves.toStrictEqual({
          id: '1',
          postId: '1',
          authorId: '1',
          content: 'comment',
          images: [],
          createdAt: date
        })
      })
    })
  })

  describe('get comment service', () => {
    describe('user can\'t see comment', () => {
      it('should throw a NotFoundException', async () => {
        CommentRepositoryMock.getComment.mockResolvedValueOnce({
          id: '1',
          postId: '1',
          authorId: '3',
          content: 'comment',
          images: [],
          createdAt: date
        })
        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(false)


        await expect(commentService.getComment('1', '1', '1')).rejects.toThrow(NotFoundException)
      })
    })

    describe('comment doesn\'t exists', () => {
      it('should throw a NotFoundException', async () => {
        CommentRepositoryMock.getComment.mockResolvedValueOnce(null)

        await expect(commentService.getComment('1', '1', '1')).rejects.toThrow(NotFoundException)
      })
    })

    describe('user can see comment', () => {
      it('should throw a NotFoundException', async () => {
        CommentRepositoryMock.getComment.mockResolvedValueOnce({
          id: '1',
          postId: '1',
          authorId: '1',
          content: 'comment',
          images: [],
          createdAt: date
        })
        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(true)

        commentToExtendedPostDTOMocked.mockResolvedValueOnce({
          id: '1',
          authorId: '1',
          content: 'comment',
          images: [],
          createdAt: date,
          isComment: true,
          author: {
            id: '1',
            name: 'name',
            username: 'username',
            profilePicture: null
          },
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0
        })

        await expect(commentService.getComment('1', '1', '1')).resolves.toStrictEqual({
          id: '1',
          authorId: '1',
          content: 'comment',
          images: [],
          createdAt: date,
          isComment: true,
          author: {
            id: '1',
            name: 'name',
            username: 'username',
            profilePicture: null
          },
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0
        })
      })
    })
  })

  describe('get post comments service', () => {
    describe('post have no comments', () => {
      it('should return an empty array of comments', async () => {
        CommentRepositoryMock.getPostComments.mockResolvedValueOnce([])
        await expect(commentService.getPostComments('1', '1')).resolves.toStrictEqual([])
      })
    })

    describe('post have comments but one of them is not visible', () => {
      it('should return an array with 1 comments', async () => {
        CommentRepositoryMock.getPostComments.mockResolvedValueOnce([{
          id: '1',
          postId: '1',
          authorId: '1',
          content: 'comment',
          images: [],
          createdAt: date
        },
        {
          id: '2',
          postId: '1',
          authorId: '3',
          content: 'comment',
          images: [],
          createdAt: date
        }])

        ValidatePostVisibilityMock.validateUserCanSeePost.mockReturnValueOnce(true).mockReturnValueOnce(false)

        commentToExtendedPostDTOMocked.mockResolvedValueOnce({
          id: '1',
          authorId: '1',
          content: 'comment',
          images: [],
          createdAt: date,
          isComment: true,
          author: {
            id: '1',
            name: 'name',
            username: 'username',
            profilePicture: null
          },
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0
        })

        await expect(commentService.getPostComments('1', '1')).resolves.toStrictEqual([{
          id: '1',
          authorId: '1',
          content: 'comment',
          images: [],
          createdAt: date,
          isComment: true,
          author: {
            id: '1',
            name: 'name',
            username: 'username',
            profilePicture: null
          },
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0
        }])
      })
    })
  })
})

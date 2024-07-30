import { PostServiceImpl } from '@domains/post/service'
import PostRepositoryMock from '@test/__mocks__/PostRepository.mock'
import { FollowRepositoryMock } from '@test/__mocks__/FollowRepository.mock'
import { UserRepositoryMock } from '@test/__mocks__/UserRepository.mock'
import ValidatePostVisibilityMock from '@test/__mocks__/ValidatePostVisibility.mock'
import ReactionRepositoryMock from '@test/__mocks__/ReactionRepository.mock'
import CommentRepositoryMock from '@test/__mocks__/CommentRepository.mock'
import { ForbiddenException, NotFoundException } from '@utils';

const postService = new PostServiceImpl(PostRepositoryMock, FollowRepositoryMock, UserRepositoryMock, ValidatePostVisibilityMock, ReactionRepositoryMock, CommentRepositoryMock)

const postToExtendedPostDTO = jest.spyOn(postService, 'postToExtendedPostDTO')

const date = new Date()

describe('post', () => {
  describe('delete delete post service', () => {
    describe('post doesn\'t exists', () => {
      it('should throw a NotFoundException', async () => {

        PostRepositoryMock.getById.mockResolvedValueOnce(null)

        await expect(postService.deletePost('1', '1')).rejects.toThrow(NotFoundException)
      })
    })

    describe('user isn\'t post author', () => {
      it('should throw a ForbiddenException', async () => {

        PostRepositoryMock.getById.mockResolvedValueOnce({
          id: '1',
          authorId: '2',
          content: '1',
          images: [],
          createdAt: date,
          isComment: false
        })

        await expect(postService.deletePost('1', '1')).rejects.toThrow(ForbiddenException)
      })
    })

    describe('user is post author', () => {
      it('should delete the post and return it', async () => {

        PostRepositoryMock.getById.mockResolvedValueOnce({
          id: '1',
          authorId: '1',
          content: '1',
          images: [],
          createdAt: date,
          isComment: false
        })

        PostRepositoryMock.delete.mockResolvedValueOnce({
          id: '1',
          authorId: '1',
          content: '1',
          images: [],
          createdAt: date,
          isComment: false
        })

        await expect(postService.deletePost('1', '1')).resolves.toStrictEqual({
          id: '1',
          authorId: '1',
          content: '1',
          images: [],
          createdAt: date,
          isComment: false
        })
      })
    })
  })

  describe('get post service', () => {
    describe('user can\'t see post', () => {
      it('should throw a NotFoundException', async () => {
        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(false)

        await expect(postService.getPost('1', '1')).rejects.toThrow(NotFoundException)
      })
    })

    describe('post doesn\'t exists', () => {
      it('should throw a NotFoundException', async () => {
        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(true)

        PostRepositoryMock.getById.mockResolvedValueOnce(null)

        await expect(postService.getPost('1', '1')).rejects.toThrow(NotFoundException)
      })
    })

    describe('post exists and is visible for the user', () => {
      it('should throw a NotFoundException', async () => {
        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(true)

        PostRepositoryMock.getById.mockResolvedValueOnce({
          id: '1',
          authorId: '1',
          content: 'post',
          images: [],
          createdAt: date,
          isComment: false
        })

        postToExtendedPostDTO.mockResolvedValueOnce({
          id: '1',
          authorId: '1',
          content: 'post',
          images: [],
          createdAt: date,
          isComment: false,
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

        await expect(postService.getPost('1', '1')).resolves.toStrictEqual({
          id: '1',
          authorId: '1',
          content: 'post',
          images: [],
          createdAt: date,
          isComment: false,
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
})

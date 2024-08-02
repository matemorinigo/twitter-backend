import { PostServiceImpl } from '@domains/post/service'
import PostRepositoryMock from '../../../__mocks__/PostRepository.mock'
import { FollowRepositoryMock } from '../../../__mocks__/FollowRepository.mock'
import { UserRepositoryMock } from '../../../__mocks__/UserRepository.mock'
import ValidatePostVisibilityMock from '../../../__mocks__/ValidatePostVisibility.mock'
import ReactionRepositoryMock from '../../../__mocks__/ReactionRepository.mock'
import CommentRepositoryMock from '../../../__mocks__/CommentRepository.mock'
import { ConflictException, ForbiddenException, NotFoundException } from '@utils';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import commentRepositoryMock from '../../../__mocks__/CommentRepository.mock';
import reactionRepositoryMock from '../../../__mocks__/ReactionRepository.mock';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn()
}))

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

  describe('get latest post service', () => {
    describe('latest posts contains posts that the user should not view', () => {
      it('should filter that posts', async () => {
        PostRepositoryMock.getAllByDatePaginated.mockResolvedValueOnce([
          {
            id: '1',
            authorId: '1',
            content: 'post',
            images: [],
            createdAt: date,
            isComment: false
          },
          {
            id: '2',
            authorId: '2',
            content: 'post',
            images: [],
            createdAt: date,
            isComment: false
          },
          {
            id: '3',
            authorId: '2',
            content: 'post',
            images: [],
            createdAt: date,
            isComment: true
          },
          {
            id: '4',
            authorId: '3',
            content: 'post',
            images: [],
            createdAt: date,
            isComment: false
          }
        ])

        ValidatePostVisibilityMock.validateUserCanSeePosts.mockResolvedValueOnce(true).mockResolvedValueOnce(false).mockReturnValueOnce(false).mockResolvedValueOnce(true)

        postToExtendedPostDTO.mockResolvedValueOnce(
          {
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
          }
        ).mockResolvedValueOnce(
          {
            id: '4',
            authorId: '3',
            content: 'post',
            images: [],
            createdAt: date,
            isComment: false,
            author: {
              id: '3',
              name: 'name',
              username: 'username',
              profilePicture: null
            },
            qtyComments: 0,
            qtyLikes: 0,
            qtyRetweets: 0
          }
        )

        await expect(postService.getLatestPosts('1',{})).resolves.toStrictEqual(
          [
            {
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
            },
            {
              id: '4',
              authorId: '3',
              content: 'post',
              images: [],
              createdAt: date,
              isComment: false,
              author: {
                id: '3',
                name: 'name',
                username: 'username',
                profilePicture: null
              },
              qtyComments: 0,
              qtyLikes: 0,
              qtyRetweets: 0
            }
          ]
        )
      })
    })
  })

  describe('get posts by author service', () => {
    describe('user should not see author posts', () => {
      it('should throw a NotFoundException', async () => {
        ValidatePostVisibilityMock.validateUserCanSeePosts.mockResolvedValueOnce(false)
        await expect(postService.getPostsByAuthor('1','2')).rejects.toThrow(NotFoundException)
      })
    })

    describe('user can see author posts', () => {
      it('should return an array of ExtendedPostDTO', async () => {
        ValidatePostVisibilityMock.validateUserCanSeePosts.mockResolvedValueOnce(true)

        PostRepositoryMock.getByAuthorId.mockResolvedValueOnce([
          {
            id: '1',
            authorId: '1',
            content: 'post',
            images: [],
            createdAt: date,
            isComment: false
          },
          {
            id: '2',
            authorId: '1',
            content: 'post',
            images: [],
            createdAt: date,
            isComment: false
          }
        ])

        postToExtendedPostDTO.mockResolvedValueOnce(
          {
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
          }
        ).mockResolvedValueOnce(
          {
            id: '2',
            authorId: '1',
            content: 'post',
            images: [],
            createdAt: date,
            isComment: false,
            author: {
              id: '3',
              name: 'name',
              username: 'username',
              profilePicture: null
            },
            qtyComments: 0,
            qtyLikes: 0,
            qtyRetweets: 0
          }
        )

        await expect(postService.getPostsByAuthor('2', '1')).resolves.toStrictEqual([
          {
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
          },
          {
            id: '2',
            authorId: '1',
            content: 'post',
            images: [],
            createdAt: date,
            isComment: false,
            author: {
              id: '3',
              name: 'name',
              username: 'username',
              profilePicture: null
            },
            qtyComments: 0,
            qtyLikes: 0,
            qtyRetweets: 0
          }
        ])
      })
    })
  })

  describe('get upload media presigned url', () =>{
    describe('data file type is not allowed', () => {
      it('should throw a ConflictException', async () => {
        await expect(postService.getUploadMediaPresignedUrl({ fileType: 'gif' })).rejects.toThrow(ConflictException)
      })
    })

    describe('data file type is allowed', () => {
      it('should return an object with the putObjectUrl and the objectUrl', async () => {

        (getSignedUrl as jest.Mock).mockResolvedValueOnce('url')

        await expect(postService.getUploadMediaPresignedUrl({ fileType: 'jpg' })).resolves.toEqual(expect.objectContaining({
          putObjectUrl: expect.any(String),
          objectUrl: expect.any(String)
        }))
      })
    })
  })

  describe('PostDTO to ExtendedPostDTO', () => {
    it('should return an ExtendedPostDTO', async () => {
      UserRepositoryMock.getById.mockResolvedValueOnce({
        id: '1',
        name: 'name',
        createdAt: date,
        publicAccount: true,
        email: 'example@example.com',
        username: 'username'
      })

      UserRepositoryMock.getProfilePicture.mockResolvedValueOnce(null)

      commentRepositoryMock.getPostComments.mockResolvedValueOnce([])
      reactionRepositoryMock.likesByPost.mockResolvedValueOnce([])
      reactionRepositoryMock.retweetsByPost.mockResolvedValueOnce([])

      await expect(postService.postToExtendedPostDTO({
        id: '1',
        authorId: '1',
        content: 'post',
        images: [],
        createdAt: date,
        isComment: false
      })).resolves.toEqual({
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

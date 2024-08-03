import { UserServiceImpl } from '@domains/user/service';
import { UserRepositoryMock } from '../../../__mocks__/UserRepository.mock';
import { FollowRepositoryMock } from '../../../__mocks__/FollowRepository.mock';
import { NotFoundException } from '@utils';
import ValidatePostVisibilityMock from '../../../__mocks__/ValidatePostVisibility.mock';

const userService = new UserServiceImpl(UserRepositoryMock, FollowRepositoryMock, ValidatePostVisibilityMock)

const isFollowedByAFollowMock = jest.spyOn(userService, 'isFollowedByAFollow')

const date = new Date()

describe('user', () => {
  describe('get user service', () => {
    describe('user doesn\'t exists', () => {
      it('should throw a NotFoundException', async () => {
        UserRepositoryMock.getById.mockResolvedValueOnce(null)

        await expect(userService.getUser('1', '2')).rejects.toThrow(NotFoundException)
      })
    })

    describe('searched user is not visible to user ', () => {
      it('should throw a NotFoundException', async () => {
        UserRepositoryMock.getById.mockResolvedValueOnce({
          id: '1',
          name: 'name',
          createdAt: date,
          publicAccount: true,
          email: 'email@email.com',
          username: 'username'
        })

        ValidatePostVisibilityMock.validateUserCanSeePosts.mockResolvedValueOnce(false)

        await expect(userService.getUser('2', '1')).rejects.toThrow(NotFoundException)
      })
    })

    describe('searched user is visible to user ', () => {
      it('should return an UserViewDTO', async () => {
        UserRepositoryMock.getById.mockResolvedValueOnce({
          id: '1',
          name: 'name',
          createdAt: date,
          publicAccount: true,
          email: 'email@email.com',
          username: 'username'
        })

        ValidatePostVisibilityMock.validateUserCanSeePosts.mockResolvedValueOnce(true)

        UserRepositoryMock.getProfilePicture.mockResolvedValueOnce(null)

        await expect(userService.getUser('2', '1')).resolves.toEqual(
          {
            id: '1',
            name: 'name',
            username: 'username',
            profilePicture: null
          }
        )
      })
    })
  })

  describe('get user recommendations service', () => {
    describe('user doesn\'t follows anyone', () => {
      it('should show users with public account', async () => {
        FollowRepositoryMock.getFollowing.mockResolvedValueOnce([])

        UserRepositoryMock.getRecommendedUsersPaginated.mockResolvedValueOnce([
          {
            id: '1',
            name: 'name',
            createdAt: date,
            publicAccount: true,
            email: 'email@email.com',
            username: 'username'
          },
          {
            id: '2',
            name: 'name',
            createdAt: date,
            publicAccount: false,
            email: 'email@email.com',
            username: 'username'
          },
          {
            id: '3',
            name: 'name',
            createdAt: date,
            publicAccount: true,
            email: 'email@email.com',
            username: 'username'
          },
          {
            id: '4',
            name: 'name',
            createdAt: date,
            publicAccount: false,
            email: 'email@email.com',
            username: 'username'
          }
        ])

        UserRepositoryMock.getProfilePicture.mockResolvedValue(null)

        await expect(userService.getUserRecommendations('6',{})).resolves.toEqual(
          [
            {
              id: '1',
              name: 'name',
              username: 'username',
              profilePicture: null
            },
            {
              id: '3',
              name: 'name',
              username: 'username',
              profilePicture: null
            }
          ]
        )
      })
    })

    describe('user follows at least 1 user', () => {
      it('should show users with public account or followed by a follow', async () => {
        FollowRepositoryMock.getFollowing.mockResolvedValueOnce([{
          followerId: '6',
          followedId: '4',
          createdAt: date
        }])

        isFollowedByAFollowMock.mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValueOnce(true)

        UserRepositoryMock.getRecommendedUsersPaginated.mockResolvedValueOnce([
          {
            id: '1',
            name: 'name',
            createdAt: date,
            publicAccount: true,
            email: 'email@email.com',
            username: 'username'
          },
          {
            id: '2',
            name: 'name',
            createdAt: date,
            publicAccount: false,
            email: 'email@email.com',
            username: 'username'
          },
          {
            id: '3',
            name: 'name',
            createdAt: date,
            publicAccount: true,
            email: 'email@email.com',
            username: 'username'
          },
          {
            id: '4',
            name: 'name',
            createdAt: date,
            publicAccount: false,
            email: 'email@email.com',
            username: 'username'
          }
        ])

        UserRepositoryMock.getProfilePicture.mockResolvedValue(null)

        await expect(userService.getUserRecommendations('6',{})).resolves.toEqual(
          [
            {
              id: '1',
              name: 'name',
              username: 'username',
              profilePicture: null
            },
            {
              id: '3',
              name: 'name',
              username: 'username',
              profilePicture: null
            },
            {
              id: '4',
              name: 'name',
              username: 'username',
              profilePicture: null
            }
          ]
        )
      })
    })
  })
})
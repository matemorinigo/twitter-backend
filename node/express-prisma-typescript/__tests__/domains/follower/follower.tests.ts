import { FollowServiceImpl } from '@domains/follower/service/follow.service.impl';
import { FollowRepositoryMock } from '../../../__mocks__/FollowRepository.mock';
import { UserRepositoryMock } from '../../../__mocks__/UserRepository.mock';
import { ConflictException, NotFoundException } from '@utils';

const followService = new FollowServiceImpl(FollowRepositoryMock, UserRepositoryMock)

const date = new Date()

describe('follow', () => {
  describe('post follow service', () => {
    describe('user tries to follow himself', () => {
      it('should throw a ConflictException', async () => {
        await expect(followService.follow('1', '1')).rejects.toThrow(ConflictException)
      })
    })

    describe('user tries to follow an already followed user', () => {
      it('should throw a ConflictException', async () => {
        FollowRepositoryMock.isFollowing.mockResolvedValueOnce(true)
        await expect(followService.follow('1', '2')).rejects.toThrow(ConflictException)
      })
    })

    describe('user doesn\'t exists', () => {
      it('should throw a NotFoundException', async () => {
        FollowRepositoryMock.isFollowing.mockResolvedValueOnce(false)
        UserRepositoryMock.getById.mockResolvedValueOnce(null)
        await expect(followService.follow('1', '2')).rejects.toThrow(NotFoundException)
      })
    })
  })

  describe('post unfollow service', () => {
    describe('user tries to unfollow an unfollowed user', () => {
      it('should throw a ConflictException', async () => {
        FollowRepositoryMock.isFollowing.mockResolvedValueOnce(false)

        await expect(followService.unfollow('1', '1')).rejects.toThrow(ConflictException)
      })
    })

    describe('user tries to follow an already followed user', () => {
      it('should unfollow the user and return the FollowDTO', async () => {
        FollowRepositoryMock.isFollowing.mockResolvedValueOnce(true)
        FollowRepositoryMock.unfollow.mockResolvedValueOnce({ followerId: '1', FollowedId: '2', createdAt: date })
        await expect(followService.unfollow('1', '2')).resolves.toStrictEqual({ followerId: '1', FollowedId: '2', createdAt: date })
      })
    })
  })
})

import { FollowServiceImpl } from '@domains/follower/service/follow.service.impl';
import { FollowRepositoryMock } from '@test/__mocks__/FollowRepository.mock';
import { UserRepositoryMock } from '@test/__mocks__/UserRepository.mock';
import { ConflictException, NotFoundException } from '@utils';

const followService = new FollowServiceImpl(FollowRepositoryMock, UserRepositoryMock)

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
})

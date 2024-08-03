import { ReactionServiceImpl } from '@domains/reaction/service/reaction.service.impl';
import ReactionRepositoryMock from '../../../__mocks__/ReactionRepository.mock';
import ValidatePostVisibilityMock from '../../../__mocks__/ValidatePostVisibility.mock';
import { ConflictException, NotFoundException } from '@utils';
import { ReactionType } from '@domains/reaction/dto';

const reactionService = new ReactionServiceImpl(ReactionRepositoryMock, ValidatePostVisibilityMock)

describe('react', () => {
  describe('post react post service', () => {
    describe('post already reacted', () => {
      it('should throw a ConflictException', async () => {
        ReactionRepositoryMock.getReaction.mockResolvedValueOnce({
          type: 'LIKE',
          postId: '1',
          userId: '1'
        })

        await expect(reactionService.react('1', '1', ReactionType.LIKE)).rejects.toThrow(ConflictException)
      })
    })

    describe('post is not visible to user', () => {
      it('should throw a NotFoundException', async () => {
        ReactionRepositoryMock.getReaction.mockResolvedValueOnce(null)
        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(false)

        await expect(reactionService.react('1', '1', ReactionType.LIKE)).rejects.toThrow(NotFoundException)
      })
    })

    describe('post is visible to user and is not reacted', () => {
      it('should return a ReactPostDTO', async () => {
        ReactionRepositoryMock.getReaction.mockResolvedValueOnce(null)
        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(true)
        ReactionRepositoryMock.react.mockResolvedValueOnce({
          type: 'LIKE',
          postId: '1',
          userId: '1'
        })

        await expect(reactionService.react('1', '1', ReactionType.LIKE)).resolves.toStrictEqual({
          type: 'LIKE',
          postId: '1',
          userId: '1'
        })
      })
    })
  })

  describe('post unreact post service', () => {
    describe('post not reacted', () => {
      it('should throw a ConflictException', async () => {
        ReactionRepositoryMock.getReaction.mockResolvedValueOnce(null)

        await expect(reactionService.unreact('1', '1', ReactionType.LIKE)).rejects.toThrow(ConflictException)
      })
    })

    describe('post is not visible to user', () => {
      it('should throw a NotFoundException', async () => {
        ReactionRepositoryMock.getReaction.mockResolvedValueOnce({
          type: 'LIKE',
          postId: '1',
          userId: '1'
        })
        
        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(false)

        await expect(reactionService.unreact('1', '1', ReactionType.LIKE)).rejects.toThrow(NotFoundException)
      })
    })

    describe('post is visible to user and is reacted', () => {
      it('should return a ReactPostDTO', async () => {
        ReactionRepositoryMock.getReaction.mockResolvedValueOnce({
          type: 'LIKE',
          postId: '1',
          userId: '1'
        })

        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(true)

        ReactionRepositoryMock.unreact.mockResolvedValueOnce({
          type: 'LIKE',
          postId: '1',
          userId: '1'
        })

        await expect(reactionService.unreact('1', '1', ReactionType.LIKE)).resolves.toStrictEqual({
          type: 'LIKE',
          postId: '1',
          userId: '1'
        })
      })
    })
  })

  describe('get likes by post service', () => {
    describe('post is not visible to user', () => {
      it('should throw a NotFoundException', async () => {
        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(false)
        
        await expect(reactionService.likesByPost('1', '1')).rejects.toThrow(NotFoundException)
      })
    })

    describe('post is visible to user', () => {
      it('should return a ReactPostDTO[]', async () => {
        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(true)

        ReactionRepositoryMock.likesByPost.mockResolvedValueOnce([
          {
            type: 'LIKE',
            postId: '1',
            userId: '1'
          },
          {
            type: 'LIKE',
            postId: '1',
            userId: '2'
          }
        ])

        await expect(reactionService.likesByPost('1', '1')).resolves.toStrictEqual([
          {
            type: 'LIKE',
            postId: '1',
            userId: '1'
          },
          {
            type: 'LIKE',
            postId: '1',
            userId: '2'
          }
        ])
      })
    })
  })

  describe('get retweets by post service', () => {
    describe('post is not visible to user', () => {
      it('should throw a NotFoundException', async () => {
        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(false)

        await expect(reactionService.retweetsByPost('1', '1')).rejects.toThrow(NotFoundException)
      })
    })

    describe('post is visible to user', () => {
      it('should return a ReactPostDTO[]', async () => {
        ValidatePostVisibilityMock.validateUserCanSeePost.mockResolvedValueOnce(true)

        ReactionRepositoryMock.retweetsByPost.mockResolvedValueOnce([
          {
            type: 'RETWEET',
            postId: '1',
            userId: '1'
          },
          {
            type: 'RETWEET',
            postId: '1',
            userId: '2'
          }
        ])

        await expect(reactionService.retweetsByPost('1', '1')).resolves.toStrictEqual([
          {
            type: 'RETWEET',
            postId: '1',
            userId: '1'
          },
          {
            type: 'RETWEET',
            postId: '1',
            userId: '2'
          }
        ])
      })
    })
  })

  describe('get likes by author service', () => {
    describe('author is not visible to user', () => {
      it('should throw a NotFoundException', async () => {
        ValidatePostVisibilityMock.validateUserCanSeePosts.mockResolvedValueOnce(false)

        await expect(reactionService.likesByUser('2', '1')).rejects.toThrow(NotFoundException)
      })
    })

    describe('author is visible to user', () => {
      it('should return a ReactPostDTO[]', async () => {
        ValidatePostVisibilityMock.validateUserCanSeePosts.mockResolvedValueOnce(true)

        ReactionRepositoryMock.likesByUser.mockResolvedValueOnce([
          {
            type: 'LIKE',
            postId: '1',
            userId: '1'
          },
          {
            type: 'LIKE',
            postId: '2',
            userId: '1'
          }
        ])

        await expect(reactionService.likesByUser('2', '1')).resolves.toStrictEqual([
          {
            type: 'LIKE',
            postId: '1',
            userId: '1'
          },
          {
            type: 'LIKE',
            postId: '2',
            userId: '1'
          }
        ])
      })
    })
  })

  describe('get retweets by author service', () => {
    describe('author is not visible to user', () => {
      it('should throw a NotFoundException', async () => {
        ValidatePostVisibilityMock.validateUserCanSeePosts.mockResolvedValueOnce(false)

        await expect(reactionService.retweetsByUser('2', '1')).rejects.toThrow(NotFoundException)
      })
    })

    describe('author is visible to user', () => {
      it('should return a ReactPostDTO[]', async () => {
        ValidatePostVisibilityMock.validateUserCanSeePosts.mockResolvedValueOnce(true)

        ReactionRepositoryMock.retweetsByUser.mockResolvedValueOnce([
          {
            type: 'RETWEET',
            postId: '1',
            userId: '1'
          },
          {
            type: 'RETWEET',
            postId: '2',
            userId: '1'
          }
        ])

        await expect(reactionService.retweetsByUser('2', '1')).resolves.toStrictEqual([
          {
            type: 'RETWEET',
            postId: '1',
            userId: '1'
          },
          {
            type: 'RETWEET',
            postId: '2',
            userId: '1'
          }
        ])
      })
    })
  })
})
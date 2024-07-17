import { SignupInputDTO } from '@domains/auth/dto'
import { PrismaClient } from '@prisma/client'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UpdateUserDTO, UserDTO } from '../dto';
import { UserRepository } from './user.repository'
import { adjectives, colors, starWars, uniqueNamesGenerator } from 'unique-names-generator';

export class UserRepositoryImpl implements UserRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (data: SignupInputDTO): Promise<UserDTO> {
    const name = uniqueNamesGenerator({
      dictionaries: [colors, adjectives, starWars],
      length: 2
    })
    return await this.db.user.create({
      data: { ...data, name }
    }).then(user => new UserDTO(user))
  }

  async getById (userId: any): Promise<ExtendedUserDTO | null> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      }
    })
    return user ? new ExtendedUserDTO(user) : null
  }

  async updateUser (userId: string, data: UpdateUserDTO): Promise<UpdateUserDTO> {
    const updatedUser = await this.db.user.update({
      where: {
        id: userId
      },
      data
    })
    return new UpdateUserDTO(updatedUser)
  }

  async delete (userId: any): Promise<void> {
    await this.db.user.delete({
      where: {
        id: userId
      }
    })
  }

  async getRecommendedUsersPaginated (options: OffsetPagination): Promise<ExtendedUserDTO[]> {
    const users = await this.db.user.findMany({
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined,
      orderBy: [
        {
          id: 'asc'
        }
      ]
    })
    return users.map(user => new ExtendedUserDTO(user))
  }

  async getByEmailOrUsername (email?: string, username?: string): Promise<ExtendedUserDTO | null> {
    const user = await this.db.user.findFirst({
      where: {
        OR: [
          {
            email
          },
          {
            username
          }
        ]
      }
    })
    return user ? new ExtendedUserDTO(user) : null
  }

  async userHasProfilePicture (userId: string): Promise<boolean> {
    const user = await this.db.user.findFirst({
      where: {
        id: userId
      }
    })
    return (Boolean((user?.profilePictureKey)))
  }
}

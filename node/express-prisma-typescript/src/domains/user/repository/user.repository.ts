import { SignupInputDTO } from '@domains/auth/dto'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UpdateUserDTO, UserDTO } from '../dto';

export interface UserRepository {
  create: (data: SignupInputDTO) => Promise<UserDTO>
  delete: (userId: string) => Promise<void>
  getRecommendedUsersPaginated: (options: OffsetPagination) => Promise<ExtendedUserDTO[]>
  getById: (userId: string) => Promise<ExtendedUserDTO | null>
  updateUser: (userId: string, data: UpdateUserDTO) => Promise<UpdateUserDTO>
  getByEmailOrUsername: (email?: string, username?: string) => Promise<ExtendedUserDTO | null>
  userHasProfilePicture: (userId: string) => Promise<boolean>
}

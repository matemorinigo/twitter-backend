import { SignupInputDTO } from '@domains/auth/dto'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UpdateUserDTO, UserDTO, UserViewDTO } from '../dto';

export interface UserRepository {
  create: (data: SignupInputDTO) => Promise<UserDTO>
  delete: (userId: string) => Promise<void>
  getRecommendedUsersPaginated: (options: OffsetPagination) => Promise<ExtendedUserDTO[]>
  getById: (userId: string) => Promise<ExtendedUserDTO | null>
  getUsersByUsername: (username: string, options: OffsetPagination) => Promise<UserViewDTO[]>
  updateUser: (userId: string, data: UpdateUserDTO) => Promise<UpdateUserDTO>
  getByEmailOrUsername: (email?: string, username?: string) => Promise<ExtendedUserDTO | null>
  getProfilePicture: (userId: string) => Promise<string | null>
  uploadProfilePicture: (userId: string) => Promise<string>
  userHasProfilePicture: (userId: string) => Promise<boolean>
}

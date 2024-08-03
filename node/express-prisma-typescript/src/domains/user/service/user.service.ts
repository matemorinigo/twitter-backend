import { OffsetPagination } from '@types'
import { UpdateUserDTO, UserViewDTO } from '../dto'

export interface UserService {
  deleteUser: (userId: string) => Promise<void>
  getUser: (userId: string, searchedId: string) => Promise<UserViewDTO>
  getUsersByUsername: (username: string, options: OffsetPagination) => Promise<UserViewDTO[]>
  updateUser: (userId: string, data: UpdateUserDTO) => Promise<UpdateUserDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserViewDTO[]>
  getProfilePicture: (userId: string) => Promise<string | null>
  uploadProfilePicture: (userId: string) => Promise<string>
}

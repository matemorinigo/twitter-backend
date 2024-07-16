import { OffsetPagination } from '@types'
import { UpdateUserDTO, UserDTO, UserViewDTO } from '../dto'

export interface UserService {
  deleteUser: (userId: any) => Promise<void>
  getUser: (userId: any) => Promise<UserViewDTO>
  updateUser: (userId: string, data: UpdateUserDTO) => Promise<UpdateUserDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserViewDTO[]>
  getProfilePicture: (userId: string) => Promise<string | null>
  uploadProfilePicture: (userId: string) => Promise<string>
}

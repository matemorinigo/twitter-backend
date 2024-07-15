import { OffsetPagination } from '@types'
import { UpdateUserDTO, UserDTO } from '../dto'

export interface UserService {
  deleteUser: (userId: any) => Promise<void>
  getUser: (userId: any) => Promise<UserDTO>
  updateUser: (userId: string, data: UpdateUserDTO, file: Express.Multer.File | undefined) => Promise<UpdateUserDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserDTO[]>
}

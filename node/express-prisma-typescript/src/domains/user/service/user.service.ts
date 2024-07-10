import { OffsetPagination } from '@types'
import { UpdateUserDTO, UserDTO } from '../dto';

export interface UserService {
  deleteUser: (userId: any) => Promise<void>
  getUser: (userId: any) => Promise<UserDTO>
  updateUser: (userId: string, data: UpdateUserDTO) => Promise<UpdateUserDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserDTO[]>
}

import { NotFoundException } from '@utils/errors'
import { OffsetPagination } from 'types'
import { UpdateUserDTO, UserDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import 'dotenvrc'
import s3 from '@utils/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import * as process from 'process'
import sharp from 'sharp'

export class UserServiceImpl implements UserService {
  constructor (private readonly repository: UserRepository) {}

  async getUser (userId: any): Promise<UserDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return user
  }

  async updateUser (userId: string, data: UpdateUserDTO, file?: Express.Multer.File | undefined): Promise<UpdateUserDTO> {
    let buffer: Buffer | undefined = undefined
    if (file) {
      buffer = await sharp(file.buffer).resize({ width: 368, height: 368, fit: 'contain' }).toBuffer()

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: userId,
        Body: buffer,
        ContentType: file?.mimetype
      }
      const command = new PutObjectCommand(params)

      await s3.send(command)
    }

    return await this.repository.updateUser(userId, data)
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserDTO[]> {
    // TODO: make this return only users followed by users the original user follows
    return await this.repository.getRecommendedUsersPaginated(options)
  }

  async deleteUser (userId: any): Promise<void> {
    await this.repository.delete(userId)
  }
}

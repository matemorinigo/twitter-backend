import { IsOptional } from 'class-validator';

export class UserDTO {
  constructor (user: UserDTO) {
    this.id = user.id
    this.name = user.name
    this.createdAt = user.createdAt
    this.publicAccount = user.publicAccount
  }

  id: string
  name: string | null
  createdAt: Date
  publicAccount: boolean
}

export class ExtendedUserDTO extends UserDTO {
  constructor (user: ExtendedUserDTO) {
    super(user)
    this.email = user.email
    this.name = user.name
    this.password = user.password
  }

  email!: string
  username!: string
  password!: string
}
export class UserViewDTO {
  constructor (user: UserViewDTO) {
    this.id = user.id
    this.name = user.name
    this.username = user.username
    this.profilePicture = user.profilePicture
  }

  id: string
  name: string
  username: string
  profilePicture: string | null
}

export class UpdateUserDTO {
  @IsOptional()
    name?: string | null

  @IsOptional()
    username?: string

  @IsOptional()
    email?: string

  @IsOptional()
    publicAccount?: boolean

  @IsOptional()
    data?: string

  // no se que tan legal es el Partial pero sin eso se rompe cuando lee user.name
  constructor (user?: Partial<UpdateUserDTO>) {
    this.name = user?.name
    this.username = user?.username
    this.email = user?.email
    this.publicAccount = user?.publicAccount
    this.data = user?.data
  }
}

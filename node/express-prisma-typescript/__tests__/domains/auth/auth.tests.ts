import { AuthServiceImpl } from '@domains/auth/service'
import { ConflictException, db, NotFoundException, UnauthorizedException } from '@utils'
import * as auth from '@utils/auth'

import { UserRepositoryMock } from '../../../__mocks__/UserRepository.mock'

const authService = new AuthServiceImpl(UserRepositoryMock)

const encryptPasswordMocked = jest.spyOn(auth, 'encryptPassword')
const generateAccessTokenMocked = jest.spyOn(auth, 'generateAccessToken')
const checkPasswordMocked = jest.spyOn(auth, 'checkPassword')

describe('auth', () => {
  describe('post signup service', () => {
    describe('credentials exists', () => {
      it('should throw a ConflictException', async () => {
        // Mucho no importa los datos que le pasen, ya que el mock reemplaza la llamada
        // a getUserBy... entonces siempre entra en el if que tira la excepcion
        // esta bien?

        UserRepositoryMock.getByEmailOrUsername.mockReturnValueOnce(Promise.resolve({
          id: 'f4555feb-cf56-4aa1-87d9-7032bb4f4245',
          name: 'example',
          createdAt: new Date(),
          publicAccount: true,
          email: 'example@example',
          username: 'example',
          password: '12345Aa!'
        }))

        await expect(authService.signup({
          email: 'example@example',
          username: 'example',
          password: 'asd'
        })).rejects.toThrow(ConflictException)
      })
    })

    describe('credentials doesn\'t exists', () => {
      it('should create a new user and return an access token', async () => {
        UserRepositoryMock.getByEmailOrUsername.mockReturnValueOnce(Promise.resolve(null))

        encryptPasswordMocked.mockReturnValue(Promise.resolve('secret'))

        UserRepositoryMock.create.mockReturnValueOnce(Promise.resolve({
          id: 'f4555feb-cf56-4aa1-87d9-7032bb4f4245',
          name: 'example',
          createdAt: new Date(),
          publicAccount: true
        }))

        generateAccessTokenMocked.mockReturnValueOnce('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMGQ5OTIzNC02MDJjLTQxNzYtODFlNi0yYzQyMWMwZDgwZTYiLCJpYXQiOjE3MjIwMDc3NzAsImV4cCI6MTcyMjA5NDE3MH0.qn-N5oVfCcw4iTkEwW7JXJYURtf8bHWEos2WjuFB6os')

        await expect(authService.signup({
          email: 'example@example',
          username: 'example',
          password: 'asd'
        })).resolves.toStrictEqual({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMGQ5OTIzNC02MDJjLTQxNzYtODFlNi0yYzQyMWMwZDgwZTYiLCJpYXQiOjE3MjIwMDc3NzAsImV4cCI6MTcyMjA5NDE3MH0.qn-N5oVfCcw4iTkEwW7JXJYURtf8bHWEos2WjuFB6os' })
      })
    })
  })

  describe('post login service', () => {
    describe('user doesn\'t exists', () => {
      it('should throw a NotFoundException', async () => {

        UserRepositoryMock.getByEmailOrUsername.mockReturnValueOnce(Promise.resolve(null))

        await expect(authService.login({
          username: 'example',
          password: '12345Aa!'
        })).rejects.toThrow(NotFoundException)
      })
    })

    describe('user exists but the password is wrong', () => {
      it('should throw an UnauthorizedException', async () => {
        UserRepositoryMock.getByEmailOrUsername.mockReturnValueOnce(Promise.resolve({
          id: 'f4555feb-cf56-4aa1-87d9-7032bb4f4245',
          name: 'example',
          createdAt: new Date(),
          publicAccount: true,
          email: 'example@example',
          username: 'example',
          password: '12345Aa!'
        }))

        checkPasswordMocked.mockReturnValueOnce(Promise.resolve(false))

        await expect(authService.login({
          email: 'example@example',
          username: 'example',
          password: 'asd'
        })).rejects.toThrow(UnauthorizedException)
      })
    })
  })
})

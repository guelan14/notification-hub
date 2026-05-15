import * as authService from '../services/auth.service'
import * as userRepository from '../repositories/user.repository'
import bcrypt from 'bcrypt'

jest.mock('../repositories/user.repository')
jest.mock('bcrypt')

const mockFindUserByUsername = userRepository.findUserByUsername as jest.Mock
const mockCreateUser = userRepository.createUser as jest.Mock
const mockBcryptHash = bcrypt.hash as jest.Mock
const mockBcryptCompare = bcrypt.compare as jest.Mock

describe('auth.service', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('register', () => {
    it('should create a new user successfully', async () => {
      mockFindUserByUsername.mockResolvedValue(null)
      mockBcryptHash.mockResolvedValue('hashedpassword')
      mockCreateUser.mockResolvedValue({
        id: '123',
        username: 'testuser',
        role: 'USER'
      })

      const result = await authService.register('testuser', '123456')

      expect(result.username).toBe('testuser')
      expect(result.role).toBe('USER')
      expect(mockBcryptHash).toHaveBeenCalledWith('123456', 10)
    })

    it('should throw if username already exists', async () => {
      mockFindUserByUsername.mockResolvedValue({ id: '123', username: 'testuser' })

      await expect(authService.register('testuser', '123456')).rejects.toThrow('Username already taken')
    })
  })

  describe('login', () => {
    it('should return a token on valid credentials', async () => {
      mockFindUserByUsername.mockResolvedValue({
        id: '123',
        username: 'testuser',
        password: 'hashedpassword',
        role: 'USER'
      })
      mockBcryptCompare.mockResolvedValue(true)

      const result = await authService.login('testuser', '123456')

      expect(result.token).toBeDefined()
      expect(typeof result.token).toBe('string')
    })

    it('should throw on invalid username', async () => {
      mockFindUserByUsername.mockResolvedValue(null)

      await expect(authService.login('wrong', '123456')).rejects.toThrow('Invalid credentials')
    })

    it('should throw on invalid password', async () => {
      mockFindUserByUsername.mockResolvedValue({
        id: '123',
        username: 'testuser',
        password: 'hashedpassword',
        role: 'USER'
      })
      mockBcryptCompare.mockResolvedValue(false)

      await expect(authService.login('testuser', 'wrongpass')).rejects.toThrow('Invalid credentials')
    })
  })
})
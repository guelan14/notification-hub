import { authorize, clearPermissionsCache } from '../middlewares/authorize'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as permissionRepository from '../repositories/permission.repository'
import HttpError from '../errors/HttpError'

jest.mock('../repositories/permission.repository')

beforeEach(() => {
  clearPermissionsCache()
  jest.clearAllMocks()
})

describe('authorize middleware', () => {
  it('calls next with 401 error when no user on request', async () => {
    const req = {} as AuthRequest
    const res: any = { status: jest.fn(() => res), json: jest.fn() }
    const next = jest.fn()

    await authorize('metrics:read')(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(HttpError))
    expect((next.mock.calls[0][0] as HttpError).status).toBe(401)
  })

  it('calls next with 403 error when role lacks permission', async () => {
    jest.mocked(permissionRepository.getAllRolePermissions).mockResolvedValue([])

    const req = { user: { userId: '1', role: 'USER' } } as AuthRequest
    const res: any = { status: jest.fn(() => res), json: jest.fn() }
    const next = jest.fn()

    await authorize('metrics:read')(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(HttpError))
    expect((next.mock.calls[0][0] as HttpError).status).toBe(403)
  })

  it('calls next when role has permission (admin)', async () => {
    jest.mocked(permissionRepository.getAllRolePermissions).mockResolvedValue([
      { role: 'ADMIN', permissionId: '1', permission: { name: 'metrics:read' } },
    ] as any)

    const req = { user: { userId: '1', role: 'ADMIN' } } as AuthRequest
    const res: any = { status: jest.fn(() => res), json: jest.fn() }
    const next = jest.fn()

    await authorize('metrics:read')(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })
})

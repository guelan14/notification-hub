import { authorize } from '../middlewares/authorize'
import { AuthRequest } from '../middlewares/auth.middleware'

describe('authorize middleware', () => {
  it('returns 401 when no user on request', () => {
    const req = {} as AuthRequest
    const res: any = { status: jest.fn(() => res), json: jest.fn() }
    const next = jest.fn()

    const mw = authorize('metrics:read')
    mw(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 403 when role lacks permission', () => {
    const req = { user: { userId: '1', role: 'USER' } } as AuthRequest
    const res: any = { status: jest.fn(() => res), json: jest.fn() }
    const next = jest.fn()

    const mw = authorize('metrics:read')
    mw(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next when role has permission (admin)', () => {
    const req = { user: { userId: '1', role: 'ADMIN' } } as AuthRequest
    const res: any = { status: jest.fn(() => res), json: jest.fn() }
    const next = jest.fn()

    const mw = authorize('metrics:read')
    mw(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})

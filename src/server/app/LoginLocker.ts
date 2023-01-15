import { createLoginLock } from '../lib/LoginLocker'

export const loginLocker = createLoginLock({
    excludePath: ['/global', '/user/createAdmin'],
})
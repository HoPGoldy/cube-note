import { createLoginLock } from '../lib/LoginLocker'
import { createBanLock } from '../lib/banLocker'
import { db } from './database'

export const loginLocker = createLoginLock({
    excludePath: ['/global', '/user/createAdmin'],
})

export const banLocker = createBanLock({ db })
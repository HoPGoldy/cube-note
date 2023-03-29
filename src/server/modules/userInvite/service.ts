import { nanoid } from 'nanoid'
import { DatabaseAccessor } from '@/server/lib/sqlite'
import { UserInviteStorage } from '@/types/userInvite'

interface Props {
    db: DatabaseAccessor
}

export const createService = (props: Props) => {
    const {
        db,
    } = props

    /**
     * 新增用户邀请
     */
    const addInvite = async () => {
        const initStorage: Omit<UserInviteStorage, 'id'> = {
            inviteCode: nanoid(8),
            createTime: Date.now(),
        }

        const [id] = await db.userInvite().insert(initStorage)
        const data: UserInviteStorage = {
            ...initStorage,
            id,
        }

        return { code: 200, data }
    }

    /**
     * 删除用户邀请
     */
    const deleteInvite = async (id: number) => {
        await db.userInvite().delete().where('id', id)
        return { code: 200 }
    }

    /**
     * 查看邀请列表
     */
    const getInviteList = async () => {
        const data = await db.userInvite().select()
        return { code: 200, data }
    }

    /**
     * 用户执行注册
     */
    const userRegister = async (username: string, inviteCode: string) => {
        const inviteStorage = await db.userInvite().select().where({ inviteCode }).first()
        if (!inviteStorage) return { code: 400, msg: '邀请码错误' }

        await db.userInvite().update({
            useTime: Date.now(),
            username,
        }).where('inviteCode', inviteCode)
        return { code: 200 }
    }

    return { addInvite, deleteInvite, getInviteList, userRegister }
}

export type UserInviteService = ReturnType<typeof createService>
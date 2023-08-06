import React, { useMemo } from 'react'
import { AppTheme } from '@/types/user'
import { changeTheme, getUserTheme, logout, stateUser } from '@/client/store/user'
import { useQueryArticleCount, useSetTheme } from '@/client/services/user'
import { LockOutlined, DatabaseOutlined, TagsOutlined, SmileOutlined, ContactsOutlined } from '@ant-design/icons'
import { useJwtPayload } from '@/client/utils/jwt'
import { useAtomValue } from 'jotai'

export interface SettingLinkItem {
    label: string
    icon: React.ReactNode
    link: string
    onClick?: () => void
}

export const useSetting = () => {
    const userInfo = useAtomValue(stateUser)
    // 数量统计接口
    const { data: countInfo } = useQueryArticleCount()
    /** 是否是管理员 */
    const jwtPayload = useJwtPayload()
    /** 主题设置 */
    const { mutateAsync: updateAppTheme } = useSetTheme()

    const settingConfig = useMemo(() => {
        const list = [
            { label: '修改密码', icon: <LockOutlined />, link: '/changePassword' },
            { label: '笔记管理', icon: <DatabaseOutlined />, link: '/articleManage' },
            { label: '标签管理', icon: <TagsOutlined />, link: '/tags' },
            jwtPayload?.isAdmin
                ? { label: '用户管理', icon: <ContactsOutlined />, link: '/userInvite' }
                : null,
            { label: '关于', icon: <SmileOutlined />, link: '/about' },
        ].filter(Boolean) as SettingLinkItem[]
        
        return list
    }, [jwtPayload?.isAdmin])

    const onSwitchTheme = () => {
        const newTheme = userInfo?.theme === AppTheme.Light ? AppTheme.Dark : AppTheme.Light
        updateAppTheme(newTheme)
        changeTheme(newTheme)
    }

    const onLogout = () => {
        logout()
    }

    const articleCount = countInfo?.data?.articleCount || '---'
    const articleLength = countInfo?.data?.articleLength || '---'
    const userName = userInfo?.username || '---'
    const userTheme = getUserTheme(userInfo)

    return {
        articleCount, articleLength, userName, onLogout, settingConfig,
        userTheme, onSwitchTheme
    }
}

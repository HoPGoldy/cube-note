import React, { useState } from 'react'
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SearchOutlined,
    UserOutlined
} from '@ant-design/icons'
import { Link, Outlet } from 'react-router-dom'
import { Sidebar } from '../Sidebar'
import { Button, Popover, Space } from 'antd'
import s from './styles.module.css'
import { DesktopSetting } from '@/client/pages/userSetting'
import { isMobile } from '../Responsive'
import { useAppSelector } from '@/client/store'

const SIDE_WIDTH = '240px'

export const AppContainer: React.FC = () => {
    /** 是否展开侧边栏 */
    const [collapsed, setCollapsed] = useState(false)
    /** 是否打开用户管理菜单 */
    const [userMenuVisible, setUserMenuVisible] = useState(false)
    /** 用户名 */
    const username = useAppSelector(s => s.user.userInfo?.username)
    /** 侧边栏展开按钮 */
    const CollasedIcon = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined

    if (isMobile) {
        return (
            <main className="h-full w-screen">
                <Outlet />
            </main>
        )
    }

    return (
        <div style={{ height: '100%', display: 'flex' }}>
            <aside
                className="overflow-hidden transition-w"
                style={{ width: collapsed ? 0 : SIDE_WIDTH }}
            >
                <Sidebar />
            </aside>
            <div style={{ width: collapsed ? '100%' : `calc(100% - ${SIDE_WIDTH})`, transition: 'width 0.3s' }}>
                <header className={s.headerBox}>
                    <div>
                        <CollasedIcon onClick={() => setCollapsed(!collapsed)} className="text-xl" />
                    </div>
                    <div>
                        <Space size="middle">
                            <Link to="/search">
                                <Button icon={<SearchOutlined />} className="w-60">
                                    搜索
                                </Button>
                            </Link>
                            <Popover
                                placement="bottomRight"
                                // trigger="click"
                                content={<DesktopSetting onClick={() => setUserMenuVisible(false)} />}
                                open={userMenuVisible}
                                onOpenChange={setUserMenuVisible}
                                arrow
                            >
                                <UserOutlined className="cursor-pointer text-xl mr-2" />
                                <span className="cursor-pointer">{username}</span>
                            </Popover>
                        </Space>
                    </div>
                </header>
                {/* 后面减去的 1px 是标题栏底部边框的高度 */}
                <main
                    className="flex-1 overflow-y-auto"
                    style={{ height: 'calc(100% - 3rem - 1px)' }}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

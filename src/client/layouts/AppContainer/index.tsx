import React, { useState } from 'react'
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SearchOutlined,
    UserOutlined
} from '@ant-design/icons'
import { Link, Outlet } from 'react-router-dom'
import { Sidebar } from '../Sidebar'
import { Popover, Space } from 'antd'
import s from './styles.module.css'
import { DesktopSetting } from '@/client/pages/userSetting'

const SIDE_WIDTH = '240px'

export const AppContainer: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false)
    const CollasedIcon = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined

    return (
        <div style={{ height: '100%', display: 'flex' }}>
            <aside
                style={{
                    backgroundColor: '#334155',
                    width: collapsed ? 0 : SIDE_WIDTH,
                    overflow: 'hidden',
                    transition: 'width 0.3s'
                }}
            >
                <Sidebar />
            </aside>
            <div style={{ width: collapsed ? '100%' : `calc(100% - ${SIDE_WIDTH})`, transition: 'width 0.3s' }}>
                <header className={s.headerBox}>
                    <div>
                        <CollasedIcon onClick={() => setCollapsed(!collapsed)} style={{ fontSize: '1.2rem' }} />
                    </div>
                    <div>
                        <Space size="middle">
                            <Link to="/search">
                                <SearchOutlined style={{ fontSize: '1.2rem' }} />
                            </Link>
                            <Popover
                                placement="bottomRight"
                                trigger="click"
                                content={<DesktopSetting />}
                                arrow
                            >
                                <UserOutlined style={{ fontSize: '1.2rem', cursor: 'pointer' }} />
                            </Popover>
                        </Space>
                    </div>
                </header>
                <main style={{ flexGrow: 1, padding: '1rem', height: 'calc(100% - 5rem)' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

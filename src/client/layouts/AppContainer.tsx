import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { DesktopArea } from './Responsive'
import { Sidebar } from './Sidebar'
import TopTab, { useTabControl } from './TopTab'

export const AppContainer = () => {
    useTabControl()

    return (
        <div className='flex'>
            <aside className='h-screen w-sidebar hidden md:block'>
                <Sidebar />
            </aside>
            <main className='h-screen flex-grow box-border md:pt-[40px]'>
                <DesktopArea>
                    <nav className='h-[40px] mt-[-40px] flex items-center justify-between'>
                        <TopTab className='flex-grow' />
                        <Link to='/search'>
                            <div className='mr-4'>搜索</div>
                        </Link>
                    </nav>
                </DesktopArea>
                <div className='h-full overflow-hidden'>
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
import React from 'react'
import { Outlet } from 'react-router-dom'
import { DesktopArea } from './Responsive'
import { Sidebar } from './Sidebar'
import TopTab, { useTabControl } from './TopTab'

export const AppContainer = () => {
    useTabControl()

    return (
        <div className='flex'>
            <DesktopArea>
                <aside className='h-screen w-sidebar hidden md:block'>
                    <Sidebar />
                </aside>
            </DesktopArea>
            <main className='h-screen flex-grow box-border md:pt-[40px]'>
                <DesktopArea>
                    <nav className='h-[40px] mt-[-40px]'>
                        <TopTab />
                    </nav>
                </DesktopArea>
                <div className='h-full overflow-hidden'>
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
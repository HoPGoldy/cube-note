import React from 'react'
import { Outlet } from 'react-router-dom'
import { DesktopArea } from './Responsive'
import { Sidebar } from './Sidebar'

export const AppContainer = () => {
    return (
        <div className='flex'>
            <DesktopArea>
                <aside className='h-screen w-sidebar hidden md:block'>
                    <Sidebar />
                </aside>
            </DesktopArea>
            <main className='h-screen w-page-content flex-grow'>
                <Outlet />
            </main>
        </div>
    )
}
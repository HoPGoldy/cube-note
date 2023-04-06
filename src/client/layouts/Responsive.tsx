import React, { FC, PropsWithChildren } from 'react'

const getIsMobile = () => {
    return (
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth
    ) < 768
}

export const isMobile = getIsMobile()

export const MobileArea: FC<PropsWithChildren> = ({ children }) => {
    if (!isMobile) return null
    return (<>{children}</>)
}

export const DesktopArea: FC<PropsWithChildren> = ({ children }) => {
    if (isMobile) return null
    return (<>{children}</>)
}
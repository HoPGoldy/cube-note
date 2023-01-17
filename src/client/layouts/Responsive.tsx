import React, { FC, useEffect } from 'react'
import { useAppDispatch } from '../store'
import throttle from 'lodash/throttle'
import { getIsMobile, setIsMobile } from '../store/global'

export const ResponsiveProvider: FC = ({ children }) => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const listener = throttle(() => {
            dispatch(setIsMobile(getIsMobile()))
        }, 300)

        window.addEventListener('resize', listener, true)
        return () => {
            window.removeEventListener('resize', listener, true)
        }
    }, [])
    
    return (<>{children}</>)
}

export const MobileArea: FC = ({ children }) => {
    return (<>{children}</>)
}

export const DesktopArea: FC = ({ children }) => {
    return (<>{children}</>)
}
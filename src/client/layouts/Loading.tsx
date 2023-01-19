import React, { FC, useState, useEffect } from 'react'

interface Props {
    tip?: string
    delay?: number
}

const Loading: FC<Props> = ({ tip = '页面加载中...', delay = 500 }) => {
    const [showTip, setShowTip] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setShowTip(true), delay)
        return () => clearTimeout(timer)
    }, [])

    return showTip ? (
        <div className='h-screen w-full flex justify-center items-center dark:text-gray-400'>
            {tip}
        </div>) : null
}

export default Loading
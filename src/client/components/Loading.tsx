import React, { FC } from 'react'

interface Props {
    tip?: string
}

const Loading: FC<Props> = ({ tip = '页面加载中...' }) => {
    return (
        <div className='h-screen w-full flex justify-center items-center dark:text-gray-400'>
            {tip}
        </div>
    )
}

export default Loading
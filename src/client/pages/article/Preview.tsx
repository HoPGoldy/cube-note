import React, { FC } from 'react'
import { Viewer } from '@bytemd/react'
import { plugins } from '@/client/components/FileUploaderPlugin'

interface Props {
    value: string
}


const Preview: FC<Props> = (props) => {
    return (
        <div
            // style={{ height: 'calc(100vh - 186px)', overflowY: 'auto' }}
            className="w-full xl:w-[60%] m-auto"
        >
            <Viewer value={props.value} plugins={plugins} />
        </div>
    )
}

export default Preview
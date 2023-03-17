/* eslint-disable react/display-name */
import React, { FC } from 'react'
import { Editor as MdEditor } from '@bytemd/react'
import { plugins } from '@/client/components/FileUploaderPlugin'

interface Props {
    value: string
    onChange: (value: string) => void
}

const Editor: FC<Props> = (props) => {
    return (
        <MdEditor
            value={props.value}
            mode="split"
            plugins={plugins}
            onChange={props.onChange}
        />
    )
}

export default Editor
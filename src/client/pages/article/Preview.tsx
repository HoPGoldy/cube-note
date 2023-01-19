import React, { FC } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
    value: string
}

const Preview: FC<Props> = (props) => {
    return (
        <ReactMarkdown className='prose' remarkPlugins={[remarkGfm]}>
            {props.value}
        </ReactMarkdown>
    )
}

export default Preview
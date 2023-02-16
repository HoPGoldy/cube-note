import { fetchFile } from '@/client/services/download'
import { useLazyGetFileQuery } from '@/client/services/file'
import React, { FC, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const PIC_SUFFIX = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']

interface AccessoryProps {
    src: string
    alt: string
}

const Accessory: FC<AccessoryProps> = (props) => {
    const { src, alt } = props
    // 是否为图片
    const isPic = useMemo(() => PIC_SUFFIX.includes(src.split('.').pop() || 'unknow'), [src])
    // 获取图片数据
    // const [getPicSource] = useLazyGetFileQuery()
    // 图片引用
    const imgRef = React.createRef<HTMLImageElement>()

    const fetchPic = async (hash: string) => {
        console.log('🚀 ~ 刷新图片', src, isPic)
        // const resp = await fetchFile(hash)
    }

    // 如果是本地图片，就获取数据并显示
    useEffect(() => {
        console.log(imgRef.current?.src)
        if (!isPic) return

        // if (imgRef.current) imgRef.current.src = src
        
        // 网络图片，直接显示
        if (src.startsWith('http') || src.startsWith('//')) {
            if (imgRef.current) imgRef.current.src = src
            return
        }

        // 本地图片，获取文件并展示
        const picHash = src.split('/').pop()?.split('.').shift()
        if (!picHash) {
            console.error('图片地址错误', src, picHash)
            return
        }

        fetchPic(picHash)
    }, [src, isPic])

    // 不是图片，渲染为附件格式
    if (!isPic) return (
        <div className='rounded bg-slate-400 p-2 cursor-pointer'>
            <div className='font-bold'>{alt || src}</div>
            <div>{src}</div>
        </div>
    )

    // return <img ref={imgRef} />
    return <>123</>
}

interface Props {
    value: string
}


const Preview: FC<Props> = (props) => {
    return (
        <div
            style={{ height: 'calc(100vh - 186px)', overflowY: 'auto' }}
        >
            <ReactMarkdown
                className='prose'
                remarkPlugins={[remarkGfm]}
                // components={{
                //     img: ({ src, alt }) => <Accessory src={src || ''} alt={alt || ''} />,
                // }}
            >
                {props.value}
            </ReactMarkdown>
        </div>
    )
}

export default Preview
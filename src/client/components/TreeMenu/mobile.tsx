import { ArticleTreeNode } from '@/types/article'
import { Button } from 'antd'
import { nanoid } from 'nanoid'
import React, { FC, useRef, useState } from 'react'
import { SwitchTransition, CSSTransition } from 'react-transition-group'

/** 随机生成数字列表 */
const randomList = () => {
    const list = []
    for (let i = 0; i < Math.random() * 10; i++) {
        list.push(nanoid())
    }
    return list
}

interface Props {
    value: number[]
    onChange: (value: number[]) => void
    onClickNode?: (node: ArticleTreeNode) => void
    treeData: ArticleTreeNode[]
}

export const TreeMenu: FC<Props> = (props) => {
    const [id, setId] = useState(nanoid())
    const nodeRef = useRef<HTMLDivElement>(null)
    const [currentList, setCurrentList] = useState<string[]>(randomList)
    /** 动画 */
    const [animating, setAnimating] = useState('to-left')

    const goBack = () => {
        setAnimating('to-left')
        setTimeout(() => {
            setCurrentList(randomList())
            setId(nanoid())
        }, 0)
    }

    const goForward = () => {
        setAnimating('to-right')
        setTimeout(() => {
            setCurrentList(randomList())
            setId(nanoid())
        }, 0)
    }

    return (
        <SwitchTransition>
            <CSSTransition
                key={id}
                nodeRef={nodeRef}
                addEndListener={(done) => {
                    nodeRef.current?.addEventListener('transitionend', done, false)
                }}
                classNames={animating}
            >
                <div ref={nodeRef} className="overflow-hidden">
                    <div className='menu-container'>
                        <Button onClick={goBack} block className='mb-2'>
                            返回
                        </Button>
                        {currentList.map(item => {
                            return (
                                <Button onClick={goForward} className='mb-2' block key={item}>
                                    {item}
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </CSSTransition>
        </SwitchTransition>
    )
}
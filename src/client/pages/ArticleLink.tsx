import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Space, Cell } from 'react-vant'
import Header from '@/client/layouts/Header'
import { PageContent, PageAction, ActionButton } from '../layouts/PageWithAction'

const ArticleLink: FC = () => {
    const navigate = useNavigate()
    const [treeData, setTreeData] = useState([
        { title: 'Chicken', children: [{ title: 'Egg' }] },
        { title: 'Fish', children: [{ title: 'fingerline' }] },
    ])

    return (<>
        <PageContent>
        </PageContent>
        <PageAction>
            <ActionButton onClick={() => navigate(-1)}>返回</ActionButton>
        </PageAction>
    </>)
}

export default ArticleLink
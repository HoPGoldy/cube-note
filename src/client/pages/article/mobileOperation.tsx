import { MobileDrawer } from '@/client/components/MobileDrawer'
import { Button, Col, Row } from 'antd'
import React from 'react'

export const useMobileOperation = () => {
    /** 是否展开文章操作 */
    const [isOperationDrawerOpen, setIsOperationDrawerOpen] = React.useState(false)

    const renderOperationDrawer = () => {
        return (
            <MobileDrawer
                title='文章操作'
                open={isOperationDrawerOpen}
                onClose={() => setIsOperationDrawerOpen(false)}
            >
                <Row gutter={[8, 8]}>
                    <Col span={8}>
                        <Button size="large" block danger>删除</Button>
                    </Col>
                    <Col span={8}>
                        <Button size="large" block>颜色</Button>
                    </Col>
                    <Col span={8}>
                        <Button size="large" block>收藏</Button>
                    </Col>
                    <Col span={24}>
                        <Button size="large" block type="primary">编辑</Button>
                    </Col>
                </Row>
            </MobileDrawer>
        )
    }

    return { renderOperationDrawer, setIsOperationDrawerOpen }
}
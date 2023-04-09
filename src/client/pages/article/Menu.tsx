import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDeleteArticle } from '../../services/article'
import { useAppDispatch } from '../../store'
import { removeTab } from '../../store/tab'
import { messageSuccess } from '@/client/utils/message'
import { STATUS_CODE } from '@/config'
import { Button, Col, Modal, Row } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { isMobile } from '@/client/layouts/Responsive'
import { MobileDrawer } from '@/client/components/MobileDrawer'
import { tabOptions } from '@/client/layouts/Sidebar'
import { SwitchTransition, CSSTransition } from 'react-transition-group'
import { TreeMenu } from '@/client/components/TreeMenu/mobile'

interface Props {
    currentArticleId: number
}

/**
 * 笔记导航功能
 * 只有移动端会用到这个功能，桌面端这个功能由 Sidebar 组件负责
 */
export const useMenu = (props: Props) => {
    const { currentArticleId } = props
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    /** 是否展开导航抽屉 */
    const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false)

    const renderMenuDrawer = () => {
        return (
            <MobileDrawer
                title='笔记导航'
                open={isMenuDrawerOpen}
                onClose={() => setIsMenuDrawerOpen(false)}
                height="80%"
            >
                <div className="flex flex-col flex-nowrap h-full">
                    <div className="flex-grow">
                        <TreeMenu />
                    </div>
                    <div className="flex-shrink-0">
                        <Row gutter={[8, 8]}>
                            {tabOptions.map(tab => {
                                return (
                                    <Col span={8} key={tab.value}>
                                        <Button size="large" block>
                                            {tab.label}
                                        </Button>
                                    </Col>
                                )
                            })}
                        </Row>
                    </div>
                </div>
            </MobileDrawer>
        )
    }

    return { renderMenuDrawer, setIsMenuDrawerOpen }
}

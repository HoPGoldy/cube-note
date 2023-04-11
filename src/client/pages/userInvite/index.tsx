import React, { FC, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContent, PageAction, ActionButton, ActionIcon } from '../../layouts/PageWithAction'
import Loading from '../../layouts/Loading'
import { Col, Row, Button, List, Card, Spin } from 'antd'
import { UserInviteStorage } from '@/types/userInvite'
import { useAddInvite, useDeleteInvite, useQueryInviteList } from '@/client/services/userInvite'
import { PlusOutlined, LeftOutlined } from '@ant-design/icons'
import copy from 'copy-to-clipboard'
import { messageSuccess } from '@/client/utils/message'
import dayjs from 'dayjs'
import { isMobile, MobileArea } from '@/client/layouts/Responsive'

/**
 * 标签管理
 * 可以新增标签分组，设置标签颜色，移动标签到指定分组
 */
const TagManager: FC = () => {
    const navigate = useNavigate()
    // 获取用户列表
    const { data: inviteListResp, isLoading } = useQueryInviteList()
    // 新增邀请
    const { mutateAsync: addInvite, isLoading: isAddingInvite } = useAddInvite()
    // 删除邀请
    const { mutateAsync: deleteInvite, isLoading: isDeleteingInvite } = useDeleteInvite()

    const listItems = useMemo(() => {
        return [...(inviteListResp?.data || []), 'add']
    }, [inviteListResp])

    /** 复制注册链接 */
    const copyRegisterLink = (inviteCode: string) => {
        const link = `${location.origin}${location.pathname}#/register/${inviteCode}`
        copy(link)
        messageSuccess('复制成功')
    }

    const renderInviteItem = (item: UserInviteStorage | string) => {
        if (typeof item === 'string') {
            if (isMobile) return null
            else return renderNewInviteBtn()
        }
        const statusColor = item.username ? 'bg-green-500' : 'bg-red-500'
        return (
            <List.Item>
                <Card
                    title={item.username ? `已使用 - ${item.username}` : '未使用'}
                    size="small"
                    extra={
                        <div className={`w-4 h-4 rounded-full ${statusColor}`}></div>
                    }
                >
                    <Row>
                        <Col xs={24} md={12}>
                            <div>
                                邀请码：
                                <span className="float-right md:float-none">
                                    {item.inviteCode}
                                </span>
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <div>
                                创建时间：
                                <span className="float-right md:float-none">
                                    {dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')}
                                </span>
                            </div>
                        </Col>
                        {item.username && (<>
                            <Col xs={24} md={12}>
                                <div>
                                    用户名：
                                    <span className="float-right md:float-none">
                                        {item.username}
                                    </span>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div>
                                    使用时间：
                                    <span className="float-right md:float-none">
                                        {dayjs(item.useTime).format('YYYY-MM-DD HH:mm:ss')}
                                    </span>
                                </div>
                            </Col>
                        </>)}
                    </Row>

                    <Row gutter={[8, 8]} className="mt-2">
                        {!item.username && (<>
                            <Col flex="1">
                                <Button
                                    block
                                    onClick={() => copyRegisterLink(item.inviteCode)}
                                >复制注册链接</Button>
                            </Col>
                            <Col flex="1">
                                <Button
                                    block
                                    danger
                                    onClick={() => deleteInvite(item.id)}
                                    loading={isDeleteingInvite}
                                >删除邀请码</Button>
                            </Col>
                        </>)}
                    </Row>
                </Card>
            </List.Item>
        )
    }

    const renderNewInviteBtn = () => {
        return (
            <List.Item>
                <Spin spinning={isAddingInvite}>
                    <Card
                        onClick={() => addInvite()}
                        className="cursor-pointer hover:ring-2 ring-gray-300 active:opacity-80 transition-shadow"
                    >
                        <div className="flex justify-center items-center text-gray-400 text-lg">
                            <PlusOutlined />
                            <div className='ml-2'>新增邀请码</div>
                        </div>
                    </Card>
                </Spin>
            </List.Item>
        )
    }

    const renderContent = () => {
        if (isLoading) return <Loading />

        return (<>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <List
                        grid={{ gutter: 16, xs: 1, md: 2 }}
                        dataSource={listItems}
                        renderItem={renderInviteItem}
                    />
                </Col>
            </Row>
        </>)
    }

    return (<>
        <PageContent>
            <div className="m-2">
                <MobileArea>
                    <Card size="small" className='text-center text-base font-bold mb-2'>
                        用户管理
                    </Card>
                </MobileArea>
                {renderContent()}
            </div>
        </PageContent>
        <PageAction>
            <ActionIcon icon={<LeftOutlined />} onClick={() => navigate(-1)} />
            <ActionButton onClick={() => addInvite()}>新增邀请码</ActionButton>
        </PageAction>
    </>)
}

export default TagManager
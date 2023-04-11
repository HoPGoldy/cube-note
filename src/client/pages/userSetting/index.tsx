import React, { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppTheme } from '@/types/user'
import { useAppDispatch, useAppSelector } from '@/client/store'
import { changeTheme, logout } from '@/client/store/user'
import { useQueryArticleCount } from '@/client/services/user'
import { Button, Card, Col, Row, Statistic } from 'antd'
import { SnippetsOutlined, HighlightOutlined, LockOutlined, TagsOutlined, SmileOutlined, CloseCircleOutlined, ContactsOutlined } from '@ant-design/icons'
import { useChangePassword } from '../changePassword'
import { ActionButton, PageAction, PageContent } from '@/client/layouts/PageWithAction'
import { UserOutlined, RightOutlined, LogoutOutlined } from '@ant-design/icons'
import { Cell, SplitLine } from '@/client/components/Cell'

interface DesktopProps {
    onClick: () => void
}

const useSetting = () => {
    const userInfo = useAppSelector(s => s.user.userInfo)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    // 数量统计接口
    const { data: countInfo } = useQueryArticleCount()

    const onSwitchDark = () => {
        const newTheme = userInfo?.theme === AppTheme.Light ? AppTheme.Dark : AppTheme.Light
        // setAppTheme(newTheme)
        dispatch(changeTheme(newTheme))
    }

    const onLogout = () => {
        dispatch(logout())
    }

    const articleCount = countInfo?.data?.articleCount || '---'
    const articleLength = countInfo?.data?.articleLength || '---'
    const userName = userInfo?.username || '---'

    return {
        articleCount, articleLength, userName, onLogout
    }
}

export const DesktopSetting: FC<DesktopProps> = (props) => {
    /** 修改密码功能 */
    const { renderChangePasswordModal, showChangePassword } = useChangePassword()
    /** 设置功能 */
    const setting = useSetting()

    return (
        <div style={{ width: '16rem' }} onClick={props.onClick}>
            <div style={{ margin: '1rem 0rem' }}>
                <Row gutter={[16, 16]} justify="space-around">
                    <Col>
                        <Statistic title="文章数量" value={setting.articleCount} prefix={<SnippetsOutlined />} />
                    </Col>
                    <Col>
                        <Statistic title="总字数" value={setting.articleLength} prefix={<HighlightOutlined />} />
                    </Col>
                </Row>
            </div>
            <Row gutter={[0, 8]} >
                <Col span={24}>
                    <Button block onClick={showChangePassword} icon={<LockOutlined />}>修改密码</Button>
                </Col>
                <Col span={24}>
                    <Link to="/tags">
                        <Button block icon={<TagsOutlined />}>标签管理</Button>
                    </Link>
                </Col>
                <Col span={24}>
                    <Link to="/userInvite">
                        <Button block icon={<ContactsOutlined />}>用户管理</Button>
                    </Link>
                </Col>
                <Col span={24}>
                    <Link to="/about">
                        <Button block icon={<SmileOutlined />}>关于</Button>
                    </Link>
                </Col>
                <Col span={24}>
                    <Button block danger onClick={setting.onLogout} icon={<CloseCircleOutlined />}>登出</Button>
                </Col>
            </Row>
            {renderChangePasswordModal()}
        </div>
    )
}


export const MobileSetting: FC = () => {
    const navigate = useNavigate()
    /** 设置功能 */
    const setting = useSetting()

    return (<>
        <PageContent>
            <div className='p-4 text-base'>
                <Card size="small">
                    <Row justify="space-around">
                        <Col>
                            <Statistic title="文章数量" value={setting.articleCount} prefix={<SnippetsOutlined />} />
                        </Col>
                        <Col>
                            <Statistic title="总字数" value={setting.articleLength} prefix={<HighlightOutlined />} />
                        </Col>
                    </Row>
                </Card>
                <Card size="small" className='mt-4'>
                    <Cell
                        title={(<div><UserOutlined /> &nbsp;登录用户</div>)}
                        extra={setting.userName}
                    />
                </Card>
                <Card size="small" className='mt-4'>
                    <Link to="/changePassword">
                        <Cell
                            title={(<div><LockOutlined /> &nbsp;修改密码</div>)}
                            extra={<RightOutlined />}
                        />
                    </Link>
                    <SplitLine />

                    <Link to="/tags">
                        <Cell
                            title={(<div><TagsOutlined /> &nbsp;标签管理</div>)}
                            extra={<RightOutlined />}
                        />
                    </Link>
                    <SplitLine />

                    <Link to="/userInvite">
                        <Cell
                            title={(<div><ContactsOutlined /> &nbsp;用户管理</div>)}
                            extra={<RightOutlined />}
                        />
                    </Link>
                    <SplitLine />

                    <Link to="/about">
                        <Cell
                            title={(<div><SmileOutlined /> &nbsp;关于</div>)}
                            extra={<RightOutlined />}
                        />
                    </Link>
                </Card>
                <Card size="small" className='mt-4'>
                    <Cell
                        onClick={setting.onLogout}
                        title={(<div><UserOutlined /> &nbsp;登出</div>)}
                        extra={<LogoutOutlined />}
                    />
                </Card>
            </div>
        </PageContent>

        <PageAction>
            <ActionButton onClick={() => navigate(-1)}>返回</ActionButton>
        </PageAction>
    </>)
}

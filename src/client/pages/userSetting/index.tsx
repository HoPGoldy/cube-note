import React, { FC, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppTheme } from '@/types/user'
import { useAppDispatch, useAppSelector } from '@/client/store'
import { changeTheme, logout } from '@/client/store/user'
import { useQueryArticleCount } from '@/client/services/user'
import { Button, Card, Col, Row, Statistic } from 'antd'
import { SnippetsOutlined, HighlightOutlined, LockOutlined, DatabaseOutlined, TagsOutlined, SmileOutlined, CloseCircleOutlined, ContactsOutlined } from '@ant-design/icons'
import { useChangePassword } from '../changePassword'
import { ActionButton, PageAction, PageContent } from '@/client/layouts/PageWithAction'
import { UserOutlined, RightOutlined, LogoutOutlined } from '@ant-design/icons'
import { Cell, SplitLine } from '@/client/components/Cell'
import { useJwtPayload } from '@/client/utils/jwt'

interface DesktopProps {
    onClick: () => void
}

interface SettingLinkItem {
    label: string
    icon: React.ReactNode
    link: string
    onClick?: () => void
}

const useSetting = () => {
    const userInfo = useAppSelector(s => s.user.userInfo)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    // 数量统计接口
    const { data: countInfo } = useQueryArticleCount()
    /** 是否是管理员 */
    const jwtPayload = useJwtPayload()

    const settingConfig = useMemo(() => {
        const list = [
            { label: '修改密码', icon: <LockOutlined />, link: '/changePassword' },
            { label: '文章管理', icon: <DatabaseOutlined />, link: '/articleManage' },
            { label: '标签管理', icon: <TagsOutlined />, link: '/tags' },
            jwtPayload?.isAdmin
                ? { label: '用户管理', icon: <ContactsOutlined />, link: '/userInvite' }
                : null,
            { label: '关于', icon: <SmileOutlined />, link: '/about' },
        ].filter(Boolean) as SettingLinkItem[]
        
        return list
    }, [jwtPayload?.isAdmin])

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
        articleCount, articleLength, userName, onLogout, settingConfig
    }
}

export const DesktopSetting: FC<DesktopProps> = (props) => {
    /** 修改密码功能 */
    const { renderChangePasswordModal, showChangePassword } = useChangePassword()
    /** 设置功能 */
    const setting = useSetting()

    const renderConfigItem = (item: SettingLinkItem) => {
        if (item.link === '/changePassword') {
            return (
                <Col span={24} key={item.link}>
                    <Button
                        block
                        onClick={showChangePassword}
                        icon={item.icon}
                    >{item.label}</Button>
                </Col>
            )
        }

        return (
            <Col span={24} key={item.link}>
                <Link to={item.link}>
                    <Button block icon={item.icon}>{item.label}</Button>
                </Link>
            </Col>
        )
    }

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
                {setting.settingConfig.map(renderConfigItem)}

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

    const renderConfigItem = (item: SettingLinkItem, index: number) => {
        return (<>
            <Link to={item.link}>
                <Cell
                    title={(<div>{item.icon} &nbsp;{item.label}</div>)}
                    extra={<RightOutlined />}
                />
            </Link>
            {index !== setting.settingConfig.length - 1 && <SplitLine />}
        </>)
    }

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
                    {setting.settingConfig.map(renderConfigItem)}
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

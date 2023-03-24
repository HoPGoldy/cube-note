import React from 'react'
import { Card, Cell, Space, Switch } from 'react-vant'
import { Contact, Close, LikeO, StarO, ArrowLeft, Certificate, SendGiftO, EcardPay } from '@react-vant/icons'
import { ActionButton, ActionIcon, PageAction, PageContent } from '../layouts/PageWithAction'
import { useNavigate } from 'react-router-dom'
import { Statistic } from '../components/Statistic'
import { AppTheme } from '@/types/user'
import { useAppDispatch, useAppSelector } from '../store'
import { changeTheme, logout } from '../store/user'
import { useQueryArticleCount } from '../services/user'

const SettingPage = () => {
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

    return (<>
        <PageContent>
            <div className='px-4 lg:px-auto lg:mx-auto w-full lg:w-3/4 xl:w-1/2 2xl:w-1/3 mt-4'>
                <Space direction="vertical" gap={16} className='w-full'>
                    <Card round>
                        <Card.Body>
                            <div className="flex flex-row justify-around">
                                <Statistic label="文章数量" value={countInfo?.data?.articleCount || '---'} />
                                <Statistic label="总字数" value={countInfo?.data?.articleLength || '---'} />
                            </div>
                        </Card.Body>
                    </Card>

                    <Card round>
                        <Cell title="修改密码" icon={<Contact />} isLink onClick={() => navigate('/ChangePassword')} />
                        <Cell title="标签管理" icon={<SendGiftO />} isLink onClick={() => navigate('/tags')} />
                        <Cell title="黑夜模式" icon={<StarO />} 
                            rightIcon={<Switch
                                size={24}
                                defaultChecked={userInfo?.theme === AppTheme.Dark}
                                onChange={onSwitchDark}
                            />}
                        />
                        <Cell title="关于" icon={<LikeO />} isLink onClick={() => navigate('/about')} />
                    </Card>

                    <Card round>
                        <Cell title="登出" icon={<Close />} isLink onClick={onLogout} />
                    </Card>
                </Space>
            </div>
        </PageContent>

        <PageAction>
            <ActionIcon onClick={() => navigate(-1)}>
                <ArrowLeft fontSize={24} />
            </ActionIcon>
            <ActionButton onClick={() => navigate('/securityEntry')}>安全管理</ActionButton>
        </PageAction>
    </>)
}

export default SettingPage
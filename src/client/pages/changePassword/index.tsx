import React, { FC, useState } from 'react'
import { useChangePasswordContent } from './content'
import { isMobile } from 'react-device-detect'
import { useNavigate } from 'react-router-dom'
import { Modal } from 'antd'

export const useChangePassword = () => {
    const navigate = useNavigate()
    /** 是否显示修改密码弹窗 */
    const [visible, setVisible] = useState(false)
    const { onSavePassword, renderContent } = useChangePasswordContent()

    /** 展示修改密码页面 */
    const showChangePassword = () => {
        if (isMobile) navigate('/changePassword')
        else setVisible(true)
    }

    /** 渲染修改密码弹窗 */
    const renderChangePasswordModal = () => {
        if (isMobile) return null

        return (
            <Modal
                open={visible}
                onCancel={() => setVisible(false)}
                onOk={async () => {
                    const success = await onSavePassword()
                    if (success) setVisible(false)
                }}
                title="修改密码"
            >
                {renderContent()}
            </Modal>
        )
    }

    return { showChangePassword, renderChangePasswordModal }
}

const ChangePassword: FC = () => {
    const { renderContent } = useChangePasswordContent()
    return (
        <div>
            {renderContent()}
        </div>
    )
}

export default ChangePassword
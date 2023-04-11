import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDeleteArticle } from '../../services/article'
import { messageSuccess } from '@/client/utils/message'
import { STATUS_CODE } from '@/config'
import { Button, Modal } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { isMobile } from '@/client/layouts/Responsive'

interface Props {
    title: string
    currentArticleId: number
}

export const useDelete = (props: Props) => {
    const { title, currentArticleId } = props
    const navigate = useNavigate()
    // 删除文章
    const { mutateAsync: deleteArticle } = useDeleteArticle()
    // 是否显示删除弹窗
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    // 是否删除子文章
    const [deleteChildren, setDeleteChildren] = useState(false)

    const onDelete = async () => {
        const resp = await deleteArticle({
            id: currentArticleId,
            force: deleteChildren
        })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('删除成功')
        navigate(`/article/${resp.data?.parentArticleId}`)
    }

    /** 渲染删除确认弹窗 */
    const renderDeleteModal = () => {
        return (
            <Modal
                title={`删除${title}`}
                open={showDeleteDialog}
                onOk={async () => {
                    await onDelete()
                    setShowDeleteDialog(false)
                }}
                onCancel={() => {
                    setShowDeleteDialog(false)
                    setDeleteChildren(false)
                }}
                okText='删除'
                cancelText='取消'
                okButtonProps={{ danger: true }}
                width={400}
                style={isMobile ? { top: '45%' } : undefined}
            >
                <div className="mb-2">
                    删除后笔记将无法恢复，请谨慎操作
                </div>

                <Button
                    block
                    danger
                    type={deleteChildren ? 'primary' : 'default'}
                    onClick={() => setDeleteChildren(!deleteChildren)}
                    icon={deleteChildren ? <CheckOutlined /> : <CloseOutlined />}
                >
                    删除子笔记
                </Button>
            </Modal>
        )
    }

    return { renderDeleteModal, setShowDeleteDialog }
}

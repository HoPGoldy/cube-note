import React, { FC, useState } from 'react'
import { Dialog, Checkbox } from 'react-vant'
import { useNavigate } from 'react-router-dom'
import { useDeleteArticle } from '../../services/article'
import { useAppDispatch } from '../../store'
import { removeTab } from '../../store/tab'
import { messageSuccess } from '@/client/utils/message'
import { STATUS_CODE } from '@/config'
import { Button } from '@/client/components/Button'

interface Props {
    title: string
    currentArticleId: number
}

const DeleteBtn: FC<Props> = (props) => {
    const { title, currentArticleId } = props
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
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
        const needRemoveTab = resp.data?.deletedArticleIds.map(id => `/article/${id}`) || []
        dispatch(removeTab(needRemoveTab))
    }

    return (<>
        <div className='w-20'>
            <Button
                onClick={() => setShowDeleteDialog(true)}
                className='w-full'
                type='danger'
            >删除</Button>
        </div>

        <Dialog
            visible={showDeleteDialog}
            title={`删除${title}`}
            showCancelButton
            confirmButtonText='删除'
            confirmButtonColor='red'
            cancelButtonText='取消'
            onConfirm={async () => {
                await onDelete()
                setShowDeleteDialog(false)
            }}
            onCancel={() => setShowDeleteDialog(false)}
        >
            <div className='text-center'>删除后笔记将无法恢复，请谨慎操作</div>

            <Checkbox.Group value={deleteChildren ? ['deleteChildren'] : []}>
                <div className='flex justify-center'>
                    删除子笔记 <Checkbox
                        name='deleteChildren'
                        onClick={() => setDeleteChildren(!deleteChildren)}
                    />
                </div>
            </Checkbox.Group>
        </Dialog>
    </>)
}

export default DeleteBtn
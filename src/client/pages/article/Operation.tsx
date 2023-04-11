import { MobileDrawer } from '@/client/components/MobileDrawer'
import { DesktopArea } from '@/client/layouts/Responsive'
import { Button, Col, Row, Space, Tooltip } from 'antd'
import React, { ChangeEventHandler, useRef, useState } from 'react'
import { HeartFilled, FormOutlined, SaveOutlined, StarFilled, RollbackOutlined, LoadingOutlined, DeleteOutlined, LeftOutlined, CloudUploadOutlined } from '@ant-design/icons'
import { useAppSelector } from '@/client/store'
import { useFavoriteArticle } from '@/client/services/article'
import { useSearchParams } from 'react-router-dom'
import { useDelete } from './Delete'
import { ActionButton, ActionIcon } from '@/client/layouts/PageWithAction'
import { uploadFiles } from '@/client/services/file'
import { STATUS_CODE } from '@/config'
import { messageError } from '@/client/utils/message'
import { getFileUrl } from '@/client/components/FileUploaderPlugin'
import { ColorPicker } from '@/client/components/ColorPicker'

interface Props {
    currentArticleId: number
    isEdit: boolean
    title: string
    color: string
    updatingArticle: boolean
    onClickSaveBtn: () => Promise<void>
    onClickExitBtn: () => Promise<void>
    onChangeColor: (color: string) => void
}

export const useOperation = (props: Props) => {
    const { isEdit, title, color, updatingArticle, currentArticleId } = props
    const [searchParams, setSearchParams] = useSearchParams()
    /** 切换收藏状态 */
    const { mutateAsync: updateFavoriteState } = useFavoriteArticle()
    /** 根节点文章 */
    const rootArticleId = useAppSelector(s => s.user.userInfo?.rootArticleId)
    /** 是否展开文章操作 */
    const [isOperationDrawerOpen, setIsOperationDrawerOpen] = useState(false)
    /** 是否收藏 */
    const [isFavorite, setIsFavorite] = useState(false)
    /** 保存按钮的文本 */
    const [saveBtnText, setSaveBtnText] = useState('')
    /** 删除功能 */
    const deleteArticle = useDelete({ title, currentArticleId })
    /** 是否为根节点文章 */
    const isRootArticle = currentArticleId === rootArticleId
    /** 移动端的附件选择器 */
    const fileSelectRef = useRef<HTMLInputElement>(null)
    /** 颜色选择器是否显示 */
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

    /** 进入编辑模式 */
    const startEdit = () => {
        searchParams.set('mode', 'edit')
        setSearchParams(searchParams)
    }

    /** 退出编辑模式 */
    const endEdit = async () => {
        searchParams.delete('mode')
        setSearchParams(searchParams)
        setSaveBtnText('')

        props.onClickExitBtn()
    }

    /** 渲染移动端非编辑时的操作弹窗 */
    const renderOperationDrawer = () => {
        return (
            <MobileDrawer
                title='文章操作'
                open={isOperationDrawerOpen}
                onClose={() => setIsOperationDrawerOpen(false)}
            >
                <Row gutter={[8, 8]}>
                    {!isRootArticle && (
                        <Col span={8}>
                            <Button
                                size="large"
                                block
                                danger
                                onClick={() => deleteArticle.setShowDeleteDialog(true)}
                            >删除</Button>
                        </Col>
                    )}
                    <Col span={isRootArticle ? 12 : 8}>
                        <Button
                            size="large"
                            block
                            onClick={() => setIsColorPickerOpen(true)}
                            className='flex items-center justify-center'
                        >
                            {color && (
                                <div
                                    className='inline-block w-4 h-4 mr-2 rounded-full cursor-pointer'
                                    style={{ backgroundColor: color }}
                                />
                            )}
                            <span>颜色</span>
                        </Button>
                    </Col>
                    <Col span={isRootArticle ? 12 : 8}>
                        <Button
                            size="large"
                            block
                            onClick={() => {
                                updateFavoriteState({ id: currentArticleId, favorite: !isFavorite })
                                setIsFavorite(!isFavorite)
                            }}
                        >
                            {isFavorite
                                ? (<span className='text-red-500'><HeartFilled  /> 已收藏</span>) 
                                : '收藏'
                            }
                        </Button>
                    </Col>
                    <Col span={24}>
                        <Button
                            size="large"
                            block
                            type="primary"
                            onClick={() => {
                                startEdit()
                                setIsOperationDrawerOpen(false)
                            }}
                        >编辑</Button>
                    </Col>
                </Row>
                {deleteArticle.renderDeleteModal()}
                {renderColorPicker()}
            </MobileDrawer>
        )
    }

    /** 选中颜色选择弹窗 */
    const onSelectedColor = (color: string) => {
        setIsColorPickerOpen(false)
        props.onChangeColor(color === '#000' ? '' : color)
    }

    /** 渲染颜色选择弹窗 */
    const renderColorPicker = () => {
        return (
            <ColorPicker
                onChange={onSelectedColor}
                visible={isColorPickerOpen}
                onClose={() => setIsColorPickerOpen(false)}
            />
        )
    }

    /** 渲染桌面端右上角的文章功能按钮 */
    const renderDesktopOperation = () => {
        const SaveIcon = updatingArticle ? LoadingOutlined : SaveOutlined

        return (
            <DesktopArea>
                <Space className='text-xl text-gray-500 flex-shrink-0 ml-4'>
                    {isEdit && (
                        <div className="text-base">{saveBtnText}</div>
                    )}

                    <Tooltip title='设置颜色' placement="bottom">
                        {/* <div
                            className="hover:scale-125 cursor-pointer rounded-full transition-all w-4 h-4 bg-gray-300"
                            style={{ backgroundColor: color }}
                            onClick={() => setIsColorPickerOpen(true)}
                        /> */}
                        <StarFilled
                            className="hover:scale-125 transition-all"
                            style={{ color }}
                            onClick={() => setIsColorPickerOpen(true)}
                        />
                    </Tooltip>

                    <Tooltip title={isFavorite ? '取消收藏' : '收藏'} placement="bottom">
                        <HeartFilled
                            className={'hover:scale-125 transition-all ' + (isFavorite ? 'text-red-500 ' : '')}
                            onClick={() => {
                                updateFavoriteState({ id: currentArticleId, favorite: !isFavorite })
                                setIsFavorite(!isFavorite)
                            }}
                        />
                    </Tooltip>

                    {!isRootArticle && (
                        <Tooltip title='删除' placement="bottom">
                            <DeleteOutlined
                                className="text-xl hover:scale-125 hover:text-red-500 transition-all"
                                onClick={() => deleteArticle.setShowDeleteDialog(true)}
                            />
                        </Tooltip>
                    )}

                    {isEdit ? (<>
                        <Tooltip title="保存" placement="bottom">
                            <SaveIcon
                                className={updatingArticle ? 'cursor-default' : 'hover:scale-125 transition-all'}
                                onClick={props.onClickSaveBtn}
                            />
                        </Tooltip>
                        <Tooltip title="保存并退出" placement="bottomLeft">
                            <RollbackOutlined
                                className="hover:scale-125 transition-all"
                                onClick={endEdit}
                            />
                        </Tooltip>
                    </>) : (
                        <Tooltip title="编辑" placement="bottom">
                            <FormOutlined
                                className="hover:scale-125 transition-all"
                                onClick={startEdit}
                            />
                        </Tooltip>
                    )}
                </Space>
                {deleteArticle.renderDeleteModal()}
                {renderColorPicker()}
            </DesktopArea>
        )
    }

    /** 移动端选中了附件 */
    const onFileSelect: ChangeEventHandler<HTMLInputElement> = async (event) => {
        event.preventDefault()

        const files = event.target.files
        if (!files) return

        const resp = await uploadFiles(files)
        if (resp.code !== STATUS_CODE.SUCCESS || !resp.data) {
            messageError(resp.msg || '上传失败')
            return
        }

        const insertFileText = resp.data.map(getFileUrl).join('\n')

        // 通过 dom 取到 bytemd 内部的 codemirror 实例
        // 然后将上传好的文件链接插入到光标处
        const cm: CodeMirror.Editor = (document.querySelector('.CodeMirror.CodeMirror-wrap') as any)?.CodeMirror
        if (!cm) {
            messageError('获取编辑器失败，无法上传文件')
            return
        }

        cm.replaceSelection(insertFileText)
    }

    /** 渲染移动端在编辑状态下的底部操作栏 */
    const renderMobileEditBar = () => {
        return (<>
            <input
                type="file"
                ref={fileSelectRef}
                style={{ display: 'none' }}
                onChange={onFileSelect}
            ></input>
            <ActionIcon icon={<LeftOutlined />} onClick={endEdit} />
            <ActionIcon icon={<CloudUploadOutlined />} onClick={() => fileSelectRef.current?.click()} />
            <ActionButton onClick={props.onClickSaveBtn} loading={updatingArticle}>保存</ActionButton>
        </>)
    }

    return {
        renderOperationDrawer, renderDesktopOperation, renderMobileEditBar,
        setIsOperationDrawerOpen, setIsFavorite, setSaveBtnText
    }
}
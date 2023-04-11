import React, { FC, useState, useEffect, useRef } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ActionButton, PageContent, PageAction, ActionIcon } from '../../layouts/PageWithAction'
import { useQueryArticleContent, useUpdateArticle } from '../../services/article'
import { useAppDispatch } from '../../store'
import Loading from '../../layouts/Loading'
import Preview from './Preview'
import { useEditor } from './Editor'
import { messageSuccess, messageWarning } from '@/client/utils/message'
import { STATUS_CODE } from '@/config'
import { setCurrentArticle } from '@/client/store/menu'
import { UpdateArticleReqData } from '@/types/article'
import TagArea from './TagArea'
import { blurOnEnter } from '@/client/utils/input'
import dayjs from 'dayjs'
import { SwitcherOutlined, SettingOutlined, SearchOutlined, MenuOutlined } from '@ant-design/icons'
import s from './styles.module.css'
import { useOperation } from './Operation'
import { useMobileMenu } from './Menu'

const About: FC = () => {
    const params = useParams()
    const dispatch = useAppDispatch()
    const [searchParams] = useSearchParams()
    /** 页面是否在编辑中 */
    const isEdit = (searchParams.get('mode') === 'edit')
    /** 当前文章 id */
    const currentArticleId = +(params.articleId as string)
    /** 获取详情 */
    const { data: articleResp, isFetching: isLoadingArticle } = useQueryArticleContent(currentArticleId)
    /** 保存详情 */
    const { mutateAsync: updateArticle, isLoading: updatingArticle } = useUpdateArticle()
    /** 标题是否被修改 */
    const isTitleModified = useRef(false)
    /** 标题输入框 */
    const titleInputRef = useRef<HTMLInputElement>(null)
    /** 正在编辑的标题内容 */
    const [title, setTitle] = useState('')
    /** 本文的颜色 */
    const [color, setColor] = useState('')
    /** 功能 - 导航抽屉 */
    const menu = useMobileMenu({
        currentArticleId
    })

    /** 点击保存按钮必定会触发保存，无论内容是否被修改 */
    const onClickSaveBtn = async () => {
        await saveEdit({ title, content })
    }

    /** 只有在内容变化时，点击退出按钮才会自动保存 */
    const onClickExitBtn = async () => {
        if (isContentModified.current) onClickSaveBtn()
        isContentModified.current = false
    }

    /** 文章相关的操作 */
    const operation = useOperation({
        currentArticleId,
        isEdit,
        title,
        color,
        updatingArticle,
        onChangeColor: (color) => saveEdit({ color }),
        onClickSaveBtn,
        onClickExitBtn,
    })

    /** 功能 - 编辑器 */
    const { renderEditor, setEditorContent, content, isContentModified } = useEditor({
        onAutoSave: () => operation.setSaveBtnText(`自动保存于 ${dayjs().format('HH:mm')}`),
        articleId: currentArticleId
    })

    useEffect(() => {
        dispatch(setCurrentArticle(currentArticleId))
    }, [currentArticleId])

    useEffect(() => {
        if (!articleResp?.data) return

        setTitle(articleResp.data.title)
        setColor(articleResp.data.color || '')
        setEditorContent(articleResp.data.content)
        operation.setIsFavorite(articleResp.data.favorite)
    }, [articleResp])

    const saveEdit = async (data: Partial<UpdateArticleReqData>) => {
        if (data.title === '') {
            messageWarning('标题不能为空')
            return
        }

        const resp = await updateArticle({ ...data, id: currentArticleId })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('保存成功')
        operation.setSaveBtnText('')
    }

    const renderContent = () => {
        if (isLoadingArticle) return <Loading tip='信息加载中...' />

        return (
            <div className="box-border p-4 md:w-full h-full flex flex-col flex-nowrap">
                <div className="flex justify-between items-start">
                    <input
                        ref={titleInputRef}
                        value={title}
                        onChange={e => {
                            setTitle(e.target.value)
                            isTitleModified.current = true
                        }}
                        onKeyUp={blurOnEnter}
                        onBlur={() => {
                            if (isTitleModified.current) saveEdit({ title })
                            isTitleModified.current = false
                        }}
                        placeholder="请输入笔记名"
                        className="font-bold border-0 text-3xl my-2 w-full"
                    />
                    {operation.renderDesktopOperation()}
                </div>

                <TagArea
                    articleId={currentArticleId}
                    value={articleResp?.data?.tagIds || []}
                    disabled={!isEdit}
                />

                {isEdit ? (
                    <div className={[s.editorArea, s.mdArea].join(' ')}>
                        {renderEditor()}
                    </div>
                ) : (
                    <div className={`md:w-[100%] ${s.mdArea}`}>
                        <Preview value={content} />
                    </div>
                )}
            </div>
        )
    }

    const renderActionBar = () => {
        if (isEdit) return operation.renderMobileEditBar()

        return (<>
            {menu.renderMenuDrawer()}
            {operation.renderOperationDrawer()}

            <Link to="/setting">
                <ActionIcon icon={<SettingOutlined />} />
            </Link>
            <Link to="/search">
                <ActionIcon icon={<SearchOutlined />} />
            </Link>
            <ActionIcon icon={<MenuOutlined />} onClick={() => menu.setIsMenuDrawerOpen(true)} />
            <ActionIcon icon={<SwitcherOutlined />} onClick={() => operation.setIsOperationDrawerOpen(true)} />
            <ActionButton onClick={menu.menu.createArticle}>新增</ActionButton>
        </>)
    }

    return (<>
        <PageContent>
            {renderContent()}
        </PageContent>

        <PageAction>
            {renderActionBar()}
        </PageAction>
    </>)
}

export default About
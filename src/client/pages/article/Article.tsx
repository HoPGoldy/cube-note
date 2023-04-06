import React, { FC, useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ActionButton, PageContent, PageAction, ActionIcon } from '../../layouts/PageWithAction'
import { useQueryArticleContent, useFavoriteArticle, useUpdateArticle } from '../../services/article'
import { useAppDispatch, useAppSelector } from '../../store'
import { updateCurrentTab } from '../../store/tab'
import Loading from '../../layouts/Loading'
import Preview from './Preview'
import { useEditor } from './Editor'
import { messageSuccess, messageWarning } from '@/client/utils/message'
import { STATUS_CODE } from '@/config'
import { setCurrentArticle } from '@/client/store/menu'
import DeleteBtn from './DeleteBtn'
import { Space, Tooltip } from 'antd'
import { UpdateArticleReqData } from '@/types/article'
import TagArea from './TagArea'
import { blurOnEnter } from '@/client/utils/input'
import dayjs from 'dayjs'
import { SwitcherOutlined, SettingOutlined, SearchOutlined, MenuOutlined, HeartFilled, EditOutlined, SaveOutlined, RollbackOutlined, LoadingOutlined } from '@ant-design/icons'
import s from './styles.module.css'
import { DesktopArea } from '@/client/layouts/Responsive'

const About: FC = () => {
    const navigate = useNavigate()
    const params = useParams()
    const dispatch = useAppDispatch()
    const [searchParams, setSearchParams] = useSearchParams()
    // 当前文章 id
    const currentArticleId = +(params.articleId as string)
    // 获取详情
    const { data: articleResp, isFetching: isLoadingArticle } = useQueryArticleContent(currentArticleId)
    // 保存详情
    const { mutateAsync: updateArticle, isLoading: updatingArticle } = useUpdateArticle()
    // 切换收藏状态
    const { mutateAsync: updateFavoriteState } = useFavoriteArticle()
    // 根节点文章
    const rootArticleId = useAppSelector(s => s.user.userInfo?.rootArticleId)
    // 保存按钮的文本
    const [saveBtnText, setSaveBtnText] = useState('')
    // 标题是否被修改
    const isTitleModified = useRef(false)
    // 标题输入框
    const titleInputRef = useRef<HTMLInputElement>(null)
    // 正在编辑的标题内容
    const [title, setTitle] = useState('')
    // 当前正文内容
    const [content, setContent] = useState('')
    // 是否收藏
    const [isFavorite, setIsFavorite] = useState(false)
    // 页面是否在编辑中
    const isEdit = (searchParams.get('mode') === 'edit')

    // 功能 - 编辑器
    const { renderEditor, setEditorContent, isContentModified } = useEditor({
        onChange: setContent,
        onAutoSave: () => setSaveBtnText(`自动保存于 ${dayjs().format('HH:mm')}`),
        articleId: currentArticleId
    })

    useEffect(() => {
        dispatch(setCurrentArticle(currentArticleId))
    }, [currentArticleId])

    useEffect(() => {
        if (!articleResp?.data) return

        dispatch(updateCurrentTab({ title: articleResp.data.title }))
        setTitle(articleResp.data.title)
        setContent(articleResp.data.content)
        setEditorContent(articleResp.data.content)
        setIsFavorite(articleResp.data.favorite)
    }, [articleResp])

    const saveEdit = async (data: Partial<UpdateArticleReqData>) => {
        if (data.title === '') {
            messageWarning('标题不能为空')
            return
        }

        const resp = await updateArticle({ ...data, id: currentArticleId })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('保存成功')
        setSaveBtnText('')
        dispatch(updateCurrentTab({ title }))
    }

    const endEdit = async () => {
        searchParams.delete('mode')
        setSearchParams(searchParams)
        setSaveBtnText('')
        // 只有在内容变化时，点击退出按钮才会自动保存
        if (isContentModified.current) onClickSaveBtn()
        isContentModified.current = false
    }

    /** 点击保存按钮必定会触发保存，无论内容是否被修改 */
    const onClickSaveBtn = async () => {
        await saveEdit({ title, content })
    }

    const SaveIcon = updatingArticle ? LoadingOutlined : SaveOutlined

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
                    <DesktopArea>
                        <Space className='text-xl text-gray-500'>
                            {isEdit && (
                                <div className="text-base">{saveBtnText}</div>
                            )}

                            <Tooltip title={isFavorite ? '取消收藏' : '收藏'} placement="bottom">
                                <HeartFilled
                                    className={'hover:scale-125 transition-all ' + (isFavorite ? 'text-red-500 ' : '')}
                                    onClick={() => {
                                        updateFavoriteState({ id: currentArticleId, favorite: !isFavorite })
                                        setIsFavorite(!isFavorite)
                                    }}
                                />
                            </Tooltip>

                            {currentArticleId !== rootArticleId && <DeleteBtn
                                title={title}
                                currentArticleId={currentArticleId}
                            />}

                            {isEdit ? (<>
                                <Tooltip title="保存" placement="bottom">
                                    <SaveIcon
                                        className={updatingArticle ? 'cursor-default' : 'hover:scale-125 transition-all'}
                                        onClick={onClickSaveBtn}
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
                                    <EditOutlined
                                        className="hover:scale-125 transition-all"
                                        onClick={startEdit}
                                    />
                                </Tooltip>
                            )}
                        </Space>
                    </DesktopArea>
                </div>

                <TagArea
                    articleId={currentArticleId}
                    value={articleResp?.data?.tagIds || []}
                    disabled={!isEdit}
                />

                {isEdit ? (
                    <div className={s.editorArea}>
                        {renderEditor()}
                    </div>
                ) : (
                    <div className={'md:w-[100%]'}>
                        <Preview value={content} />
                    </div>
                )}
            </div>
        )
    }

    const startEdit = () => {
        searchParams.set('mode', 'edit')
        setSearchParams(searchParams)
    }

    return (<>
        <PageContent>
            {renderContent()}
        </PageContent>

        <PageAction>
            <ActionIcon icon={<SettingOutlined />} />
            <ActionIcon icon={<SearchOutlined />} />
            <ActionIcon icon={<MenuOutlined />} />
            <ActionIcon icon={<SwitcherOutlined />} />
            <ActionButton onClick={() => navigate(-1)}>新增</ActionButton>
        </PageAction>
    </>)
}

export default About
import React, { FC, useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ActionButton, PageContent, PageAction } from '../../layouts/PageWithAction'
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
import { Star } from '@react-vant/icons'
import { UpdateArticleReqData } from '@/types/article'
import TagArea from './TagArea'
import { blurOnEnter } from '@/client/utils/input'
import { Button } from '@/client/components/Button'
import dayjs from 'dayjs'

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
    const [saveBtnText, setSaveBtnText] = useState('保存')
    // 标题输入框
    const titleInputRef = useRef<HTMLInputElement>(null)
    // 正在编辑的标题内容
    const [title, setTitle] = useState('')
    // 当前正文内容
    const [content, setContent] = useState('')
    // 是否收藏
    const [isFavorite, setIsFavorite] = useState(false)
    // 是否正在编辑标签
    const [isEditTag, setIsEditTag] = useState(false)
    // 页面是否在编辑中
    const isEdit = (searchParams.get('mode') === 'edit')

    // 功能 - 编辑器
    const { renderEditor, setEditorContent } = useEditor({
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
        setSaveBtnText('保存')
        dispatch(updateCurrentTab({ title }))
    }

    const endEdit = async () => {
        searchParams.delete('mode')
        setSearchParams(searchParams)
        setSaveBtnText('保存')
    }

    const onClickSaveBtn = async () => {
        await saveEdit({ title, content })
    }

    const renderContent = () => {
        if (isLoadingArticle) return <Loading tip='信息加载中...' />

        return (
            <div className='px-4 lg:px-auto lg:mx-auto w-full mt-4'>
                <div className="flex mb-2">
                    <input
                        ref={titleInputRef}
                        value={title}
                        disabled={!isEdit}
                        onChange={e => setTitle(e.target.value)}
                        onKeyUp={blurOnEnter}
                        onBlur={() => saveEdit({ title })}
                        placeholder="请输入笔记名"
                        className='font-bold dark:text-slate-200 text-xl bg-inherit mb-4 w-full'
                    />
                    <div className='flex items-center'>
                        <Star
                            className={'mr-2 ' + (updatingArticle ? 'cursor-wait' : 'cursor-pointer')}
                            fontSize="1.5rem"
                            color={isFavorite ? 'yellow' : 'gray'}
                            onClick={() => {
                                updateFavoriteState({ id: currentArticleId, favorite: !isFavorite })
                                setIsFavorite(!isFavorite)
                            }}
                        />
                        {currentArticleId !== rootArticleId && <DeleteBtn
                            title={title}
                            currentArticleId={currentArticleId}
                        />}

                        <div className='ml-2 flex'>
                            {isEdit ? (<>
                                <Button className='w-60 !mr-2' onClick={onClickSaveBtn}>
                                    {updatingArticle ? '保存中' : saveBtnText}
                                </Button>
                                <Button className='w-40' onClick={endEdit}>
                                    退出编辑
                                </Button>
                            </>) : (
                                <Button className='w-40' onClick={startEdit}>编辑</Button>
                            )}
                        </div>
                    </div>
                </div>

                <TagArea
                    articleId={currentArticleId}
                    value={articleResp?.data?.tagIds || []}
                    editing={isEditTag}
                    onEditFinish={setIsEditTag}
                />

                <div className='flex md:flex-row flex-col flex-nowrap'>
                    {isEdit ? (
                        <div className='md:w-[100%]'>
                            {renderEditor()}
                        </div>
                    ) : (
                        <div className={'md:w-[100%]'}>
                            <Preview value={content} />
                        </div>
                    )}
                </div>
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
            <ActionButton onClick={() => navigate(-1)}>返回</ActionButton>
        </PageAction>
    </>)
}

export default About
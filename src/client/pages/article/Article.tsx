import React, { FC, useState, useEffect, useMemo, useRef } from 'react'
import throttle from 'lodash/throttle'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ActionButton, PageContent, PageAction } from '../../layouts/PageWithAction'
import { useGetArticleContentQuery, useUpdateArticleMutation } from '../../services/article'
import { useAppDispatch, useAppSelector } from '../../store'
import { updateCurrentTab } from '../../store/tab'
import Loading from '../../layouts/Loading'
import Preview from './Preview'
import Editor from './Editor'
import { messageSuccess, messageWarning } from '@/client/utils/message'
import { STATUS_CODE } from '@/config'
import { setCurrentArticle } from '@/client/store/menu'
import DeleteBtn from './DeleteBtn'
import { Star } from '@react-vant/icons'
import { UpdateArticleReqData } from '@/types/article'
import TagArea from './TagArea'
import { blurOnEnter } from '@/client/utils/input'
import { Button } from '@/client/components/Button'
import { useAutoSave } from './AutoSave'
import { useUpload } from './Upload'

const About: FC = () => {
    const navigate = useNavigate()
    const params = useParams()
    const dispatch = useAppDispatch()
    const [searchParams, setSearchParams] = useSearchParams()
    // 当前文章 id
    const currentArticleId = params.articleId as string
    // 获取详情
    const { data: articleResp, isFetching: isLoadingArticle } = useGetArticleContentQuery(currentArticleId)
    // 保存详情
    const [updateArticle, { isLoading: updatingArticle }] = useUpdateArticleMutation()
    // 根节点文章
    const rootArticleId = useAppSelector(s => s.user.userInfo?.rootArticleId)
    // 保存按钮的文本
    const [saveBtnText, setSaveBtnText] = useState('保存')
    // 标题输入框
    const titleInputRef = useRef<HTMLInputElement>(null)
    // 正在编辑的标题内容
    const [title, setTitle] = useState('')
    // 正在编辑的文本内容
    const [content, setContent] = useState('')
    // 是否收藏
    const [isFavorite, setIsFavorite] = useState(false)
    // 渲染的内容
    const [visibleContent, setVisibleContent] = useState('')
    // 是否正在编辑标签
    const [isEditTag, setIsEditTag] = useState(false)
    // 页面是否在编辑中
    const isEdit = (searchParams.get('mode') === 'edit')
    // 功能 - 自动保存
    const { saveToLocal, getLocalSaveContent, contentRef } = useAutoSave(isEdit, currentArticleId, setSaveBtnText)
    // 功能 - 附件上传
    const { upload } = useUpload()

    // 编辑时的节流
    const onContentChangeThrottle = useMemo(() => throttle(newContent => {
        setVisibleContent(newContent)
        if (contentRef.current) saveToLocal(newContent)
        contentRef.current = newContent
    }, 500), [])

    useEffect(() => {
        if (content === null) return
        onContentChangeThrottle(content)
    }, [content])


    useEffect(() => {
        dispatch(setCurrentArticle(currentArticleId))
    }, [currentArticleId])

    useEffect(() => {
        if (!articleResp?.data) return

        // 获取本地数据
        const localData = getLocalSaveContent()
        // 本地没有，直接使用接口数据
        if (!localData) setContent(articleResp.data.content)
        // 本地有数据，比较两者，谁新用谁
        else {
            const newContent = localData.saveDate > articleResp.data.updateTime
                ? localData.content
                : articleResp.data.content
            setContent(newContent)
        }

        dispatch(updateCurrentTab({ title: articleResp.data.title }))
        setTitle(articleResp.data.title)
        setVisibleContent(articleResp.data.content)
        setIsFavorite(articleResp.data.favorite)
    }, [articleResp])

    const saveEdit = async (data: Partial<UpdateArticleReqData>) => {
        if (data.title === '') {
            messageWarning('标题不能为空')
            return
        }

        const resp = await updateArticle({ ...data, id: currentArticleId }).unwrap()
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
        await saveEdit({ title, content, favorite: isFavorite })
    }

    const onUploadFile = async (files: File[]) => {
        console.log('🚀 ~ file: Article.tsx:117 ~ onUploadFile ~ files', files)
        upload(files)
    }

    const renderContent = () => {
        if (isLoadingArticle) return <Loading tip='信息加载中...' />

        return (
            <div className='px-4 lg:px-auto lg:mx-auto w-full lg:w-4/5 mt-4'>
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
                                saveEdit({ favorite: !isFavorite })
                                setIsFavorite(!isFavorite)
                            }}
                        />
                        {currentArticleId !== rootArticleId && <DeleteBtn
                            title={title}
                            currentArticleId={currentArticleId}
                        />}

                        <div className='ml-2 flex' >
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
                    {isEdit && (
                        <div className='md:w-[50%]'>
                            <Editor
                                value={content}
                                onChange={setContent}
                                onUploadFile={onUploadFile}
                            />
                        </div>
                    )}

                    <div className='md:w-[50%]'>
                        <Preview value={visibleContent} />
                    </div>

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
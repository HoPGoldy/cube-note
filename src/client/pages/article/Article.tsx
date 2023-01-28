import React, { FC, useState, useEffect, useMemo, useRef } from 'react'
import throttle from 'lodash/throttle'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ActionButton, PageContent, PageAction } from '../../layouts/PageWithAction'
import { useAddArticleMutation, useDeleteArticleMutation, useLazyGetArticleContentQuery, useUpdateArticleMutation } from '../../services/article'
import { useAppDispatch, useAppSelector } from '../../store'
import { removeTab, updateCurrentTabTitle } from '../../store/tab'
import Loading from '../../layouts/Loading'
import { DesktopArea } from '../../layouts/Responsive'
import Preview from './Preview'
import Editor from './Editor'
import { messageInfo, messageSuccess, messageWarning } from '@/client/utils/message'
import { STATUS_CODE } from '@/config'
import { setCurrentArticle } from '@/client/store/menu'
import DeleteBtn from './DeleteBtn'

const About: FC = () => {
    const navigate = useNavigate()
    const params = useParams()
    const dispatch = useAppDispatch()
    const [searchParams, setSearchParams] = useSearchParams()
    // 获取详情
    const [fetchArticle, {data: articleResp, isLoading}] = useLazyGetArticleContentQuery()
    // 保存详情
    const [updateArticle, { isLoading: updatingArticle }] = useUpdateArticleMutation()
    // 根节点文章
    const rootArticleId = useAppSelector(s => s.user.userInfo?.rootArticleId)
    // 标题输入框
    const titleInputRef = useRef<HTMLInputElement>(null)
    // 正在编辑的标题内容
    const [title, setTitle] = useState('')
    // 正在编辑的文本内容
    const [content, setContent] = useState('')
    // 渲染的内容
    const [visibleContent, setVisibleContent] = useState('')
    // 编辑时的节流
    const onContentChangeThrottle = useMemo(() => throttle(setVisibleContent, 500), [])
    // 页面是否在编辑中
    const isEdit = (searchParams.get('mode') === 'edit')
    // 当前文章 id
    const currentArticleId = params.articleId as string

    useEffect(() => {
        onContentChangeThrottle(content)
    }, [content, onContentChangeThrottle])

    useEffect(() => {
        if (!currentArticleId) {
            return
        }
        fetchArticle(currentArticleId)
        dispatch(setCurrentArticle(currentArticleId))
    }, [currentArticleId])

    useEffect(() => {
        if (!articleResp?.data) return

        dispatch(updateCurrentTabTitle(articleResp.data.title))
        setTitle(articleResp.data.title)
        setContent(articleResp.data.content)
        setVisibleContent(articleResp.data.content)
    }, [articleResp])

    const saveEdit = async () => {
        if (!title) {
            messageWarning('标题不能为空')
            return
        }

        const resp = await updateArticle({ id: currentArticleId, title, content }).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('保存成功')
        dispatch(updateCurrentTabTitle(title))
    }

    const endEdit = async () => {
        searchParams.delete('mode')
        setSearchParams(searchParams)
    }

    const renderContent = () => {
        if (isLoading) return <Loading tip='信息加载中...' />

        return (
            <div className='px-4 lg:px-auto lg:mx-auto w-full lg:w-3/4 xl:w-1/2 2xl:w-1/3 mt-4'>
                <div className="flex">
                    <input
                        ref={titleInputRef}
                        value={title}
                        disabled={!isEdit}
                        onChange={e => setTitle(e.target.value)}
                        onKeyUp={e => e.key === 'Enter' && titleInputRef.current?.blur()}
                        onBlur={saveEdit}
                        placeholder="请输入笔记名"
                        className='font-bold dark:text-slate-200 text-xl bg-inherit mb-4 w-full'
                    />
                    {currentArticleId !== rootArticleId && <DeleteBtn
                        title={title}
                        currentArticleId={currentArticleId}
                    />}
                </div>

                <div className='flex md:flex-row flex-col flex-nowrap'>
                    {isEdit && (
                        <div className='md:w-[50%]'>
                            <Editor value={content} onChange={setContent} />
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

        <DesktopArea>
            <div className='fixed bottom-0 right-0 m-4'>
                {isEdit ? (
                    <div className='cursor-pointer' onClick={async () => {
                        await saveEdit()
                        await endEdit()
                    }}>
                        保存
                    </div>
                ) : (<>
                    <div className='cursor-pointer' onClick={startEdit}>
                        编辑
                    </div>
                </>)}
            </div>
        </DesktopArea>
    </>)
}

export default About
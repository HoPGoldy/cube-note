import React, { FC, useState, useEffect, useMemo, useRef } from 'react'
import throttle from 'lodash/throttle'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ActionButton, PageContent, PageAction } from '../../layouts/PageWithAction'
import { useGetArticleContentQuery, useUpdateArticleMutation } from '../../services/article'
import { useAppDispatch, useAppSelector } from '../../store'
import { updateCurrentTabTitle } from '../../store/tab'
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

const About: FC = () => {
    const navigate = useNavigate()
    const params = useParams()
    const dispatch = useAppDispatch()
    const [searchParams, setSearchParams] = useSearchParams()
    // 当前文章 id
    const currentArticleId = params.articleId as string
    // 获取详情
    const { data: articleResp, isLoading } = useGetArticleContentQuery(currentArticleId)
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
    // 是否收藏
    const [isFavorite, setIsFavorite] = useState(false)
    // 渲染的内容
    const [visibleContent, setVisibleContent] = useState('')
    // 编辑时的节流
    const onContentChangeThrottle = useMemo(() => throttle(setVisibleContent, 500), [])
    // 页面是否在编辑中
    const isEdit = (searchParams.get('mode') === 'edit')
    // 是否正在编辑标签
    const [isEditTag, setIsEditTag] = useState(false)

    useEffect(() => {
        onContentChangeThrottle(content)
    }, [content])

    useEffect(() => {
        dispatch(setCurrentArticle(currentArticleId))
    }, [currentArticleId])

    useEffect(() => {
        if (!articleResp?.data) return

        dispatch(updateCurrentTabTitle(articleResp.data.title))
        setTitle(articleResp.data.title)
        setContent(articleResp.data.content)
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
        dispatch(updateCurrentTabTitle(title))
    }

    const endEdit = async () => {
        searchParams.delete('mode')
        setSearchParams(searchParams)
    }

    const onClickSaveBtn = async () => {
        await saveEdit({ title, content, favorite: isFavorite })
        await endEdit()
    }

    const renderContent = () => {
        if (isLoading) return <Loading tip='信息加载中...' />

        return (
            <div className='px-4 lg:px-auto lg:mx-auto w-full lg:w-3/4 xl:w-1/2 2xl:w-1/3 mt-4'>
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

                        <div className='w-20 ml-2' >
                            {isEdit ? (
                                <Button className='w-full' onClick={onClickSaveBtn}>保存</Button>
                            ) : (
                                <Button className='w-full' onClick={startEdit}>编辑</Button>
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

        {/* <DesktopArea>
            <div className='fixed bottom-0 right-0 m-4'>
                {isEdit ? (
                    <div className='cursor-pointer' onClick={onClickSaveBtn}>
                        保存
                    </div>
                ) : (<>
                    <div className='cursor-pointer' onClick={startEdit}>
                        编辑
                    </div>
                </>)}
            </div>
        </DesktopArea> */}
    </>)
}

export default About
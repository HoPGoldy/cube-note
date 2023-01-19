import React, { FC, useState, useEffect, useMemo } from 'react'
import throttle from 'lodash/throttle'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ActionButton, PageContent, PageAction } from '../../layouts/PageWithAction'
import { useGetArticleContentQuery, useUpdateArticleMutation } from '../../services/article'
import { useAppDispatch } from '../../store'
import { setTabTitle } from '../../store/tab'
import Loading from '../../layouts/Loading'
import { DesktopArea } from '../../layouts/Responsive'
import Preview from './Preview'
import Editor from './Editor'

const About: FC = () => {
    const navigate = useNavigate()
    const params = useParams()
    const dispatch = useAppDispatch()
    const [searchParams, setSearchParams] = useSearchParams()
    // 获取详情
    const {data: articleResp, isLoading} = useGetArticleContentQuery(params.articleId as string)
    // 保存详情
    const [updateArticle, { isLoading: updatingArticle }] = useUpdateArticleMutation()
    // 正在编辑的文本内容
    const [content, setContent] = useState('')
    // 渲染的内容
    const [visibleContent, setVisibleContent] = useState('')
    // 编辑时的节流
    const onContentChangeThrottle = useMemo(() => throttle(setVisibleContent, 1000), [])
    // 页面是否在编辑中
    const isEdit = searchParams.get('mode') === 'edit'

    useEffect(() => {
        onContentChangeThrottle(content)
    }, [content, onContentChangeThrottle])

    useEffect(() => {
        if (!articleResp?.data) return
        
        dispatch(setTabTitle({
            title: articleResp.data.title,
            path: `/article/${params.articleId}`
        }))
        setContent(visibleContent)
        setVisibleContent(articleResp.data.content)
    }, [articleResp])

    const renderContent = () => {
        if (isLoading) return <Loading tip='信息加载中...' />

        return (
            <div className='px-4 lg:px-auto lg:mx-auto w-full lg:w-3/4 xl:w-1/2 2xl:w-1/3 mt-4'>
                <div>
                    {articleResp?.data?.title}
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

    const saveEdit = () => {
        searchParams.delete('mode')
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
                    <div className='cursor-pointer' onClick={saveEdit}>
                        保存
                    </div>
                ) : (
                    <div className='cursor-pointer' onClick={startEdit}>
                        编辑
                    </div>
                )}
            </div>
        </DesktopArea>
    </>)
}

export default About
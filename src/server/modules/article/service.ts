import { AppTheme, UserStorage, LoginSuccessResp } from '@/types/user'
import { AppResponse } from '@/types/global'
import { STATUS_CODE } from '@/config'
import { sha } from '@/utils/crypto'
import { LoginLocker } from '@/server/lib/LoginLocker'
import { nanoid } from 'nanoid'
import { Collection, ObjectId, WithId } from 'mongodb'
import { AddArticlePostData, ArticleStorage } from '@/types/article'

interface Props {
    getArticleCollection: () => Collection<ArticleStorage>
}

export const createService = (props: Props) => {
    const {
        getArticleCollection
    } = props

    /**
     * 添加文章
     */
    const addArticle = async (title: string, content: string, parentId?: string) => {
        const articleCollection = getArticleCollection()
        const parentArticleId = parentId ? new ObjectId(parentId) : null
        let parentArticle: WithId<ArticleStorage> | null = null
        if (parentId) {
            const _id = new ObjectId(parentId)
            parentArticle = await articleCollection.findOne({ _id })
            if (!parentArticle) {
                return { code: 400, msg: '父条目不存在' }
            }
        }

        const newArticle = await articleCollection.insertOne({
            title,
            content,
            createTime: Date.now(),
            updateTime: Date.now(),
            parentArticleId: parentId,
            childrenArticleIds: [],
            relatedArticleIds: [],
            tagIds: [],
        })

        if (parentArticleId && parentArticle) {
            await articleCollection.updateOne({ _id: parentArticleId }, { $set: {
                childrenArticleIds: [...parentArticle.childrenArticleIds, newArticle.insertedId.toString()]
            } })
        }

        return { code: 200, data: newArticle.insertedId.toString() }
    }

    /**
     * 删除文章
     */
    const removeArticle = async (id: string) => {

    }

    const updateArticle = async (id: string, detail: Partial<AddArticlePostData>) => {
        const articleCollection = getArticleCollection()
        const _id = new ObjectId(id)
        const article = await articleCollection.findOne({ _id })
        if (!article) {
            return { code: 400, msg: '文章不存在' }
        }

        await articleCollection.updateOne({ _id }, { $set: {
            title: detail.title || article.title,
            content: detail.content || article.content,
            parentArticleId: detail.parentId ? detail.parentId : article.parentArticleId,
            updateTime: Date.now()
        } })

        return { code: 200 }
    }

    const getArticleContent = async (id: string) => {
        const articleCollection = getArticleCollection()
        const _id = new ObjectId(id)
        const article = await articleCollection.findOne(
            { _id },
            {
                projection: {
                    childrenArticleIds: 0,
                    relatedArticleIds: 0,
                    parentArticleId: 0
                }
            }
        )
        if (!article) {
            return { code: 400, msg: '文章不存在' }
        }

        return { code: 200, data: article }
    }

    return { addArticle, getArticleContent, updateArticle }
}

export type ArticleService = ReturnType<typeof createService>
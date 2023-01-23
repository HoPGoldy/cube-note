import { Collection, ObjectId, WithId } from 'mongodb'
import { AddArticlePostData, ArticleLinkResp, ArticleMenuItem, ArticleStorage, ArticleTreeNode } from '@/types/article'
import { cloneDeep } from 'lodash'

interface Props {
    getArticleCollection: () => Collection<ArticleStorage>
}

export const createService = (props: Props) => {
    const {
        getArticleCollection
    } = props

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

        const parentArticleIds = parentArticle ? cloneDeep(parentArticle.parentArticleIds) : []
        if (parentId) parentArticleIds.push(parentId)

        const newArticle = await articleCollection.insertOne({
            title,
            content,
            createTime: Date.now(),
            updateTime: Date.now(),
            parentArticleIds,
            relatedArticleIds: [],
            tagIds: [],
        })

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

        const parentArticleIds = cloneDeep(article.parentArticleIds)
        if (detail.parentId) {
            parentArticleIds.pop()
            parentArticleIds.push(detail.parentId)
        }

        await articleCollection.updateOne({ _id }, { $set: {
            title: detail.title || article.title,
            content: detail.content || article.content,
            parentArticleIds,
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

    const getArticleLink = async (id: string) => {
        const articleCollection = getArticleCollection()
        const _id = new ObjectId(id)
        const article = await articleCollection.findOne({ _id })
        if (!article) {
            return { code: 400, msg: '文章不存在' }
        }

        const targetArticleIds = [
            ...article.parentArticleIds,
            id
        ]

        const queryPromises = [
            articleCollection.find({
                parentArticleIds: { $eq: targetArticleIds }
            }, {
                projection: { title: 1 }
            }).toArray(),
            articleCollection.find({
                _id: { $all: article.relatedArticleIds }
            }, {
                projection: { title: 1 }
            }).toArray()
        ]

        const [childrenArticles, relatedArticles] = await Promise.all(queryPromises)

        console.log('relatedArticles', relatedArticles)

        const formatItem = (item: WithId<ArticleStorage>) => ({
            title: item.title,
            _id: item._id.toString(),
        })

        const data: ArticleLinkResp = {
            childrenArticles: childrenArticles.map(formatItem),
            relatedArticles: relatedArticles.map(formatItem),
        }

        return { code: 200, data }
    }

    const arrayToTree = (rootId: string, data: WithId<ArticleStorage>[]) => {
        if (!data || data.length <= 0) return []
        const cache = new Map<string, ArticleTreeNode>()
        const roots: ArticleTreeNode[] = []

        data.forEach(item => {
            const newItem: ArticleTreeNode = { label: item.title, key: item._id.toString() }
            if (item.parentArticleIds.length === 1 && item.parentArticleIds[0] === rootId) {
                roots.push(newItem)
            }

            cache.set(newItem.key.toString(), newItem)

            const parent = cache.get(item.parentArticleIds[item.parentArticleIds.length - 1])
            if (parent) {
                if (!parent.children) parent.children = []
                parent.children.push(newItem)
            }
        })

        return roots
    }

    /**
     * 查询文章树
     * @param rootId 根节点的id
     */
    const getArticleTree = async (rootId: string) => {
        const articleCollection = getArticleCollection()
        // 查询 parentArticleIds 包含 rootId 的文章
        const articles = await articleCollection.find({
            parentArticleIds: {
                $elemMatch: { $eq: rootId }
            }
        }, {
            projection: {
                title: 1, parentArticleIds: 1
            }
        }).toArray()

        return { code: 200, data: arrayToTree(rootId, articles) }
    }

    return { addArticle, getArticleContent, updateArticle, getArticleLink, getArticleTree }
}

export type ArticleService = ReturnType<typeof createService>
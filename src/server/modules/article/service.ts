import { Filter, ObjectId, RootFilterOperators, WithId } from 'mongodb'
import { ArticleDeleteResp, ArticleLinkResp, ArticleMenuItem, ArticleRelatedResp, ArticleStorage, ArticleTreeNode, ArticleUpdateResp, QueryArticleReqData, UpdateArticleReqData } from '@/types/article'
import { cloneDeep, isNil } from 'lodash'
import { DatabaseAccessor } from '@/server/lib/mongodb'

interface Props {
    db: DatabaseAccessor
}

export const createService = (props: Props) => {
    const {
        getArticleCollection,
    } = props.db

    const addArticle = async (title: string, content: string, parentId?: string) => {
        const articleCollection = getArticleCollection()
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
            favorite: false
        })

        return { code: 200, data: newArticle.insertedId.toString() }
    }

    /**
     * 删除文章
     */
    const removeArticle = async (id: string, force: boolean) => {
        const articleCollection = getArticleCollection()
        const _id = new ObjectId(id)
        const article = await articleCollection.findOne({ _id })
        if (!article) {
            return { code: 200 }
        }

        const childrenArticles = await articleCollection.find({
            parentArticleIds: {
                $elemMatch: { $eq: id }
            }
        }, {
            projection: { title: 1 }
        }).toArray()

        const deleteIds = [_id]

        if (childrenArticles.length > 0) {
            if (!force) return { code: 400, msg: '包含子条目，无法删除' }
            deleteIds.push(...childrenArticles.map(item => item._id))
        }

        await articleCollection.deleteMany({
            _id: { $in: deleteIds }
        })

        const data: ArticleDeleteResp = {
            parentArticleId: article.parentArticleIds[article.parentArticleIds.length - 1],
            deletedArticleIds: deleteIds.map(item => item.toString()),
        }

        // 返回父级文章 id，删除后会跳转至这个文章
        return { code: 200, data }
    }

    const updateArticle = async (detail: UpdateArticleReqData) => {
        const articleCollection = getArticleCollection()
        const _id = new ObjectId(detail.id)
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
            relatedArticleIds: detail.relatedArticleIds || article.relatedArticleIds,
            favorite: isNil(detail.favorite) ? article.favorite : detail.favorite,
            tagIds: detail.tagIds || article.tagIds,
            updateTime: Date.now()
        } })

        const data: ArticleUpdateResp = {
            parentArticleId: parentArticleIds[parentArticleIds.length - 1],
        }

        return { code: 200, data }
    }

    const getArticleList = async (query: QueryArticleReqData) => {
        const collection = getArticleCollection()
        const { page = 1, tagIds, keyword } = query

        const filterObj: Filter<ArticleStorage> & RootFilterOperators<ArticleStorage> = {}
        if (tagIds && tagIds.length > 0) {
            filterObj.tagIds = { $elemMatch: { $in: tagIds } }
        }
        if (keyword) {
            filterObj.$or = [
                { title: { $regex: keyword } },
                { content: { $regex: keyword } }
            ]
        }

        const result = await collection
            .find(filterObj, {
                projection: { content: 1, title: 1, updateTime: 1, favorite: 1, tagIds: 1 }
            })
            .sort({ updateTime: -1 })
            .skip((page - 1) * 15)
            .limit(15)
            .toArray()

        const data = result.map(item =>  {
            let content = ''
            // 截取正文中关键字前后的内容
            if (keyword) {
                const matched = item.content.match(new RegExp(keyword, 'i'))
                if (matched && matched.index) {
                    content = item.content.slice(Math.max(matched.index - 30, 0), matched.index + 30)
                }
            }
            if (!content) content = item.content.slice(0, 30)

            return { ...item, content }
        })

        return { code: 200, data }
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

    const formatArticleListItem = (item: WithId<ArticleStorage>) => ({
        title: item.title,
        _id: item._id.toString(),
    })

    // 获取子代的文章列表（也会包含父级文章）
    const getChildren = async (id: string) => {
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

        const parentArticleId = article.parentArticleIds[article.parentArticleIds.length - 1]

        const queryPromises: [
            Promise<WithId<ArticleStorage>[]>,
            Promise<WithId<ArticleStorage> | null>
        ] = [
            articleCollection.find({
                parentArticleIds: { $eq: targetArticleIds }
            }, {
                projection: { title: 1 }
            }).toArray(),
            articleCollection.findOne({
                _id: new ObjectId(parentArticleId)
            }, {
                projection: { title: 1 }
            })
        ]

        const [childrenArticles, parentArticle] = await Promise.all(queryPromises)

        const data: ArticleLinkResp = {
            parentArticleId: parentArticleId,
            parentArticleTitle: parentArticle?.title || '',
            childrenArticles: childrenArticles.map(formatArticleListItem),
        }

        return { code: 200, data }
    }

    // 获取相关的文章列表
    const getRelatives = async (id: string) => {
        const articleCollection = getArticleCollection()
        const _id = new ObjectId(id)
        const article = await articleCollection.findOne({ _id })
        if (!article) {
            return { code: 400, msg: '文章不存在' }
        }

        const relatedArticles = await articleCollection.find({
            _id: { $in: article.relatedArticleIds.map(id => new ObjectId(id)) }
        }, {
            projection: { title: 1 }
        }).toArray()

        const data: ArticleRelatedResp = {
            relatedArticles: relatedArticles.map(formatArticleListItem),
        }

        return { code: 200, data }
    }

    const arrayToTree = (rootId: string, data: WithId<ArticleStorage>[]) => {
        if (!data || data.length <= 0) return []
        const cache = new Map<string, ArticleTreeNode>()
        const roots: ArticleTreeNode[] = []

        data.forEach(item => {
            const newItem: ArticleTreeNode = { title: item.title, value: item._id.toString() }
            if (item.parentArticleIds.length === 1 && item.parentArticleIds[0] === rootId) {
                roots.push(newItem)
            }

            cache.set(newItem.value, newItem)

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

    const getFavoriteArticles = async () => {
        const articleCollection = getArticleCollection()
        const articles = await articleCollection.find({
            favorite: true
        }, {
            projection: { title: 1 }
        }).toArray()

        const data: ArticleMenuItem[] = articles.map(formatArticleListItem)
        return { code: 200, data }
    }

    return {
        addArticle, getArticleContent, updateArticle, getChildren, getRelatives, getArticleTree, removeArticle,
        getFavoriteArticles, getArticleList
    }
}

export type ArticleService = ReturnType<typeof createService>
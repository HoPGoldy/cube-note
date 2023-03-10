import {
    ArticleContent, ArticleStorage, ArticleDeleteResp, QueryArticleReqData, UpdateArticleReqData,
    ArticleTreeNode, ArticleLinkResp, ArticleRelatedResp, SetArticleRelatedReqData
} from '@/types/article'
import { DatabaseAccessor } from '@/server/lib/sqlite'
import { appendIdToPath, arrayToPath, getParentIdByPath, pathToArray, replaceParentId } from '@/utils/parentPath'
import { TABLE_NAME } from '@/constants'

interface Props {
    db: DatabaseAccessor
}

export const createService = (props: Props) => {
    const { db } = props

    /**
     * 把数据库中的数据格式化成前端需要的格式
     */
    const formatArticle = (article: ArticleStorage & { favoriteId?: number }): ArticleContent => {
        const { parentPath, tagIds, favoriteId, ...rest } = article

        const fontendArticle = {
            ...rest,
            parentArticleId: getParentIdByPath(parentPath),
            favorite: !!favoriteId,
            tagIds: tagIds ? pathToArray(tagIds) : []
        }

        return fontendArticle
    }

    const addArticle = async (title: string, content: string, userId: number, parentId?: number) => {
        let parentArticle: ArticleStorage | undefined
        if (parentId) {
            const detail = await db.article().select().where('id', parentId).first()
            parentArticle = detail
            if (!parentArticle) return { code: 400, msg: '父条目不存在' }
        }

        const newArticle: Omit<ArticleStorage, 'id'> = {
            title,
            content,
            createUserId: userId,
            createTime: Date.now(),
            updateTime: Date.now(),
            parentPath: (parentArticle && parentId) ? appendIdToPath(parentArticle.parentPath, parentId) : ''
        }

        const [id] = await db.article().insert(newArticle)
        return { code: 200, data: id }
    }

    const setFavorite = async (favorite: boolean, articleId: number, userId: number) => {
        const article = await db.article().select().where('id', articleId).first()
        if (!article) return { code: 400, msg: '文章不存在' }

        if (favorite) {
            await db.favoriteArticle().insert({ articleId, userId })
        }
        else {
            await db.favoriteArticle().delete().where({ articleId, userId })
        }

        return { code: 200 }
    }

    /**
     * 删除文章
     */
    const removeArticle = async (id: number, force: boolean) => {
        const removedArticle = await db.article().select().where('id', id).first()
        if (!removedArticle) return { code: 200 }

        const childrenArticles = await db.article().select().whereLike({ parentPath: `%#${id}#%` })

        const deleteIds = [id]
        if (childrenArticles.length > 0) {
            if (!force) return { code: 400, msg: '包含子条目，无法删除' }
            deleteIds.push(...childrenArticles.map(item => item.id))
        }

        const parentId = getParentIdByPath(removedArticle.parentPath)

        const data: ArticleDeleteResp = {
            // 返回父级文章 id，删除后会跳转至这个文章
            parentArticleId: parentId ? +parentId : undefined,
            deletedArticleIds: deleteIds,
        }

        return { code: 200, data }
    }

    const updateArticle = async (detail: UpdateArticleReqData) => {
        const { id, tagIds, parentArticleId, ...restDetail } = detail
        const oldArticle = await db.article().select().where({ id }).first()
        if (!oldArticle) return { code: 400, msg: '文章不存在' }

        const newArticle: Partial<ArticleStorage> = {
            ...oldArticle,
            ...restDetail,
            updateTime: Date.now(),
        }

        if (parentArticleId) {
            newArticle.parentPath = replaceParentId(oldArticle.parentPath, parentArticleId)
        }

        if (tagIds) {
            newArticle.tagIds = arrayToPath(tagIds)
        }

        await db.article().update(newArticle).where({ id })

        return { code: 200 }
    }

    const getArticleList = async (reqData: QueryArticleReqData) => {
        const { page = 1, tagIds, keyword } = reqData
        const query = db.article().select()

        if (keyword) {
            query.whereLike('title', `%${keyword}%`)
                .andWhereLike('content', `%${keyword}%`)
        }

        if (tagIds) {
            tagIds.forEach(tagId => {
                query.andWhereLike('tagIds', `%#${tagId}#%`)
            })
        }

        const result = await query
            .orderBy('updateTime', 'desc')
            .limit(15)
            .offset((page - 1) * 15)

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

            const tagIds = item.tagIds ? pathToArray(item.tagIds) : []

            return {
                id: item.id,
                title: item.title,
                updateTime: item.updateTime,
                tagIds,
                content,
            }
        })

        return { code: 200, data }
    }

    const getArticleContent = async (id: number, userId: number) => {
        const article = await db.article()
            .select('articles.*')
            .select('favorites.id as favoriteId')
            .leftJoin(db.knex.raw(`${TABLE_NAME.FAVORITE} ON articles.id = favorites.articleId AND favorites.userId = ?`, [userId]))
            .where('articles.id', id)
            .first()

        if (!article) return { code: 400, msg: '文章不存在' }

        return { code: 200, data: formatArticle(article) }
    }

    // 获取子代的文章列表（也会包含父级文章）
    const getChildren = async (id: number) => {
        const article = await db.article().select().where('id', id).first()
        if (!article) return { code: 400, msg: '文章不存在' }

        const query = db.article().select('id', 'title', 'parentPath').whereLike('parentPath', `%#${id}#`)
        // 如果有父级文章，就把父级文章也查出来
        const parentId = getParentIdByPath(article.parentPath)
        if (parentId) query.orWhere('id', parentId)

        const data: ArticleLinkResp = {
            parentArticleId: -1,
            parentArticleTitle: '',
            childrenArticles: [],
        }

        const matchedArticles = await query
        // 因为父级是跟子级一起查出来的，所以这里要筛一下
        data.childrenArticles = matchedArticles.filter(item => {
            if (item.id !== parentId) return true
            data.parentArticleId = item.id
            data.parentArticleTitle = item.title
            return false
        })

        return { code: 200, data }
    }

    // 获取相关的文章列表
    const getRelatives = async (id: string, userId: number) => {
        const relatedArticles = await db.articleRelation()
            .select('articles.id', 'articles.title')
            .leftJoin(db.knex.raw(`${TABLE_NAME.ARTICLE} ON articleRelations.toArticleId = articles.id`))
            .where('articleRelations.fromArticleId', id)
            .andWhere('articleRelations.userId', userId)

        const data: ArticleRelatedResp = { relatedArticles }
        return { code: 200, data }
    }

    /**
     * 关联文章 / 解除关联
     **/
    const setArticleRelate = async (data: SetArticleRelatedReqData, userId: number) => {
        const { fromArticleId, toArticleId, link } = data

        if (link) {
            await db.articleRelation()
                .insert({ fromArticleId, toArticleId, userId })
        }
        else {
            await db.articleRelation()
                .delete()
                .where({ fromArticleId, toArticleId, userId })
        }

        return { code: 200 }
    }

    const arrayToTree = (rootId: number, data: ArticleStorage[]) => {
        if (!data || data.length <= 0) return []
        const cache = new Map<string, ArticleTreeNode>()
        const roots: ArticleTreeNode[] = []

        const rootPath = `#${rootId}#`

        data.forEach(item => {
            const newItem: ArticleTreeNode = { title: item.title, value: item.id }
            if (item.parentPath === rootPath) {
                roots.push(newItem)
            }

            cache.set(appendIdToPath(item.parentPath, item.id), newItem)

            const parent = cache.get(item.parentPath)
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
    const getArticleTree = async (rootId: number) => {
        const subArticle = await db.article()
            .select()
            .whereLike('parentPath', `%#${rootId}#%`)

        return { code: 200, data: arrayToTree(rootId, subArticle) }
    }

    const getFavoriteArticles = async (userId: number) => {
        const data = await db.favoriteArticle()
            .select('articles.id', 'articles.title')
            .leftJoin(db.knex.raw(`${TABLE_NAME.ARTICLE} ON favorites.articleId = articles.id`))
            .where('favorites.userId', userId)

        return { code: 200, data }
    }

    return {
        addArticle, getArticleContent, updateArticle, getChildren, getRelatives, getArticleTree, removeArticle,
        getFavoriteArticles, getArticleList, setFavorite, setArticleRelate
    }
}

export type ArticleService = ReturnType<typeof createService>
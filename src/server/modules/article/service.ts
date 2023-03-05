import { ArticleContent, ArticleStorage, ArticleDeleteResp, ArticleUpdateResp, QueryArticleReqData, UpdateArticleReqData, ArticleTreeNode, ArticleLinkResp, ArticleRelatedResp } from '@/types/article.new'
import { DatabaseAccessor } from '@/server/lib/sqlite'
import { createId, createSqlInsert, createSqlSelect, createSqlUpdate, SqlWhere } from '@/utils/sqlite'

interface Props {
    db: DatabaseAccessor
}

export const createService = (props: Props) => {
    const { dbGet, dbAll, dbRun, getUserStorage } = props.db

    /**
     * 把数据库中的数据格式化成前端需要的格式
     */
    const formatArticle = (article: ArticleStorage): ArticleContent => {
        const { tagIds, relatedArticleIds, ...rest } = article

        const fontendArticle: Partial<ArticleContent> = { ...rest }
        if (tagIds) fontendArticle.tagIds = tagIds.split(',')

        return {
            ...rest,
            tagIds: tagIds ? tagIds.split(',') : [],
        }
    }

    const addArticle = async (title: string, content: string, parentId?: string) => {
        if (parentId) {
            const parentArticle = await dbGet(createSqlSelect('articles', { id: parentId }))
            if (!parentArticle) {
                return { code: 400, msg: '父条目不存在' }
            }
        }

        const newArticle: ArticleStorage = {
            id: createId(),
            title,
            content,
            createTime: Date.now(),
            updateTime: Date.now(),
            parentArticleId: parentId || '',
            relatedArticleIds: '',
            tagIds: '',
        }

        await dbAll(createSqlInsert('articles', newArticle))
        return { code: 200, data: newArticle.id }
    }

    /**
     * 删除文章
     */
    const removeArticle = async (id: string, force: boolean) => {
        const removedArticle = await dbGet<ArticleStorage>(createSqlSelect('articles', { id }))
        if (!removedArticle) return { code: 200 }

        const childrenArticles = await dbAll<ArticleStorage>(createSqlSelect('articles', { parentArticleId: id }))

        const deleteIds = [id]
        if (childrenArticles.length > 0) {
            if (!force) return { code: 400, msg: '包含子条目，无法删除' }
            deleteIds.push(...childrenArticles.map(item => item.id))
        }

        const data: ArticleDeleteResp = {
            // 返回父级文章 id，删除后会跳转至这个文章
            parentArticleId: removedArticle.parentArticleId,
            deletedArticleIds: deleteIds,
        }

        return { code: 200, data }
    }

    const updateArticle = async (detail: UpdateArticleReqData) => {
        const { id, tagIds, relatedArticleIds, ...restDetail } = detail
        const targetArticle = await dbGet<ArticleStorage>(createSqlSelect('articles', { id: id }))
        if (!targetArticle) return { code: 400, msg: '文章不存在' }

        const newArticle: Partial<ArticleStorage> = {
            ...restDetail,
            updateTime: Date.now(),
        }

        if (relatedArticleIds) newArticle.relatedArticleIds = relatedArticleIds.join(',')
        if (tagIds) newArticle.tagIds = tagIds.join(',')

        await dbRun(createSqlUpdate('articles', newArticle, { id }))

        const data: ArticleUpdateResp = {
            parentArticleId: targetArticle.parentArticleId,
        }

        return { code: 200, data }
    }

    const getArticleList = async (query: QueryArticleReqData) => {
        /** TODO: tag id 搜索 */
        const { page = 1, tagIds, keyword } = query
        console.log('🚀 ~ file: service.ts:99 ~ getArticleList ~ query:', query)

        const sql = `
            SELECT id, title, content, tagIds, updateTime, createTime FROM articles
            WHERE title LIKE '%${keyword}%' OR content LIKE '%${keyword}%'
            ORDER BY updateTime DESC
            LIMIT 15 OFFSET ${(page - 1) * 15}
        `

        const result = await dbAll<ArticleStorage>(sql)
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

            return {
                ...item,
                content,
                tagIds: item.tagIds ? item.tagIds.split(',') : [],
            }
        })

        return { code: 200, data }
    }

    const getArticleContent = async (id: string) => {
        const article = await dbGet<ArticleStorage>(createSqlSelect('articles', { id }))
        if (!article) return { code: 400, msg: '文章不存在' }

        return { code: 200, data: formatArticle(article) }
    }

    // 获取子代的文章列表（也会包含父级文章）
    const getChildren = async (id: string) => {
        const article = await dbGet<ArticleStorage>(createSqlSelect('articles', { id }))
        if (!article) return { code: 400, msg: '文章不存在' }

        const where: SqlWhere = [{ parentArticleId: id }]
        // 如果有父级文章，就把父级文章也查出来
        if (article.parentArticleId) {
            where.push('OR', { id: article.parentArticleId })
        }

        const data: ArticleLinkResp = {
            parentArticleId: '',
            parentArticleTitle: '',
            childrenArticles: [],
        }

        const querySql = createSqlSelect<ArticleStorage>('articles', where, ['id', 'title'])
        const childrenArticles = await dbAll<ArticleStorage>(querySql)
        // 因为父级是跟子级一起查出来的，所以这里要筛一下
        data.childrenArticles = childrenArticles.filter(item => {
            if (item.id === article.parentArticleId) {
                data.parentArticleId = item.id
                data.parentArticleTitle = item.title
                return false
            }
            return true
        })

        return { code: 200, data }
    }

    // 获取相关的文章列表
    const getRelatives = async (id: string) => {
        const article = await dbGet<ArticleStorage>(createSqlSelect('articles', { id }))
        if (!article) return { code: 400, msg: '文章不存在' }

        const data: ArticleRelatedResp = { relatedArticles: [] }
        if (!article.relatedArticleIds) return { code: 200, data }

        const ids = article.relatedArticleIds.split(',').map(item => `'${item}'`).join(',')
        data.relatedArticles = await dbAll<ArticleStorage>(
            `SELECT id, title FROM articles WHERE id IN(${ids});`
        )

        return { code: 200, data }
    }

    const arrayToTree = (rootId: string, data: ArticleStorage[]) => {
        if (!data || data.length <= 0) return []
        const cache = new Map<string, ArticleTreeNode>()
        const roots: ArticleTreeNode[] = []

        data.forEach(item => {
            const newItem: ArticleTreeNode = { title: item.title, value: item.id }
            if (item.parentArticleId === rootId) roots.push(newItem)

            cache.set(newItem.value, newItem)

            const parent = cache.get(item.parentArticleId)
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
        const articles = await dbAll(`
            WITH RECURSIVE
                tree AS (
                    SELECT * FROM articles WHERE id = '${rootId}'
                    UNION ALL
                    SELECT articles.* FROM tree JOIN articles ON tree.id = articles.parentArticleId
                )
            SELECT id, title, parentArticleId FROM tree;
        `)

        return { code: 200, data: arrayToTree(rootId, articles) }
    }

    const getFavoriteArticles = async (username: string) => {
        /** TDOO: 收藏 */
        const { favoriteArticleIds } = await getUserStorage(username)
        if (!favoriteArticleIds || favoriteArticleIds.length <= 0) return { code: 200, data: [] }

        const ids = favoriteArticleIds.split(',').map(item => `'${item}'`).join(',')
        const data = await dbAll<ArticleStorage>(`SELECT id, title FROM articles WHERE id IN(${ids});`)
        return { code: 200, data }
    }

    return {
        addArticle, getArticleContent, updateArticle, getChildren, getRelatives, getArticleTree, removeArticle,
        getFavoriteArticles, getArticleList
    }
}

export type ArticleService = ReturnType<typeof createService>
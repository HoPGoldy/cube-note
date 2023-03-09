import {
    ArticleContent, ArticleStorage, ArticleDeleteResp, QueryArticleReqData, UpdateArticleReqData,
    ArticleTreeNode, ArticleLinkResp
} from '@/types/article'
import { DatabaseAccessor } from '@/server/lib/sqlite'
import { appendIdToPath, getParentIdByPath, replaceParentId } from '@/utils/parentPath'

interface Props {
    db: DatabaseAccessor
}

export const createService = (props: Props) => {
    const { queryArticle } = props.db

    /**
     * 把数据库中的数据格式化成前端需要的格式
     */
    const formatArticle = (article: ArticleStorage): ArticleContent => {
        const { parentPath, ...rest } = article

        const fontendArticle = {
            ...rest,
            parentArticleId: getParentIdByPath(parentPath),
        }

        return fontendArticle
    }

    const addArticle = async (title: string, content: string, userId: number, parentId?: number) => {
        let parentArticle: ArticleStorage | undefined
        if (parentId) {
            const detail = await queryArticle().select().where('id', parentId).first()
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

        const [id] = await queryArticle().insert(newArticle)
        return { code: 200, data: id }
    }

    /**
     * 删除文章
     */
    const removeArticle = async (id: number, force: boolean) => {
        const removedArticle = await queryArticle().select().where('id', id).first()
        if (!removedArticle) return { code: 200 }

        const childrenArticles = await queryArticle().select().whereLike({ parentPath: `%#${id}#%` })

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
        const { id, tagIds, relatedArticleIds, parentArticleId, ...restDetail } = detail
        const oldArticle = await queryArticle().select().where({ id }).first()
        if (!oldArticle) return { code: 400, msg: '文章不存在' }

        const newArticle: Partial<ArticleStorage> = {
            ...oldArticle,
            ...restDetail,
            updateTime: Date.now(),
        }

        if (parentArticleId) {
            newArticle.parentPath = replaceParentId(oldArticle.parentPath, parentArticleId)
        }

        await queryArticle().update(newArticle).where({ id })

        return { code: 200 }
    }

    const getArticleList = async (query: QueryArticleReqData) => {
        /** TODO: tag id 搜索 */
        const { page = 1, tagIds, keyword } = query

        const result = await queryArticle()
            .select()
            .whereILike({ title: `%${keyword}%`, content: `%${keyword}%` })
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

            return {
                ...item,
                content,
            }
        })

        return { code: 200, data }
    }

    const getArticleContent = async (id: number) => {
        const article = await queryArticle().select().where('id', id).first()
        if (!article) return { code: 400, msg: '文章不存在' }

        return { code: 200, data: formatArticle(article) }
    }

    // 获取子代的文章列表（也会包含父级文章）
    const getChildren = async (id: number) => {
        const article = await queryArticle().select().where('id', id).first()
        if (!article) return { code: 400, msg: '文章不存在' }

        const query = queryArticle().select('id', 'title', 'parentPath').whereLike('parentPath', `%#${id}#`)
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
    const getRelatives = async (id: string) => {
        // const article = await dbGet<ArticleStorage>(sqlSelect('articles', { id }))
        // if (!article) return { code: 400, msg: '文章不存在' }

        // const data: ArticleRelatedResp = { relatedArticles: [] }
        // if (!article.relatedArticleIds) return { code: 200, data }

        // const ids = article.relatedArticleIds.split(',').map(item => `'${item}'`).join(',')
        // data.relatedArticles = await dbAll<ArticleStorage>(
        //     `SELECT id, title FROM articles WHERE id IN(${ids});`
        // )

        return { code: 200, data: [] }
    }

    const arrayToTree = (rootId: number, data: ArticleStorage[]) => {
        if (!data || data.length <= 0) return []
        const cache = new Map<string, ArticleTreeNode>()
        const roots: ArticleTreeNode[] = []

        const rootPath = `#${rootId}#`

        data.forEach(item => {
            const newItem: ArticleTreeNode = { title: item.title, value: item.id.toString() }
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
        const subArticle = await queryArticle()
            .select()
            .whereLike('parentPath', `%#${rootId}#%`)

        return { code: 200, data: arrayToTree(rootId, subArticle) }
    }

    const getFavoriteArticles = async (userId: number) => {
        /** TDOO: 收藏 */
        // const { favoriteArticleIds } = await dbGet<UserStorage>(sqlSelect('users', { userId }))
        // if (!favoriteArticleIds || favoriteArticleIds.length <= 0) return { code: 200, data: [] }

        // const ids = favoriteArticleIds.split(',').map(item => `'${item}'`).join(',')
        // const data = await dbAll<ArticleStorage>(`SELECT id, title FROM articles WHERE id IN(${ids});`)
        return { code: 200, data: [] }
    }

    return {
        addArticle, getArticleContent, updateArticle, getChildren, getRelatives, getArticleTree, removeArticle,
        getFavoriteArticles, getArticleList
    }
}

export type ArticleService = ReturnType<typeof createService>
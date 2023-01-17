import { AppTheme, UserStorage, LoginSuccessResp } from '@/types/user'
import { AppResponse } from '@/types/global'
import { STATUS_CODE } from '@/config'
import { sha } from '@/utils/crypto'
import { LoginLocker } from '@/server/lib/LoginLocker'
import { nanoid } from 'nanoid'
import { Collection, ObjectId } from 'mongodb'
import { ArticleStorage } from '@/types/article'

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
    const addArticle = async (title: string, content: string, parentId: string) => {
        const articleCollection = getArticleCollection()
        const _id = new ObjectId(parentId)
        const parentArticle = await articleCollection.findOne({ _id })
        if (!parentArticle) {
            return { code: 400, msg: '父条目不存在' }
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
        await articleCollection.updateOne({ _id }, { $set: {
            childrenArticleIds: [...parentArticle.childrenArticleIds, newArticle.insertedId.toString()]
        } })

        return { code: 200 }
    }

    /**
     * 删除文章
     */
    const removeArticle = async (id: string) => {

    }

    return { addArticle }
}

export type ArticleService = ReturnType<typeof createService>
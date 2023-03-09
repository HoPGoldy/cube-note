/**
 * 页面主按钮的默认配色
 */
export const DEFAULT_COLOR = [
    'linear-gradient(45deg, #0081ff, #1cbbb4)',
    'linear-gradient(45deg, #ec008c, #6739b6)',
    'linear-gradient(45deg, #9000ff, #5e00ff)',
    'linear-gradient(45deg, #39b54a, #8dc63f)',
    'linear-gradient(45deg, #ff9700, #ed1c24)',
    'linear-gradient(45deg, #f43f3b, #ec008c)'
]

/**
 * 默认（未分组）的标签分组 ID
 */
export const DEFAULT_TAG_GROUP = 'default'


/**
 * 数据库表名
 */
export const TABLE_NAME = {
    /** 用户表 */
    USER: 'users',
    /** 文章表 */
    ARTICLE: 'articles',
    /** 标签表 */
    TAG: 'tags',
    /** 标签分组表 */
    TAG_GROUP: 'tagGroups',
    /** 附件表 */
    FILE: 'files',
    /** 用户收藏文章表 */
    FAVORITE: 'favorites',
    /** 文章相互关联表 */
    ARTICLE_RELATION: 'articleRelations'
} as const
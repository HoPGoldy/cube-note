import { ArticleTreeNode } from '@/types/article'
import React, { FC, useState } from 'react'
import { Button as RvButton, ButtonProps } from 'react-vant'

interface Props {
    treeData: ArticleTreeNode
}

interface MenuItem {
    key: string
    // div 左上角到屏幕左边的距离
    x: number
    // div 左上角到屏幕上边的距离
    y: number
    // div 里显示的选项列表
    subMenus?: ArticleTreeNode[]
}

/**
 * 桌面端左下方的快捷访问嵌套菜单
 */
export const SideMenu: FC<Props> = (props) => {
    // 弹出的菜单项，一个数组，元素是弹出的菜单项
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])

    return (
        <div
            className='w-full border border-white text-center p-2 cursor-pointer'
            onMouseEnter={() => console.log('进入')}
            onMouseLeave={() => console.log('离开')}
        >
            侧边栏菜单
        </div>
    )
}

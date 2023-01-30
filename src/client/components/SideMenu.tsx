import { ArticleTreeNode } from '@/types/article'
import React, { FC, MouseEvent, useState } from 'react'
import { Button as RvButton, ButtonProps } from 'react-vant'

interface Props {
    treeData: ArticleTreeNode[]
}

interface MenuList {
    key: string
    // div 左上角到屏幕左边的距离
    left: number
    // div 左上角到屏幕上边的距离
    top: number
    // div 里显示的选项列表
    subMenus?: ArticleTreeNode[]
}

/**
 * 桌面端左下方的快捷访问嵌套菜单
 */
export const SideMenu: FC<Props> = (props) => {
    // 弹出的菜单项，一个数组，元素是弹出的菜单项
    const [menuLists, setMenuLists] = useState<MenuList[]>([])

    const onOpenMenu = (e: MouseEvent<Element>) => {
        const rect = (e.target as Element)?.getBoundingClientRect()

        const menuList: MenuList = {
            key: '1',
            left: rect.right + 10,
            top: rect.top,
            subMenus: props.treeData,
        }
        setMenuLists([menuList])
    }

    const mouseLeave = () => {
        console.log('离开')
    }

    const renderMenuItem = (item: ArticleTreeNode) => {
        return (
            <div
                className='h-[100px]'
            >
                {item.title}
            </div>
        )
    }

    const renderMenuLists = (item: MenuList) => {
        return (
            <div
                className='bg-red-50 border border-white w-[100px] fixed'
                style={{ top: item.top, left: item.left }}
            >
                {item.subMenus?.map(renderMenuItem)}
            </div>
        )
    }

    return (<>
        <div
            className='w-full border border-white text-center p-2 cursor-pointer'
            onMouseEnter={onOpenMenu}
            onMouseLeave={mouseLeave}
        >
            侧边栏菜单
        </div>
        {menuLists.map(renderMenuLists)}
    </>)
}

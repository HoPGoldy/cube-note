import { ArticleTreeNode } from '@/types/article'
import React, { FC, useState, useMemo, useRef } from 'react'
import debounce from 'lodash/debounce'
import { Arrow } from '@react-vant/icons'
import { nanoid } from 'nanoid'

interface Props {
    treeData: ArticleTreeNode[]
    onClickNode?: (node: ArticleTreeNode) => void
    onClickRoot?: () => void
    value?: number[]
    onChange?: (value: number[]) => void
}

interface MenuList {
    key: number
    // div 的样式
    styles?: React.CSSProperties
    // div 里显示的选项列表
    subMenus?: ArticleTreeNode[]
}

const MENU_WIDTH = 200
const MENU_HEIGHT = 50

const getNewMenuPos = (prevRect: DOMRect, menuItemNumber: number) => {
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    const menuTotalHeight = menuItemNumber * MENU_HEIGHT
    const top = screenHeight > (prevRect.top + menuTotalHeight) ? prevRect.top : (screenHeight - menuTotalHeight - 10)
    const left = screenWidth > (prevRect.right + MENU_WIDTH) ? prevRect.right + 10 : (prevRect.left - MENU_WIDTH - 10)

    return {
        left,
        top,
    }
}

/**
 * 桌面端左下方的快捷访问嵌套菜单
 */
export const TreeMenu: FC<Props> = (props) => {
    // 唯一的 dom id，用于支持多个 TreeMenu 组件
    const entryId = useRef(nanoid())
    // 弹出的菜单项，一个数组，元素是弹出的菜单项
    const [menuLists, setMenuLists] = useState<MenuList[]>([])
    // 关闭全部菜单
    const closeAllThrottle = useMemo(() => debounce(() => setMenuLists([]), 200), [])

    const openMenu = (elementId: string, menuData: ArticleTreeNode[], level?: number) => {
        const el = document.getElementById(elementId)
        if (!el) {
            console.error('找不到侧边栏元素', elementId)
            return
        }
        const prevRect = el.getBoundingClientRect()

        const newMenu: MenuList = {
            key: Date.now(),
            subMenus: menuData,
            styles: {
                ...getNewMenuPos(prevRect, menuData.length),
            }
        }

        // 没有设置层级，直接追加
        if (level === undefined) {
            setMenuLists([...menuLists, newMenu])
            return
        }

        // 设置了层级，插入到指定层级
        const prevMenus = menuLists.slice(0, level + 1)
        setMenuLists([...prevMenus, newMenu])
    }

    const onOpenFirstMenu = () => {
        closeAllThrottle.cancel()
        openMenu(entryId.current, props.treeData)
    }

    const onOpenInnerMenu = (id: string, level: number, nextMenuList?: ArticleTreeNode[]) => {
        closeAllThrottle.cancel()
        if (!nextMenuList) {
            setMenuLists(menuLists.slice(0, level + 1))
            return
        }
        openMenu(id, nextMenuList, level)
    }

    const mouseLeave = () => {
        closeAllThrottle()
    }

    const onClickNode = (node: ArticleTreeNode) => {
        props.onClickNode?.(node)

        if (props.value?.includes(node.value)) {
            props.onChange?.(props.value?.filter(v => v !== node.value))
        }
        else props.onChange?.([...(props?.value || []), node.value])
    }

    const renderMenuItem = (item: ArticleTreeNode, level: number) => {
        return (
            <div
                key={item.value}
                id={item.value.toString()}
                className={
                    'p-2 text-white cursor-pointer flex items-center justify-between ' +
                    (props.value?.includes(item.value) ? 'bg-green-700 hover:bg-green-600' : 'hover:bg-slate-400 ')
                }
                onClick={() => onClickNode(item)}
                onMouseEnter={() => onOpenInnerMenu(item.value.toString(), level, item.children)}
                style={{ height: MENU_HEIGHT, width: MENU_WIDTH }}
            >
                <div className='truncate'>{item.title}</div>
                {item.children && <Arrow />}
            </div>
        )
    }

    const renderMenuLists = (item: MenuList, index: number) => {
        return (
            <div
                key={item.key}
                className='bg-slate-600 absolute z-10'
                style={item.styles}
                onMouseLeave={mouseLeave}
            >
                {item.subMenus?.map(item => renderMenuItem(item, index))}
            </div>
        )
    }

    return (<>
        <div
            id={entryId.current}
            onClick={props.onClickRoot}
            onMouseEnter={onOpenFirstMenu}
            onMouseLeave={mouseLeave}
        >
            {props.children}
        </div>
        {menuLists.map(renderMenuLists)}
    </>)
}

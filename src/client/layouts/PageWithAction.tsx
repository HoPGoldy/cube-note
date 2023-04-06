import React, { FC, PropsWithChildren, useEffect, useRef, useState } from 'react'
import { Search } from '@react-vant/icons'
import { Button, ButtonProps } from 'antd'
import { DebouncedFunc } from 'lodash'
import debounce from 'lodash/debounce'
import { Field, FieldInstance } from 'react-vant'
import { useAppSelector } from '../store'
import { MobileView } from 'react-device-detect'

/**
 * 页面正文，会给下面的操作栏留出空间
 */
export const PageContent: FC<PropsWithChildren> = (props) => {
    return (
        <div className="overflow-y-auto relative md:h-full h-page-content" >
            {props.children}
        </div>
    )
}

/**
 * 底部操作栏
 */
export const PageAction: FC<PropsWithChildren> = (props) => {
    return (
        <MobileView>
            <div className="p-2 flex flex-row md:hidden h-bottombar">
                {props.children}
            </div>
        </MobileView>
    )
}

/**
 * 底部操作栏中的图标
 */
export const ActionIcon: FC<ButtonProps> = (props) => {
    const { className, ...restProps } = props
    return (
        <Button
            size="large"
            className={'mr-2 flex-shrink-0 ' + className}
            {...restProps}
        />
    )
}

/**
 * 底部操作栏中的按钮
 */
export const ActionButton: FC<ButtonProps> = (props) => {
    const buttonColor = useAppSelector(s => s.global.appConfig?.buttonColor)
    const styles = { background: props.color || buttonColor || 'f000' }

    return (
        <Button
            type="primary"
            style={styles}
            loading={props.loading}
            onClick={props.onClick}
            block
            size="large"
        >
            {props.children}
        </Button>
    )
}

type ActionSearchProps = {
    /**
     * 搜索的节流事件，单位毫秒
     */
    debounceWait?: number
    /**
     * 是否自动聚焦输入框
     */
    autoFocus?: boolean
    /**
     * 触发搜索事件，会受到 debounceWait 的影响
     */
    onSearch?: (value: string) => unknown
}

/**
 * 操作栏中的搜索按钮
 */
export const ActionSearch: FC<ActionSearchProps> = (props) => {
    const { onSearch, debounceWait = 500, autoFocus } = props

    // 搜索内容
    const [searchValue, setSearchValue] = useState('')

    // 搜索防抖实例
    const searchDebounce = useRef<DebouncedFunc<(newValue: string) => void>>()
    useEffect(() => {
        searchDebounce.current = debounce((newValue: string) => {
            onSearch?.(newValue)
        }, debounceWait)
    }, [])

    // 回调 - 搜索内容变化
    const onSearchValueChange = (value: string) => {
        setSearchValue(value)
        searchDebounce.current?.(value)
    }

    // 自动聚焦实现，组件的 autoFocus 不好用
    const fieldRef = useRef<FieldInstance>(null)
    useEffect(() => {
        autoFocus && fieldRef.current?.focus()
    }, [])

    return (
        <div className="m-2 flex items-center justify-center grow rounded-lg text-white relative">
            <Field
                ref={fieldRef}
                style={{ height: '40px' }}
                value={searchValue}
                onChange={onSearchValueChange}
                rightIcon={<Search />}
                placeholder="搜索内容"
                onClickRightIcon={() => onSearch?.(searchValue)}
            />
        </div>
    )
}

import React, { FC, PropsWithChildren, useMemo } from 'react'
import { ConfigProvider, ThemeConfig } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useAppSelector } from '../store'
import cloneDeep from 'lodash/cloneDeep'
import { isMobile } from '../layouts/Responsive'

const globalThemeConfig: ThemeConfig = {
    // algorithm: theme.darkAlgorithm,
    token: {
        lineWidth: 2,
        controlOutlineWidth: 1,
    },
    components: {
        Card: {
            colorBorderSecondary: '#d1d5db',
            lineHeight: 1.6
        }
    }
}

/**
 * antd 使用的主题配置
 */
export const AntdConfigProvider: FC<PropsWithChildren> = (props) => {
    const appConfig = useAppSelector(s => s.global.appConfig)

    const themeConfig: ThemeConfig = useMemo(() => {
        const theme = cloneDeep(globalThemeConfig)
        if (appConfig?.buttonColor) {
            document.documentElement.style.setProperty(
                '--cube-note-primary-button-color',
                appConfig.buttonColor
            )
        }

        if (theme.token) {
            if (appConfig?.primaryColor) theme.token.colorPrimary = appConfig.primaryColor
            if (isMobile) theme.token.fontSize = 16
        }

        return theme
    }, [appConfig])

    return (
        <ConfigProvider locale={zhCN} theme={themeConfig}>
            {props.children}
        </ConfigProvider>
    )
}
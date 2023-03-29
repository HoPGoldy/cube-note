import React from 'react'
import { store } from './store'
import { Provider } from 'react-redux'
import { Routes } from './Route'
import { AppConfigProvider } from './layouts/AppConfigProvider'
import { ResponsiveProvider } from './layouts/Responsive'
import { QueryClientProvider } from 'react-query'
import { queryClient } from './services/base'
import { ReactQueryDevtools } from 'react-query/devtools'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'

const themeVars = {
    buttonBorderRadius: 'var(--rv-border-radius-lg)',
    buttonDefaultHeight: '38px'
}

function App() {
    return (
        <Provider store={store}>
            <ConfigProvider locale={zhCN} theme={{
                // algorithm: theme.darkAlgorithm
            }}>
                <QueryClientProvider client={queryClient}>
                    <AppConfigProvider>
                        <ResponsiveProvider>
                            <Routes />
                        </ResponsiveProvider>
                    </AppConfigProvider>
                    <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
                </QueryClientProvider>
            </ConfigProvider>
        </Provider>
    )
}

export default App

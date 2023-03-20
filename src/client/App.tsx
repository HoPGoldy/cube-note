import React from 'react'
import { store } from './store'
import { Provider } from 'react-redux'
import { Routes } from './Route'
import { AppConfigProvider } from './layouts/AppConfigProvider'
import { ConfigProvider } from 'react-vant'
import { ResponsiveProvider } from './layouts/Responsive'
import { QueryClientProvider } from 'react-query'
import { queryClient } from './services/base'
import { ReactQueryDevtools } from 'react-query/devtools'

const themeVars = {
    buttonBorderRadius: 'var(--rv-border-radius-lg)',
    buttonDefaultHeight: '38px'
}

function App() {
    return (
        <Provider store={store}>
            <ConfigProvider themeVars={themeVars}>
                <QueryClientProvider client={queryClient}>
                    <AppConfigProvider>
                        <ResponsiveProvider>
                            <Routes />
                        </ResponsiveProvider>
                    </AppConfigProvider>
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </ConfigProvider>
        </Provider>
    )
}

export default App

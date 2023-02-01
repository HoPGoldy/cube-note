import React from 'react'
import { store } from './store'
import { Provider } from 'react-redux'
import { Routes } from './Route'
import { AppConfigProvider } from './layouts/AppConfigProvider'
import { ConfigProvider } from 'react-vant'
import { ResponsiveProvider } from './layouts/Responsive'

const themeVars = {
    buttonBorderRadius: 'var(--rv-border-radius-lg)',
    buttonDefaultHeight: '38px'
}

function App() {
    return (
        <Provider store={store}>
            <ConfigProvider themeVars={themeVars}>
                <AppConfigProvider>
                    <ResponsiveProvider>
                        <Routes />
                    </ResponsiveProvider>
                </AppConfigProvider>
            </ConfigProvider>
        </Provider>
    )
}

export default App

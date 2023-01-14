import React from 'react'
import { store } from './store'
import { Provider } from 'react-redux'
import { Routes } from './Route'
import { AppConfigProvider } from './components/AppConfigProvider'
import { ConfigProvider } from 'react-vant'

const themeVars = {
    buttonBorderRadius: 'var(--rv-border-radius-lg)',
    buttonDefaultHeight: '38px'
}

function App() {
    return (
        <Provider store={store}>
            <ConfigProvider themeVars={themeVars}>
                <AppConfigProvider>
                    <Routes />
                </AppConfigProvider>
            </ConfigProvider>
        </Provider>
    )
}

export default App

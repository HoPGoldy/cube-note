import React from 'react'
import { store } from './store'
import { Provider } from 'react-redux'
import { Routes } from './Route'
import { AppConfigProvider } from './components/AppConfigProvider'
import { UserProvider } from './components/UserProvider'
import { QueryProvider } from './components/QueryClientProvider'
import { ConfigProvider } from 'react-vant'

const themeVars = {
    buttonBorderRadius: 'var(--rv-border-radius-lg)',
    buttonDefaultHeight: '38px'
}

function App() {
    return (
        <Provider store={store}>
            <QueryProvider>
                <ConfigProvider themeVars={themeVars}>
                    <UserProvider>
                        <AppConfigProvider>
                            <Routes />
                        </AppConfigProvider>
                    </UserProvider>
                </ConfigProvider>
            </QueryProvider>
        </Provider>
    )
}

export default App

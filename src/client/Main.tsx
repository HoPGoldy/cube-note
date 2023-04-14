import React from 'react'
import { createRoot } from 'react-dom/client'
import { store } from './store'
import { Provider } from 'react-redux'
import { routes } from './Route'
import { QueryClientProvider } from 'react-query'
import { queryClient } from './services/base'
// import { ReactQueryDevtools } from 'react-query/devtools'
import { App as AntdApp } from 'antd'
import { RouterProvider } from 'react-router-dom'
import './styles/index.css'
import 'bytemd/dist/index.css'
import { useInitMessage } from './utils/message'
import { AntdConfigProvider } from './components/AntdConfigProvider'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rootContainer = document.getElementById('root')!

const App = () => {
    useInitMessage()
    return (
        <Provider store={store}>
            <AntdConfigProvider>
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={routes} />
                    {/* <ReactQueryDevtools initialIsOpen={false} position="bottom-right" /> */}
                </QueryClientProvider>
            </AntdConfigProvider>
        </Provider>
    )
}

createRoot(rootContainer).render(
    <React.StrictMode>
        <AntdApp className='h-full'>
            <App />
        </AntdApp>
    </React.StrictMode>
)

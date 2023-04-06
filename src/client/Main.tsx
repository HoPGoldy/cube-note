import React from 'react'
import { createRoot } from 'react-dom/client'
import { store } from './store'
import { Provider } from 'react-redux'
import { routes } from './Route'
import { QueryClientProvider } from 'react-query'
import { queryClient } from './services/base'
import { ReactQueryDevtools } from 'react-query/devtools'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { RouterProvider } from 'react-router-dom'
import './styles/index.css'
import 'bytemd/dist/index.css'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rootContainer = document.getElementById('root')!

createRoot(rootContainer).render(
    <React.StrictMode>
        <Provider store={store}>
            <ConfigProvider locale={zhCN} theme={{
                // algorithm: theme.darkAlgorithm,
                token: {
                    lineWidth: 2,
                    controlOutlineWidth: 1
                }
            }}>
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={routes} />
                    <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
                </QueryClientProvider>
            </ConfigProvider>
        </Provider>
    </React.StrictMode>
)

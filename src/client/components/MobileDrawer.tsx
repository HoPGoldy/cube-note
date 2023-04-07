import React, { FC } from 'react'
import { Button, Drawer, DrawerProps } from 'antd'
import { MobileArea } from '../layouts/Responsive'

/**
 * 移动端专用的底部弹窗
 * @param props Antd Drawer 的属性
 */
export const MobileDrawer: FC<DrawerProps> = (props) => {
    return (
        <MobileArea>
            <Drawer
                placement="bottom"
                footer={(
                    <Button block size="large" onClick={props.onClose}>返回</Button>
                )}
                footerStyle={{ padding: 8, border: 'none' }}
                closable={false}
                headerStyle={{ textAlign: 'center', padding: 8 }}
                {...props}
            >
                {props.children}
            </Drawer>
        </MobileArea>
    )
}
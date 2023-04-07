import { Col, Row } from 'antd'
import React, { FC } from 'react'

export interface CellProps {
    title: string | React.ReactNode
    extra?: string | React.ReactNode
    onClick?: () => void
}

export const Cell: FC<CellProps> = (props) => {
    return (
        <Row
            justify="space-between"
            className='text-black'
            onClick={props.onClick}
        >
            <Col className='text-base'>
                {props.title}
            </Col>
            <Col className='text-base'>
                {props.extra}
            </Col>
        </Row>
    )
}

export const SplitLine: FC = () => {
    return (
        <div className="h-[1px] my-2 w-full bg-gray-200"></div>
    )
}
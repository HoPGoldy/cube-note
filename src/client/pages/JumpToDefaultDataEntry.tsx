import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../store'

const JumpToDefaultDataEntry = () => {
    const rootArticleId = useAppSelector(s => s.user.userInfo?.rootArticleId)

    return (
        <Navigate to={`/article/${rootArticleId}`} replace />
    )
}

export default JumpToDefaultDataEntry
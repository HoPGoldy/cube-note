import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { stateUser } from '../store/user'

const JumpToDefaultDataEntry = () => {
    const rootArticleId = useAtomValue(stateUser)?.rootArticleId

    return (
        <Navigate to={`/article/${rootArticleId}`} replace />
    )
}

export default JumpToDefaultDataEntry
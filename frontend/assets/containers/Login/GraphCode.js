import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import Cookies from 'js-cookie'

import { cookiesName } from '../../public/js'
import { useCallbackAsync } from '../../public/hooks'

export default () => {
    const [graphCode, setGraphCode] = useState(null)
    const dispath = useDispatch()
    const getGraphCode = useCallbackAsync(async () => {
        const uuidKey = Cookies.get(cookiesName.uuidkey)
        const res = await dispath.public.getGraphCode({ uuidKey })
        if (res.code && res.code === 1) {
            setGraphCode(res.data.code)
            !uuidKey && Cookies.set(cookiesName.uuidkey, res.data.uuidKey)
        }
    }, [dispath.public])
    useEffect(() => {
        getGraphCode()
    }, [getGraphCode])
    return <div className="graph-code" onClick={getGraphCode}>
        {graphCode && <div dangerouslySetInnerHTML = {{ __html: graphCode }} />}
    </div>
}

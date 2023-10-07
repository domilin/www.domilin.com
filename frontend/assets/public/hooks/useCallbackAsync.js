import { useCallback } from 'react'
import Toast from '../../components/Toast'

export default (asyncCallback = async () => {}, inputs = []) => useCallback(async function () {
    if (!asyncCallback || typeof asyncCallback !== 'function') {
        throw Error('useCallbackAsync: the first parameter must be an async function')
    }

    if (!Array.isArray(inputs)) {
        throw Error('useCallbackAsync: the second parameter must be an array')
    }

    const res = await (asyncCallback)(...arguments).catch(function (err) {
        console.error(err)
        Toast.error(err.message || 'useCallbackAsync hooks error')
    })
    return res
// eslint-disable-next-line react-hooks/exhaustive-deps
}, inputs)

import { useEffect } from 'react'
import Toast from '../../components/Toast'

export default (asyncCallback = async () => {}, inputs = []) => {
    useEffect(() => {
        if (!asyncCallback || typeof asyncCallback !== 'function') {
            throw Error('useEffectAsync: the first parameter must be an async function')
        }

        if (!Array.isArray(inputs)) {
            throw Error('useEffectAsync: the second parameter must be an array')
        }

        (asyncCallback)().catch(function (err) {
            console.error(err)
            Toast.error(err.message || 'useEffectAsync hooks error')
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, inputs)
}

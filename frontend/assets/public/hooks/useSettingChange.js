import { useDispatch } from 'react-redux'

import Toast from '../../components/Toast'
import { useCallbackAsync } from './index'
import { syncStateToBackground } from '../js'

export default () => {
    const dispatch = useDispatch()
    return useCallbackAsync(async (value) => {
        const res = await dispatch.public.setting(value)
        if (res.code !== 1) {
            Toast.info(res.msg)
            return
        }
        syncStateToBackground()
        return res
    }, [dispatch.public])
}

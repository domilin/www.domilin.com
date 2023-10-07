import { useDispatch } from 'react-redux'
import { isLogin, loginedInitialState, noLoginInitailState } from './public'
import { useEffectAsync } from '../../assets/public/hooks'
import { syncStateToBackground } from '../../assets/public/js'

export default () => {
    const dispatch = useDispatch()
    useEffectAsync(async () => {
        const login = await isLogin()
        if (login) {
            loginedInitialState(dispatch)
        } else {
            noLoginInitailState(dispatch)
        }

        // 特别在网页设置完情况下
        // 更新background的state，下次启动时默认数据为最新的
        // newTab, popup, 网页某一方设置后，新建newTab/popup时，会请求新设置并更新background的state
        syncStateToBackground()
    }, [dispatch])
}

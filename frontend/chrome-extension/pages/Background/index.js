import configureStore from '@browser/store'
import { isLogin, loginedInitialState, noLoginInitailState } from '../../utils/public'
const store = configureStore()

// 浏览器启动获取默认数据，newTab+popup页面在创建之前index.jsx会首先获取background已经请求的数据
// 显示设置与已添加收藏
// 在newTab+popup的useEffect中，再次请求数据并且同步给background
window.defaultData = async function () {
    const login = await isLogin()
    if (login) {
        loginedInitialState(store.dispatch)
    } else {
        noLoginInitailState(store.dispatch)
    }

    window.storeState = store.getState()
}

window.defaultData()

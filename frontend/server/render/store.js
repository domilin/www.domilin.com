import { init } from '@rematch/core'
import immerPlugin from '@rematch/immer'
import * as models from '../../assets/models/root'

const immer = immerPlugin()
export default () => init({
    models,
    plugins: [immer]
})

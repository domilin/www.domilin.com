import Router from 'express-promise-router'

import render from '../render/render'

const router = new Router()

router.get('*', render)

router.get('/signup', async function (req, res, next) {
    res.cookie('au_token', '', { expires: new Date(0) })

    res.json({
        code: 0,
        msg: 'success'
    })
})

export default router

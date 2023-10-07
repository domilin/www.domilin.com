import Router from 'express-promise-router'

const router = new Router()

router.get('/', async function (req, res, next) {
    res.send('respond with a resource')
})

export default router

import index from './index'
import logger from './logger'
import weather from './weather'
// import users from './users'
// import signture from './signture'
// import exportBookmark from './exportBookmark'

export default (app) => {
    app.use('/', index)
    app.use('/logger', logger)
    app.use('/weather', weather)
    // app.use('/users', users)
    // app.use('/export', exportBookmark)
    // app.use('/signture', signture)
}

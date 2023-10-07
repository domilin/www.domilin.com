import debug from 'debug'
import http from 'http'

import app from './app'
import { serverPort } from '../../config/config'

const createHttp = (app) => {
    debug('mclouds:server')
    const normalizePort = (val) => {
        const port = parseInt(val, 10)
        if (isNaN(port)) {
            return val
        }
        if (port >= 0) {
            return port
        }
        return false
    }
    const onError = (error) => {
        if (error.syscall !== 'listen') {
            throw error
        }
        const bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port
        if (error.code === 'EACCES') {
            console.error(bind + ' requires elevated privileges')
            process.exit(1)
        } else if (error.code === 'EADDRINUSE') {
            console.error(bind + ' is already in use')
            process.exit(1)
        } else {
            throw error
        }
    }

    const port = normalizePort(process.env.PORT || serverPort)
    app.set('port', port)

    const server = http.createServer(app)
    const onListening = () => {
        const addr = server.address()
        const bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port
        debug('Listening on ' + bind)
    }

    server.listen(port, function (err) {
        if (err) {
            console.error(err)
        } else {
            console.info('==> Server Listening on port %s.', port)
        }
    })
    server.on('error', onError)
    server.on('listening', onListening)
}

createHttp(app)

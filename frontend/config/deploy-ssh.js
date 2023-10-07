const gulp = require('gulp')
const util = require('gulp-util')
const through = require('through2')
const async = require('async')
const SSH = require('gulp-ssh')
const Progress = require('progress')
const Client = require('scp2').Client

const PLUGIN_NAME = 'deploy-ssh'

module.exports = function (opts) {
    return through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            callback(null, file)
            return
        }

        if (file.isStream()) {
            return callback(new util.PluginError(PLUGIN_NAME, 'No stream support'))
        }

        let i = 0
        async.eachSeries(opts.sshServer, function (server, done) {
            const hostName = server.config.host
            util.log(PLUGIN_NAME, 'start deploy:' + hostName)
            const client = new Client(server.config)

            let bar = null
            client.on('transfer', function (buffer, uploaded, total) {
                if (bar == null) {
                    bar = new Progress(hostName + ' uploading [:bar] :percent :elapsed s', {
                        complete: '=',
                        incomplete: ' ',
                        width: 50,
                        total: total
                    })
                }
                bar.tick(1)
            })

            client.write({
                destination: server.path,
                content: file.contents
            }, function () {
                const ssh = new SSH({
                    ignoreErrors: false,
                    sshConfig: server.config
                })

                ssh.shell(server.shell, {
                    filePath: server.logs + '-' + hostName + '.log',
                    autoExit: true
                }).on('error', function (err) {
                    done(err)
                    util.PluginError(PLUGIN_NAME, err)
                }).on('finish', function () {
                    util.log(PLUGIN_NAME, 'finish deploy:' + hostName)
                    done()
                    if (++i === opts.sshServer.length) {
                        callback(null, file)
                    }
                }).pipe(gulp.dest('logs'))
            })
        })
    })
}

const through = require('through-gulp')

module.exports = (gitVersion) => {
    const stream = through(function (file, encoding, callback) {
        if (file.isNull()) {
            this.push(file)
            return callback()
        }

        if (file.isStream()) {
            this.emit('error')
            return callback()
        }

        if (file.isBuffer()) {
            const fileContent = file.contents.toString('utf-8')
            let newFileContents = fileContent
            if (gitVersion) {
                const packageJson = JSON.parse(newFileContents)
                packageJson.repository = {
                    version: gitVersion
                }
                newFileContents = JSON.stringify(packageJson)
            } else {
                newFileContents = fileContent
            }

            file.contents = new Buffer(newFileContents, 'utf-8')
        }

        this.push(file)
        callback()
    }, function (callback) {
        callback()
    })

    return stream
}

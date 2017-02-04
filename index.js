'use strict'

const chalk = require('chalk')
const Server = require('./src/Server')
const Spec = require('./src/Spec')
const utils = require('./utils')
const path = require('path')

function start(file, root) {
  const spec = new Spec(path.resolve(file), root)
  if (!spec.exists) {
    utils.logError('The spec file is missing')
    return
  }

  spec.load()

  const server = new Server(spec)
  server.load()

  server.start((error) => {
    if (error) {
      utils.logError(error.message)
      return
    }

    utils.logInfo(chalk.green('started on port ') + chalk.bold(spec.settings.port))
  })
}

module.exports = { start }

'use strict'

const chalk = require('chalk')
const Server = require('./Server')
const Spec = require('./Spec')
const utils = require('./utils')

function start() {
  const spec = new Spec('bindi.yaml')
  if (!spec.exists) {
    utils.logError('The bindi.yaml file is missing')
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

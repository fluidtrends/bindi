'use strict'

const chalk = require('chalk')

function logInfo(message) {
  console.log(chalk.bold('[bindi] ') + message)
}

function logError(message) {
  console.log(chalk.bold('[bindi] ') + chalk.red(message))
}


module.exports = { logError, logInfo }

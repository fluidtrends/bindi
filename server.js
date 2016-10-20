'use strict'

var express     = require('express')
var bodyParser  = require('body-parser')
var cors        = require('cors')
var chalk       = require('chalk')

class Server {

  constructor(props) {
    this.props = props
    this.initialize()
    this.mountRoutes()
  }

  initialize() {
    this.app = express()
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({extended: false}))
    this.app.use(cors())
  }

  mountRoutes() {
    this.props.routes.forEach(route => {
      this.app.use(route.endpoint, route.router)
    })
  }

  start() {
    this.app.listen(this.props.config.port, () => {
      console.log(chalk.bold("[Chunky]"), chalk.green('API Server ready on port'), chalk.bold(this.props.config.port))
    })
  }

}

module.exports = Server

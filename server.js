'use strict'

var express     = require('express')
var bodyParser  = require('body-parser')
var cors        = require('cors')
var routes      = require('./routes')
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
    routes.forEach(route => {
      this.app.use(route.path, route.router)
    })
  }

  start() {
    this.app.listen(this.props.port, () => {
      console.log(chalk.bold("[Chunky]"), chalk.green('API Server ready on port'), chalk.bold(this.props.port))
    })
  }

}

module.exports = Server

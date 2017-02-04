'use strict'

const Spec        = require('./Spec')
const Router      = require('./Router')
const Vault       = require('./Vault')
const express     = require('express')
const passport    = require('passport')
const bodyParser  = require('body-parser')
const cors        = require('cors')
const mongoose    = require('mongoose')
const pm2         = require('pm2')

class Server {

  constructor(spec) {
    this._spec = spec
  }

  get spec() {
    return this._spec
  }

  get router () {
    return this._router
  }

  get instance () {
    return this._instance
  }

  get databaseUrl() {
    return `mongodb://${this.spec.database.host}/${this.spec.database.name}`
  }

  get databaseOptions() {
    return this.spec.database.options || {}
  }

  get vault() {
    return this._vault
  }

  load() {
    this._instance = express()
    this._instance.use(bodyParser.json())
    this._instance.use(bodyParser.urlencoded({extended: false}))
    this._instance.use(cors())
    this._instance.use(passport.initialize())
    this._instance.use(passport.session())
    this._vault = new Vault(this.spec)
    this._router = new Router(this.spec, this.vault)
    this._router.mount()
    this._instance.use(this.spec.settings.root, this.router.instance)
  }

  initialize () {
    return new Promise((resolve, reject) => {
      mongoose.connect(this.databaseUrl, this.databaseOptions, (error) => {
        if (error) {
          // Failed to connect to the database
          reject(error)
          return
        }

        // We should be all initialized now
        resolve()
      })
    })
  }

  start(callback) {
    this.initialize().then(() => this.instance.listen(this.spec.settings.port, callback)).
                      catch((error) => callback(error))
  }

}

module.exports = Server

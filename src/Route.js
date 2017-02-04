'use strict'

const path = require('path')
const winston = require('winston')
const chalk = require('chalk')
const utils = require('./utils')
const mongoose = require('mongoose')
const moment = require('moment')

const EVENTS = ({
  POST_OK: "POST_OK",
  POST_ERROR: "POST_ERROR",
  GET_OK: "GET_OK",
  GET_ERROR: "GET_ERROR",
  GET_ALL_OK: "GET_ALL_OK",
  GET_ALL_ERROR: "GET_ALL_ERROR"
})

class Route {

  constructor(props, vault, spec) {
    this._props = props
    this._vault = vault
    this._spec = spec

    this.configure()
  }

  configure() {
    if (this.props.fields) {
      var fields = {timestamp: { type: Date, default: Date.now }}
      this.props.fields.map(field => {
        fields[field.name] = { type: field.type }
        if (field.required) {
          fields[field.name].required = [field.required, field.name + " field is required" ]
        }
      })
      this._schema = new mongoose.Schema(fields)
      this._model = mongoose.model(this.name, this._schema)
    }

    this._functions = []
    if (this.props.functions) {
      this.props.functions.forEach(func => {
        try {
          const exec = require(path.resolve(this.spec.dir, "functions", func.lib))
          this._functions.push({
            type: func.type, exec
          })
        } catch (e) {

        }
      })
    }
  }

  get spec () {
    return this._spec
  }

  get props() {
    return this._props
  }

  get name() {
    return this.props.name
  }

  get vault() {
    return this._vault
  }

  get path() {
    return this.props.path
  }

  get model() {
    return this._model
  }

  get schema() {
    return this._schema
  }

  get hasModel() {
    return (this.model != undefined)
  }

  get fields () {
    return this.props.fields
  }

  get isSecure() {
    return this.props.secure
  }

  get functions() {
    return this._functions
  }

  sanitizeItem(data, authorized) {
    var sanitized = {id: data._id}
    this.fields.forEach(field => {
      if (field.secure != undefined && !authorized) {
        // Hide secure fields when not authorized and viewing a non-secure resource
        return
      }
      sanitized[field.name] = data[field.name]
    })
    sanitized.timestamp = moment(data.timestamp).format("YYYY-MM-DD hh:mm:ss")
    return sanitized
  }

  sanitize(data, authorized = false) {
    if (!Array.isArray(data)) {
      return this.sanitizeItem(data)
    }

    var sanitized = []

    data.forEach(item => {
      sanitized.push(this.sanitizeItem(item, authorized))
    })

    return sanitized
  }

  respond(res, data) {
    if(data instanceof Error) {
      return res.send({error: data.message});
    }

    return res.send({data: data})
  }

  all (req, res, next) {
    utils.logInfo(chalk.gray("request: ") + chalk.bold(req.method) + " " + chalk.green(req.originalUrl))
    utils.logInfo(chalk.gray("  params: ") + chalk.green(JSON.stringify(req.params)))
    utils.logInfo(chalk.gray("  body: ") + chalk.green(JSON.stringify(req.body)) + "\n")

    if (!this.hasModel) {
      this.respond(res, new Error('model is missing'))
      return
    }

    next()
  }

  onEvent(eventType, data) {
    if (!this.functions) {
      return
    }

    const context = {
      // notifier: new Notifier(this.spec)
    }

    this.functions.forEach(func => {
      func.exec(this, data, context)
    })
  }

  get (req, res, next) {
    this.vault.isRequestAuthorized(req, (authorized) => {
      if (req.params.id) {
        // We want a single record only
        this.model.findOne({_id: req.params.id}, (error, data) => {
          error ? this.onEvent(EVENTS.GET_ERROR, error) : this.onEvent(EVENTS.GET_OK, data)
          this.respond(res, error ? new Error('cannot find item: ' + error.message) : this.sanitize(data, authorized))
        })
        return
      }

      // We're looking for all records
      this.model.find({}, (error, data) => {
        error ? this.onEvent(EVENTS.GET_ALL_ERROR, error) : this.onEvent(EVENTS.GET_ALL_OK, data)
        this.respond(res, error ? new Error('cannot find items: ' + error.message) : this.sanitize(data, authorized))
      })
    })
  }

  post (req, res, next) {
    this.model.create(req.body, (error, data) => {
      error ? this.onEvent(EVENTS.POST_ERROR, error) : this.onEvent(EVENTS.POST_OK, data)
      error ? utils.logError(error) : utils.logInfo(chalk.green('post ok'))
      this.respond(res, error ? new Error('cannot create item: ' + error.message) : this.sanitize(data))
    })
  }

}

module.exports = Route

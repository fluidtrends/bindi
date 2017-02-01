'use strict'

const path = require('path')
const winston = require('winston')
const chalk = require('chalk')
const utils = require('./utils')
const mongoose = require('mongoose')
const moment = require('moment')

class Route {

  constructor(props, vault) {
    this._props = props
    this._vault = vault

    if (props.fields) {
      var fields = {timestamp: { type: Date, default: Date.now }}
      props.fields.map(field => {
        fields[field.name] = { type: field.type }
        if (field.required) {
          fields[field.name].required = [field.required, field.name + " field is required" ]
        }
      })
      this._schema = new mongoose.Schema(fields)
      this._model = mongoose.model(this.name, this._schema)
    }

    try {
      this._lib = require(props.lib)
    } catch (e) {
    }
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

  get lib () {
    return this._lib
  }

  get hasLib() {
    return (this.lib != undefined)
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

  get (req, res, next) {
    this.vault.isRequestAuthorized(req, (authorized) => {
      if (req.params.id) {
        // We want a single record only
        this.model.findOne({_id: req.params.id}, (error, data) => {
          this.respond(res, error ? new Error('cannot find item') : this.sanitize(data, authorized))
        })
        return
      }

      // We're looking for all records
      this.model.find({}, (error, data) => {
        this.respond(res, error ? new Error('cannot find items') : this.sanitize(data, authorized))
      })
    })
  }

  post (req, res, next) {
    this.model.create(req.body, (error, data) => {
      this.respond(res, error ? new Error('cannot create item') : this.sanitize(data))
    })
  }

}

module.exports = Route

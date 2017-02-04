'use strict'

const fs = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')

class Spec {

  constructor(file, root) {
    this._file = file
    this._root = root
  }

  load () {
    try {
      // Attempt to load from file, if any
      const raw = yaml.safeLoad(fs.readFileSync(this.file, 'utf8'))
      this._data = this.root ? raw[this.root] : raw
      this._routesDir = path.resolve(path.dirname(this.file), this.root || '', 'routes')

      if (this._data.routes) {
        // Resolve the routes
        this._data.routes = this._data.routes.map(route => this.loadRoute(route))
        console.log(this.data.routes)
      }

      // Attempt to load from secure file, if any
      this._data.secure = yaml.safeLoad(fs.readFileSync(this.secureFile, 'utf8'))
    } catch (e) {
    }
  }

  loadRoute (route) {
    try {
      // Attempt to load from file, if any
      return Object.assign(route, yaml.safeLoad(fs.readFileSync(path.resolve(this.routesDir, route.name + ".yaml"), 'utf8')))
    } catch (e) {
    }

    return route
  }


  get root() {
    return this._root
  }

  get routesDir() {
    return this._routesDir
  }

  get exists() {
    return this.file && fs.existsSync(this.file)
  }

  get file () {
    return path.resolve(this._file)
  }

  get secureFile() {
    return path.resolve(path.dirname(path.resolve(this._file)), "." + path.basename(this._file))
  }

  get hasData() {
    return (this.data != undefined)
  }

  get data() {
    return this._data
  }

  get database() {
    return this.data.database
  }

  get routes() {
    return this.data.routes
  }

  get settings() {
    return this.data.settings
  }

  get email () {
    return this.data.email
  }

  get dir() {
    return path.dirname(this.file)
  }

}

module.exports = Spec

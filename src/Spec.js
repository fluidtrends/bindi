'use strict'

const fs = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')

class Spec {

  constructor(file) {
    this._file = file
  }

  load () {
    try {
      // Attempt to load from file, if any
      this._data = yaml.safeLoad(fs.readFileSync(this.file, 'utf8'))

      // Attempt to load from secure file, if any
      this._data.secure = yaml.safeLoad(fs.readFileSync(this.secureFile, 'utf8'))
    } catch (e) {
    }
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
    return (this._data != undefined)
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

}

module.exports = Spec

'use strict'

var mongoose = require('mongoose')
var bcrypt   = require('bcryptjs')

var User = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: { unique: true }
  },
  password: {
    type: String,
    required: true
  }
})

function hash(password) {
   return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

User.methods.hashPassword = function() {
  this.password = hash(this.password)
}

User.methods.passwordMatch = function(password) {
  return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('User', User)

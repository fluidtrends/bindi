'use strict'

const passport   = require('passport')
const jwt        = require('jsonwebtoken')
const ExtractJwt = require('passport-jwt').ExtractJwt
const User       = require('./model/User')
const JwtStrategy = require('passport-jwt').Strategy
const LocalStrategy = require('passport-local')

class Vault {

  constructor(spec) {
    this._spec = spec
    this.configure()
  }

  newToken(user) {
    return jwt.sign(user, this.key, {
      expiresIn: "10 days"
    })
  }

  get key() {
    return this._key
  }

  register(email, password) {
    return new Promise((resolve, reject) => {
      if (!email) {
        reject(new Error('Please enter your email'))
        return
      }

      if (!password) {
        reject(new Error('Please enter your password'))
        return
      }

      // Create a new user
      var newUser = new User({ email, password })

      // Make sure the password gets hashed before saving
      newUser.hashPassword()

      newUser.save((error) => {
        if (error) {
          reject(new Error("The user could not be created"))
          return
        }

        // The user is now created
        resolve(newUser)
      })
    })
  }

  login(email, password) {
    return new Promise((resolve, reject) => {
      User.findOne({ email: email }, (error, user) => {
        if (error) {
          // Something went wrong when trying to fetch the user
          reject(error)
          return
        }

        if (!user) {
          // The user does not exist
          reject(new Error('Could not find user'))
          return
        }

        if (!user.passwordMatch(password)) {
          // The password is wrong
          reject(new Error('Invalid password'))
          return
        }

        // We're now logged in, return the login token
        resolve(this.newToken(user))
      })
    })
  }

  configure() {
    const key    = (this.spec.secure ? this.spec.secure.key : '')
    const secret = (this.spec.secure ? this.spec.secure.secret : '')
    this._key = key + ":" + secret

    passport.use(new LocalStrategy({
      usernameField: 'email'
    }, (email, password, done) => {
      User.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err)
        }

        if (!user) {
          return done(null, false, {error: 'Unauthorized'})
        }

        if (!user.passwordMatch(password)) {
          return done(null, false, {error: 'bad password'})
        }

        return done(null, user)
      })
    }))

    passport.use(new JwtStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeader(),
      secretOrKey: this.key
    }, (payload, done) => {
      User.findById(payload._doc._id, (err, user) => {
        if (err) {
          return done(err)
        }

        if (!user) {
          return done(null, false, {error: 'Unauthorized'})
        }

        return done(null, user)
      })
    }))
  }

  get spec() {
    return this._spec
  }

  authenticate() {
    return passport.authenticate('jwt', { session: false })
  }

  isRequestAuthorized(req, done) {
    if (!req.headers.authorization) {
      return done(false)
    }

    jwt.verify(req.headers.authorization.substring(4), this.key, (err, payload) => {
      if (err) {
        return done(false)
      }

      User.findById(payload._doc._id, (err, user) => {
        if (err) {
          return done(false)
        }

        if (!user) {
          return done(false)
        }

        return done(true)
      })
    })
  }
}

module.exports = Vault

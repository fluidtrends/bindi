'use strict'

const express = require('express')
const Route = require('./Route')

class Router {

  constructor(spec, vault) {
    this._spec = spec
    this._vault = vault
    this._instance = express.Router()
    this.configure()
  }

  configure() {
    if (!this.spec || !this.spec.routes) {
      return
    }

    this._routes = []
    this.spec.routes.forEach(routeProps => {
      const route = new Route(routeProps, this.vault)
      this._routes.push(route)
    })
  }

  get vault() {
    return this._vault
  }

  get routes() {
    return this._routes
  }

  get hasRoutes() {
    return (this.routes != undefined)
  }

  get spec() {
    return this._spec
  }

  get instance() {
    return this._instance
  }

  mountAuth() {
    this.instance.post('/register', (req, res) => {
      this.vault.register(req.body.email, req.body.password).
                 then((user) => {
                    res.send({
                      data: { user }
                    })
                  }).
                  catch((error) => res.send({error: error.message}))
    })

    this.instance.post('/login', (req, res) => {
      this.vault.login(req.body.email, req.body.password).
                 then((token) => {
                    res.send({
                      data: { token }
                    })
                  }).
                  catch((error) => res.send({error: error.message}))
    })
  }

  mountRoute(route) {
    this.instance.all(route.path, route.all.bind(route))

    if (route && route.isSecure && this.vault) {
      // This is a secure route
      this.instance.get(route.path, this.vault.authenticate(), route.get.bind(route))
      this.instance.post(route.path, this.vault.authenticate(), route.post.bind(route))
      return
    }

    // This is an unsecure route
    this.instance.get(route.path, route.get.bind(route))
    this.instance.post(route.path, route.post.bind(route))
  }

  mount() {
    if (!this.hasRoutes) {
      return
    }

    // Mount authentication
    this.mountAuth()

    // Mount all routes
    this.routes.forEach (route => this.mountRoute(route))
  }

}

module.exports = Router

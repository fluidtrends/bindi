const savor = require("savor")
const Server = savor.src("Server")
const Spec = savor.src("Spec")

const mongoose    = require('mongoose')

function newServer(context) {
  savor.addAsset('assets/spec.yaml', 'spec.yaml', context)
  const spec = new Spec('spec.yaml')
  spec.load()
  return new Server(spec)
}

savor.add("should be able to create a server", (context, done) => {
  const server = newServer(context)
  context.expect(server).to.exist

  done()
}).

add("should not initialize a server if the database connection fails", (context, done) => {
  const server = newServer(context)

  // Force the connect to fail (fake it)
  context.stub(mongoose, 'connect', (url, options, callback) => callback(new Error('error')))

  savor.promiseShouldFail(server.initialize(), done, () => {
    mongoose.connect.restore()
  })
}).

add("should initialize a server", (context, done) => {
  const server = newServer(context)
  server.load()

  // Force the connect to succeed (fake it)
  context.stub(mongoose, 'connect', (url, options, callback) => callback())

  savor.promiseShouldSucceed(server.initialize(), done, () => {
    mongoose.connect.restore()
  })
}).

add("should start a server", (context, done) => {
  const server = newServer(context)
  server.load()

  // Force the connect to succeed and the start (fake them)
  context.stub(server.instance, 'listen', (port, callback) => callback())
  context.stub(mongoose, 'connect', (url, options, callback) => callback())


  server.start(() => {
    mongoose.connect.restore()
    server.instance.listen.restore()
    done()
  })
}).

run("Server")

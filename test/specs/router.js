const savor = require("savor")
const Router = savor.src("Router")
const Server = savor.src("Server")
const Spec = savor.src("Spec")
// var request = require("supertest")

function newSpec(context, withRoutes = true) {
  savor.addAsset(withRoutes ? 'assets/spec.yaml' : 'assets/spec-noroutes.yaml', 'spec.yaml', context)
  const spec = new Spec('spec.yaml')
  spec.load()
  return spec
}

savor.add("should be able to create a router", (context, done) => {
  const spec = newSpec(context)
  const router = new Router(spec)
  router.mount()

  context.expect(router).to.exist
  context.expect(router.instance).to.exist
  context.expect(router.spec).to.exist
  context.expect(router.hasRoutes).to.equal.true
  context.expect(router.routes).to.exist

  done()
}).

add("should be able to create a router without routes", (context, done) => {
  const spec = newSpec(context, false)
  const router = new Router(spec)
  router.mount()

  context.expect(router).to.exist
  context.expect(router.instance).to.exist
  context.expect(router.spec).to.exist
  context.expect(router.hasRoutes).to.equal.false
  context.expect(router.routes).to.not.exist

  done()
}).

run("Router")

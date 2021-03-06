const savor = require("savor")
const Cloud = savor.src("Cloud")
const Spec = savor.src("Spec")

function newSpec(context, withRoutes = true) {
  savor.addAsset(withRoutes ? 'assets/spec.yaml' : 'assets/spec-noroutes.yaml', 'spec.yaml', context)
  savor.addAsset('assets/config.json', 'config.json', context)
  const spec = new Spec('spec.yaml')
  spec.load()
  return spec
}

savor.add("should be able to send an email", (context, done) => {
  const spec = newSpec(context)
  const cloud = new Cloud(spec)

  context.expect(cloud).to.exist

  done()
}).


run("Cloud")

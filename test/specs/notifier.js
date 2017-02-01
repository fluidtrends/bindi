const savor = require("savor")
const Notifier = savor.src("Notifier")
const Spec = savor.src("Spec")

function newSpec(context, withRoutes = true) {
  savor.addAsset(withRoutes ? 'assets/spec.yaml' : 'assets/spec-noroutes.yaml', 'spec.yaml', context)
  const spec = new Spec('spec.yaml')
  spec.load()
  return spec
}

savor.add("should be able to send an email", (context, done) => {
  const spec = newSpec(context)
  const notifier = new Notifier(spec)

  context.expect(notifier).to.exist

  done()
}).


run("Notifier")

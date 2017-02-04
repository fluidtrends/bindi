var savor = require("savor")
var Spec = savor.src("Spec")

savor.add("should be able to load a spec", (context, done) => {
  savor.addAsset('assets/spec.yaml', 'spec.yaml', context)
  const spec = new Spec('spec.yaml')
  spec.load()

  context.expect(spec).to.exist
  context.expect(spec.exists).to.be.true
  context.expect(spec.hasData).to.be.true
  context.expect(spec.database).to.exist
  context.expect(spec.database.name).to.equal('test')

  done()
}).


add("should be able to load a spec with a root", (context, done) => {
  savor.addAsset('assets/spec-root.yaml', 'spec.yaml', context)
  const spec = new Spec('spec.yaml', 'api')
  spec.load()

  context.expect(spec).to.exist
  context.expect(spec.exists).to.be.true
  context.expect(spec.hasData).to.be.true
  context.expect(spec.database).to.exist
  context.expect(spec.database.name).to.equal('test')

  done()
}).

run("Spec")

const savor = require("savor")
const Route = savor.src("Route")
const path = require('path')
// var request = require("supertest")

savor.add("should be able to create a route", (context, done) => {
  savor.addAsset('assets/tests.js', 'tests.js', context)
  const route = new Route({
    name: 'tests',
    lib: path.resolve(context.dir, 'tests.js')
  })

  context.expect(route).to.exist
  context.expect(route.props).to.exist
  context.expect(route.name).to.equal('tests')

  done()
}).

add("should be able to invoke a route", (context, done) => {
    // request(newServerInstance(routes)).
    // get('/ddddd').
    // end((err, res) => {
    //     context.expect(res.statusCode).to.equal(404)
    //     done()
    // })
    done()
}).

run("Route")

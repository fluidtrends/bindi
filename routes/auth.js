var express = require('express')
var router  = express.Router()

router.get('/', (req, res) => {
  res.send({status: "ok", data: {message: 'done'}});
})

module.exports = {
  path: '/auth',
  router: router
}

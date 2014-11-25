var router = require('./router')

exports.start = function(app) {
  app.afterRun(router.start)
}

exports.getExports = function(app) {
  return router
}

exports.stop = function(app) {

}

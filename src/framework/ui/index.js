exports.start = function(app) {
  app.registerStore('ui/regions', require('./stores/regions'))
  app.registerStore('ui/loading', require('./stores/regions'))
  app.registerStore('ui/components', require('./stores/components'))

  app.registerComponent('region', require('./components/region'))
}

exports.stop = function(app) {

}

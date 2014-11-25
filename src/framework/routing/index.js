var _ = require('lodash')
var page = require('page')

/**
 * @param {{ match: string|regex, handlers: array<function> }}
 */
function loadRoute(rotue) {
  var args = [route.match].concat(route.handlers)
  // register route with PageJS
  page.apply(page, args)
}

exports.start = (app) => {
  app.beforeRun(app => {
    app.registerStore('routing/routes')
  })

  app.router = {
    /**
     * @param {array<{ match: string|regex, handlers: array<function> }>}
     */
    defineRoutes(routes) {
      if (_.isArray(routes)) {
        routes.forEach(loadRoute)
      } else {
        loadRoute(routes)
      }
    },

    go: function(url) {
      page(url)
    },

    start: function() {
      page.start()
    },

    stop: function() {
      page.start()
    },
  }

  app.router = pa

}

var page = require('page')

/**
 * @param {{ match: string|regex, handlers: array<function> }}
 */
function loadRoute(route) {
  var args = [route.match].concat(route.handlers)
  // register route with PageJS
  page.apply(page, args)
}

module.exports = {
  /**
   * @param {array<{ match: string|regex, handlers: array<function> }}
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
    page.stop()
  },
}

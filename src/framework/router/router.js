var _ = require('lodash')
var page = require('page')

/**
 * @param {{ match: string|regex, handle: array<function> }}
 */
function loadRoute(route) {
  var args = _.filter([route.match].concat(route.handle))

  if (args.length === 1) {
    throw new Error("Must supply `handle` functions to defineRoutes")
  }

  // register route with PageJS
  page.apply(page, args)
}

module.exports = {
  /**
   * @param {array<{ match: string|regex, handle: array<function> }}
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

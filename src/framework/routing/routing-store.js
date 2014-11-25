var Store = require('nuclear-js').Store
var Map = require('immutable').Map

module.exports = Store({
  getInitialState() {
    return Map()
  },

  initialize() {
    this.on(actionTypes.REGISTER_ROUTE, registerRoute)
  }
})


/**
 * Registers a new route
 * payload.match
 * payload.handlers
 */
function registerRoute(routes, payload) {
  routes.set(payload.match, payload.handlers)
}

var actionTypes = require('../action-types')
var Store = require('nuclear-js').Store

module.exports = Store({
  getInitialState() {
    return {}
  },

  initialize() {
    this.on(actionTypes.REGISTER_COMPONENT, registerComponent)
  }
})

/**
 * payload.id
 * payload.component
 */
function registerComponent(state, payload) {
  return state.set(payload.id, payload.component)
}

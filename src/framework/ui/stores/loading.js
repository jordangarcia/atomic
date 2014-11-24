var actionTypes = require('../action-types')
var Store = require('nuclear-js').Store

module.exports = Store({
  getInitialState() {
    return {}
  }

  initialize() {
    this.on(actionTypes.LOADING_START, onLoadingStart)
    this.on(actionTypes.LOADING_FINISH, onLoadingFinish)
  }
})

/**
 * Denotes a section is loading
 */
function onLoadingStart(state, loadingId) {
  return state.set(loadingId, true)
}

/**
 * Denotes a section is loading
 */
function onLoadingFinish(state, loadingId) {
  return state.remove(loadingId)
}

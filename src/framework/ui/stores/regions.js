var Map = require('immutable').Map
var actionTypes = require('../action-types')
var Store = require('nuclear-js').Store

module.exports = Store({
  getInitialState() {
    return {}
  }

  initialize() {
    this.on(actionTypes.INIT_REGION, initRegion)
    this.on(actionTypes.SET_REGION_COMPONENT, showComponent)
    this.on(actionTypes.SHOW_REGION, showRegion)
    this.on(actionTypes.HIDE_REGION, hideRegion)
    this.on(actionTypes.TEARDOWN_REGION, initRegion)
  }
})

/**
 * Initializes a region
 * payload.regionId
 */
function initRegion(state, payload) {
  return state.set(payload.regionId, Map({
    regionId: payload.regionId,
    shown: false,
    componentId: null,
    componentData: null,
  }))
}

/**
 * Shows a component on a region
 * payload.regionId
 * payload.componentId
 * payload.componentData
 */
function showComponent(state, payload) {
  return state.set(payload.regionId, Map({
    regionId: payload.regionId,
    shown: false,
    componentId: payload.componentId,
    componentData: payload.componentData,
  }))
}

/**
 * Makes a region visible
 * payload.regionId
 */
function showRegion(state, payload) {
  return state.setIn([payload.regionId, shown], true)
}

/**
 * Hides a region
 * payload.regionId
 */
function hideRegion(state, payload) {
  return state.setIn([payload.regionId, shown], false)
}

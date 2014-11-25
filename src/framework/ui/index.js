var actionTypes = require('./action-types')

exports.start = function(app) {
  app.registerStore('ui/regions', require('./stores/regions'))
  app.registerStore('ui/loading', require('./stores/regions'))
  app.registerStore('ui/components', require('./stores/components'))

  app.registerComponent('v-region', require('./components/region'))
}

exports.getExports = function(app) {
  return {
    /**
     * Shows a component at a certain region
     */
    showComponent(regionId, componentId) {
      app.dispatch(actionTypes.SET_REGION_COMPONENT, {
        regionId: regionId,
        componentId: componentId,
        isVisible: true,
      })
    }
  }
}

exports.stop = function(app) {

}

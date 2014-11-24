exports.render = ['app', 'ui', function(app, ui) {
  return function(region, component) {
    ui.showComponent(region, component)
  }
}]

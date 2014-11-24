module.exports = ['ui', function(app) {
  return [
    {
      match: '/home',
      handle: [
        ui.render('mainRegion', 'homepage')
      ]
    },
  ]
}]

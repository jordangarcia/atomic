var Atomic = require('../framework')
var app = Atomic()

app.registerComponent('dashboard', require('./modules/dashboard/dashboard-component'))
app.registerComponent('editor', require('./modules/editor/editor-component'))

app.router.defineRoutes([
  {
    match: '/',
    handlers: [
      (ctx) => app.ui.showComponent('workspace', 'dashboard'),
    ]
  },
  {
    match: '/editor',
    handlers: [
      (ctx) => app.ui.showComponent('workspace', 'editor'),
    ]
  }
])

document.addEventListener('DOMContentLoaded', () => {
  app.run({
    el: '#webapp'
  })
})

window.webapp = app

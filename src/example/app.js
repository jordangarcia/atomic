var Atomic = require('./framework')
var exampleModule = require('./modules/example-module')

var app = Atomic()

app.attachModule('example', exampleModule);

app.start()

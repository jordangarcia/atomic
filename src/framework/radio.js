var Radio = require('backbone-radio-standalone')

var appChannel = Radio.channel('app')

appChannel.dispatch = function(actionType, payload) {
  appChannel.command('dispatch', actionType, payload)
}

module.exports = appChannel

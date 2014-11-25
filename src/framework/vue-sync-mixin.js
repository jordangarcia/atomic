var Nuclear = require('nuclear-js')
var logging = require('./logging')

module.exports = {
  methods: {
    /**
     * Syncs a reactor.get(getter) value with a vm data property
     * @param {string} vmProp
     * @param {Getter|KeyPath} getter
     */
    $sync(vmProp, getter) {
      if (!Nuclear.Getter.isGetter(getter) &&
          !Nuclear.KeyPath.isKeyPath(getter)) {

        logging.warn('Must supply a KeyPath or Getter to getDataBindings()')
        return
      }

      logging.log("Setting up sync", vmProp, getter)
      var reactor = this.$options.reactor
      this.$set(vmProp, reactor.getJS(getter))
      // setup the data observation
      var unwatchFn = reactor.observe(getter, val => {
        this.$set(vmProp, Nuclear.toJS(val))
      })
      this.__reactorUnwatchFns.push(unwatchFn)
    }
  },

  created: function() {
    if (!this.$options.reactor) {
      throw new Error("Must supply reactor to ViewModel")
    }

    this.__reactorUnwatchFns = []

    if (!this.$options.getDataBindings) {
      return
    }

    var dataBindings = this.$options.getDataBindings()
    var reactor = this.$options.reactor

    _.each(dataBindings, (reactorKeyPath, vmProp) => {
      this.$sync(vmProp, reactorKeyPath)
    })

    this.$on('destroyed', function() {
      while (this.__reactorUnwatchFns.length) {
        this.__reactorUnwatchFns.shift()()
      }
    })
  }
}

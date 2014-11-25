var _ = require('lodash')
var Vue = require('vue')
var Nuclear = require('nuclear-js')
var List = require('immutable').List
var logging = require('./logging')
var vueSyncMixin = require('./vue-sync-mixin')

var coreModules = {
  ui: require('./ui'),
}

function validateRunOptions(options) {
  if (!options.el) {
    throw new Error("Cannot run app with options.el")
  }
}

/**
 * @constructor
 * Main App wrapper
 */
class App {
  constructor(config) {
    if (!(this instanceof App)) {
      return new App(config)
    }
    this.radio = require('./radio')

    /**
     * Nuclear Reactor with framework core stores
     */
    this.reactor = Nuclear.Reactor()

    this.router = require('./router')

    // rootVM holds all Vue related things such as components, directives, filters, etc
    this.__rootVM = new Vue()

    //this.__modules = {}

    this.__beforeRunFns = []

    this.__afterRunFns = []

    // setup link between radio and Nuclear Reactor
    this.radio.comply('dispatch', (type, payload) => {
      this.reactor.dispatch(type, payload)
    })

    _.each(coreModules, (module, id) => {
      this.attachModule(id, module)
    })
  }

  /**
   * Runs the app
   * @param {object} options
   */
  run(options) {
    validateRunOptions(options)

    while(this.__beforeRunFns.length > 0) {
      this.__beforeRunFns.shift()(this)
    }

    this.__rootVM.$mount(options.el)

    this.router.start()

    while(this.__afterRunFns.length > 0) {
      this.__afterRunFns.shift()(this)
    }
  }

  /**
   * Attaches a module and starts it
   * @param {string} id
   * @param {object} module
   */
  attachModule(id, module) {
    if (this[id]) {
      throw new Error("Cannot attach module at this[" + id + "]")
    }

    logging.log('module started', id, module)

    module.start(this)

    // expose whatever the module wanted to export
    this[id] = module.getExports(this)

    if (this.isRunning) {
      this.__clearFnQueues()
    }
  }

  /**
   * Attaches a module and starts it
   * @param {string} id
   * @param {object} module
   */
  detachModule(id) {
    var module = this[id]

    if (module.stop) {
      module.stop(module)
    }

    delete this[id]
  }

  /**
   * Dispatch an actionType and payload into the Nuclear.Reactor
   * @param {string} actionType
   * @param {object|*} payload
   */
  dispatch(actionType, payload) {
    this.reactor.dispatch(actionType, payload)
  }

  /**
   * Returns a map of moduleId => module
   */
  getCoreModules() {
    return coreModules
  }

  /**
   * Registers a function to be run before the app is started
   * @param {function} fn
   */
  beforeRun(fn) {
    this.__beforeRunFns = this.__beforeRunFns.push(fn)
  }

  /**
   * Registers a function to be run after the app is started
   * @param {function} fn
   */
  afterRun(fn) {
    this.__afterRunFns = this.__afterRunFns.push(fn)
  }

  /**
   * Registers a Nuclear store on the Nuclear Reactor
   */
  registerStore(id, store) {
    this.reactor.attachStore(id, store)
  }

  /**
   * Registers a global Vue Component
   * @param {string} id
   * @param {object} component
   */
  registerComponent(id, component) {
    component = _.cloneDeep(component)
    // inject the sync mixin to allow reactor data syncing
    if (component.mixins) {
      component.mixins.unshift(vueSyncMixin)
    } else {
      component.mixins = [vueSyncMixin]
    }

    component.reactor = this.reactor

    this.__rootVM.$options.components[id] = Vue.extend(component)
  }

  /**
   * Registers a global Vue Directive
   * @param {string} id
   * @param {object|function} directive
   */
  registerDirective(id, directive) {
    this.__rootVM.$options.directives[id] = directive
  }

  /**
   * Registers a global Vue Filter
   * @param {string} id
   * @param {function} filter
   */
  registerFilter(id, filter) {
    this.__rootVM.$options.filters[id] = filter
  }

  /**
   * Executes all the before and after functions
   */
  __clearFnQueues() {
    while(this.__beforeRunFns.length > 0) {
      this.__beforeRunFns.shift()(this)
    }
    while(this.__afterRunFns.length > 0) {
      this.__afterRunFns.shift()(this)
    }
  }
}

module.exports = App

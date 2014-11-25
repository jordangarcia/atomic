var _ = require('lodash')
var Vue = require('vue')
var Nuclear = require('nuclear-js')
var logging = require('./logging')
var vueSyncMixin = require('./vue-sync-mixin')

var coreModules = {
  ui: require('./ui'),
  router: require('./router'),
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

    /**
     * Nuclear Reactor with framework core stores
     */
    this.reactor = Nuclear.Reactor()

    // rootVM holds all Vue related things such as components, directives, filters, etc
    this.__rootVM = new Vue()

    // list of all module ids
    this.__modules = []

    this.__beforeRunFns = []

    this.__afterRunFns = []

    _.each(coreModules, (module, id) => {
      this.attachModule(id, module)
    })
  }

  /**
   * Runs the app
   * @param {object} options
   */
  run(options) {
    logging.log("Running app with: ", options)

    validateRunOptions(options)

    while(this.__beforeRunFns.length > 0) {
      this.__beforeRunFns.shift()(this)
    }

    this.__rootVM.$mount(options.el)

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

    this.__modules.push(id)

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
   * Shortcut to reactor.get
   * @param {string|array} keypaths
   * @param {function} computeFn
   * @return {*}
   */
  get() {
    return this.reactor.get.apply(this.reactor, arguments)
  }

  /**
   * Shortcut to reactor.observe
   * @param {Getter|KeyPath} getter
   * @param {function} handler
   * @return {*}
   */
  observe(getter, handler) {
    return this.reactor.observe(getter, handler)
  }

  /**
   * Registers a function to be run before the app is started
   * @param {function} fn
   */
  beforeRun(fn) {
    this.__beforeRunFns.push(fn)
  }

  /**
   * Registers a function to be run after the app is started
   * @param {function} fn
   */
  afterRun(fn) {
    this.__afterRunFns.push(fn)
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

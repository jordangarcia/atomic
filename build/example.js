/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Atomic = __webpack_require__(1)
	var app = Atomic()

	app.registerComponent('dashboard', __webpack_require__(2))
	app.registerComponent('editor', __webpack_require__(3))

	app.router.defineRoutes([
	  {
	    match: '/',
	    handle: [
	      function()  {return app.ui.showComponent('workspace', 'dashboard');}
	    ],
	  },
	  {
	    match: '/editor',
	    handle: [
	      function()  {return app.ui.showComponent('workspace', 'editor');}
	    ],
	  }
	])

	document.addEventListener('DOMContentLoaded', function()  {
	  app.run({
	    el: '#webapp'
	  })
	})

	window.webapp = app


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(4)


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  template: __webpack_require__(8),

	  replace: true,
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  template: __webpack_require__(7),

	  replace: true,
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(11)
	var Vue = __webpack_require__(12)
	var Nuclear = __webpack_require__(13)
	var logging = __webpack_require__(5)
	var vueSyncMixin = __webpack_require__(6)

	var coreModules = {
	  ui: __webpack_require__(9),
	  router: __webpack_require__(10),
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

	  function App(config) {"use strict";
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

	    _.each(coreModules, function(module, id)  {
	      this.attachModule(id, module)
	    }.bind(this))
	  }

	  /**
	   * Runs the app
	   * @param {object} options
	   */
	  App.prototype.run=function(options) {"use strict";
	    logging.log("Running app with: ", options)

	    validateRunOptions(options)

	    while(this.__beforeRunFns.length > 0) {
	      this.__beforeRunFns.shift()(this)
	    }

	    this.__rootVM.$mount(options.el)

	    while(this.__afterRunFns.length > 0) {
	      this.__afterRunFns.shift()(this)
	    }
	  };

	  /**
	   * Attaches a module and starts it
	   * @param {string} id
	   * @param {object} module
	   */
	  App.prototype.attachModule=function(id, module) {"use strict";
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
	  };

	  /**
	   * Attaches a module and starts it
	   * @param {string} id
	   * @param {object} module
	   */
	  App.prototype.detachModule=function(id) {"use strict";
	    var module = this[id]

	    if (module.stop) {
	      module.stop(module)
	    }

	    delete this[id]
	  };

	  /**
	   * Dispatch an actionType and payload into the Nuclear.Reactor
	   * @param {string} actionType
	   * @param {object|*} payload
	   */
	  App.prototype.dispatch=function(actionType, payload) {"use strict";
	    this.reactor.dispatch(actionType, payload)
	  };

	  /**
	   * Shortcut to reactor.get
	   * @param {string|array} keypaths
	   * @param {function} computeFn
	   * @return {*}
	   */
	  App.prototype.get=function() {"use strict";
	    return this.reactor.get.apply(this.reactor, arguments)
	  };

	  /**
	   * Shortcut to reactor.observe
	   * @param {Getter|KeyPath} getter
	   * @param {function} handler
	   * @return {*}
	   */
	  App.prototype.observe=function(getter, handler) {"use strict";
	    return this.reactor.observe(getter, handler)
	  };

	  /**
	   * Registers a function to be run before the app is started
	   * @param {function} fn
	   */
	  App.prototype.beforeRun=function(fn) {"use strict";
	    this.__beforeRunFns.push(fn)
	  };

	  /**
	   * Registers a function to be run after the app is started
	   * @param {function} fn
	   */
	  App.prototype.afterRun=function(fn) {"use strict";
	    this.__afterRunFns.push(fn)
	  };

	  /**
	   * Registers a Nuclear store on the Nuclear Reactor
	   */
	  App.prototype.registerStore=function(id, store) {"use strict";
	    this.reactor.attachStore(id, store)
	  };

	  /**
	   * Registers a global Vue Component
	   * @param {string} id
	   * @param {object} component
	   */
	  App.prototype.registerComponent=function(id, component) {"use strict";
	    component = _.cloneDeep(component)
	    // inject the sync mixin to allow reactor data syncing
	    if (component.mixins) {
	      component.mixins.unshift(vueSyncMixin)
	    } else {
	      component.mixins = [vueSyncMixin]
	    }

	    component.reactor = this.reactor

	    this.__rootVM.$options.components[id] = Vue.extend(component)
	  };

	  /**
	   * Registers a global Vue Directive
	   * @param {string} id
	   * @param {object|function} directive
	   */
	  App.prototype.registerDirective=function(id, directive) {"use strict";
	    this.__rootVM.$options.directives[id] = directive
	  };

	  /**
	   * Registers a global Vue Filter
	   * @param {string} id
	   * @param {function} filter
	   */
	  App.prototype.registerFilter=function(id, filter) {"use strict";
	    this.__rootVM.$options.filters[id] = filter
	  };

	  /**
	   * Executes all the before and after functions
	   */
	  App.prototype.__clearFnQueues=function() {"use strict";
	    while(this.__beforeRunFns.length > 0) {
	      this.__beforeRunFns.shift()(this)
	    }
	    while(this.__afterRunFns.length > 0) {
	      this.__afterRunFns.shift()(this)
	    }
	  };


	module.exports = App


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var utils = {}
	/**
	 *  log for debugging
	 */
	utils.log = function () {
	  if (console) {
	    console.log.apply(console, arguments)
	  }
	}

	/**
	 *  warnings, traces by default
	 *  can be suppressed by `silent` option.
	 */
	utils.warn = function (msg) {
	  if (console) {
	    console.warn(msg)
	      if (console.trace) {
	        console.trace()
	      }
	  }
	}

	module.exports = utils


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Nuclear = __webpack_require__(13)
	var logging = __webpack_require__(5)

	module.exports = {
	  methods: {
	    /**
	     * Syncs a reactor.get(getter) value with a vm data property
	     * @param {string} vmProp
	     * @param {Getter|KeyPath} getter
	     */
	    $sync:function(vmProp, getter) {
	      if (!Nuclear.Getter.isGetter(getter) &&
	          !Nuclear.KeyPath.isKeyPath(getter)) {

	        logging.warn('Must supply a KeyPath or Getter to getDataBindings()')
	        return
	      }

	      logging.log("Setting up sync", vmProp, getter)
	      var reactor = this.$options.reactor
	      this.$set(vmProp, reactor.getJS(getter))
	      // setup the data observation
	      var unwatchFn = reactor.observe(getter, function(val)  {
	        this.$set(vmProp, Nuclear.toJS(val))
	      }.bind(this))
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

	    _.each(dataBindings, function(reactorKeyPath, vmProp)  {
	      this.$sync(vmProp, reactorKeyPath)
	    }.bind(this))

	    this.$on('destroyed', function() {
	      while (this.__reactorUnwatchFns.length) {
	        this.__reactorUnwatchFns.shift()()
	      }
	    })
	  }
	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "<div class=\"editor\">\n  <h1>Editor:</h1>\n  <a href=\"/\">goto dashboard</a>\n</div>\n";

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "<div class=\"dashboard\">\n  <h1>Dashboard:</h1>\n  <a href=\"/editor\">goto editor</a>\n</div>\n";

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var actionTypes = __webpack_require__(14)

	exports.start = function(app) {
	  app.registerStore('ui/regions', __webpack_require__(15))
	  app.registerStore('ui/loading', __webpack_require__(15))
	  app.registerStore('ui/components', __webpack_require__(16))

	  app.registerComponent('v-region', __webpack_require__(17))
	}

	exports.getExports = function(app) {
	  return {
	    /**
	     * Shows a component at a certain region
	     */
	    showComponent:function(regionId, componentId) {
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


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var router = __webpack_require__(18)

	exports.start = function(app) {
	  app.afterRun(router.start)
	}

	exports.getExports = function(app) {
	  return router
	}

	exports.stop = function(app) {

	}


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/**
	 * @license
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash -o ./dist/lodash.compat.js`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	;(function() {

	  /** Used as a safe reference for `undefined` in pre ES5 environments */
	  var undefined;

	  /** Used to pool arrays and objects used internally */
	  var arrayPool = [],
	      objectPool = [];

	  /** Used to generate unique IDs */
	  var idCounter = 0;

	  /** Used internally to indicate various things */
	  var indicatorObject = {};

	  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
	  var keyPrefix = +new Date + '';

	  /** Used as the size when optimizations are enabled for large arrays */
	  var largeArraySize = 75;

	  /** Used as the max size of the `arrayPool` and `objectPool` */
	  var maxPoolSize = 40;

	  /** Used to detect and test whitespace */
	  var whitespace = (
	    // whitespace
	    ' \t\x0B\f\xA0\ufeff' +

	    // line terminators
	    '\n\r\u2028\u2029' +

	    // unicode category "Zs" space separators
	    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
	  );

	  /** Used to match empty string literals in compiled template source */
	  var reEmptyStringLeading = /\b__p \+= '';/g,
	      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
	      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

	  /**
	   * Used to match ES6 template delimiters
	   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
	   */
	  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

	  /** Used to match regexp flags from their coerced string values */
	  var reFlags = /\w*$/;

	  /** Used to detected named functions */
	  var reFuncName = /^\s*function[ \n\r\t]+\w/;

	  /** Used to match "interpolate" template delimiters */
	  var reInterpolate = /<%=([\s\S]+?)%>/g;

	  /** Used to match leading whitespace and zeros to be removed */
	  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

	  /** Used to ensure capturing order of template delimiters */
	  var reNoMatch = /($^)/;

	  /** Used to detect functions containing a `this` reference */
	  var reThis = /\bthis\b/;

	  /** Used to match unescaped characters in compiled string literals */
	  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

	  /** Used to assign default `context` object properties */
	  var contextProps = [
	    'Array', 'Boolean', 'Date', 'Error', 'Function', 'Math', 'Number', 'Object',
	    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
	    'parseInt', 'setTimeout'
	  ];

	  /** Used to fix the JScript [[DontEnum]] bug */
	  var shadowedProps = [
	    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
	    'toLocaleString', 'toString', 'valueOf'
	  ];

	  /** Used to make template sourceURLs easier to identify */
	  var templateCounter = 0;

	  /** `Object#toString` result shortcuts */
	  var argsClass = '[object Arguments]',
	      arrayClass = '[object Array]',
	      boolClass = '[object Boolean]',
	      dateClass = '[object Date]',
	      errorClass = '[object Error]',
	      funcClass = '[object Function]',
	      numberClass = '[object Number]',
	      objectClass = '[object Object]',
	      regexpClass = '[object RegExp]',
	      stringClass = '[object String]';

	  /** Used to identify object classifications that `_.clone` supports */
	  var cloneableClasses = {};
	  cloneableClasses[funcClass] = false;
	  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
	  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
	  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
	  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

	  /** Used as an internal `_.debounce` options object */
	  var debounceOptions = {
	    'leading': false,
	    'maxWait': 0,
	    'trailing': false
	  };

	  /** Used as the property descriptor for `__bindData__` */
	  var descriptor = {
	    'configurable': false,
	    'enumerable': false,
	    'value': null,
	    'writable': false
	  };

	  /** Used as the data object for `iteratorTemplate` */
	  var iteratorData = {
	    'args': '',
	    'array': null,
	    'bottom': '',
	    'firstArg': '',
	    'init': '',
	    'keys': null,
	    'loop': '',
	    'shadowedProps': null,
	    'support': null,
	    'top': '',
	    'useHas': false
	  };

	  /** Used to determine if values are of the language type Object */
	  var objectTypes = {
	    'boolean': false,
	    'function': true,
	    'object': true,
	    'number': false,
	    'string': false,
	    'undefined': false
	  };

	  /** Used to escape characters for inclusion in compiled string literals */
	  var stringEscapes = {
	    '\\': '\\',
	    "'": "'",
	    '\n': 'n',
	    '\r': 'r',
	    '\t': 't',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  /** Used as a reference to the global object */
	  var root = (objectTypes[typeof window] && window) || this;

	  /** Detect free variable `exports` */
	  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

	  /** Detect free variable `module` */
	  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

	  /** Detect the popular CommonJS extension `module.exports` */
	  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

	  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
	  var freeGlobal = objectTypes[typeof global] && global;
	  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
	    root = freeGlobal;
	  }

	  /*--------------------------------------------------------------------------*/

	  /**
	   * The base implementation of `_.indexOf` without support for binary searches
	   * or `fromIndex` constraints.
	   *
	   * @private
	   * @param {Array} array The array to search.
	   * @param {*} value The value to search for.
	   * @param {number} [fromIndex=0] The index to search from.
	   * @returns {number} Returns the index of the matched value or `-1`.
	   */
	  function baseIndexOf(array, value, fromIndex) {
	    var index = (fromIndex || 0) - 1,
	        length = array ? array.length : 0;

	    while (++index < length) {
	      if (array[index] === value) {
	        return index;
	      }
	    }
	    return -1;
	  }

	  /**
	   * An implementation of `_.contains` for cache objects that mimics the return
	   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
	   *
	   * @private
	   * @param {Object} cache The cache object to inspect.
	   * @param {*} value The value to search for.
	   * @returns {number} Returns `0` if `value` is found, else `-1`.
	   */
	  function cacheIndexOf(cache, value) {
	    var type = typeof value;
	    cache = cache.cache;

	    if (type == 'boolean' || value == null) {
	      return cache[value] ? 0 : -1;
	    }
	    if (type != 'number' && type != 'string') {
	      type = 'object';
	    }
	    var key = type == 'number' ? value : keyPrefix + value;
	    cache = (cache = cache[type]) && cache[key];

	    return type == 'object'
	      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
	      : (cache ? 0 : -1);
	  }

	  /**
	   * Adds a given value to the corresponding cache object.
	   *
	   * @private
	   * @param {*} value The value to add to the cache.
	   */
	  function cachePush(value) {
	    var cache = this.cache,
	        type = typeof value;

	    if (type == 'boolean' || value == null) {
	      cache[value] = true;
	    } else {
	      if (type != 'number' && type != 'string') {
	        type = 'object';
	      }
	      var key = type == 'number' ? value : keyPrefix + value,
	          typeCache = cache[type] || (cache[type] = {});

	      if (type == 'object') {
	        (typeCache[key] || (typeCache[key] = [])).push(value);
	      } else {
	        typeCache[key] = true;
	      }
	    }
	  }

	  /**
	   * Used by `_.max` and `_.min` as the default callback when a given
	   * collection is a string value.
	   *
	   * @private
	   * @param {string} value The character to inspect.
	   * @returns {number} Returns the code unit of given character.
	   */
	  function charAtCallback(value) {
	    return value.charCodeAt(0);
	  }

	  /**
	   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
	   * them in ascending order.
	   *
	   * @private
	   * @param {Object} a The object to compare to `b`.
	   * @param {Object} b The object to compare to `a`.
	   * @returns {number} Returns the sort order indicator of `1` or `-1`.
	   */
	  function compareAscending(a, b) {
	    var ac = a.criteria,
	        bc = b.criteria,
	        index = -1,
	        length = ac.length;

	    while (++index < length) {
	      var value = ac[index],
	          other = bc[index];

	      if (value !== other) {
	        if (value > other || typeof value == 'undefined') {
	          return 1;
	        }
	        if (value < other || typeof other == 'undefined') {
	          return -1;
	        }
	      }
	    }
	    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
	    // that causes it, under certain circumstances, to return the same value for
	    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
	    //
	    // This also ensures a stable sort in V8 and other engines.
	    // See http://code.google.com/p/v8/issues/detail?id=90
	    return a.index - b.index;
	  }

	  /**
	   * Creates a cache object to optimize linear searches of large arrays.
	   *
	   * @private
	   * @param {Array} [array=[]] The array to search.
	   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
	   */
	  function createCache(array) {
	    var index = -1,
	        length = array.length,
	        first = array[0],
	        mid = array[(length / 2) | 0],
	        last = array[length - 1];

	    if (first && typeof first == 'object' &&
	        mid && typeof mid == 'object' && last && typeof last == 'object') {
	      return false;
	    }
	    var cache = getObject();
	    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

	    var result = getObject();
	    result.array = array;
	    result.cache = cache;
	    result.push = cachePush;

	    while (++index < length) {
	      result.push(array[index]);
	    }
	    return result;
	  }

	  /**
	   * Used by `template` to escape characters for inclusion in compiled
	   * string literals.
	   *
	   * @private
	   * @param {string} match The matched character to escape.
	   * @returns {string} Returns the escaped character.
	   */
	  function escapeStringChar(match) {
	    return '\\' + stringEscapes[match];
	  }

	  /**
	   * Gets an array from the array pool or creates a new one if the pool is empty.
	   *
	   * @private
	   * @returns {Array} The array from the pool.
	   */
	  function getArray() {
	    return arrayPool.pop() || [];
	  }

	  /**
	   * Gets an object from the object pool or creates a new one if the pool is empty.
	   *
	   * @private
	   * @returns {Object} The object from the pool.
	   */
	  function getObject() {
	    return objectPool.pop() || {
	      'array': null,
	      'cache': null,
	      'criteria': null,
	      'false': false,
	      'index': 0,
	      'null': false,
	      'number': null,
	      'object': null,
	      'push': null,
	      'string': null,
	      'true': false,
	      'undefined': false,
	      'value': null
	    };
	  }

	  /**
	   * Checks if `value` is a DOM node in IE < 9.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is a DOM node, else `false`.
	   */
	  function isNode(value) {
	    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
	    // methods that are `typeof` "string" and still can coerce nodes to strings
	    return typeof value.toString != 'function' && typeof (value + '') == 'string';
	  }

	  /**
	   * Releases the given array back to the array pool.
	   *
	   * @private
	   * @param {Array} [array] The array to release.
	   */
	  function releaseArray(array) {
	    array.length = 0;
	    if (arrayPool.length < maxPoolSize) {
	      arrayPool.push(array);
	    }
	  }

	  /**
	   * Releases the given object back to the object pool.
	   *
	   * @private
	   * @param {Object} [object] The object to release.
	   */
	  function releaseObject(object) {
	    var cache = object.cache;
	    if (cache) {
	      releaseObject(cache);
	    }
	    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
	    if (objectPool.length < maxPoolSize) {
	      objectPool.push(object);
	    }
	  }

	  /**
	   * Slices the `collection` from the `start` index up to, but not including,
	   * the `end` index.
	   *
	   * Note: This function is used instead of `Array#slice` to support node lists
	   * in IE < 9 and to ensure dense arrays are returned.
	   *
	   * @private
	   * @param {Array|Object|string} collection The collection to slice.
	   * @param {number} start The start index.
	   * @param {number} end The end index.
	   * @returns {Array} Returns the new array.
	   */
	  function slice(array, start, end) {
	    start || (start = 0);
	    if (typeof end == 'undefined') {
	      end = array ? array.length : 0;
	    }
	    var index = -1,
	        length = end - start || 0,
	        result = Array(length < 0 ? 0 : length);

	    while (++index < length) {
	      result[index] = array[start + index];
	    }
	    return result;
	  }

	  /*--------------------------------------------------------------------------*/

	  /**
	   * Create a new `lodash` function using the given context object.
	   *
	   * @static
	   * @memberOf _
	   * @category Utilities
	   * @param {Object} [context=root] The context object.
	   * @returns {Function} Returns the `lodash` function.
	   */
	  function runInContext(context) {
	    // Avoid issues with some ES3 environments that attempt to use values, named
	    // after built-in constructors like `Object`, for the creation of literals.
	    // ES5 clears this up by stating that literals must use built-in constructors.
	    // See http://es5.github.io/#x11.1.5.
	    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

	    /** Native constructor references */
	    var Array = context.Array,
	        Boolean = context.Boolean,
	        Date = context.Date,
	        Error = context.Error,
	        Function = context.Function,
	        Math = context.Math,
	        Number = context.Number,
	        Object = context.Object,
	        RegExp = context.RegExp,
	        String = context.String,
	        TypeError = context.TypeError;

	    /**
	     * Used for `Array` method references.
	     *
	     * Normally `Array.prototype` would suffice, however, using an array literal
	     * avoids issues in Narwhal.
	     */
	    var arrayRef = [];

	    /** Used for native method references */
	    var errorProto = Error.prototype,
	        objectProto = Object.prototype,
	        stringProto = String.prototype;

	    /** Used to restore the original `_` reference in `noConflict` */
	    var oldDash = context._;

	    /** Used to resolve the internal [[Class]] of values */
	    var toString = objectProto.toString;

	    /** Used to detect if a method is native */
	    var reNative = RegExp('^' +
	      String(toString)
	        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	        .replace(/toString| for [^\]]+/g, '.*?') + '$'
	    );

	    /** Native method shortcuts */
	    var ceil = Math.ceil,
	        clearTimeout = context.clearTimeout,
	        floor = Math.floor,
	        fnToString = Function.prototype.toString,
	        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
	        hasOwnProperty = objectProto.hasOwnProperty,
	        push = arrayRef.push,
	        propertyIsEnumerable = objectProto.propertyIsEnumerable,
	        setTimeout = context.setTimeout,
	        splice = arrayRef.splice,
	        unshift = arrayRef.unshift;

	    /** Used to set meta data on functions */
	    var defineProperty = (function() {
	      // IE 8 only accepts DOM elements
	      try {
	        var o = {},
	            func = isNative(func = Object.defineProperty) && func,
	            result = func(o, o, o) && func;
	      } catch(e) { }
	      return result;
	    }());

	    /* Native method shortcuts for methods with the same name as other `lodash` methods */
	    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
	        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
	        nativeIsFinite = context.isFinite,
	        nativeIsNaN = context.isNaN,
	        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
	        nativeMax = Math.max,
	        nativeMin = Math.min,
	        nativeParseInt = context.parseInt,
	        nativeRandom = Math.random;

	    /** Used to lookup a built-in constructor by [[Class]] */
	    var ctorByClass = {};
	    ctorByClass[arrayClass] = Array;
	    ctorByClass[boolClass] = Boolean;
	    ctorByClass[dateClass] = Date;
	    ctorByClass[funcClass] = Function;
	    ctorByClass[objectClass] = Object;
	    ctorByClass[numberClass] = Number;
	    ctorByClass[regexpClass] = RegExp;
	    ctorByClass[stringClass] = String;

	    /** Used to avoid iterating non-enumerable properties in IE < 9 */
	    var nonEnumProps = {};
	    nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
	    nonEnumProps[boolClass] = nonEnumProps[stringClass] = { 'constructor': true, 'toString': true, 'valueOf': true };
	    nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { 'constructor': true, 'toString': true };
	    nonEnumProps[objectClass] = { 'constructor': true };

	    (function() {
	      var length = shadowedProps.length;
	      while (length--) {
	        var key = shadowedProps[length];
	        for (var className in nonEnumProps) {
	          if (hasOwnProperty.call(nonEnumProps, className) && !hasOwnProperty.call(nonEnumProps[className], key)) {
	            nonEnumProps[className][key] = false;
	          }
	        }
	      }
	    }());

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Creates a `lodash` object which wraps the given value to enable intuitive
	     * method chaining.
	     *
	     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
	     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
	     * and `unshift`
	     *
	     * Chaining is supported in custom builds as long as the `value` method is
	     * implicitly or explicitly included in the build.
	     *
	     * The chainable wrapper functions are:
	     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
	     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
	     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
	     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
	     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
	     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
	     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
	     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
	     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
	     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
	     * and `zip`
	     *
	     * The non-chainable wrapper functions are:
	     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
	     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
	     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
	     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
	     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
	     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
	     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
	     * `template`, `unescape`, `uniqueId`, and `value`
	     *
	     * The wrapper functions `first` and `last` return wrapped values when `n` is
	     * provided, otherwise they return unwrapped values.
	     *
	     * Explicit chaining can be enabled by using the `_.chain` method.
	     *
	     * @name _
	     * @constructor
	     * @category Chaining
	     * @param {*} value The value to wrap in a `lodash` instance.
	     * @returns {Object} Returns a `lodash` instance.
	     * @example
	     *
	     * var wrapped = _([1, 2, 3]);
	     *
	     * // returns an unwrapped value
	     * wrapped.reduce(function(sum, num) {
	     *   return sum + num;
	     * });
	     * // => 6
	     *
	     * // returns a wrapped value
	     * var squares = wrapped.map(function(num) {
	     *   return num * num;
	     * });
	     *
	     * _.isArray(squares);
	     * // => false
	     *
	     * _.isArray(squares.value());
	     * // => true
	     */
	    function lodash(value) {
	      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
	      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
	       ? value
	       : new lodashWrapper(value);
	    }

	    /**
	     * A fast path for creating `lodash` wrapper objects.
	     *
	     * @private
	     * @param {*} value The value to wrap in a `lodash` instance.
	     * @param {boolean} chainAll A flag to enable chaining for all methods
	     * @returns {Object} Returns a `lodash` instance.
	     */
	    function lodashWrapper(value, chainAll) {
	      this.__chain__ = !!chainAll;
	      this.__wrapped__ = value;
	    }
	    // ensure `new lodashWrapper` is an instance of `lodash`
	    lodashWrapper.prototype = lodash.prototype;

	    /**
	     * An object used to flag environments features.
	     *
	     * @static
	     * @memberOf _
	     * @type Object
	     */
	    var support = lodash.support = {};

	    (function() {
	      var ctor = function() { this.x = 1; },
	          object = { '0': 1, 'length': 1 },
	          props = [];

	      ctor.prototype = { 'valueOf': 1, 'y': 1 };
	      for (var key in new ctor) { props.push(key); }
	      for (key in arguments) { }

	      /**
	       * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.argsClass = toString.call(arguments) == argsClass;

	      /**
	       * Detect if `arguments` objects are `Object` objects (all but Narwhal and Opera < 10.5).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.argsObject = arguments.constructor == Object && !(arguments instanceof Array);

	      /**
	       * Detect if `name` or `message` properties of `Error.prototype` are
	       * enumerable by default. (IE < 9, Safari < 5.1)
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');

	      /**
	       * Detect if `prototype` properties are enumerable by default.
	       *
	       * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
	       * (if the prototype or a property on the prototype has been set)
	       * incorrectly sets a function's `prototype` property [[Enumerable]]
	       * value to `true`.
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');

	      /**
	       * Detect if functions can be decompiled by `Function#toString`
	       * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

	      /**
	       * Detect if `Function#name` is supported (all but IE).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.funcNames = typeof Function.name == 'string';

	      /**
	       * Detect if `arguments` object indexes are non-enumerable
	       * (Firefox < 4, IE < 9, PhantomJS, Safari < 5.1).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.nonEnumArgs = key != 0;

	      /**
	       * Detect if properties shadowing those on `Object.prototype` are non-enumerable.
	       *
	       * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
	       * made non-enumerable as well (a.k.a the JScript [[DontEnum]] bug).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.nonEnumShadows = !/valueOf/.test(props);

	      /**
	       * Detect if own properties are iterated after inherited properties (all but IE < 9).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.ownLast = props[0] != 'x';

	      /**
	       * Detect if `Array#shift` and `Array#splice` augment array-like objects correctly.
	       *
	       * Firefox < 10, IE compatibility mode, and IE < 9 have buggy Array `shift()`
	       * and `splice()` functions that fail to remove the last element, `value[0]`,
	       * of array-like objects even though the `length` property is set to `0`.
	       * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`
	       * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.spliceObjects = (arrayRef.splice.call(object, 0, 1), !object[0]);

	      /**
	       * Detect lack of support for accessing string characters by index.
	       *
	       * IE < 8 can't access characters by index and IE 8 can only access
	       * characters by index on string literals.
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.unindexedChars = ('x'[0] + Object('x')[0]) != 'xx';

	      /**
	       * Detect if a DOM node's [[Class]] is resolvable (all but IE < 9)
	       * and that the JS engine errors when attempting to coerce an object to
	       * a string without a `toString` function.
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      try {
	        support.nodeClass = !(toString.call(document) == objectClass && !({ 'toString': 0 } + ''));
	      } catch(e) {
	        support.nodeClass = true;
	      }
	    }(1));

	    /**
	     * By default, the template delimiters used by Lo-Dash are similar to those in
	     * embedded Ruby (ERB). Change the following template settings to use alternative
	     * delimiters.
	     *
	     * @static
	     * @memberOf _
	     * @type Object
	     */
	    lodash.templateSettings = {

	      /**
	       * Used to detect `data` property values to be HTML-escaped.
	       *
	       * @memberOf _.templateSettings
	       * @type RegExp
	       */
	      'escape': /<%-([\s\S]+?)%>/g,

	      /**
	       * Used to detect code to be evaluated.
	       *
	       * @memberOf _.templateSettings
	       * @type RegExp
	       */
	      'evaluate': /<%([\s\S]+?)%>/g,

	      /**
	       * Used to detect `data` property values to inject.
	       *
	       * @memberOf _.templateSettings
	       * @type RegExp
	       */
	      'interpolate': reInterpolate,

	      /**
	       * Used to reference the data object in the template text.
	       *
	       * @memberOf _.templateSettings
	       * @type string
	       */
	      'variable': '',

	      /**
	       * Used to import variables into the compiled template.
	       *
	       * @memberOf _.templateSettings
	       * @type Object
	       */
	      'imports': {

	        /**
	         * A reference to the `lodash` function.
	         *
	         * @memberOf _.templateSettings.imports
	         * @type Function
	         */
	        '_': lodash
	      }
	    };

	    /*--------------------------------------------------------------------------*/

	    /**
	     * The template used to create iterator functions.
	     *
	     * @private
	     * @param {Object} data The data object used to populate the text.
	     * @returns {string} Returns the interpolated text.
	     */
	    var iteratorTemplate = function(obj) {

	      var __p = 'var index, iterable = ' +
	      (obj.firstArg) +
	      ', result = ' +
	      (obj.init) +
	      ';\nif (!iterable) return result;\n' +
	      (obj.top) +
	      ';';
	       if (obj.array) {
	      __p += '\nvar length = iterable.length; index = -1;\nif (' +
	      (obj.array) +
	      ') {  ';
	       if (support.unindexedChars) {
	      __p += '\n  if (isString(iterable)) {\n    iterable = iterable.split(\'\')\n  }  ';
	       }
	      __p += '\n  while (++index < length) {\n    ' +
	      (obj.loop) +
	      ';\n  }\n}\nelse {  ';
	       } else if (support.nonEnumArgs) {
	      __p += '\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += \'\';\n      ' +
	      (obj.loop) +
	      ';\n    }\n  } else {  ';
	       }

	       if (support.enumPrototypes) {
	      __p += '\n  var skipProto = typeof iterable == \'function\';\n  ';
	       }

	       if (support.enumErrorProps) {
	      __p += '\n  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\n  ';
	       }

	          var conditions = [];    if (support.enumPrototypes) { conditions.push('!(skipProto && index == "prototype")'); }    if (support.enumErrorProps)  { conditions.push('!(skipErrorProps && (index == "message" || index == "name"))'); }

	       if (obj.useHas && obj.keys) {
	      __p += '\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] && keys(iterable),\n      length = ownProps ? ownProps.length : 0;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n';
	          if (conditions.length) {
	      __p += '    if (' +
	      (conditions.join(' && ')) +
	      ') {\n  ';
	       }
	      __p +=
	      (obj.loop) +
	      ';    ';
	       if (conditions.length) {
	      __p += '\n    }';
	       }
	      __p += '\n  }  ';
	       } else {
	      __p += '\n  for (index in iterable) {\n';
	          if (obj.useHas) { conditions.push("hasOwnProperty.call(iterable, index)"); }    if (conditions.length) {
	      __p += '    if (' +
	      (conditions.join(' && ')) +
	      ') {\n  ';
	       }
	      __p +=
	      (obj.loop) +
	      ';    ';
	       if (conditions.length) {
	      __p += '\n    }';
	       }
	      __p += '\n  }    ';
	       if (support.nonEnumShadows) {
	      __p += '\n\n  if (iterable !== objectProto) {\n    var ctor = iterable.constructor,\n        isProto = iterable === (ctor && ctor.prototype),\n        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\n        nonEnum = nonEnumProps[className];\n      ';
	       for (k = 0; k < 7; k++) {
	      __p += '\n    index = \'' +
	      (obj.shadowedProps[k]) +
	      '\';\n    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))';
	              if (!obj.useHas) {
	      __p += ' || (!nonEnum[index] && iterable[index] !== objectProto[index])';
	       }
	      __p += ') {\n      ' +
	      (obj.loop) +
	      ';\n    }      ';
	       }
	      __p += '\n  }    ';
	       }

	       }

	       if (obj.array || support.nonEnumArgs) {
	      __p += '\n}';
	       }
	      __p +=
	      (obj.bottom) +
	      ';\nreturn result';

	      return __p
	    };

	    /*--------------------------------------------------------------------------*/

	    /**
	     * The base implementation of `_.bind` that creates the bound function and
	     * sets its meta data.
	     *
	     * @private
	     * @param {Array} bindData The bind data array.
	     * @returns {Function} Returns the new bound function.
	     */
	    function baseBind(bindData) {
	      var func = bindData[0],
	          partialArgs = bindData[2],
	          thisArg = bindData[4];

	      function bound() {
	        // `Function#bind` spec
	        // http://es5.github.io/#x15.3.4.5
	        if (partialArgs) {
	          // avoid `arguments` object deoptimizations by using `slice` instead
	          // of `Array.prototype.slice.call` and not assigning `arguments` to a
	          // variable as a ternary expression
	          var args = slice(partialArgs);
	          push.apply(args, arguments);
	        }
	        // mimic the constructor's `return` behavior
	        // http://es5.github.io/#x13.2.2
	        if (this instanceof bound) {
	          // ensure `new bound` is an instance of `func`
	          var thisBinding = baseCreate(func.prototype),
	              result = func.apply(thisBinding, args || arguments);
	          return isObject(result) ? result : thisBinding;
	        }
	        return func.apply(thisArg, args || arguments);
	      }
	      setBindData(bound, bindData);
	      return bound;
	    }

	    /**
	     * The base implementation of `_.clone` without argument juggling or support
	     * for `thisArg` binding.
	     *
	     * @private
	     * @param {*} value The value to clone.
	     * @param {boolean} [isDeep=false] Specify a deep clone.
	     * @param {Function} [callback] The function to customize cloning values.
	     * @param {Array} [stackA=[]] Tracks traversed source objects.
	     * @param {Array} [stackB=[]] Associates clones with source counterparts.
	     * @returns {*} Returns the cloned value.
	     */
	    function baseClone(value, isDeep, callback, stackA, stackB) {
	      if (callback) {
	        var result = callback(value);
	        if (typeof result != 'undefined') {
	          return result;
	        }
	      }
	      // inspect [[Class]]
	      var isObj = isObject(value);
	      if (isObj) {
	        var className = toString.call(value);
	        if (!cloneableClasses[className] || (!support.nodeClass && isNode(value))) {
	          return value;
	        }
	        var ctor = ctorByClass[className];
	        switch (className) {
	          case boolClass:
	          case dateClass:
	            return new ctor(+value);

	          case numberClass:
	          case stringClass:
	            return new ctor(value);

	          case regexpClass:
	            result = ctor(value.source, reFlags.exec(value));
	            result.lastIndex = value.lastIndex;
	            return result;
	        }
	      } else {
	        return value;
	      }
	      var isArr = isArray(value);
	      if (isDeep) {
	        // check for circular references and return corresponding clone
	        var initedStack = !stackA;
	        stackA || (stackA = getArray());
	        stackB || (stackB = getArray());

	        var length = stackA.length;
	        while (length--) {
	          if (stackA[length] == value) {
	            return stackB[length];
	          }
	        }
	        result = isArr ? ctor(value.length) : {};
	      }
	      else {
	        result = isArr ? slice(value) : assign({}, value);
	      }
	      // add array properties assigned by `RegExp#exec`
	      if (isArr) {
	        if (hasOwnProperty.call(value, 'index')) {
	          result.index = value.index;
	        }
	        if (hasOwnProperty.call(value, 'input')) {
	          result.input = value.input;
	        }
	      }
	      // exit for shallow clone
	      if (!isDeep) {
	        return result;
	      }
	      // add the source value to the stack of traversed objects
	      // and associate it with its clone
	      stackA.push(value);
	      stackB.push(result);

	      // recursively populate clone (susceptible to call stack limits)
	      (isArr ? baseEach : forOwn)(value, function(objValue, key) {
	        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
	      });

	      if (initedStack) {
	        releaseArray(stackA);
	        releaseArray(stackB);
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.create` without support for assigning
	     * properties to the created object.
	     *
	     * @private
	     * @param {Object} prototype The object to inherit from.
	     * @returns {Object} Returns the new object.
	     */
	    function baseCreate(prototype, properties) {
	      return isObject(prototype) ? nativeCreate(prototype) : {};
	    }
	    // fallback for browsers without `Object.create`
	    if (!nativeCreate) {
	      baseCreate = (function() {
	        function Object() {}
	        return function(prototype) {
	          if (isObject(prototype)) {
	            Object.prototype = prototype;
	            var result = new Object;
	            Object.prototype = null;
	          }
	          return result || context.Object();
	        };
	      }());
	    }

	    /**
	     * The base implementation of `_.createCallback` without support for creating
	     * "_.pluck" or "_.where" style callbacks.
	     *
	     * @private
	     * @param {*} [func=identity] The value to convert to a callback.
	     * @param {*} [thisArg] The `this` binding of the created callback.
	     * @param {number} [argCount] The number of arguments the callback accepts.
	     * @returns {Function} Returns a callback function.
	     */
	    function baseCreateCallback(func, thisArg, argCount) {
	      if (typeof func != 'function') {
	        return identity;
	      }
	      // exit early for no `thisArg` or already bound by `Function#bind`
	      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
	        return func;
	      }
	      var bindData = func.__bindData__;
	      if (typeof bindData == 'undefined') {
	        if (support.funcNames) {
	          bindData = !func.name;
	        }
	        bindData = bindData || !support.funcDecomp;
	        if (!bindData) {
	          var source = fnToString.call(func);
	          if (!support.funcNames) {
	            bindData = !reFuncName.test(source);
	          }
	          if (!bindData) {
	            // checks if `func` references the `this` keyword and stores the result
	            bindData = reThis.test(source);
	            setBindData(func, bindData);
	          }
	        }
	      }
	      // exit early if there are no `this` references or `func` is bound
	      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
	        return func;
	      }
	      switch (argCount) {
	        case 1: return function(value) {
	          return func.call(thisArg, value);
	        };
	        case 2: return function(a, b) {
	          return func.call(thisArg, a, b);
	        };
	        case 3: return function(value, index, collection) {
	          return func.call(thisArg, value, index, collection);
	        };
	        case 4: return function(accumulator, value, index, collection) {
	          return func.call(thisArg, accumulator, value, index, collection);
	        };
	      }
	      return bind(func, thisArg);
	    }

	    /**
	     * The base implementation of `createWrapper` that creates the wrapper and
	     * sets its meta data.
	     *
	     * @private
	     * @param {Array} bindData The bind data array.
	     * @returns {Function} Returns the new function.
	     */
	    function baseCreateWrapper(bindData) {
	      var func = bindData[0],
	          bitmask = bindData[1],
	          partialArgs = bindData[2],
	          partialRightArgs = bindData[3],
	          thisArg = bindData[4],
	          arity = bindData[5];

	      var isBind = bitmask & 1,
	          isBindKey = bitmask & 2,
	          isCurry = bitmask & 4,
	          isCurryBound = bitmask & 8,
	          key = func;

	      function bound() {
	        var thisBinding = isBind ? thisArg : this;
	        if (partialArgs) {
	          var args = slice(partialArgs);
	          push.apply(args, arguments);
	        }
	        if (partialRightArgs || isCurry) {
	          args || (args = slice(arguments));
	          if (partialRightArgs) {
	            push.apply(args, partialRightArgs);
	          }
	          if (isCurry && args.length < arity) {
	            bitmask |= 16 & ~32;
	            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
	          }
	        }
	        args || (args = arguments);
	        if (isBindKey) {
	          func = thisBinding[key];
	        }
	        if (this instanceof bound) {
	          thisBinding = baseCreate(func.prototype);
	          var result = func.apply(thisBinding, args);
	          return isObject(result) ? result : thisBinding;
	        }
	        return func.apply(thisBinding, args);
	      }
	      setBindData(bound, bindData);
	      return bound;
	    }

	    /**
	     * The base implementation of `_.difference` that accepts a single array
	     * of values to exclude.
	     *
	     * @private
	     * @param {Array} array The array to process.
	     * @param {Array} [values] The array of values to exclude.
	     * @returns {Array} Returns a new array of filtered values.
	     */
	    function baseDifference(array, values) {
	      var index = -1,
	          indexOf = getIndexOf(),
	          length = array ? array.length : 0,
	          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
	          result = [];

	      if (isLarge) {
	        var cache = createCache(values);
	        if (cache) {
	          indexOf = cacheIndexOf;
	          values = cache;
	        } else {
	          isLarge = false;
	        }
	      }
	      while (++index < length) {
	        var value = array[index];
	        if (indexOf(values, value) < 0) {
	          result.push(value);
	        }
	      }
	      if (isLarge) {
	        releaseObject(values);
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.flatten` without support for callback
	     * shorthands or `thisArg` binding.
	     *
	     * @private
	     * @param {Array} array The array to flatten.
	     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
	     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
	     * @param {number} [fromIndex=0] The index to start from.
	     * @returns {Array} Returns a new flattened array.
	     */
	    function baseFlatten(array, isShallow, isStrict, fromIndex) {
	      var index = (fromIndex || 0) - 1,
	          length = array ? array.length : 0,
	          result = [];

	      while (++index < length) {
	        var value = array[index];

	        if (value && typeof value == 'object' && typeof value.length == 'number'
	            && (isArray(value) || isArguments(value))) {
	          // recursively flatten arrays (susceptible to call stack limits)
	          if (!isShallow) {
	            value = baseFlatten(value, isShallow, isStrict);
	          }
	          var valIndex = -1,
	              valLength = value.length,
	              resIndex = result.length;

	          result.length += valLength;
	          while (++valIndex < valLength) {
	            result[resIndex++] = value[valIndex];
	          }
	        } else if (!isStrict) {
	          result.push(value);
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
	     * that allows partial "_.where" style comparisons.
	     *
	     * @private
	     * @param {*} a The value to compare.
	     * @param {*} b The other value to compare.
	     * @param {Function} [callback] The function to customize comparing values.
	     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
	     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
	     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
	     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	     */
	    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
	      // used to indicate that when comparing objects, `a` has at least the properties of `b`
	      if (callback) {
	        var result = callback(a, b);
	        if (typeof result != 'undefined') {
	          return !!result;
	        }
	      }
	      // exit early for identical values
	      if (a === b) {
	        // treat `+0` vs. `-0` as not equal
	        return a !== 0 || (1 / a == 1 / b);
	      }
	      var type = typeof a,
	          otherType = typeof b;

	      // exit early for unlike primitive values
	      if (a === a &&
	          !(a && objectTypes[type]) &&
	          !(b && objectTypes[otherType])) {
	        return false;
	      }
	      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
	      // http://es5.github.io/#x15.3.4.4
	      if (a == null || b == null) {
	        return a === b;
	      }
	      // compare [[Class]] names
	      var className = toString.call(a),
	          otherClass = toString.call(b);

	      if (className == argsClass) {
	        className = objectClass;
	      }
	      if (otherClass == argsClass) {
	        otherClass = objectClass;
	      }
	      if (className != otherClass) {
	        return false;
	      }
	      switch (className) {
	        case boolClass:
	        case dateClass:
	          // coerce dates and booleans to numbers, dates to milliseconds and booleans
	          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
	          return +a == +b;

	        case numberClass:
	          // treat `NaN` vs. `NaN` as equal
	          return (a != +a)
	            ? b != +b
	            // but treat `+0` vs. `-0` as not equal
	            : (a == 0 ? (1 / a == 1 / b) : a == +b);

	        case regexpClass:
	        case stringClass:
	          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
	          // treat string primitives and their corresponding object instances as equal
	          return a == String(b);
	      }
	      var isArr = className == arrayClass;
	      if (!isArr) {
	        // unwrap any `lodash` wrapped values
	        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
	            bWrapped = hasOwnProperty.call(b, '__wrapped__');

	        if (aWrapped || bWrapped) {
	          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
	        }
	        // exit for functions and DOM nodes
	        if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
	          return false;
	        }
	        // in older versions of Opera, `arguments` objects have `Array` constructors
	        var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
	            ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;

	        // non `Object` object instances with different constructors are not equal
	        if (ctorA != ctorB &&
	              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
	              ('constructor' in a && 'constructor' in b)
	            ) {
	          return false;
	        }
	      }
	      // assume cyclic structures are equal
	      // the algorithm for detecting cyclic structures is adapted from ES 5.1
	      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
	      var initedStack = !stackA;
	      stackA || (stackA = getArray());
	      stackB || (stackB = getArray());

	      var length = stackA.length;
	      while (length--) {
	        if (stackA[length] == a) {
	          return stackB[length] == b;
	        }
	      }
	      var size = 0;
	      result = true;

	      // add `a` and `b` to the stack of traversed objects
	      stackA.push(a);
	      stackB.push(b);

	      // recursively compare objects and arrays (susceptible to call stack limits)
	      if (isArr) {
	        // compare lengths to determine if a deep comparison is necessary
	        length = a.length;
	        size = b.length;
	        result = size == length;

	        if (result || isWhere) {
	          // deep compare the contents, ignoring non-numeric properties
	          while (size--) {
	            var index = length,
	                value = b[size];

	            if (isWhere) {
	              while (index--) {
	                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
	                  break;
	                }
	              }
	            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
	              break;
	            }
	          }
	        }
	      }
	      else {
	        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
	        // which, in this case, is more costly
	        forIn(b, function(value, key, b) {
	          if (hasOwnProperty.call(b, key)) {
	            // count the number of properties.
	            size++;
	            // deep compare each property value.
	            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
	          }
	        });

	        if (result && !isWhere) {
	          // ensure both objects have the same number of properties
	          forIn(a, function(value, key, a) {
	            if (hasOwnProperty.call(a, key)) {
	              // `size` will be `-1` if `a` has more properties than `b`
	              return (result = --size > -1);
	            }
	          });
	        }
	      }
	      stackA.pop();
	      stackB.pop();

	      if (initedStack) {
	        releaseArray(stackA);
	        releaseArray(stackB);
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.merge` without argument juggling or support
	     * for `thisArg` binding.
	     *
	     * @private
	     * @param {Object} object The destination object.
	     * @param {Object} source The source object.
	     * @param {Function} [callback] The function to customize merging properties.
	     * @param {Array} [stackA=[]] Tracks traversed source objects.
	     * @param {Array} [stackB=[]] Associates values with source counterparts.
	     */
	    function baseMerge(object, source, callback, stackA, stackB) {
	      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
	        var found,
	            isArr,
	            result = source,
	            value = object[key];

	        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
	          // avoid merging previously merged cyclic sources
	          var stackLength = stackA.length;
	          while (stackLength--) {
	            if ((found = stackA[stackLength] == source)) {
	              value = stackB[stackLength];
	              break;
	            }
	          }
	          if (!found) {
	            var isShallow;
	            if (callback) {
	              result = callback(value, source);
	              if ((isShallow = typeof result != 'undefined')) {
	                value = result;
	              }
	            }
	            if (!isShallow) {
	              value = isArr
	                ? (isArray(value) ? value : [])
	                : (isPlainObject(value) ? value : {});
	            }
	            // add `source` and associated `value` to the stack of traversed objects
	            stackA.push(source);
	            stackB.push(value);

	            // recursively merge objects and arrays (susceptible to call stack limits)
	            if (!isShallow) {
	              baseMerge(value, source, callback, stackA, stackB);
	            }
	          }
	        }
	        else {
	          if (callback) {
	            result = callback(value, source);
	            if (typeof result == 'undefined') {
	              result = source;
	            }
	          }
	          if (typeof result != 'undefined') {
	            value = result;
	          }
	        }
	        object[key] = value;
	      });
	    }

	    /**
	     * The base implementation of `_.random` without argument juggling or support
	     * for returning floating-point numbers.
	     *
	     * @private
	     * @param {number} min The minimum possible value.
	     * @param {number} max The maximum possible value.
	     * @returns {number} Returns a random number.
	     */
	    function baseRandom(min, max) {
	      return min + floor(nativeRandom() * (max - min + 1));
	    }

	    /**
	     * The base implementation of `_.uniq` without support for callback shorthands
	     * or `thisArg` binding.
	     *
	     * @private
	     * @param {Array} array The array to process.
	     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
	     * @param {Function} [callback] The function called per iteration.
	     * @returns {Array} Returns a duplicate-value-free array.
	     */
	    function baseUniq(array, isSorted, callback) {
	      var index = -1,
	          indexOf = getIndexOf(),
	          length = array ? array.length : 0,
	          result = [];

	      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
	          seen = (callback || isLarge) ? getArray() : result;

	      if (isLarge) {
	        var cache = createCache(seen);
	        indexOf = cacheIndexOf;
	        seen = cache;
	      }
	      while (++index < length) {
	        var value = array[index],
	            computed = callback ? callback(value, index, array) : value;

	        if (isSorted
	              ? !index || seen[seen.length - 1] !== computed
	              : indexOf(seen, computed) < 0
	            ) {
	          if (callback || isLarge) {
	            seen.push(computed);
	          }
	          result.push(value);
	        }
	      }
	      if (isLarge) {
	        releaseArray(seen.array);
	        releaseObject(seen);
	      } else if (callback) {
	        releaseArray(seen);
	      }
	      return result;
	    }

	    /**
	     * Creates a function that aggregates a collection, creating an object composed
	     * of keys generated from the results of running each element of the collection
	     * through a callback. The given `setter` function sets the keys and values
	     * of the composed object.
	     *
	     * @private
	     * @param {Function} setter The setter function.
	     * @returns {Function} Returns the new aggregator function.
	     */
	    function createAggregator(setter) {
	      return function(collection, callback, thisArg) {
	        var result = {};
	        callback = lodash.createCallback(callback, thisArg, 3);

	        if (isArray(collection)) {
	          var index = -1,
	              length = collection.length;

	          while (++index < length) {
	            var value = collection[index];
	            setter(result, value, callback(value, index, collection), collection);
	          }
	        } else {
	          baseEach(collection, function(value, key, collection) {
	            setter(result, value, callback(value, key, collection), collection);
	          });
	        }
	        return result;
	      };
	    }

	    /**
	     * Creates a function that, when called, either curries or invokes `func`
	     * with an optional `this` binding and partially applied arguments.
	     *
	     * @private
	     * @param {Function|string} func The function or method name to reference.
	     * @param {number} bitmask The bitmask of method flags to compose.
	     *  The bitmask may be composed of the following flags:
	     *  1 - `_.bind`
	     *  2 - `_.bindKey`
	     *  4 - `_.curry`
	     *  8 - `_.curry` (bound)
	     *  16 - `_.partial`
	     *  32 - `_.partialRight`
	     * @param {Array} [partialArgs] An array of arguments to prepend to those
	     *  provided to the new function.
	     * @param {Array} [partialRightArgs] An array of arguments to append to those
	     *  provided to the new function.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param {number} [arity] The arity of `func`.
	     * @returns {Function} Returns the new function.
	     */
	    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
	      var isBind = bitmask & 1,
	          isBindKey = bitmask & 2,
	          isCurry = bitmask & 4,
	          isCurryBound = bitmask & 8,
	          isPartial = bitmask & 16,
	          isPartialRight = bitmask & 32;

	      if (!isBindKey && !isFunction(func)) {
	        throw new TypeError;
	      }
	      if (isPartial && !partialArgs.length) {
	        bitmask &= ~16;
	        isPartial = partialArgs = false;
	      }
	      if (isPartialRight && !partialRightArgs.length) {
	        bitmask &= ~32;
	        isPartialRight = partialRightArgs = false;
	      }
	      var bindData = func && func.__bindData__;
	      if (bindData && bindData !== true) {
	        // clone `bindData`
	        bindData = slice(bindData);
	        if (bindData[2]) {
	          bindData[2] = slice(bindData[2]);
	        }
	        if (bindData[3]) {
	          bindData[3] = slice(bindData[3]);
	        }
	        // set `thisBinding` is not previously bound
	        if (isBind && !(bindData[1] & 1)) {
	          bindData[4] = thisArg;
	        }
	        // set if previously bound but not currently (subsequent curried functions)
	        if (!isBind && bindData[1] & 1) {
	          bitmask |= 8;
	        }
	        // set curried arity if not yet set
	        if (isCurry && !(bindData[1] & 4)) {
	          bindData[5] = arity;
	        }
	        // append partial left arguments
	        if (isPartial) {
	          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
	        }
	        // append partial right arguments
	        if (isPartialRight) {
	          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
	        }
	        // merge flags
	        bindData[1] |= bitmask;
	        return createWrapper.apply(null, bindData);
	      }
	      // fast path for `_.bind`
	      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
	      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
	    }

	    /**
	     * Creates compiled iteration functions.
	     *
	     * @private
	     * @param {...Object} [options] The compile options object(s).
	     * @param {string} [options.array] Code to determine if the iterable is an array or array-like.
	     * @param {boolean} [options.useHas] Specify using `hasOwnProperty` checks in the object loop.
	     * @param {Function} [options.keys] A reference to `_.keys` for use in own property iteration.
	     * @param {string} [options.args] A comma separated string of iteration function arguments.
	     * @param {string} [options.top] Code to execute before the iteration branches.
	     * @param {string} [options.loop] Code to execute in the object loop.
	     * @param {string} [options.bottom] Code to execute after the iteration branches.
	     * @returns {Function} Returns the compiled function.
	     */
	    function createIterator() {
	      // data properties
	      iteratorData.shadowedProps = shadowedProps;

	      // iterator options
	      iteratorData.array = iteratorData.bottom = iteratorData.loop = iteratorData.top = '';
	      iteratorData.init = 'iterable';
	      iteratorData.useHas = true;

	      // merge options into a template data object
	      for (var object, index = 0; object = arguments[index]; index++) {
	        for (var key in object) {
	          iteratorData[key] = object[key];
	        }
	      }
	      var args = iteratorData.args;
	      iteratorData.firstArg = /^[^,]+/.exec(args)[0];

	      // create the function factory
	      var factory = Function(
	          'baseCreateCallback, errorClass, errorProto, hasOwnProperty, ' +
	          'indicatorObject, isArguments, isArray, isString, keys, objectProto, ' +
	          'objectTypes, nonEnumProps, stringClass, stringProto, toString',
	        'return function(' + args + ') {\n' + iteratorTemplate(iteratorData) + '\n}'
	      );

	      // return the compiled function
	      return factory(
	        baseCreateCallback, errorClass, errorProto, hasOwnProperty,
	        indicatorObject, isArguments, isArray, isString, iteratorData.keys, objectProto,
	        objectTypes, nonEnumProps, stringClass, stringProto, toString
	      );
	    }

	    /**
	     * Used by `escape` to convert characters to HTML entities.
	     *
	     * @private
	     * @param {string} match The matched character to escape.
	     * @returns {string} Returns the escaped character.
	     */
	    function escapeHtmlChar(match) {
	      return htmlEscapes[match];
	    }

	    /**
	     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
	     * customized, this method returns the custom method, otherwise it returns
	     * the `baseIndexOf` function.
	     *
	     * @private
	     * @returns {Function} Returns the "indexOf" function.
	     */
	    function getIndexOf() {
	      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
	      return result;
	    }

	    /**
	     * Checks if `value` is a native function.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
	     */
	    function isNative(value) {
	      return typeof value == 'function' && reNative.test(value);
	    }

	    /**
	     * Sets `this` binding data on a given function.
	     *
	     * @private
	     * @param {Function} func The function to set data on.
	     * @param {Array} value The data array to set.
	     */
	    var setBindData = !defineProperty ? noop : function(func, value) {
	      descriptor.value = value;
	      defineProperty(func, '__bindData__', descriptor);
	    };

	    /**
	     * A fallback implementation of `isPlainObject` which checks if a given value
	     * is an object created by the `Object` constructor, assuming objects created
	     * by the `Object` constructor have no inherited enumerable properties and that
	     * there are no `Object.prototype` extensions.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	     */
	    function shimIsPlainObject(value) {
	      var ctor,
	          result;

	      // avoid non Object objects, `arguments` objects, and DOM elements
	      if (!(value && toString.call(value) == objectClass) ||
	          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor)) ||
	          (!support.argsClass && isArguments(value)) ||
	          (!support.nodeClass && isNode(value))) {
	        return false;
	      }
	      // IE < 9 iterates inherited properties before own properties. If the first
	      // iterated property is an object's own property then there are no inherited
	      // enumerable properties.
	      if (support.ownLast) {
	        forIn(value, function(value, key, object) {
	          result = hasOwnProperty.call(object, key);
	          return false;
	        });
	        return result !== false;
	      }
	      // In most environments an object's own properties are iterated before
	      // its inherited properties. If the last iterated property is an object's
	      // own property then there are no inherited enumerable properties.
	      forIn(value, function(value, key) {
	        result = key;
	      });
	      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
	    }

	    /**
	     * Used by `unescape` to convert HTML entities to characters.
	     *
	     * @private
	     * @param {string} match The matched character to unescape.
	     * @returns {string} Returns the unescaped character.
	     */
	    function unescapeHtmlChar(match) {
	      return htmlUnescapes[match];
	    }

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Checks if `value` is an `arguments` object.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
	     * @example
	     *
	     * (function() { return _.isArguments(arguments); })(1, 2, 3);
	     * // => true
	     *
	     * _.isArguments([1, 2, 3]);
	     * // => false
	     */
	    function isArguments(value) {
	      return value && typeof value == 'object' && typeof value.length == 'number' &&
	        toString.call(value) == argsClass || false;
	    }
	    // fallback for browsers that can't detect `arguments` objects by [[Class]]
	    if (!support.argsClass) {
	      isArguments = function(value) {
	        return value && typeof value == 'object' && typeof value.length == 'number' &&
	          hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee') || false;
	      };
	    }

	    /**
	     * Checks if `value` is an array.
	     *
	     * @static
	     * @memberOf _
	     * @type Function
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
	     * @example
	     *
	     * (function() { return _.isArray(arguments); })();
	     * // => false
	     *
	     * _.isArray([1, 2, 3]);
	     * // => true
	     */
	    var isArray = nativeIsArray || function(value) {
	      return value && typeof value == 'object' && typeof value.length == 'number' &&
	        toString.call(value) == arrayClass || false;
	    };

	    /**
	     * A fallback implementation of `Object.keys` which produces an array of the
	     * given object's own enumerable property names.
	     *
	     * @private
	     * @type Function
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns an array of property names.
	     */
	    var shimKeys = createIterator({
	      'args': 'object',
	      'init': '[]',
	      'top': 'if (!(objectTypes[typeof object])) return result',
	      'loop': 'result.push(index)'
	    });

	    /**
	     * Creates an array composed of the own enumerable property names of an object.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns an array of property names.
	     * @example
	     *
	     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
	     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
	     */
	    var keys = !nativeKeys ? shimKeys : function(object) {
	      if (!isObject(object)) {
	        return [];
	      }
	      if ((support.enumPrototypes && typeof object == 'function') ||
	          (support.nonEnumArgs && object.length && isArguments(object))) {
	        return shimKeys(object);
	      }
	      return nativeKeys(object);
	    };

	    /** Reusable iterator options shared by `each`, `forIn`, and `forOwn` */
	    var eachIteratorOptions = {
	      'args': 'collection, callback, thisArg',
	      'top': "callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3)",
	      'array': "typeof length == 'number'",
	      'keys': keys,
	      'loop': 'if (callback(iterable[index], index, collection) === false) return result'
	    };

	    /** Reusable iterator options for `assign` and `defaults` */
	    var defaultsIteratorOptions = {
	      'args': 'object, source, guard',
	      'top':
	        'var args = arguments,\n' +
	        '    argsIndex = 0,\n' +
	        "    argsLength = typeof guard == 'number' ? 2 : args.length;\n" +
	        'while (++argsIndex < argsLength) {\n' +
	        '  iterable = args[argsIndex];\n' +
	        '  if (iterable && objectTypes[typeof iterable]) {',
	      'keys': keys,
	      'loop': "if (typeof result[index] == 'undefined') result[index] = iterable[index]",
	      'bottom': '  }\n}'
	    };

	    /** Reusable iterator options for `forIn` and `forOwn` */
	    var forOwnIteratorOptions = {
	      'top': 'if (!objectTypes[typeof iterable]) return result;\n' + eachIteratorOptions.top,
	      'array': false
	    };

	    /**
	     * Used to convert characters to HTML entities:
	     *
	     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
	     * don't require escaping in HTML and have no special meaning unless they're part
	     * of a tag or an unquoted attribute value.
	     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
	     */
	    var htmlEscapes = {
	      '&': '&amp;',
	      '<': '&lt;',
	      '>': '&gt;',
	      '"': '&quot;',
	      "'": '&#39;'
	    };

	    /** Used to convert HTML entities to characters */
	    var htmlUnescapes = invert(htmlEscapes);

	    /** Used to match HTML entities and HTML characters */
	    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
	        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

	    /**
	     * A function compiled to iterate `arguments` objects, arrays, objects, and
	     * strings consistenly across environments, executing the callback for each
	     * element in the collection. The callback is bound to `thisArg` and invoked
	     * with three arguments; (value, index|key, collection). Callbacks may exit
	     * iteration early by explicitly returning `false`.
	     *
	     * @private
	     * @type Function
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array|Object|string} Returns `collection`.
	     */
	    var baseEach = createIterator(eachIteratorOptions);

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Assigns own enumerable properties of source object(s) to the destination
	     * object. Subsequent sources will overwrite property assignments of previous
	     * sources. If a callback is provided it will be executed to produce the
	     * assigned values. The callback is bound to `thisArg` and invoked with two
	     * arguments; (objectValue, sourceValue).
	     *
	     * @static
	     * @memberOf _
	     * @type Function
	     * @alias extend
	     * @category Objects
	     * @param {Object} object The destination object.
	     * @param {...Object} [source] The source objects.
	     * @param {Function} [callback] The function to customize assigning values.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns the destination object.
	     * @example
	     *
	     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
	     * // => { 'name': 'fred', 'employer': 'slate' }
	     *
	     * var defaults = _.partialRight(_.assign, function(a, b) {
	     *   return typeof a == 'undefined' ? b : a;
	     * });
	     *
	     * var object = { 'name': 'barney' };
	     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
	     * // => { 'name': 'barney', 'employer': 'slate' }
	     */
	    var assign = createIterator(defaultsIteratorOptions, {
	      'top':
	        defaultsIteratorOptions.top.replace(';',
	          ';\n' +
	          "if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\n" +
	          '  var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);\n' +
	          "} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\n" +
	          '  callback = args[--argsLength];\n' +
	          '}'
	        ),
	      'loop': 'result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]'
	    });

	    /**
	     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
	     * be cloned, otherwise they will be assigned by reference. If a callback
	     * is provided it will be executed to produce the cloned values. If the
	     * callback returns `undefined` cloning will be handled by the method instead.
	     * The callback is bound to `thisArg` and invoked with one argument; (value).
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to clone.
	     * @param {boolean} [isDeep=false] Specify a deep clone.
	     * @param {Function} [callback] The function to customize cloning values.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the cloned value.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * var shallow = _.clone(characters);
	     * shallow[0] === characters[0];
	     * // => true
	     *
	     * var deep = _.clone(characters, true);
	     * deep[0] === characters[0];
	     * // => false
	     *
	     * _.mixin({
	     *   'clone': _.partialRight(_.clone, function(value) {
	     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
	     *   })
	     * });
	     *
	     * var clone = _.clone(document.body);
	     * clone.childNodes.length;
	     * // => 0
	     */
	    function clone(value, isDeep, callback, thisArg) {
	      // allows working with "Collections" methods without using their `index`
	      // and `collection` arguments for `isDeep` and `callback`
	      if (typeof isDeep != 'boolean' && isDeep != null) {
	        thisArg = callback;
	        callback = isDeep;
	        isDeep = false;
	      }
	      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
	    }

	    /**
	     * Creates a deep clone of `value`. If a callback is provided it will be
	     * executed to produce the cloned values. If the callback returns `undefined`
	     * cloning will be handled by the method instead. The callback is bound to
	     * `thisArg` and invoked with one argument; (value).
	     *
	     * Note: This method is loosely based on the structured clone algorithm. Functions
	     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
	     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
	     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to deep clone.
	     * @param {Function} [callback] The function to customize cloning values.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the deep cloned value.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * var deep = _.cloneDeep(characters);
	     * deep[0] === characters[0];
	     * // => false
	     *
	     * var view = {
	     *   'label': 'docs',
	     *   'node': element
	     * };
	     *
	     * var clone = _.cloneDeep(view, function(value) {
	     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
	     * });
	     *
	     * clone.node == view.node;
	     * // => false
	     */
	    function cloneDeep(value, callback, thisArg) {
	      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
	    }

	    /**
	     * Creates an object that inherits from the given `prototype` object. If a
	     * `properties` object is provided its own enumerable properties are assigned
	     * to the created object.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} prototype The object to inherit from.
	     * @param {Object} [properties] The properties to assign to the object.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * function Shape() {
	     *   this.x = 0;
	     *   this.y = 0;
	     * }
	     *
	     * function Circle() {
	     *   Shape.call(this);
	     * }
	     *
	     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
	     *
	     * var circle = new Circle;
	     * circle instanceof Circle;
	     * // => true
	     *
	     * circle instanceof Shape;
	     * // => true
	     */
	    function create(prototype, properties) {
	      var result = baseCreate(prototype);
	      return properties ? assign(result, properties) : result;
	    }

	    /**
	     * Assigns own enumerable properties of source object(s) to the destination
	     * object for all destination properties that resolve to `undefined`. Once a
	     * property is set, additional defaults of the same property will be ignored.
	     *
	     * @static
	     * @memberOf _
	     * @type Function
	     * @category Objects
	     * @param {Object} object The destination object.
	     * @param {...Object} [source] The source objects.
	     * @param- {Object} [guard] Allows working with `_.reduce` without using its
	     *  `key` and `object` arguments as sources.
	     * @returns {Object} Returns the destination object.
	     * @example
	     *
	     * var object = { 'name': 'barney' };
	     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
	     * // => { 'name': 'barney', 'employer': 'slate' }
	     */
	    var defaults = createIterator(defaultsIteratorOptions);

	    /**
	     * This method is like `_.findIndex` except that it returns the key of the
	     * first element that passes the callback check, instead of the element itself.
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to search.
	     * @param {Function|Object|string} [callback=identity] The function called per
	     *  iteration. If a property name or object is provided it will be used to
	     *  create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
	     * @example
	     *
	     * var characters = {
	     *   'barney': {  'age': 36, 'blocked': false },
	     *   'fred': {    'age': 40, 'blocked': true },
	     *   'pebbles': { 'age': 1,  'blocked': false }
	     * };
	     *
	     * _.findKey(characters, function(chr) {
	     *   return chr.age < 40;
	     * });
	     * // => 'barney' (property order is not guaranteed across environments)
	     *
	     * // using "_.where" callback shorthand
	     * _.findKey(characters, { 'age': 1 });
	     * // => 'pebbles'
	     *
	     * // using "_.pluck" callback shorthand
	     * _.findKey(characters, 'blocked');
	     * // => 'fred'
	     */
	    function findKey(object, callback, thisArg) {
	      var result;
	      callback = lodash.createCallback(callback, thisArg, 3);
	      forOwn(object, function(value, key, object) {
	        if (callback(value, key, object)) {
	          result = key;
	          return false;
	        }
	      });
	      return result;
	    }

	    /**
	     * This method is like `_.findKey` except that it iterates over elements
	     * of a `collection` in the opposite order.
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to search.
	     * @param {Function|Object|string} [callback=identity] The function called per
	     *  iteration. If a property name or object is provided it will be used to
	     *  create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
	     * @example
	     *
	     * var characters = {
	     *   'barney': {  'age': 36, 'blocked': true },
	     *   'fred': {    'age': 40, 'blocked': false },
	     *   'pebbles': { 'age': 1,  'blocked': true }
	     * };
	     *
	     * _.findLastKey(characters, function(chr) {
	     *   return chr.age < 40;
	     * });
	     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
	     *
	     * // using "_.where" callback shorthand
	     * _.findLastKey(characters, { 'age': 40 });
	     * // => 'fred'
	     *
	     * // using "_.pluck" callback shorthand
	     * _.findLastKey(characters, 'blocked');
	     * // => 'pebbles'
	     */
	    function findLastKey(object, callback, thisArg) {
	      var result;
	      callback = lodash.createCallback(callback, thisArg, 3);
	      forOwnRight(object, function(value, key, object) {
	        if (callback(value, key, object)) {
	          result = key;
	          return false;
	        }
	      });
	      return result;
	    }

	    /**
	     * Iterates over own and inherited enumerable properties of an object,
	     * executing the callback for each property. The callback is bound to `thisArg`
	     * and invoked with three arguments; (value, key, object). Callbacks may exit
	     * iteration early by explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @type Function
	     * @category Objects
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * function Shape() {
	     *   this.x = 0;
	     *   this.y = 0;
	     * }
	     *
	     * Shape.prototype.move = function(x, y) {
	     *   this.x += x;
	     *   this.y += y;
	     * };
	     *
	     * _.forIn(new Shape, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
	     */
	    var forIn = createIterator(eachIteratorOptions, forOwnIteratorOptions, {
	      'useHas': false
	    });

	    /**
	     * This method is like `_.forIn` except that it iterates over elements
	     * of a `collection` in the opposite order.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * function Shape() {
	     *   this.x = 0;
	     *   this.y = 0;
	     * }
	     *
	     * Shape.prototype.move = function(x, y) {
	     *   this.x += x;
	     *   this.y += y;
	     * };
	     *
	     * _.forInRight(new Shape, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
	     */
	    function forInRight(object, callback, thisArg) {
	      var pairs = [];

	      forIn(object, function(value, key) {
	        pairs.push(key, value);
	      });

	      var length = pairs.length;
	      callback = baseCreateCallback(callback, thisArg, 3);
	      while (length--) {
	        if (callback(pairs[length--], pairs[length], object) === false) {
	          break;
	        }
	      }
	      return object;
	    }

	    /**
	     * Iterates over own enumerable properties of an object, executing the callback
	     * for each property. The callback is bound to `thisArg` and invoked with three
	     * arguments; (value, key, object). Callbacks may exit iteration early by
	     * explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @type Function
	     * @category Objects
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
	     *   console.log(key);
	     * });
	     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
	     */
	    var forOwn = createIterator(eachIteratorOptions, forOwnIteratorOptions);

	    /**
	     * This method is like `_.forOwn` except that it iterates over elements
	     * of a `collection` in the opposite order.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
	     *   console.log(key);
	     * });
	     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
	     */
	    function forOwnRight(object, callback, thisArg) {
	      var props = keys(object),
	          length = props.length;

	      callback = baseCreateCallback(callback, thisArg, 3);
	      while (length--) {
	        var key = props[length];
	        if (callback(object[key], key, object) === false) {
	          break;
	        }
	      }
	      return object;
	    }

	    /**
	     * Creates a sorted array of property names of all enumerable properties,
	     * own and inherited, of `object` that have function values.
	     *
	     * @static
	     * @memberOf _
	     * @alias methods
	     * @category Objects
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns an array of property names that have function values.
	     * @example
	     *
	     * _.functions(_);
	     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
	     */
	    function functions(object) {
	      var result = [];
	      forIn(object, function(value, key) {
	        if (isFunction(value)) {
	          result.push(key);
	        }
	      });
	      return result.sort();
	    }

	    /**
	     * Checks if the specified property name exists as a direct property of `object`,
	     * instead of an inherited property.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to inspect.
	     * @param {string} key The name of the property to check.
	     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
	     * @example
	     *
	     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
	     * // => true
	     */
	    function has(object, key) {
	      return object ? hasOwnProperty.call(object, key) : false;
	    }

	    /**
	     * Creates an object composed of the inverted keys and values of the given object.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to invert.
	     * @returns {Object} Returns the created inverted object.
	     * @example
	     *
	     * _.invert({ 'first': 'fred', 'second': 'barney' });
	     * // => { 'fred': 'first', 'barney': 'second' }
	     */
	    function invert(object) {
	      var index = -1,
	          props = keys(object),
	          length = props.length,
	          result = {};

	      while (++index < length) {
	        var key = props[index];
	        result[object[key]] = key;
	      }
	      return result;
	    }

	    /**
	     * Checks if `value` is a boolean value.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
	     * @example
	     *
	     * _.isBoolean(null);
	     * // => false
	     */
	    function isBoolean(value) {
	      return value === true || value === false ||
	        value && typeof value == 'object' && toString.call(value) == boolClass || false;
	    }

	    /**
	     * Checks if `value` is a date.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
	     * @example
	     *
	     * _.isDate(new Date);
	     * // => true
	     */
	    function isDate(value) {
	      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
	    }

	    /**
	     * Checks if `value` is a DOM element.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
	     * @example
	     *
	     * _.isElement(document.body);
	     * // => true
	     */
	    function isElement(value) {
	      return value && value.nodeType === 1 || false;
	    }

	    /**
	     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
	     * length of `0` and objects with no own enumerable properties are considered
	     * "empty".
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Array|Object|string} value The value to inspect.
	     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
	     * @example
	     *
	     * _.isEmpty([1, 2, 3]);
	     * // => false
	     *
	     * _.isEmpty({});
	     * // => true
	     *
	     * _.isEmpty('');
	     * // => true
	     */
	    function isEmpty(value) {
	      var result = true;
	      if (!value) {
	        return result;
	      }
	      var className = toString.call(value),
	          length = value.length;

	      if ((className == arrayClass || className == stringClass ||
	          (support.argsClass ? className == argsClass : isArguments(value))) ||
	          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
	        return !length;
	      }
	      forOwn(value, function() {
	        return (result = false);
	      });
	      return result;
	    }

	    /**
	     * Performs a deep comparison between two values to determine if they are
	     * equivalent to each other. If a callback is provided it will be executed
	     * to compare values. If the callback returns `undefined` comparisons will
	     * be handled by the method instead. The callback is bound to `thisArg` and
	     * invoked with two arguments; (a, b).
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} a The value to compare.
	     * @param {*} b The other value to compare.
	     * @param {Function} [callback] The function to customize comparing values.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	     * @example
	     *
	     * var object = { 'name': 'fred' };
	     * var copy = { 'name': 'fred' };
	     *
	     * object == copy;
	     * // => false
	     *
	     * _.isEqual(object, copy);
	     * // => true
	     *
	     * var words = ['hello', 'goodbye'];
	     * var otherWords = ['hi', 'goodbye'];
	     *
	     * _.isEqual(words, otherWords, function(a, b) {
	     *   var reGreet = /^(?:hello|hi)$/i,
	     *       aGreet = _.isString(a) && reGreet.test(a),
	     *       bGreet = _.isString(b) && reGreet.test(b);
	     *
	     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
	     * });
	     * // => true
	     */
	    function isEqual(a, b, callback, thisArg) {
	      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
	    }

	    /**
	     * Checks if `value` is, or can be coerced to, a finite number.
	     *
	     * Note: This is not the same as native `isFinite` which will return true for
	     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
	     * @example
	     *
	     * _.isFinite(-101);
	     * // => true
	     *
	     * _.isFinite('10');
	     * // => true
	     *
	     * _.isFinite(true);
	     * // => false
	     *
	     * _.isFinite('');
	     * // => false
	     *
	     * _.isFinite(Infinity);
	     * // => false
	     */
	    function isFinite(value) {
	      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
	    }

	    /**
	     * Checks if `value` is a function.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
	     * @example
	     *
	     * _.isFunction(_);
	     * // => true
	     */
	    function isFunction(value) {
	      return typeof value == 'function';
	    }
	    // fallback for older versions of Chrome and Safari
	    if (isFunction(/x/)) {
	      isFunction = function(value) {
	        return typeof value == 'function' && toString.call(value) == funcClass;
	      };
	    }

	    /**
	     * Checks if `value` is the language type of Object.
	     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
	     * @example
	     *
	     * _.isObject({});
	     * // => true
	     *
	     * _.isObject([1, 2, 3]);
	     * // => true
	     *
	     * _.isObject(1);
	     * // => false
	     */
	    function isObject(value) {
	      // check if the value is the ECMAScript language type of Object
	      // http://es5.github.io/#x8
	      // and avoid a V8 bug
	      // http://code.google.com/p/v8/issues/detail?id=2291
	      return !!(value && objectTypes[typeof value]);
	    }

	    /**
	     * Checks if `value` is `NaN`.
	     *
	     * Note: This is not the same as native `isNaN` which will return `true` for
	     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
	     * @example
	     *
	     * _.isNaN(NaN);
	     * // => true
	     *
	     * _.isNaN(new Number(NaN));
	     * // => true
	     *
	     * isNaN(undefined);
	     * // => true
	     *
	     * _.isNaN(undefined);
	     * // => false
	     */
	    function isNaN(value) {
	      // `NaN` as a primitive is the only value that is not equal to itself
	      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
	      return isNumber(value) && value != +value;
	    }

	    /**
	     * Checks if `value` is `null`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
	     * @example
	     *
	     * _.isNull(null);
	     * // => true
	     *
	     * _.isNull(undefined);
	     * // => false
	     */
	    function isNull(value) {
	      return value === null;
	    }

	    /**
	     * Checks if `value` is a number.
	     *
	     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
	     * @example
	     *
	     * _.isNumber(8.4 * 5);
	     * // => true
	     */
	    function isNumber(value) {
	      return typeof value == 'number' ||
	        value && typeof value == 'object' && toString.call(value) == numberClass || false;
	    }

	    /**
	     * Checks if `value` is an object created by the `Object` constructor.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	     * @example
	     *
	     * function Shape() {
	     *   this.x = 0;
	     *   this.y = 0;
	     * }
	     *
	     * _.isPlainObject(new Shape);
	     * // => false
	     *
	     * _.isPlainObject([1, 2, 3]);
	     * // => false
	     *
	     * _.isPlainObject({ 'x': 0, 'y': 0 });
	     * // => true
	     */
	    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
	      if (!(value && toString.call(value) == objectClass) || (!support.argsClass && isArguments(value))) {
	        return false;
	      }
	      var valueOf = value.valueOf,
	          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

	      return objProto
	        ? (value == objProto || getPrototypeOf(value) == objProto)
	        : shimIsPlainObject(value);
	    };

	    /**
	     * Checks if `value` is a regular expression.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
	     * @example
	     *
	     * _.isRegExp(/fred/);
	     * // => true
	     */
	    function isRegExp(value) {
	      return value && objectTypes[typeof value] && toString.call(value) == regexpClass || false;
	    }

	    /**
	     * Checks if `value` is a string.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
	     * @example
	     *
	     * _.isString('fred');
	     * // => true
	     */
	    function isString(value) {
	      return typeof value == 'string' ||
	        value && typeof value == 'object' && toString.call(value) == stringClass || false;
	    }

	    /**
	     * Checks if `value` is `undefined`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
	     * @example
	     *
	     * _.isUndefined(void 0);
	     * // => true
	     */
	    function isUndefined(value) {
	      return typeof value == 'undefined';
	    }

	    /**
	     * Creates an object with the same keys as `object` and values generated by
	     * running each own enumerable property of `object` through the callback.
	     * The callback is bound to `thisArg` and invoked with three arguments;
	     * (value, key, object).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
	     * @example
	     *
	     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
	     * // => { 'a': 3, 'b': 6, 'c': 9 }
	     *
	     * var characters = {
	     *   'fred': { 'name': 'fred', 'age': 40 },
	     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
	     * };
	     *
	     * // using "_.pluck" callback shorthand
	     * _.mapValues(characters, 'age');
	     * // => { 'fred': 40, 'pebbles': 1 }
	     */
	    function mapValues(object, callback, thisArg) {
	      var result = {};
	      callback = lodash.createCallback(callback, thisArg, 3);

	      forOwn(object, function(value, key, object) {
	        result[key] = callback(value, key, object);
	      });
	      return result;
	    }

	    /**
	     * Recursively merges own enumerable properties of the source object(s), that
	     * don't resolve to `undefined` into the destination object. Subsequent sources
	     * will overwrite property assignments of previous sources. If a callback is
	     * provided it will be executed to produce the merged values of the destination
	     * and source properties. If the callback returns `undefined` merging will
	     * be handled by the method instead. The callback is bound to `thisArg` and
	     * invoked with two arguments; (objectValue, sourceValue).
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The destination object.
	     * @param {...Object} [source] The source objects.
	     * @param {Function} [callback] The function to customize merging properties.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns the destination object.
	     * @example
	     *
	     * var names = {
	     *   'characters': [
	     *     { 'name': 'barney' },
	     *     { 'name': 'fred' }
	     *   ]
	     * };
	     *
	     * var ages = {
	     *   'characters': [
	     *     { 'age': 36 },
	     *     { 'age': 40 }
	     *   ]
	     * };
	     *
	     * _.merge(names, ages);
	     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
	     *
	     * var food = {
	     *   'fruits': ['apple'],
	     *   'vegetables': ['beet']
	     * };
	     *
	     * var otherFood = {
	     *   'fruits': ['banana'],
	     *   'vegetables': ['carrot']
	     * };
	     *
	     * _.merge(food, otherFood, function(a, b) {
	     *   return _.isArray(a) ? a.concat(b) : undefined;
	     * });
	     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
	     */
	    function merge(object) {
	      var args = arguments,
	          length = 2;

	      if (!isObject(object)) {
	        return object;
	      }
	      // allows working with `_.reduce` and `_.reduceRight` without using
	      // their `index` and `collection` arguments
	      if (typeof args[2] != 'number') {
	        length = args.length;
	      }
	      if (length > 3 && typeof args[length - 2] == 'function') {
	        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
	      } else if (length > 2 && typeof args[length - 1] == 'function') {
	        callback = args[--length];
	      }
	      var sources = slice(arguments, 1, length),
	          index = -1,
	          stackA = getArray(),
	          stackB = getArray();

	      while (++index < length) {
	        baseMerge(object, sources[index], callback, stackA, stackB);
	      }
	      releaseArray(stackA);
	      releaseArray(stackB);
	      return object;
	    }

	    /**
	     * Creates a shallow clone of `object` excluding the specified properties.
	     * Property names may be specified as individual arguments or as arrays of
	     * property names. If a callback is provided it will be executed for each
	     * property of `object` omitting the properties the callback returns truey
	     * for. The callback is bound to `thisArg` and invoked with three arguments;
	     * (value, key, object).
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The source object.
	     * @param {Function|...string|string[]} [callback] The properties to omit or the
	     *  function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns an object without the omitted properties.
	     * @example
	     *
	     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
	     * // => { 'name': 'fred' }
	     *
	     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
	     *   return typeof value == 'number';
	     * });
	     * // => { 'name': 'fred' }
	     */
	    function omit(object, callback, thisArg) {
	      var result = {};
	      if (typeof callback != 'function') {
	        var props = [];
	        forIn(object, function(value, key) {
	          props.push(key);
	        });
	        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

	        var index = -1,
	            length = props.length;

	        while (++index < length) {
	          var key = props[index];
	          result[key] = object[key];
	        }
	      } else {
	        callback = lodash.createCallback(callback, thisArg, 3);
	        forIn(object, function(value, key, object) {
	          if (!callback(value, key, object)) {
	            result[key] = value;
	          }
	        });
	      }
	      return result;
	    }

	    /**
	     * Creates a two dimensional array of an object's key-value pairs,
	     * i.e. `[[key1, value1], [key2, value2]]`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns new array of key-value pairs.
	     * @example
	     *
	     * _.pairs({ 'barney': 36, 'fred': 40 });
	     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
	     */
	    function pairs(object) {
	      var index = -1,
	          props = keys(object),
	          length = props.length,
	          result = Array(length);

	      while (++index < length) {
	        var key = props[index];
	        result[index] = [key, object[key]];
	      }
	      return result;
	    }

	    /**
	     * Creates a shallow clone of `object` composed of the specified properties.
	     * Property names may be specified as individual arguments or as arrays of
	     * property names. If a callback is provided it will be executed for each
	     * property of `object` picking the properties the callback returns truey
	     * for. The callback is bound to `thisArg` and invoked with three arguments;
	     * (value, key, object).
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The source object.
	     * @param {Function|...string|string[]} [callback] The function called per
	     *  iteration or property names to pick, specified as individual property
	     *  names or arrays of property names.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns an object composed of the picked properties.
	     * @example
	     *
	     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
	     * // => { 'name': 'fred' }
	     *
	     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
	     *   return key.charAt(0) != '_';
	     * });
	     * // => { 'name': 'fred' }
	     */
	    function pick(object, callback, thisArg) {
	      var result = {};
	      if (typeof callback != 'function') {
	        var index = -1,
	            props = baseFlatten(arguments, true, false, 1),
	            length = isObject(object) ? props.length : 0;

	        while (++index < length) {
	          var key = props[index];
	          if (key in object) {
	            result[key] = object[key];
	          }
	        }
	      } else {
	        callback = lodash.createCallback(callback, thisArg, 3);
	        forIn(object, function(value, key, object) {
	          if (callback(value, key, object)) {
	            result[key] = value;
	          }
	        });
	      }
	      return result;
	    }

	    /**
	     * An alternative to `_.reduce` this method transforms `object` to a new
	     * `accumulator` object which is the result of running each of its own
	     * enumerable properties through a callback, with each callback execution
	     * potentially mutating the `accumulator` object. The callback is bound to
	     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
	     * Callbacks may exit iteration early by explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Array|Object} object The object to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [accumulator] The custom accumulator value.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the accumulated value.
	     * @example
	     *
	     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
	     *   num *= num;
	     *   if (num % 2) {
	     *     return result.push(num) < 3;
	     *   }
	     * });
	     * // => [1, 9, 25]
	     *
	     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
	     *   result[key] = num * 3;
	     * });
	     * // => { 'a': 3, 'b': 6, 'c': 9 }
	     */
	    function transform(object, callback, accumulator, thisArg) {
	      var isArr = isArray(object);
	      if (accumulator == null) {
	        if (isArr) {
	          accumulator = [];
	        } else {
	          var ctor = object && object.constructor,
	              proto = ctor && ctor.prototype;

	          accumulator = baseCreate(proto);
	        }
	      }
	      if (callback) {
	        callback = lodash.createCallback(callback, thisArg, 4);
	        (isArr ? baseEach : forOwn)(object, function(value, index, object) {
	          return callback(accumulator, value, index, object);
	        });
	      }
	      return accumulator;
	    }

	    /**
	     * Creates an array composed of the own enumerable property values of `object`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns an array of property values.
	     * @example
	     *
	     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
	     * // => [1, 2, 3] (property order is not guaranteed across environments)
	     */
	    function values(object) {
	      var index = -1,
	          props = keys(object),
	          length = props.length,
	          result = Array(length);

	      while (++index < length) {
	        result[index] = object[props[index]];
	      }
	      return result;
	    }

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Creates an array of elements from the specified indexes, or keys, of the
	     * `collection`. Indexes may be specified as individual arguments or as arrays
	     * of indexes.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
	     *   to retrieve, specified as individual indexes or arrays of indexes.
	     * @returns {Array} Returns a new array of elements corresponding to the
	     *  provided indexes.
	     * @example
	     *
	     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
	     * // => ['a', 'c', 'e']
	     *
	     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
	     * // => ['fred', 'pebbles']
	     */
	    function at(collection) {
	      var args = arguments,
	          index = -1,
	          props = baseFlatten(args, true, false, 1),
	          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
	          result = Array(length);

	      if (support.unindexedChars && isString(collection)) {
	        collection = collection.split('');
	      }
	      while(++index < length) {
	        result[index] = collection[props[index]];
	      }
	      return result;
	    }

	    /**
	     * Checks if a given value is present in a collection using strict equality
	     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
	     * offset from the end of the collection.
	     *
	     * @static
	     * @memberOf _
	     * @alias include
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {*} target The value to check for.
	     * @param {number} [fromIndex=0] The index to search from.
	     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
	     * @example
	     *
	     * _.contains([1, 2, 3], 1);
	     * // => true
	     *
	     * _.contains([1, 2, 3], 1, 2);
	     * // => false
	     *
	     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
	     * // => true
	     *
	     * _.contains('pebbles', 'eb');
	     * // => true
	     */
	    function contains(collection, target, fromIndex) {
	      var index = -1,
	          indexOf = getIndexOf(),
	          length = collection ? collection.length : 0,
	          result = false;

	      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
	      if (isArray(collection)) {
	        result = indexOf(collection, target, fromIndex) > -1;
	      } else if (typeof length == 'number') {
	        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
	      } else {
	        baseEach(collection, function(value) {
	          if (++index >= fromIndex) {
	            return !(result = value === target);
	          }
	        });
	      }
	      return result;
	    }

	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of `collection` through the callback. The corresponding value
	     * of each key is the number of times the key was returned by the callback.
	     * The callback is bound to `thisArg` and invoked with three arguments;
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
	     * // => { '4': 1, '6': 2 }
	     *
	     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
	     * // => { '4': 1, '6': 2 }
	     *
	     * _.countBy(['one', 'two', 'three'], 'length');
	     * // => { '3': 2, '5': 1 }
	     */
	    var countBy = createAggregator(function(result, value, key) {
	      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
	    });

	    /**
	     * Checks if the given callback returns truey value for **all** elements of
	     * a collection. The callback is bound to `thisArg` and invoked with three
	     * arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias all
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {boolean} Returns `true` if all elements passed the callback check,
	     *  else `false`.
	     * @example
	     *
	     * _.every([true, 1, null, 'yes']);
	     * // => false
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.every(characters, 'age');
	     * // => true
	     *
	     * // using "_.where" callback shorthand
	     * _.every(characters, { 'age': 36 });
	     * // => false
	     */
	    function every(collection, callback, thisArg) {
	      var result = true;
	      callback = lodash.createCallback(callback, thisArg, 3);

	      if (isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        while (++index < length) {
	          if (!(result = !!callback(collection[index], index, collection))) {
	            break;
	          }
	        }
	      } else {
	        baseEach(collection, function(value, index, collection) {
	          return (result = !!callback(value, index, collection));
	        });
	      }
	      return result;
	    }

	    /**
	     * Iterates over elements of a collection, returning an array of all elements
	     * the callback returns truey for. The callback is bound to `thisArg` and
	     * invoked with three arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias select
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a new array of elements that passed the callback check.
	     * @example
	     *
	     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
	     * // => [2, 4, 6]
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36, 'blocked': false },
	     *   { 'name': 'fred',   'age': 40, 'blocked': true }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.filter(characters, 'blocked');
	     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
	     *
	     * // using "_.where" callback shorthand
	     * _.filter(characters, { 'age': 36 });
	     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
	     */
	    function filter(collection, callback, thisArg) {
	      var result = [];
	      callback = lodash.createCallback(callback, thisArg, 3);

	      if (isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        while (++index < length) {
	          var value = collection[index];
	          if (callback(value, index, collection)) {
	            result.push(value);
	          }
	        }
	      } else {
	        baseEach(collection, function(value, index, collection) {
	          if (callback(value, index, collection)) {
	            result.push(value);
	          }
	        });
	      }
	      return result;
	    }

	    /**
	     * Iterates over elements of a collection, returning the first element that
	     * the callback returns truey for. The callback is bound to `thisArg` and
	     * invoked with three arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias detect, findWhere
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the found element, else `undefined`.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'age': 36, 'blocked': false },
	     *   { 'name': 'fred',    'age': 40, 'blocked': true },
	     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
	     * ];
	     *
	     * _.find(characters, function(chr) {
	     *   return chr.age < 40;
	     * });
	     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
	     *
	     * // using "_.where" callback shorthand
	     * _.find(characters, { 'age': 1 });
	     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
	     *
	     * // using "_.pluck" callback shorthand
	     * _.find(characters, 'blocked');
	     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
	     */
	    function find(collection, callback, thisArg) {
	      callback = lodash.createCallback(callback, thisArg, 3);

	      if (isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        while (++index < length) {
	          var value = collection[index];
	          if (callback(value, index, collection)) {
	            return value;
	          }
	        }
	      } else {
	        var result;
	        baseEach(collection, function(value, index, collection) {
	          if (callback(value, index, collection)) {
	            result = value;
	            return false;
	          }
	        });
	        return result;
	      }
	    }

	    /**
	     * This method is like `_.find` except that it iterates over elements
	     * of a `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the found element, else `undefined`.
	     * @example
	     *
	     * _.findLast([1, 2, 3, 4], function(num) {
	     *   return num % 2 == 1;
	     * });
	     * // => 3
	     */
	    function findLast(collection, callback, thisArg) {
	      var result;
	      callback = lodash.createCallback(callback, thisArg, 3);
	      forEachRight(collection, function(value, index, collection) {
	        if (callback(value, index, collection)) {
	          result = value;
	          return false;
	        }
	      });
	      return result;
	    }

	    /**
	     * Iterates over elements of a collection, executing the callback for each
	     * element. The callback is bound to `thisArg` and invoked with three arguments;
	     * (value, index|key, collection). Callbacks may exit iteration early by
	     * explicitly returning `false`.
	     *
	     * Note: As with other "Collections" methods, objects with a `length` property
	     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
	     * may be used for object iteration.
	     *
	     * @static
	     * @memberOf _
	     * @alias each
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array|Object|string} Returns `collection`.
	     * @example
	     *
	     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
	     * // => logs each number and returns '1,2,3'
	     *
	     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
	     * // => logs each number and returns the object (property order is not guaranteed across environments)
	     */
	    function forEach(collection, callback, thisArg) {
	      if (callback && typeof thisArg == 'undefined' && isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        while (++index < length) {
	          if (callback(collection[index], index, collection) === false) {
	            break;
	          }
	        }
	      } else {
	        baseEach(collection, callback, thisArg);
	      }
	      return collection;
	    }

	    /**
	     * This method is like `_.forEach` except that it iterates over elements
	     * of a `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @alias eachRight
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array|Object|string} Returns `collection`.
	     * @example
	     *
	     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
	     * // => logs each number from right to left and returns '3,2,1'
	     */
	    function forEachRight(collection, callback, thisArg) {
	      var iterable = collection,
	          length = collection ? collection.length : 0;

	      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
	      if (isArray(collection)) {
	        while (length--) {
	          if (callback(collection[length], length, collection) === false) {
	            break;
	          }
	        }
	      } else {
	        if (typeof length != 'number') {
	          var props = keys(collection);
	          length = props.length;
	        } else if (support.unindexedChars && isString(collection)) {
	          iterable = collection.split('');
	        }
	        baseEach(collection, function(value, key, collection) {
	          key = props ? props[--length] : --length;
	          return callback(iterable[key], key, collection);
	        });
	      }
	      return collection;
	    }

	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of a collection through the callback. The corresponding value
	     * of each key is an array of the elements responsible for generating the key.
	     * The callback is bound to `thisArg` and invoked with three arguments;
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
	     * // => { '4': [4.2], '6': [6.1, 6.4] }
	     *
	     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
	     * // => { '4': [4.2], '6': [6.1, 6.4] }
	     *
	     * // using "_.pluck" callback shorthand
	     * _.groupBy(['one', 'two', 'three'], 'length');
	     * // => { '3': ['one', 'two'], '5': ['three'] }
	     */
	    var groupBy = createAggregator(function(result, value, key) {
	      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
	    });

	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of the collection through the given callback. The corresponding
	     * value of each key is the last element responsible for generating the key.
	     * The callback is bound to `thisArg` and invoked with three arguments;
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * var keys = [
	     *   { 'dir': 'left', 'code': 97 },
	     *   { 'dir': 'right', 'code': 100 }
	     * ];
	     *
	     * _.indexBy(keys, 'dir');
	     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
	     *
	     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
	     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
	     *
	     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
	     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
	     */
	    var indexBy = createAggregator(function(result, value, key) {
	      result[key] = value;
	    });

	    /**
	     * Invokes the method named by `methodName` on each element in the `collection`
	     * returning an array of the results of each invoked method. Additional arguments
	     * will be provided to each invoked method. If `methodName` is a function it
	     * will be invoked for, and `this` bound to, each element in the `collection`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|string} methodName The name of the method to invoke or
	     *  the function invoked per iteration.
	     * @param {...*} [arg] Arguments to invoke the method with.
	     * @returns {Array} Returns a new array of the results of each invoked method.
	     * @example
	     *
	     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
	     * // => [[1, 5, 7], [1, 2, 3]]
	     *
	     * _.invoke([123, 456], String.prototype.split, '');
	     * // => [['1', '2', '3'], ['4', '5', '6']]
	     */
	    function invoke(collection, methodName) {
	      var args = slice(arguments, 2),
	          index = -1,
	          isFunc = typeof methodName == 'function',
	          length = collection ? collection.length : 0,
	          result = Array(typeof length == 'number' ? length : 0);

	      forEach(collection, function(value) {
	        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
	      });
	      return result;
	    }

	    /**
	     * Creates an array of values by running each element in the collection
	     * through the callback. The callback is bound to `thisArg` and invoked with
	     * three arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias collect
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a new array of the results of each `callback` execution.
	     * @example
	     *
	     * _.map([1, 2, 3], function(num) { return num * 3; });
	     * // => [3, 6, 9]
	     *
	     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
	     * // => [3, 6, 9] (property order is not guaranteed across environments)
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.map(characters, 'name');
	     * // => ['barney', 'fred']
	     */
	    function map(collection, callback, thisArg) {
	      var index = -1,
	          length = collection ? collection.length : 0,
	          result = Array(typeof length == 'number' ? length : 0);

	      callback = lodash.createCallback(callback, thisArg, 3);
	      if (isArray(collection)) {
	        while (++index < length) {
	          result[index] = callback(collection[index], index, collection);
	        }
	      } else {
	        baseEach(collection, function(value, key, collection) {
	          result[++index] = callback(value, key, collection);
	        });
	      }
	      return result;
	    }

	    /**
	     * Retrieves the maximum value of a collection. If the collection is empty or
	     * falsey `-Infinity` is returned. If a callback is provided it will be executed
	     * for each value in the collection to generate the criterion by which the value
	     * is ranked. The callback is bound to `thisArg` and invoked with three
	     * arguments; (value, index, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the maximum value.
	     * @example
	     *
	     * _.max([4, 2, 8, 6]);
	     * // => 8
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * _.max(characters, function(chr) { return chr.age; });
	     * // => { 'name': 'fred', 'age': 40 };
	     *
	     * // using "_.pluck" callback shorthand
	     * _.max(characters, 'age');
	     * // => { 'name': 'fred', 'age': 40 };
	     */
	    function max(collection, callback, thisArg) {
	      var computed = -Infinity,
	          result = computed;

	      // allows working with functions like `_.map` without using
	      // their `index` argument as a callback
	      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
	        callback = null;
	      }
	      if (callback == null && isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        while (++index < length) {
	          var value = collection[index];
	          if (value > result) {
	            result = value;
	          }
	        }
	      } else {
	        callback = (callback == null && isString(collection))
	          ? charAtCallback
	          : lodash.createCallback(callback, thisArg, 3);

	        baseEach(collection, function(value, index, collection) {
	          var current = callback(value, index, collection);
	          if (current > computed) {
	            computed = current;
	            result = value;
	          }
	        });
	      }
	      return result;
	    }

	    /**
	     * Retrieves the minimum value of a collection. If the collection is empty or
	     * falsey `Infinity` is returned. If a callback is provided it will be executed
	     * for each value in the collection to generate the criterion by which the value
	     * is ranked. The callback is bound to `thisArg` and invoked with three
	     * arguments; (value, index, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the minimum value.
	     * @example
	     *
	     * _.min([4, 2, 8, 6]);
	     * // => 2
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * _.min(characters, function(chr) { return chr.age; });
	     * // => { 'name': 'barney', 'age': 36 };
	     *
	     * // using "_.pluck" callback shorthand
	     * _.min(characters, 'age');
	     * // => { 'name': 'barney', 'age': 36 };
	     */
	    function min(collection, callback, thisArg) {
	      var computed = Infinity,
	          result = computed;

	      // allows working with functions like `_.map` without using
	      // their `index` argument as a callback
	      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
	        callback = null;
	      }
	      if (callback == null && isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        while (++index < length) {
	          var value = collection[index];
	          if (value < result) {
	            result = value;
	          }
	        }
	      } else {
	        callback = (callback == null && isString(collection))
	          ? charAtCallback
	          : lodash.createCallback(callback, thisArg, 3);

	        baseEach(collection, function(value, index, collection) {
	          var current = callback(value, index, collection);
	          if (current < computed) {
	            computed = current;
	            result = value;
	          }
	        });
	      }
	      return result;
	    }

	    /**
	     * Retrieves the value of a specified property from all elements in the collection.
	     *
	     * @static
	     * @memberOf _
	     * @type Function
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {string} property The name of the property to pluck.
	     * @returns {Array} Returns a new array of property values.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * _.pluck(characters, 'name');
	     * // => ['barney', 'fred']
	     */
	    var pluck = map;

	    /**
	     * Reduces a collection to a value which is the accumulated result of running
	     * each element in the collection through the callback, where each successive
	     * callback execution consumes the return value of the previous execution. If
	     * `accumulator` is not provided the first element of the collection will be
	     * used as the initial `accumulator` value. The callback is bound to `thisArg`
	     * and invoked with four arguments; (accumulator, value, index|key, collection).
	     *
	     * @static
	     * @memberOf _
	     * @alias foldl, inject
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [accumulator] Initial value of the accumulator.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the accumulated value.
	     * @example
	     *
	     * var sum = _.reduce([1, 2, 3], function(sum, num) {
	     *   return sum + num;
	     * });
	     * // => 6
	     *
	     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
	     *   result[key] = num * 3;
	     *   return result;
	     * }, {});
	     * // => { 'a': 3, 'b': 6, 'c': 9 }
	     */
	    function reduce(collection, callback, accumulator, thisArg) {
	      var noaccum = arguments.length < 3;
	      callback = lodash.createCallback(callback, thisArg, 4);

	      if (isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        if (noaccum) {
	          accumulator = collection[++index];
	        }
	        while (++index < length) {
	          accumulator = callback(accumulator, collection[index], index, collection);
	        }
	      } else {
	        baseEach(collection, function(value, index, collection) {
	          accumulator = noaccum
	            ? (noaccum = false, value)
	            : callback(accumulator, value, index, collection)
	        });
	      }
	      return accumulator;
	    }

	    /**
	     * This method is like `_.reduce` except that it iterates over elements
	     * of a `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @alias foldr
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [accumulator] Initial value of the accumulator.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the accumulated value.
	     * @example
	     *
	     * var list = [[0, 1], [2, 3], [4, 5]];
	     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
	     * // => [4, 5, 2, 3, 0, 1]
	     */
	    function reduceRight(collection, callback, accumulator, thisArg) {
	      var noaccum = arguments.length < 3;
	      callback = lodash.createCallback(callback, thisArg, 4);
	      forEachRight(collection, function(value, index, collection) {
	        accumulator = noaccum
	          ? (noaccum = false, value)
	          : callback(accumulator, value, index, collection);
	      });
	      return accumulator;
	    }

	    /**
	     * The opposite of `_.filter` this method returns the elements of a
	     * collection that the callback does **not** return truey for.
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a new array of elements that failed the callback check.
	     * @example
	     *
	     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
	     * // => [1, 3, 5]
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36, 'blocked': false },
	     *   { 'name': 'fred',   'age': 40, 'blocked': true }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.reject(characters, 'blocked');
	     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
	     *
	     * // using "_.where" callback shorthand
	     * _.reject(characters, { 'age': 36 });
	     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
	     */
	    function reject(collection, callback, thisArg) {
	      callback = lodash.createCallback(callback, thisArg, 3);
	      return filter(collection, function(value, index, collection) {
	        return !callback(value, index, collection);
	      });
	    }

	    /**
	     * Retrieves a random element or `n` random elements from a collection.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to sample.
	     * @param {number} [n] The number of elements to sample.
	     * @param- {Object} [guard] Allows working with functions like `_.map`
	     *  without using their `index` arguments as `n`.
	     * @returns {Array} Returns the random sample(s) of `collection`.
	     * @example
	     *
	     * _.sample([1, 2, 3, 4]);
	     * // => 2
	     *
	     * _.sample([1, 2, 3, 4], 2);
	     * // => [3, 1]
	     */
	    function sample(collection, n, guard) {
	      if (collection && typeof collection.length != 'number') {
	        collection = values(collection);
	      } else if (support.unindexedChars && isString(collection)) {
	        collection = collection.split('');
	      }
	      if (n == null || guard) {
	        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
	      }
	      var result = shuffle(collection);
	      result.length = nativeMin(nativeMax(0, n), result.length);
	      return result;
	    }

	    /**
	     * Creates an array of shuffled values, using a version of the Fisher-Yates
	     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to shuffle.
	     * @returns {Array} Returns a new shuffled collection.
	     * @example
	     *
	     * _.shuffle([1, 2, 3, 4, 5, 6]);
	     * // => [4, 1, 6, 3, 5, 2]
	     */
	    function shuffle(collection) {
	      var index = -1,
	          length = collection ? collection.length : 0,
	          result = Array(typeof length == 'number' ? length : 0);

	      forEach(collection, function(value) {
	        var rand = baseRandom(0, ++index);
	        result[index] = result[rand];
	        result[rand] = value;
	      });
	      return result;
	    }

	    /**
	     * Gets the size of the `collection` by returning `collection.length` for arrays
	     * and array-like objects or the number of own enumerable properties for objects.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to inspect.
	     * @returns {number} Returns `collection.length` or number of own enumerable properties.
	     * @example
	     *
	     * _.size([1, 2]);
	     * // => 2
	     *
	     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
	     * // => 3
	     *
	     * _.size('pebbles');
	     * // => 7
	     */
	    function size(collection) {
	      var length = collection ? collection.length : 0;
	      return typeof length == 'number' ? length : keys(collection).length;
	    }

	    /**
	     * Checks if the callback returns a truey value for **any** element of a
	     * collection. The function returns as soon as it finds a passing value and
	     * does not iterate over the entire collection. The callback is bound to
	     * `thisArg` and invoked with three arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias any
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {boolean} Returns `true` if any element passed the callback check,
	     *  else `false`.
	     * @example
	     *
	     * _.some([null, 0, 'yes', false], Boolean);
	     * // => true
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36, 'blocked': false },
	     *   { 'name': 'fred',   'age': 40, 'blocked': true }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.some(characters, 'blocked');
	     * // => true
	     *
	     * // using "_.where" callback shorthand
	     * _.some(characters, { 'age': 1 });
	     * // => false
	     */
	    function some(collection, callback, thisArg) {
	      var result;
	      callback = lodash.createCallback(callback, thisArg, 3);

	      if (isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        while (++index < length) {
	          if ((result = callback(collection[index], index, collection))) {
	            break;
	          }
	        }
	      } else {
	        baseEach(collection, function(value, index, collection) {
	          return !(result = callback(value, index, collection));
	        });
	      }
	      return !!result;
	    }

	    /**
	     * Creates an array of elements, sorted in ascending order by the results of
	     * running each element in a collection through the callback. This method
	     * performs a stable sort, that is, it will preserve the original sort order
	     * of equal elements. The callback is bound to `thisArg` and invoked with
	     * three arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an array of property names is provided for `callback` the collection
	     * will be sorted by each property value.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Array|Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a new array of sorted elements.
	     * @example
	     *
	     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
	     * // => [3, 1, 2]
	     *
	     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
	     * // => [3, 1, 2]
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'age': 36 },
	     *   { 'name': 'fred',    'age': 40 },
	     *   { 'name': 'barney',  'age': 26 },
	     *   { 'name': 'fred',    'age': 30 }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.map(_.sortBy(characters, 'age'), _.values);
	     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
	     *
	     * // sorting by multiple properties
	     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
	     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
	     */
	    function sortBy(collection, callback, thisArg) {
	      var index = -1,
	          isArr = isArray(callback),
	          length = collection ? collection.length : 0,
	          result = Array(typeof length == 'number' ? length : 0);

	      if (!isArr) {
	        callback = lodash.createCallback(callback, thisArg, 3);
	      }
	      forEach(collection, function(value, key, collection) {
	        var object = result[++index] = getObject();
	        if (isArr) {
	          object.criteria = map(callback, function(key) { return value[key]; });
	        } else {
	          (object.criteria = getArray())[0] = callback(value, key, collection);
	        }
	        object.index = index;
	        object.value = value;
	      });

	      length = result.length;
	      result.sort(compareAscending);
	      while (length--) {
	        var object = result[length];
	        result[length] = object.value;
	        if (!isArr) {
	          releaseArray(object.criteria);
	        }
	        releaseObject(object);
	      }
	      return result;
	    }

	    /**
	     * Converts the `collection` to an array.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to convert.
	     * @returns {Array} Returns the new converted array.
	     * @example
	     *
	     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
	     * // => [2, 3, 4]
	     */
	    function toArray(collection) {
	      if (collection && typeof collection.length == 'number') {
	        return (support.unindexedChars && isString(collection))
	          ? collection.split('')
	          : slice(collection);
	      }
	      return values(collection);
	    }

	    /**
	     * Performs a deep comparison of each element in a `collection` to the given
	     * `properties` object, returning an array of all elements that have equivalent
	     * property values.
	     *
	     * @static
	     * @memberOf _
	     * @type Function
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Object} props The object of property values to filter by.
	     * @returns {Array} Returns a new array of elements that have the given properties.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
	     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
	     * ];
	     *
	     * _.where(characters, { 'age': 36 });
	     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
	     *
	     * _.where(characters, { 'pets': ['dino'] });
	     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
	     */
	    var where = filter;

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Creates an array with all falsey values removed. The values `false`, `null`,
	     * `0`, `""`, `undefined`, and `NaN` are all falsey.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to compact.
	     * @returns {Array} Returns a new array of filtered values.
	     * @example
	     *
	     * _.compact([0, 1, false, 2, '', 3]);
	     * // => [1, 2, 3]
	     */
	    function compact(array) {
	      var index = -1,
	          length = array ? array.length : 0,
	          result = [];

	      while (++index < length) {
	        var value = array[index];
	        if (value) {
	          result.push(value);
	        }
	      }
	      return result;
	    }

	    /**
	     * Creates an array excluding all values of the provided arrays using strict
	     * equality for comparisons, i.e. `===`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to process.
	     * @param {...Array} [values] The arrays of values to exclude.
	     * @returns {Array} Returns a new array of filtered values.
	     * @example
	     *
	     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
	     * // => [1, 3, 4]
	     */
	    function difference(array) {
	      return baseDifference(array, baseFlatten(arguments, true, true, 1));
	    }

	    /**
	     * This method is like `_.find` except that it returns the index of the first
	     * element that passes the callback check, instead of the element itself.
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to search.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {number} Returns the index of the found element, else `-1`.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'age': 36, 'blocked': false },
	     *   { 'name': 'fred',    'age': 40, 'blocked': true },
	     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
	     * ];
	     *
	     * _.findIndex(characters, function(chr) {
	     *   return chr.age < 20;
	     * });
	     * // => 2
	     *
	     * // using "_.where" callback shorthand
	     * _.findIndex(characters, { 'age': 36 });
	     * // => 0
	     *
	     * // using "_.pluck" callback shorthand
	     * _.findIndex(characters, 'blocked');
	     * // => 1
	     */
	    function findIndex(array, callback, thisArg) {
	      var index = -1,
	          length = array ? array.length : 0;

	      callback = lodash.createCallback(callback, thisArg, 3);
	      while (++index < length) {
	        if (callback(array[index], index, array)) {
	          return index;
	        }
	      }
	      return -1;
	    }

	    /**
	     * This method is like `_.findIndex` except that it iterates over elements
	     * of a `collection` from right to left.
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to search.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {number} Returns the index of the found element, else `-1`.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'age': 36, 'blocked': true },
	     *   { 'name': 'fred',    'age': 40, 'blocked': false },
	     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
	     * ];
	     *
	     * _.findLastIndex(characters, function(chr) {
	     *   return chr.age > 30;
	     * });
	     * // => 1
	     *
	     * // using "_.where" callback shorthand
	     * _.findLastIndex(characters, { 'age': 36 });
	     * // => 0
	     *
	     * // using "_.pluck" callback shorthand
	     * _.findLastIndex(characters, 'blocked');
	     * // => 2
	     */
	    function findLastIndex(array, callback, thisArg) {
	      var length = array ? array.length : 0;
	      callback = lodash.createCallback(callback, thisArg, 3);
	      while (length--) {
	        if (callback(array[length], length, array)) {
	          return length;
	        }
	      }
	      return -1;
	    }

	    /**
	     * Gets the first element or first `n` elements of an array. If a callback
	     * is provided elements at the beginning of the array are returned as long
	     * as the callback returns truey. The callback is bound to `thisArg` and
	     * invoked with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias head, take
	     * @category Arrays
	     * @param {Array} array The array to query.
	     * @param {Function|Object|number|string} [callback] The function called
	     *  per element or the number of elements to return. If a property name or
	     *  object is provided it will be used to create a "_.pluck" or "_.where"
	     *  style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the first element(s) of `array`.
	     * @example
	     *
	     * _.first([1, 2, 3]);
	     * // => 1
	     *
	     * _.first([1, 2, 3], 2);
	     * // => [1, 2]
	     *
	     * _.first([1, 2, 3], function(num) {
	     *   return num < 3;
	     * });
	     * // => [1, 2]
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
	     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
	     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.first(characters, 'blocked');
	     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
	     *
	     * // using "_.where" callback shorthand
	     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
	     * // => ['barney', 'fred']
	     */
	    function first(array, callback, thisArg) {
	      var n = 0,
	          length = array ? array.length : 0;

	      if (typeof callback != 'number' && callback != null) {
	        var index = -1;
	        callback = lodash.createCallback(callback, thisArg, 3);
	        while (++index < length && callback(array[index], index, array)) {
	          n++;
	        }
	      } else {
	        n = callback;
	        if (n == null || thisArg) {
	          return array ? array[0] : undefined;
	        }
	      }
	      return slice(array, 0, nativeMin(nativeMax(0, n), length));
	    }

	    /**
	     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
	     * is truey, the array will only be flattened a single level. If a callback
	     * is provided each element of the array is passed through the callback before
	     * flattening. The callback is bound to `thisArg` and invoked with three
	     * arguments; (value, index, array).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to flatten.
	     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a new flattened array.
	     * @example
	     *
	     * _.flatten([1, [2], [3, [[4]]]]);
	     * // => [1, 2, 3, 4];
	     *
	     * _.flatten([1, [2], [3, [[4]]]], true);
	     * // => [1, 2, 3, [[4]]];
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
	     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.flatten(characters, 'pets');
	     * // => ['hoppy', 'baby puss', 'dino']
	     */
	    function flatten(array, isShallow, callback, thisArg) {
	      // juggle arguments
	      if (typeof isShallow != 'boolean' && isShallow != null) {
	        thisArg = callback;
	        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
	        isShallow = false;
	      }
	      if (callback != null) {
	        array = map(array, callback, thisArg);
	      }
	      return baseFlatten(array, isShallow);
	    }

	    /**
	     * Gets the index at which the first occurrence of `value` is found using
	     * strict equality for comparisons, i.e. `===`. If the array is already sorted
	     * providing `true` for `fromIndex` will run a faster binary search.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to search.
	     * @param {*} value The value to search for.
	     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
	     *  to perform a binary search on a sorted array.
	     * @returns {number} Returns the index of the matched value or `-1`.
	     * @example
	     *
	     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
	     * // => 1
	     *
	     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
	     * // => 4
	     *
	     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
	     * // => 2
	     */
	    function indexOf(array, value, fromIndex) {
	      if (typeof fromIndex == 'number') {
	        var length = array ? array.length : 0;
	        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
	      } else if (fromIndex) {
	        var index = sortedIndex(array, value);
	        return array[index] === value ? index : -1;
	      }
	      return baseIndexOf(array, value, fromIndex);
	    }

	    /**
	     * Gets all but the last element or last `n` elements of an array. If a
	     * callback is provided elements at the end of the array are excluded from
	     * the result as long as the callback returns truey. The callback is bound
	     * to `thisArg` and invoked with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to query.
	     * @param {Function|Object|number|string} [callback=1] The function called
	     *  per element or the number of elements to exclude. If a property name or
	     *  object is provided it will be used to create a "_.pluck" or "_.where"
	     *  style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a slice of `array`.
	     * @example
	     *
	     * _.initial([1, 2, 3]);
	     * // => [1, 2]
	     *
	     * _.initial([1, 2, 3], 2);
	     * // => [1]
	     *
	     * _.initial([1, 2, 3], function(num) {
	     *   return num > 1;
	     * });
	     * // => [1]
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
	     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
	     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.initial(characters, 'blocked');
	     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
	     *
	     * // using "_.where" callback shorthand
	     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
	     * // => ['barney', 'fred']
	     */
	    function initial(array, callback, thisArg) {
	      var n = 0,
	          length = array ? array.length : 0;

	      if (typeof callback != 'number' && callback != null) {
	        var index = length;
	        callback = lodash.createCallback(callback, thisArg, 3);
	        while (index-- && callback(array[index], index, array)) {
	          n++;
	        }
	      } else {
	        n = (callback == null || thisArg) ? 1 : callback || n;
	      }
	      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
	    }

	    /**
	     * Creates an array of unique values present in all provided arrays using
	     * strict equality for comparisons, i.e. `===`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {...Array} [array] The arrays to inspect.
	     * @returns {Array} Returns an array of shared values.
	     * @example
	     *
	     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
	     * // => [1, 2]
	     */
	    function intersection() {
	      var args = [],
	          argsIndex = -1,
	          argsLength = arguments.length,
	          caches = getArray(),
	          indexOf = getIndexOf(),
	          trustIndexOf = indexOf === baseIndexOf,
	          seen = getArray();

	      while (++argsIndex < argsLength) {
	        var value = arguments[argsIndex];
	        if (isArray(value) || isArguments(value)) {
	          args.push(value);
	          caches.push(trustIndexOf && value.length >= largeArraySize &&
	            createCache(argsIndex ? args[argsIndex] : seen));
	        }
	      }
	      var array = args[0],
	          index = -1,
	          length = array ? array.length : 0,
	          result = [];

	      outer:
	      while (++index < length) {
	        var cache = caches[0];
	        value = array[index];

	        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
	          argsIndex = argsLength;
	          (cache || seen).push(value);
	          while (--argsIndex) {
	            cache = caches[argsIndex];
	            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
	              continue outer;
	            }
	          }
	          result.push(value);
	        }
	      }
	      while (argsLength--) {
	        cache = caches[argsLength];
	        if (cache) {
	          releaseObject(cache);
	        }
	      }
	      releaseArray(caches);
	      releaseArray(seen);
	      return result;
	    }

	    /**
	     * Gets the last element or last `n` elements of an array. If a callback is
	     * provided elements at the end of the array are returned as long as the
	     * callback returns truey. The callback is bound to `thisArg` and invoked
	     * with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to query.
	     * @param {Function|Object|number|string} [callback] The function called
	     *  per element or the number of elements to return. If a property name or
	     *  object is provided it will be used to create a "_.pluck" or "_.where"
	     *  style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the last element(s) of `array`.
	     * @example
	     *
	     * _.last([1, 2, 3]);
	     * // => 3
	     *
	     * _.last([1, 2, 3], 2);
	     * // => [2, 3]
	     *
	     * _.last([1, 2, 3], function(num) {
	     *   return num > 1;
	     * });
	     * // => [2, 3]
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
	     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
	     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.pluck(_.last(characters, 'blocked'), 'name');
	     * // => ['fred', 'pebbles']
	     *
	     * // using "_.where" callback shorthand
	     * _.last(characters, { 'employer': 'na' });
	     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
	     */
	    function last(array, callback, thisArg) {
	      var n = 0,
	          length = array ? array.length : 0;

	      if (typeof callback != 'number' && callback != null) {
	        var index = length;
	        callback = lodash.createCallback(callback, thisArg, 3);
	        while (index-- && callback(array[index], index, array)) {
	          n++;
	        }
	      } else {
	        n = callback;
	        if (n == null || thisArg) {
	          return array ? array[length - 1] : undefined;
	        }
	      }
	      return slice(array, nativeMax(0, length - n));
	    }

	    /**
	     * Gets the index at which the last occurrence of `value` is found using strict
	     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
	     * as the offset from the end of the collection.
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to search.
	     * @param {*} value The value to search for.
	     * @param {number} [fromIndex=array.length-1] The index to search from.
	     * @returns {number} Returns the index of the matched value or `-1`.
	     * @example
	     *
	     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
	     * // => 4
	     *
	     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
	     * // => 1
	     */
	    function lastIndexOf(array, value, fromIndex) {
	      var index = array ? array.length : 0;
	      if (typeof fromIndex == 'number') {
	        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
	      }
	      while (index--) {
	        if (array[index] === value) {
	          return index;
	        }
	      }
	      return -1;
	    }

	    /**
	     * Removes all provided values from the given array using strict equality for
	     * comparisons, i.e. `===`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to modify.
	     * @param {...*} [value] The values to remove.
	     * @returns {Array} Returns `array`.
	     * @example
	     *
	     * var array = [1, 2, 3, 1, 2, 3];
	     * _.pull(array, 2, 3);
	     * console.log(array);
	     * // => [1, 1]
	     */
	    function pull(array) {
	      var args = arguments,
	          argsIndex = 0,
	          argsLength = args.length,
	          length = array ? array.length : 0;

	      while (++argsIndex < argsLength) {
	        var index = -1,
	            value = args[argsIndex];
	        while (++index < length) {
	          if (array[index] === value) {
	            splice.call(array, index--, 1);
	            length--;
	          }
	        }
	      }
	      return array;
	    }

	    /**
	     * Creates an array of numbers (positive and/or negative) progressing from
	     * `start` up to but not including `end`. If `start` is less than `stop` a
	     * zero-length range is created unless a negative `step` is specified.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {number} [start=0] The start of the range.
	     * @param {number} end The end of the range.
	     * @param {number} [step=1] The value to increment or decrement by.
	     * @returns {Array} Returns a new range array.
	     * @example
	     *
	     * _.range(4);
	     * // => [0, 1, 2, 3]
	     *
	     * _.range(1, 5);
	     * // => [1, 2, 3, 4]
	     *
	     * _.range(0, 20, 5);
	     * // => [0, 5, 10, 15]
	     *
	     * _.range(0, -4, -1);
	     * // => [0, -1, -2, -3]
	     *
	     * _.range(1, 4, 0);
	     * // => [1, 1, 1]
	     *
	     * _.range(0);
	     * // => []
	     */
	    function range(start, end, step) {
	      start = +start || 0;
	      step = typeof step == 'number' ? step : (+step || 1);

	      if (end == null) {
	        end = start;
	        start = 0;
	      }
	      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
	      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
	      var index = -1,
	          length = nativeMax(0, ceil((end - start) / (step || 1))),
	          result = Array(length);

	      while (++index < length) {
	        result[index] = start;
	        start += step;
	      }
	      return result;
	    }

	    /**
	     * Removes all elements from an array that the callback returns truey for
	     * and returns an array of removed elements. The callback is bound to `thisArg`
	     * and invoked with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to modify.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a new array of removed elements.
	     * @example
	     *
	     * var array = [1, 2, 3, 4, 5, 6];
	     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
	     *
	     * console.log(array);
	     * // => [1, 3, 5]
	     *
	     * console.log(evens);
	     * // => [2, 4, 6]
	     */
	    function remove(array, callback, thisArg) {
	      var index = -1,
	          length = array ? array.length : 0,
	          result = [];

	      callback = lodash.createCallback(callback, thisArg, 3);
	      while (++index < length) {
	        var value = array[index];
	        if (callback(value, index, array)) {
	          result.push(value);
	          splice.call(array, index--, 1);
	          length--;
	        }
	      }
	      return result;
	    }

	    /**
	     * The opposite of `_.initial` this method gets all but the first element or
	     * first `n` elements of an array. If a callback function is provided elements
	     * at the beginning of the array are excluded from the result as long as the
	     * callback returns truey. The callback is bound to `thisArg` and invoked
	     * with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias drop, tail
	     * @category Arrays
	     * @param {Array} array The array to query.
	     * @param {Function|Object|number|string} [callback=1] The function called
	     *  per element or the number of elements to exclude. If a property name or
	     *  object is provided it will be used to create a "_.pluck" or "_.where"
	     *  style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a slice of `array`.
	     * @example
	     *
	     * _.rest([1, 2, 3]);
	     * // => [2, 3]
	     *
	     * _.rest([1, 2, 3], 2);
	     * // => [3]
	     *
	     * _.rest([1, 2, 3], function(num) {
	     *   return num < 3;
	     * });
	     * // => [3]
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
	     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
	     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.pluck(_.rest(characters, 'blocked'), 'name');
	     * // => ['fred', 'pebbles']
	     *
	     * // using "_.where" callback shorthand
	     * _.rest(characters, { 'employer': 'slate' });
	     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
	     */
	    function rest(array, callback, thisArg) {
	      if (typeof callback != 'number' && callback != null) {
	        var n = 0,
	            index = -1,
	            length = array ? array.length : 0;

	        callback = lodash.createCallback(callback, thisArg, 3);
	        while (++index < length && callback(array[index], index, array)) {
	          n++;
	        }
	      } else {
	        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
	      }
	      return slice(array, n);
	    }

	    /**
	     * Uses a binary search to determine the smallest index at which a value
	     * should be inserted into a given sorted array in order to maintain the sort
	     * order of the array. If a callback is provided it will be executed for
	     * `value` and each element of `array` to compute their sort ranking. The
	     * callback is bound to `thisArg` and invoked with one argument; (value).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to inspect.
	     * @param {*} value The value to evaluate.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     * @example
	     *
	     * _.sortedIndex([20, 30, 50], 40);
	     * // => 2
	     *
	     * // using "_.pluck" callback shorthand
	     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
	     * // => 2
	     *
	     * var dict = {
	     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
	     * };
	     *
	     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
	     *   return dict.wordToNumber[word];
	     * });
	     * // => 2
	     *
	     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
	     *   return this.wordToNumber[word];
	     * }, dict);
	     * // => 2
	     */
	    function sortedIndex(array, value, callback, thisArg) {
	      var low = 0,
	          high = array ? array.length : low;

	      // explicitly reference `identity` for better inlining in Firefox
	      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
	      value = callback(value);

	      while (low < high) {
	        var mid = (low + high) >>> 1;
	        (callback(array[mid]) < value)
	          ? low = mid + 1
	          : high = mid;
	      }
	      return low;
	    }

	    /**
	     * Creates an array of unique values, in order, of the provided arrays using
	     * strict equality for comparisons, i.e. `===`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {...Array} [array] The arrays to inspect.
	     * @returns {Array} Returns an array of combined values.
	     * @example
	     *
	     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
	     * // => [1, 2, 3, 5, 4]
	     */
	    function union() {
	      return baseUniq(baseFlatten(arguments, true, true));
	    }

	    /**
	     * Creates a duplicate-value-free version of an array using strict equality
	     * for comparisons, i.e. `===`. If the array is sorted, providing
	     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
	     * each element of `array` is passed through the callback before uniqueness
	     * is computed. The callback is bound to `thisArg` and invoked with three
	     * arguments; (value, index, array).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias unique
	     * @category Arrays
	     * @param {Array} array The array to process.
	     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a duplicate-value-free array.
	     * @example
	     *
	     * _.uniq([1, 2, 1, 3, 1]);
	     * // => [1, 2, 3]
	     *
	     * _.uniq([1, 1, 2, 2, 3], true);
	     * // => [1, 2, 3]
	     *
	     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
	     * // => ['A', 'b', 'C']
	     *
	     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
	     * // => [1, 2.5, 3]
	     *
	     * // using "_.pluck" callback shorthand
	     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
	     * // => [{ 'x': 1 }, { 'x': 2 }]
	     */
	    function uniq(array, isSorted, callback, thisArg) {
	      // juggle arguments
	      if (typeof isSorted != 'boolean' && isSorted != null) {
	        thisArg = callback;
	        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
	        isSorted = false;
	      }
	      if (callback != null) {
	        callback = lodash.createCallback(callback, thisArg, 3);
	      }
	      return baseUniq(array, isSorted, callback);
	    }

	    /**
	     * Creates an array excluding all provided values using strict equality for
	     * comparisons, i.e. `===`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to filter.
	     * @param {...*} [value] The values to exclude.
	     * @returns {Array} Returns a new array of filtered values.
	     * @example
	     *
	     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
	     * // => [2, 3, 4]
	     */
	    function without(array) {
	      return baseDifference(array, slice(arguments, 1));
	    }

	    /**
	     * Creates an array that is the symmetric difference of the provided arrays.
	     * See http://en.wikipedia.org/wiki/Symmetric_difference.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {...Array} [array] The arrays to inspect.
	     * @returns {Array} Returns an array of values.
	     * @example
	     *
	     * _.xor([1, 2, 3], [5, 2, 1, 4]);
	     * // => [3, 5, 4]
	     *
	     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
	     * // => [1, 4, 5]
	     */
	    function xor() {
	      var index = -1,
	          length = arguments.length;

	      while (++index < length) {
	        var array = arguments[index];
	        if (isArray(array) || isArguments(array)) {
	          var result = result
	            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
	            : array;
	        }
	      }
	      return result || [];
	    }

	    /**
	     * Creates an array of grouped elements, the first of which contains the first
	     * elements of the given arrays, the second of which contains the second
	     * elements of the given arrays, and so on.
	     *
	     * @static
	     * @memberOf _
	     * @alias unzip
	     * @category Arrays
	     * @param {...Array} [array] Arrays to process.
	     * @returns {Array} Returns a new array of grouped elements.
	     * @example
	     *
	     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
	     * // => [['fred', 30, true], ['barney', 40, false]]
	     */
	    function zip() {
	      var array = arguments.length > 1 ? arguments : arguments[0],
	          index = -1,
	          length = array ? max(pluck(array, 'length')) : 0,
	          result = Array(length < 0 ? 0 : length);

	      while (++index < length) {
	        result[index] = pluck(array, index);
	      }
	      return result;
	    }

	    /**
	     * Creates an object composed from arrays of `keys` and `values`. Provide
	     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
	     * or two arrays, one of `keys` and one of corresponding `values`.
	     *
	     * @static
	     * @memberOf _
	     * @alias object
	     * @category Arrays
	     * @param {Array} keys The array of keys.
	     * @param {Array} [values=[]] The array of values.
	     * @returns {Object} Returns an object composed of the given keys and
	     *  corresponding values.
	     * @example
	     *
	     * _.zipObject(['fred', 'barney'], [30, 40]);
	     * // => { 'fred': 30, 'barney': 40 }
	     */
	    function zipObject(keys, values) {
	      var index = -1,
	          length = keys ? keys.length : 0,
	          result = {};

	      if (!values && length && !isArray(keys[0])) {
	        values = [];
	      }
	      while (++index < length) {
	        var key = keys[index];
	        if (values) {
	          result[key] = values[index];
	        } else if (key) {
	          result[key[0]] = key[1];
	        }
	      }
	      return result;
	    }

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Creates a function that executes `func`, with  the `this` binding and
	     * arguments of the created function, only after being called `n` times.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {number} n The number of times the function must be called before
	     *  `func` is executed.
	     * @param {Function} func The function to restrict.
	     * @returns {Function} Returns the new restricted function.
	     * @example
	     *
	     * var saves = ['profile', 'settings'];
	     *
	     * var done = _.after(saves.length, function() {
	     *   console.log('Done saving!');
	     * });
	     *
	     * _.forEach(saves, function(type) {
	     *   asyncSave({ 'type': type, 'complete': done });
	     * });
	     * // => logs 'Done saving!', after all saves have completed
	     */
	    function after(n, func) {
	      if (!isFunction(func)) {
	        throw new TypeError;
	      }
	      return function() {
	        if (--n < 1) {
	          return func.apply(this, arguments);
	        }
	      };
	    }

	    /**
	     * Creates a function that, when called, invokes `func` with the `this`
	     * binding of `thisArg` and prepends any additional `bind` arguments to those
	     * provided to the bound function.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to bind.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param {...*} [arg] Arguments to be partially applied.
	     * @returns {Function} Returns the new bound function.
	     * @example
	     *
	     * var func = function(greeting) {
	     *   return greeting + ' ' + this.name;
	     * };
	     *
	     * func = _.bind(func, { 'name': 'fred' }, 'hi');
	     * func();
	     * // => 'hi fred'
	     */
	    function bind(func, thisArg) {
	      return arguments.length > 2
	        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
	        : createWrapper(func, 1, null, null, thisArg);
	    }

	    /**
	     * Binds methods of an object to the object itself, overwriting the existing
	     * method. Method names may be specified as individual arguments or as arrays
	     * of method names. If no method names are provided all the function properties
	     * of `object` will be bound.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Object} object The object to bind and assign the bound methods to.
	     * @param {...string} [methodName] The object method names to
	     *  bind, specified as individual method names or arrays of method names.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * var view = {
	     *   'label': 'docs',
	     *   'onClick': function() { console.log('clicked ' + this.label); }
	     * };
	     *
	     * _.bindAll(view);
	     * jQuery('#docs').on('click', view.onClick);
	     * // => logs 'clicked docs', when the button is clicked
	     */
	    function bindAll(object) {
	      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
	          index = -1,
	          length = funcs.length;

	      while (++index < length) {
	        var key = funcs[index];
	        object[key] = createWrapper(object[key], 1, null, null, object);
	      }
	      return object;
	    }

	    /**
	     * Creates a function that, when called, invokes the method at `object[key]`
	     * and prepends any additional `bindKey` arguments to those provided to the bound
	     * function. This method differs from `_.bind` by allowing bound functions to
	     * reference methods that will be redefined or don't yet exist.
	     * See http://michaux.ca/articles/lazy-function-definition-pattern.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Object} object The object the method belongs to.
	     * @param {string} key The key of the method.
	     * @param {...*} [arg] Arguments to be partially applied.
	     * @returns {Function} Returns the new bound function.
	     * @example
	     *
	     * var object = {
	     *   'name': 'fred',
	     *   'greet': function(greeting) {
	     *     return greeting + ' ' + this.name;
	     *   }
	     * };
	     *
	     * var func = _.bindKey(object, 'greet', 'hi');
	     * func();
	     * // => 'hi fred'
	     *
	     * object.greet = function(greeting) {
	     *   return greeting + 'ya ' + this.name + '!';
	     * };
	     *
	     * func();
	     * // => 'hiya fred!'
	     */
	    function bindKey(object, key) {
	      return arguments.length > 2
	        ? createWrapper(key, 19, slice(arguments, 2), null, object)
	        : createWrapper(key, 3, null, null, object);
	    }

	    /**
	     * Creates a function that is the composition of the provided functions,
	     * where each function consumes the return value of the function that follows.
	     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
	     * Each function is executed with the `this` binding of the composed function.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {...Function} [func] Functions to compose.
	     * @returns {Function} Returns the new composed function.
	     * @example
	     *
	     * var realNameMap = {
	     *   'pebbles': 'penelope'
	     * };
	     *
	     * var format = function(name) {
	     *   name = realNameMap[name.toLowerCase()] || name;
	     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
	     * };
	     *
	     * var greet = function(formatted) {
	     *   return 'Hiya ' + formatted + '!';
	     * };
	     *
	     * var welcome = _.compose(greet, format);
	     * welcome('pebbles');
	     * // => 'Hiya Penelope!'
	     */
	    function compose() {
	      var funcs = arguments,
	          length = funcs.length;

	      while (length--) {
	        if (!isFunction(funcs[length])) {
	          throw new TypeError;
	        }
	      }
	      return function() {
	        var args = arguments,
	            length = funcs.length;

	        while (length--) {
	          args = [funcs[length].apply(this, args)];
	        }
	        return args[0];
	      };
	    }

	    /**
	     * Creates a function which accepts one or more arguments of `func` that when
	     * invoked either executes `func` returning its result, if all `func` arguments
	     * have been provided, or returns a function that accepts one or more of the
	     * remaining `func` arguments, and so on. The arity of `func` can be specified
	     * if `func.length` is not sufficient.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to curry.
	     * @param {number} [arity=func.length] The arity of `func`.
	     * @returns {Function} Returns the new curried function.
	     * @example
	     *
	     * var curried = _.curry(function(a, b, c) {
	     *   console.log(a + b + c);
	     * });
	     *
	     * curried(1)(2)(3);
	     * // => 6
	     *
	     * curried(1, 2)(3);
	     * // => 6
	     *
	     * curried(1, 2, 3);
	     * // => 6
	     */
	    function curry(func, arity) {
	      arity = typeof arity == 'number' ? arity : (+arity || func.length);
	      return createWrapper(func, 4, null, null, null, arity);
	    }

	    /**
	     * Creates a function that will delay the execution of `func` until after
	     * `wait` milliseconds have elapsed since the last time it was invoked.
	     * Provide an options object to indicate that `func` should be invoked on
	     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
	     * to the debounced function will return the result of the last `func` call.
	     *
	     * Note: If `leading` and `trailing` options are `true` `func` will be called
	     * on the trailing edge of the timeout only if the the debounced function is
	     * invoked more than once during the `wait` timeout.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to debounce.
	     * @param {number} wait The number of milliseconds to delay.
	     * @param {Object} [options] The options object.
	     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
	     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
	     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
	     * @returns {Function} Returns the new debounced function.
	     * @example
	     *
	     * // avoid costly calculations while the window size is in flux
	     * var lazyLayout = _.debounce(calculateLayout, 150);
	     * jQuery(window).on('resize', lazyLayout);
	     *
	     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
	     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
	     *   'leading': true,
	     *   'trailing': false
	     * });
	     *
	     * // ensure `batchLog` is executed once after 1 second of debounced calls
	     * var source = new EventSource('/stream');
	     * source.addEventListener('message', _.debounce(batchLog, 250, {
	     *   'maxWait': 1000
	     * }, false);
	     */
	    function debounce(func, wait, options) {
	      var args,
	          maxTimeoutId,
	          result,
	          stamp,
	          thisArg,
	          timeoutId,
	          trailingCall,
	          lastCalled = 0,
	          maxWait = false,
	          trailing = true;

	      if (!isFunction(func)) {
	        throw new TypeError;
	      }
	      wait = nativeMax(0, wait) || 0;
	      if (options === true) {
	        var leading = true;
	        trailing = false;
	      } else if (isObject(options)) {
	        leading = options.leading;
	        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
	        trailing = 'trailing' in options ? options.trailing : trailing;
	      }
	      var delayed = function() {
	        var remaining = wait - (now() - stamp);
	        if (remaining <= 0) {
	          if (maxTimeoutId) {
	            clearTimeout(maxTimeoutId);
	          }
	          var isCalled = trailingCall;
	          maxTimeoutId = timeoutId = trailingCall = undefined;
	          if (isCalled) {
	            lastCalled = now();
	            result = func.apply(thisArg, args);
	            if (!timeoutId && !maxTimeoutId) {
	              args = thisArg = null;
	            }
	          }
	        } else {
	          timeoutId = setTimeout(delayed, remaining);
	        }
	      };

	      var maxDelayed = function() {
	        if (timeoutId) {
	          clearTimeout(timeoutId);
	        }
	        maxTimeoutId = timeoutId = trailingCall = undefined;
	        if (trailing || (maxWait !== wait)) {
	          lastCalled = now();
	          result = func.apply(thisArg, args);
	          if (!timeoutId && !maxTimeoutId) {
	            args = thisArg = null;
	          }
	        }
	      };

	      return function() {
	        args = arguments;
	        stamp = now();
	        thisArg = this;
	        trailingCall = trailing && (timeoutId || !leading);

	        if (maxWait === false) {
	          var leadingCall = leading && !timeoutId;
	        } else {
	          if (!maxTimeoutId && !leading) {
	            lastCalled = stamp;
	          }
	          var remaining = maxWait - (stamp - lastCalled),
	              isCalled = remaining <= 0;

	          if (isCalled) {
	            if (maxTimeoutId) {
	              maxTimeoutId = clearTimeout(maxTimeoutId);
	            }
	            lastCalled = stamp;
	            result = func.apply(thisArg, args);
	          }
	          else if (!maxTimeoutId) {
	            maxTimeoutId = setTimeout(maxDelayed, remaining);
	          }
	        }
	        if (isCalled && timeoutId) {
	          timeoutId = clearTimeout(timeoutId);
	        }
	        else if (!timeoutId && wait !== maxWait) {
	          timeoutId = setTimeout(delayed, wait);
	        }
	        if (leadingCall) {
	          isCalled = true;
	          result = func.apply(thisArg, args);
	        }
	        if (isCalled && !timeoutId && !maxTimeoutId) {
	          args = thisArg = null;
	        }
	        return result;
	      };
	    }

	    /**
	     * Defers executing the `func` function until the current call stack has cleared.
	     * Additional arguments will be provided to `func` when it is invoked.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to defer.
	     * @param {...*} [arg] Arguments to invoke the function with.
	     * @returns {number} Returns the timer id.
	     * @example
	     *
	     * _.defer(function(text) { console.log(text); }, 'deferred');
	     * // logs 'deferred' after one or more milliseconds
	     */
	    function defer(func) {
	      if (!isFunction(func)) {
	        throw new TypeError;
	      }
	      var args = slice(arguments, 1);
	      return setTimeout(function() { func.apply(undefined, args); }, 1);
	    }

	    /**
	     * Executes the `func` function after `wait` milliseconds. Additional arguments
	     * will be provided to `func` when it is invoked.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to delay.
	     * @param {number} wait The number of milliseconds to delay execution.
	     * @param {...*} [arg] Arguments to invoke the function with.
	     * @returns {number} Returns the timer id.
	     * @example
	     *
	     * _.delay(function(text) { console.log(text); }, 1000, 'later');
	     * // => logs 'later' after one second
	     */
	    function delay(func, wait) {
	      if (!isFunction(func)) {
	        throw new TypeError;
	      }
	      var args = slice(arguments, 2);
	      return setTimeout(function() { func.apply(undefined, args); }, wait);
	    }

	    /**
	     * Creates a function that memoizes the result of `func`. If `resolver` is
	     * provided it will be used to determine the cache key for storing the result
	     * based on the arguments provided to the memoized function. By default, the
	     * first argument provided to the memoized function is used as the cache key.
	     * The `func` is executed with the `this` binding of the memoized function.
	     * The result cache is exposed as the `cache` property on the memoized function.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to have its output memoized.
	     * @param {Function} [resolver] A function used to resolve the cache key.
	     * @returns {Function} Returns the new memoizing function.
	     * @example
	     *
	     * var fibonacci = _.memoize(function(n) {
	     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
	     * });
	     *
	     * fibonacci(9)
	     * // => 34
	     *
	     * var data = {
	     *   'fred': { 'name': 'fred', 'age': 40 },
	     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
	     * };
	     *
	     * // modifying the result cache
	     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
	     * get('pebbles');
	     * // => { 'name': 'pebbles', 'age': 1 }
	     *
	     * get.cache.pebbles.name = 'penelope';
	     * get('pebbles');
	     * // => { 'name': 'penelope', 'age': 1 }
	     */
	    function memoize(func, resolver) {
	      if (!isFunction(func)) {
	        throw new TypeError;
	      }
	      var memoized = function() {
	        var cache = memoized.cache,
	            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

	        return hasOwnProperty.call(cache, key)
	          ? cache[key]
	          : (cache[key] = func.apply(this, arguments));
	      }
	      memoized.cache = {};
	      return memoized;
	    }

	    /**
	     * Creates a function that is restricted to execute `func` once. Repeat calls to
	     * the function will return the value of the first call. The `func` is executed
	     * with the `this` binding of the created function.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to restrict.
	     * @returns {Function} Returns the new restricted function.
	     * @example
	     *
	     * var initialize = _.once(createApplication);
	     * initialize();
	     * initialize();
	     * // `initialize` executes `createApplication` once
	     */
	    function once(func) {
	      var ran,
	          result;

	      if (!isFunction(func)) {
	        throw new TypeError;
	      }
	      return function() {
	        if (ran) {
	          return result;
	        }
	        ran = true;
	        result = func.apply(this, arguments);

	        // clear the `func` variable so the function may be garbage collected
	        func = null;
	        return result;
	      };
	    }

	    /**
	     * Creates a function that, when called, invokes `func` with any additional
	     * `partial` arguments prepended to those provided to the new function. This
	     * method is similar to `_.bind` except it does **not** alter the `this` binding.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to partially apply arguments to.
	     * @param {...*} [arg] Arguments to be partially applied.
	     * @returns {Function} Returns the new partially applied function.
	     * @example
	     *
	     * var greet = function(greeting, name) { return greeting + ' ' + name; };
	     * var hi = _.partial(greet, 'hi');
	     * hi('fred');
	     * // => 'hi fred'
	     */
	    function partial(func) {
	      return createWrapper(func, 16, slice(arguments, 1));
	    }

	    /**
	     * This method is like `_.partial` except that `partial` arguments are
	     * appended to those provided to the new function.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to partially apply arguments to.
	     * @param {...*} [arg] Arguments to be partially applied.
	     * @returns {Function} Returns the new partially applied function.
	     * @example
	     *
	     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
	     *
	     * var options = {
	     *   'variable': 'data',
	     *   'imports': { 'jq': $ }
	     * };
	     *
	     * defaultsDeep(options, _.templateSettings);
	     *
	     * options.variable
	     * // => 'data'
	     *
	     * options.imports
	     * // => { '_': _, 'jq': $ }
	     */
	    function partialRight(func) {
	      return createWrapper(func, 32, null, slice(arguments, 1));
	    }

	    /**
	     * Creates a function that, when executed, will only call the `func` function
	     * at most once per every `wait` milliseconds. Provide an options object to
	     * indicate that `func` should be invoked on the leading and/or trailing edge
	     * of the `wait` timeout. Subsequent calls to the throttled function will
	     * return the result of the last `func` call.
	     *
	     * Note: If `leading` and `trailing` options are `true` `func` will be called
	     * on the trailing edge of the timeout only if the the throttled function is
	     * invoked more than once during the `wait` timeout.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to throttle.
	     * @param {number} wait The number of milliseconds to throttle executions to.
	     * @param {Object} [options] The options object.
	     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
	     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
	     * @returns {Function} Returns the new throttled function.
	     * @example
	     *
	     * // avoid excessively updating the position while scrolling
	     * var throttled = _.throttle(updatePosition, 100);
	     * jQuery(window).on('scroll', throttled);
	     *
	     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
	     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
	     *   'trailing': false
	     * }));
	     */
	    function throttle(func, wait, options) {
	      var leading = true,
	          trailing = true;

	      if (!isFunction(func)) {
	        throw new TypeError;
	      }
	      if (options === false) {
	        leading = false;
	      } else if (isObject(options)) {
	        leading = 'leading' in options ? options.leading : leading;
	        trailing = 'trailing' in options ? options.trailing : trailing;
	      }
	      debounceOptions.leading = leading;
	      debounceOptions.maxWait = wait;
	      debounceOptions.trailing = trailing;

	      return debounce(func, wait, debounceOptions);
	    }

	    /**
	     * Creates a function that provides `value` to the wrapper function as its
	     * first argument. Additional arguments provided to the function are appended
	     * to those provided to the wrapper function. The wrapper is executed with
	     * the `this` binding of the created function.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {*} value The value to wrap.
	     * @param {Function} wrapper The wrapper function.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var p = _.wrap(_.escape, function(func, text) {
	     *   return '<p>' + func(text) + '</p>';
	     * });
	     *
	     * p('Fred, Wilma, & Pebbles');
	     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
	     */
	    function wrap(value, wrapper) {
	      return createWrapper(wrapper, 16, [value]);
	    }

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Creates a function that returns `value`.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {*} value The value to return from the new function.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var object = { 'name': 'fred' };
	     * var getter = _.constant(object);
	     * getter() === object;
	     * // => true
	     */
	    function constant(value) {
	      return function() {
	        return value;
	      };
	    }

	    /**
	     * Produces a callback bound to an optional `thisArg`. If `func` is a property
	     * name the created callback will return the property value for a given element.
	     * If `func` is an object the created callback will return `true` for elements
	     * that contain the equivalent object properties, otherwise it will return `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {*} [func=identity] The value to convert to a callback.
	     * @param {*} [thisArg] The `this` binding of the created callback.
	     * @param {number} [argCount] The number of arguments the callback accepts.
	     * @returns {Function} Returns a callback function.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * // wrap to create custom callback shorthands
	     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
	     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
	     *   return !match ? func(callback, thisArg) : function(object) {
	     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
	     *   };
	     * });
	     *
	     * _.filter(characters, 'age__gt38');
	     * // => [{ 'name': 'fred', 'age': 40 }]
	     */
	    function createCallback(func, thisArg, argCount) {
	      var type = typeof func;
	      if (func == null || type == 'function') {
	        return baseCreateCallback(func, thisArg, argCount);
	      }
	      // handle "_.pluck" style callback shorthands
	      if (type != 'object') {
	        return property(func);
	      }
	      var props = keys(func),
	          key = props[0],
	          a = func[key];

	      // handle "_.where" style callback shorthands
	      if (props.length == 1 && a === a && !isObject(a)) {
	        // fast path the common case of providing an object with a single
	        // property containing a primitive value
	        return function(object) {
	          var b = object[key];
	          return a === b && (a !== 0 || (1 / a == 1 / b));
	        };
	      }
	      return function(object) {
	        var length = props.length,
	            result = false;

	        while (length--) {
	          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
	            break;
	          }
	        }
	        return result;
	      };
	    }

	    /**
	     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
	     * corresponding HTML entities.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {string} string The string to escape.
	     * @returns {string} Returns the escaped string.
	     * @example
	     *
	     * _.escape('Fred, Wilma, & Pebbles');
	     * // => 'Fred, Wilma, &amp; Pebbles'
	     */
	    function escape(string) {
	      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
	    }

	    /**
	     * This method returns the first argument provided to it.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {*} value Any value.
	     * @returns {*} Returns `value`.
	     * @example
	     *
	     * var object = { 'name': 'fred' };
	     * _.identity(object) === object;
	     * // => true
	     */
	    function identity(value) {
	      return value;
	    }

	    /**
	     * Adds function properties of a source object to the destination object.
	     * If `object` is a function methods will be added to its prototype as well.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {Function|Object} [object=lodash] object The destination object.
	     * @param {Object} source The object of functions to add.
	     * @param {Object} [options] The options object.
	     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
	     * @example
	     *
	     * function capitalize(string) {
	     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
	     * }
	     *
	     * _.mixin({ 'capitalize': capitalize });
	     * _.capitalize('fred');
	     * // => 'Fred'
	     *
	     * _('fred').capitalize().value();
	     * // => 'Fred'
	     *
	     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
	     * _('fred').capitalize();
	     * // => 'Fred'
	     */
	    function mixin(object, source, options) {
	      var chain = true,
	          methodNames = source && functions(source);

	      if (!source || (!options && !methodNames.length)) {
	        if (options == null) {
	          options = source;
	        }
	        ctor = lodashWrapper;
	        source = object;
	        object = lodash;
	        methodNames = functions(source);
	      }
	      if (options === false) {
	        chain = false;
	      } else if (isObject(options) && 'chain' in options) {
	        chain = options.chain;
	      }
	      var ctor = object,
	          isFunc = isFunction(ctor);

	      forEach(methodNames, function(methodName) {
	        var func = object[methodName] = source[methodName];
	        if (isFunc) {
	          ctor.prototype[methodName] = function() {
	            var chainAll = this.__chain__,
	                value = this.__wrapped__,
	                args = [value];

	            push.apply(args, arguments);
	            var result = func.apply(object, args);
	            if (chain || chainAll) {
	              if (value === result && isObject(result)) {
	                return this;
	              }
	              result = new ctor(result);
	              result.__chain__ = chainAll;
	            }
	            return result;
	          };
	        }
	      });
	    }

	    /**
	     * Reverts the '_' variable to its previous value and returns a reference to
	     * the `lodash` function.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @returns {Function} Returns the `lodash` function.
	     * @example
	     *
	     * var lodash = _.noConflict();
	     */
	    function noConflict() {
	      context._ = oldDash;
	      return this;
	    }

	    /**
	     * A no-operation function.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @example
	     *
	     * var object = { 'name': 'fred' };
	     * _.noop(object) === undefined;
	     * // => true
	     */
	    function noop() {
	      // no operation performed
	    }

	    /**
	     * Gets the number of milliseconds that have elapsed since the Unix epoch
	     * (1 January 1970 00:00:00 UTC).
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @example
	     *
	     * var stamp = _.now();
	     * _.defer(function() { console.log(_.now() - stamp); });
	     * // => logs the number of milliseconds it took for the deferred function to be called
	     */
	    var now = isNative(now = Date.now) && now || function() {
	      return new Date().getTime();
	    };

	    /**
	     * Converts the given value into an integer of the specified radix.
	     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
	     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
	     *
	     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
	     * implementations. See http://es5.github.io/#E.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {string} value The value to parse.
	     * @param {number} [radix] The radix used to interpret the value to parse.
	     * @returns {number} Returns the new integer value.
	     * @example
	     *
	     * _.parseInt('08');
	     * // => 8
	     */
	    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
	      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
	      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
	    };

	    /**
	     * Creates a "_.pluck" style function, which returns the `key` value of a
	     * given object.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {string} key The name of the property to retrieve.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'fred',   'age': 40 },
	     *   { 'name': 'barney', 'age': 36 }
	     * ];
	     *
	     * var getName = _.property('name');
	     *
	     * _.map(characters, getName);
	     * // => ['barney', 'fred']
	     *
	     * _.sortBy(characters, getName);
	     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
	     */
	    function property(key) {
	      return function(object) {
	        return object[key];
	      };
	    }

	    /**
	     * Produces a random number between `min` and `max` (inclusive). If only one
	     * argument is provided a number between `0` and the given number will be
	     * returned. If `floating` is truey or either `min` or `max` are floats a
	     * floating-point number will be returned instead of an integer.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {number} [min=0] The minimum possible value.
	     * @param {number} [max=1] The maximum possible value.
	     * @param {boolean} [floating=false] Specify returning a floating-point number.
	     * @returns {number} Returns a random number.
	     * @example
	     *
	     * _.random(0, 5);
	     * // => an integer between 0 and 5
	     *
	     * _.random(5);
	     * // => also an integer between 0 and 5
	     *
	     * _.random(5, true);
	     * // => a floating-point number between 0 and 5
	     *
	     * _.random(1.2, 5.2);
	     * // => a floating-point number between 1.2 and 5.2
	     */
	    function random(min, max, floating) {
	      var noMin = min == null,
	          noMax = max == null;

	      if (floating == null) {
	        if (typeof min == 'boolean' && noMax) {
	          floating = min;
	          min = 1;
	        }
	        else if (!noMax && typeof max == 'boolean') {
	          floating = max;
	          noMax = true;
	        }
	      }
	      if (noMin && noMax) {
	        max = 1;
	      }
	      min = +min || 0;
	      if (noMax) {
	        max = min;
	        min = 0;
	      } else {
	        max = +max || 0;
	      }
	      if (floating || min % 1 || max % 1) {
	        var rand = nativeRandom();
	        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
	      }
	      return baseRandom(min, max);
	    }

	    /**
	     * Resolves the value of property `key` on `object`. If `key` is a function
	     * it will be invoked with the `this` binding of `object` and its result returned,
	     * else the property value is returned. If `object` is falsey then `undefined`
	     * is returned.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {Object} object The object to inspect.
	     * @param {string} key The name of the property to resolve.
	     * @returns {*} Returns the resolved value.
	     * @example
	     *
	     * var object = {
	     *   'cheese': 'crumpets',
	     *   'stuff': function() {
	     *     return 'nonsense';
	     *   }
	     * };
	     *
	     * _.result(object, 'cheese');
	     * // => 'crumpets'
	     *
	     * _.result(object, 'stuff');
	     * // => 'nonsense'
	     */
	    function result(object, key) {
	      if (object) {
	        var value = object[key];
	        return isFunction(value) ? object[key]() : value;
	      }
	    }

	    /**
	     * A micro-templating method that handles arbitrary delimiters, preserves
	     * whitespace, and correctly escapes quotes within interpolated code.
	     *
	     * Note: In the development build, `_.template` utilizes sourceURLs for easier
	     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
	     *
	     * For more information on precompiling templates see:
	     * http://lodash.com/custom-builds
	     *
	     * For more information on Chrome extension sandboxes see:
	     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {string} text The template text.
	     * @param {Object} data The data object used to populate the text.
	     * @param {Object} [options] The options object.
	     * @param {RegExp} [options.escape] The "escape" delimiter.
	     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
	     * @param {Object} [options.imports] An object to import into the template as local variables.
	     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
	     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
	     * @param {string} [variable] The data object variable name.
	     * @returns {Function|string} Returns a compiled function when no `data` object
	     *  is given, else it returns the interpolated text.
	     * @example
	     *
	     * // using the "interpolate" delimiter to create a compiled template
	     * var compiled = _.template('hello <%= name %>');
	     * compiled({ 'name': 'fred' });
	     * // => 'hello fred'
	     *
	     * // using the "escape" delimiter to escape HTML in data property values
	     * _.template('<b><%- value %></b>', { 'value': '<script>' });
	     * // => '<b>&lt;script&gt;</b>'
	     *
	     * // using the "evaluate" delimiter to generate HTML
	     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
	     * _.template(list, { 'people': ['fred', 'barney'] });
	     * // => '<li>fred</li><li>barney</li>'
	     *
	     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
	     * _.template('hello ${ name }', { 'name': 'pebbles' });
	     * // => 'hello pebbles'
	     *
	     * // using the internal `print` function in "evaluate" delimiters
	     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
	     * // => 'hello barney!'
	     *
	     * // using a custom template delimiters
	     * _.templateSettings = {
	     *   'interpolate': /{{([\s\S]+?)}}/g
	     * };
	     *
	     * _.template('hello {{ name }}!', { 'name': 'mustache' });
	     * // => 'hello mustache!'
	     *
	     * // using the `imports` option to import jQuery
	     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
	     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
	     * // => '<li>fred</li><li>barney</li>'
	     *
	     * // using the `sourceURL` option to specify a custom sourceURL for the template
	     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
	     * compiled(data);
	     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
	     *
	     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
	     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
	     * compiled.source;
	     * // => function(data) {
	     *   var __t, __p = '', __e = _.escape;
	     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
	     *   return __p;
	     * }
	     *
	     * // using the `source` property to inline compiled templates for meaningful
	     * // line numbers in error messages and a stack trace
	     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
	     *   var JST = {\
	     *     "main": ' + _.template(mainText).source + '\
	     *   };\
	     * ');
	     */
	    function template(text, data, options) {
	      // based on John Resig's `tmpl` implementation
	      // http://ejohn.org/blog/javascript-micro-templating/
	      // and Laura Doktorova's doT.js
	      // https://github.com/olado/doT
	      var settings = lodash.templateSettings;
	      text = String(text || '');

	      // avoid missing dependencies when `iteratorTemplate` is not defined
	      options = defaults({}, options, settings);

	      var imports = defaults({}, options.imports, settings.imports),
	          importsKeys = keys(imports),
	          importsValues = values(imports);

	      var isEvaluating,
	          index = 0,
	          interpolate = options.interpolate || reNoMatch,
	          source = "__p += '";

	      // compile the regexp to match each delimiter
	      var reDelimiters = RegExp(
	        (options.escape || reNoMatch).source + '|' +
	        interpolate.source + '|' +
	        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
	        (options.evaluate || reNoMatch).source + '|$'
	      , 'g');

	      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
	        interpolateValue || (interpolateValue = esTemplateValue);

	        // escape characters that cannot be included in string literals
	        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

	        // replace delimiters with snippets
	        if (escapeValue) {
	          source += "' +\n__e(" + escapeValue + ") +\n'";
	        }
	        if (evaluateValue) {
	          isEvaluating = true;
	          source += "';\n" + evaluateValue + ";\n__p += '";
	        }
	        if (interpolateValue) {
	          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
	        }
	        index = offset + match.length;

	        // the JS engine embedded in Adobe products requires returning the `match`
	        // string in order to produce the correct `offset` value
	        return match;
	      });

	      source += "';\n";

	      // if `variable` is not specified, wrap a with-statement around the generated
	      // code to add the data object to the top of the scope chain
	      var variable = options.variable,
	          hasVariable = variable;

	      if (!hasVariable) {
	        variable = 'obj';
	        source = 'with (' + variable + ') {\n' + source + '\n}\n';
	      }
	      // cleanup code by stripping empty strings
	      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
	        .replace(reEmptyStringMiddle, '$1')
	        .replace(reEmptyStringTrailing, '$1;');

	      // frame code as the function body
	      source = 'function(' + variable + ') {\n' +
	        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
	        "var __t, __p = '', __e = _.escape" +
	        (isEvaluating
	          ? ', __j = Array.prototype.join;\n' +
	            "function print() { __p += __j.call(arguments, '') }\n"
	          : ';\n'
	        ) +
	        source +
	        'return __p\n}';

	      // Use a sourceURL for easier debugging.
	      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
	      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

	      try {
	        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
	      } catch(e) {
	        e.source = source;
	        throw e;
	      }
	      if (data) {
	        return result(data);
	      }
	      // provide the compiled function's source by its `toString` method, in
	      // supported environments, or the `source` property as a convenience for
	      // inlining compiled templates during the build process
	      result.source = source;
	      return result;
	    }

	    /**
	     * Executes the callback `n` times, returning an array of the results
	     * of each callback execution. The callback is bound to `thisArg` and invoked
	     * with one argument; (index).
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {number} n The number of times to execute the callback.
	     * @param {Function} callback The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns an array of the results of each `callback` execution.
	     * @example
	     *
	     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
	     * // => [3, 6, 4]
	     *
	     * _.times(3, function(n) { mage.castSpell(n); });
	     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
	     *
	     * _.times(3, function(n) { this.cast(n); }, mage);
	     * // => also calls `mage.castSpell(n)` three times
	     */
	    function times(n, callback, thisArg) {
	      n = (n = +n) > -1 ? n : 0;
	      var index = -1,
	          result = Array(n);

	      callback = baseCreateCallback(callback, thisArg, 1);
	      while (++index < n) {
	        result[index] = callback(index);
	      }
	      return result;
	    }

	    /**
	     * The inverse of `_.escape` this method converts the HTML entities
	     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
	     * corresponding characters.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {string} string The string to unescape.
	     * @returns {string} Returns the unescaped string.
	     * @example
	     *
	     * _.unescape('Fred, Barney &amp; Pebbles');
	     * // => 'Fred, Barney & Pebbles'
	     */
	    function unescape(string) {
	      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
	    }

	    /**
	     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {string} [prefix] The value to prefix the ID with.
	     * @returns {string} Returns the unique ID.
	     * @example
	     *
	     * _.uniqueId('contact_');
	     * // => 'contact_104'
	     *
	     * _.uniqueId();
	     * // => '105'
	     */
	    function uniqueId(prefix) {
	      var id = ++idCounter;
	      return String(prefix == null ? '' : prefix) + id;
	    }

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Creates a `lodash` object that wraps the given value with explicit
	     * method chaining enabled.
	     *
	     * @static
	     * @memberOf _
	     * @category Chaining
	     * @param {*} value The value to wrap.
	     * @returns {Object} Returns the wrapper object.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'age': 36 },
	     *   { 'name': 'fred',    'age': 40 },
	     *   { 'name': 'pebbles', 'age': 1 }
	     * ];
	     *
	     * var youngest = _.chain(characters)
	     *     .sortBy('age')
	     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
	     *     .first()
	     *     .value();
	     * // => 'pebbles is 1'
	     */
	    function chain(value) {
	      value = new lodashWrapper(value);
	      value.__chain__ = true;
	      return value;
	    }

	    /**
	     * Invokes `interceptor` with the `value` as the first argument and then
	     * returns `value`. The purpose of this method is to "tap into" a method
	     * chain in order to perform operations on intermediate results within
	     * the chain.
	     *
	     * @static
	     * @memberOf _
	     * @category Chaining
	     * @param {*} value The value to provide to `interceptor`.
	     * @param {Function} interceptor The function to invoke.
	     * @returns {*} Returns `value`.
	     * @example
	     *
	     * _([1, 2, 3, 4])
	     *  .tap(function(array) { array.pop(); })
	     *  .reverse()
	     *  .value();
	     * // => [3, 2, 1]
	     */
	    function tap(value, interceptor) {
	      interceptor(value);
	      return value;
	    }

	    /**
	     * Enables explicit method chaining on the wrapper object.
	     *
	     * @name chain
	     * @memberOf _
	     * @category Chaining
	     * @returns {*} Returns the wrapper object.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * // without explicit chaining
	     * _(characters).first();
	     * // => { 'name': 'barney', 'age': 36 }
	     *
	     * // with explicit chaining
	     * _(characters).chain()
	     *   .first()
	     *   .pick('age')
	     *   .value();
	     * // => { 'age': 36 }
	     */
	    function wrapperChain() {
	      this.__chain__ = true;
	      return this;
	    }

	    /**
	     * Produces the `toString` result of the wrapped value.
	     *
	     * @name toString
	     * @memberOf _
	     * @category Chaining
	     * @returns {string} Returns the string result.
	     * @example
	     *
	     * _([1, 2, 3]).toString();
	     * // => '1,2,3'
	     */
	    function wrapperToString() {
	      return String(this.__wrapped__);
	    }

	    /**
	     * Extracts the wrapped value.
	     *
	     * @name valueOf
	     * @memberOf _
	     * @alias value
	     * @category Chaining
	     * @returns {*} Returns the wrapped value.
	     * @example
	     *
	     * _([1, 2, 3]).valueOf();
	     * // => [1, 2, 3]
	     */
	    function wrapperValueOf() {
	      return this.__wrapped__;
	    }

	    /*--------------------------------------------------------------------------*/

	    // add functions that return wrapped values when chaining
	    lodash.after = after;
	    lodash.assign = assign;
	    lodash.at = at;
	    lodash.bind = bind;
	    lodash.bindAll = bindAll;
	    lodash.bindKey = bindKey;
	    lodash.chain = chain;
	    lodash.compact = compact;
	    lodash.compose = compose;
	    lodash.constant = constant;
	    lodash.countBy = countBy;
	    lodash.create = create;
	    lodash.createCallback = createCallback;
	    lodash.curry = curry;
	    lodash.debounce = debounce;
	    lodash.defaults = defaults;
	    lodash.defer = defer;
	    lodash.delay = delay;
	    lodash.difference = difference;
	    lodash.filter = filter;
	    lodash.flatten = flatten;
	    lodash.forEach = forEach;
	    lodash.forEachRight = forEachRight;
	    lodash.forIn = forIn;
	    lodash.forInRight = forInRight;
	    lodash.forOwn = forOwn;
	    lodash.forOwnRight = forOwnRight;
	    lodash.functions = functions;
	    lodash.groupBy = groupBy;
	    lodash.indexBy = indexBy;
	    lodash.initial = initial;
	    lodash.intersection = intersection;
	    lodash.invert = invert;
	    lodash.invoke = invoke;
	    lodash.keys = keys;
	    lodash.map = map;
	    lodash.mapValues = mapValues;
	    lodash.max = max;
	    lodash.memoize = memoize;
	    lodash.merge = merge;
	    lodash.min = min;
	    lodash.omit = omit;
	    lodash.once = once;
	    lodash.pairs = pairs;
	    lodash.partial = partial;
	    lodash.partialRight = partialRight;
	    lodash.pick = pick;
	    lodash.pluck = pluck;
	    lodash.property = property;
	    lodash.pull = pull;
	    lodash.range = range;
	    lodash.reject = reject;
	    lodash.remove = remove;
	    lodash.rest = rest;
	    lodash.shuffle = shuffle;
	    lodash.sortBy = sortBy;
	    lodash.tap = tap;
	    lodash.throttle = throttle;
	    lodash.times = times;
	    lodash.toArray = toArray;
	    lodash.transform = transform;
	    lodash.union = union;
	    lodash.uniq = uniq;
	    lodash.values = values;
	    lodash.where = where;
	    lodash.without = without;
	    lodash.wrap = wrap;
	    lodash.xor = xor;
	    lodash.zip = zip;
	    lodash.zipObject = zipObject;

	    // add aliases
	    lodash.collect = map;
	    lodash.drop = rest;
	    lodash.each = forEach;
	    lodash.eachRight = forEachRight;
	    lodash.extend = assign;
	    lodash.methods = functions;
	    lodash.object = zipObject;
	    lodash.select = filter;
	    lodash.tail = rest;
	    lodash.unique = uniq;
	    lodash.unzip = zip;

	    // add functions to `lodash.prototype`
	    mixin(lodash);

	    /*--------------------------------------------------------------------------*/

	    // add functions that return unwrapped values when chaining
	    lodash.clone = clone;
	    lodash.cloneDeep = cloneDeep;
	    lodash.contains = contains;
	    lodash.escape = escape;
	    lodash.every = every;
	    lodash.find = find;
	    lodash.findIndex = findIndex;
	    lodash.findKey = findKey;
	    lodash.findLast = findLast;
	    lodash.findLastIndex = findLastIndex;
	    lodash.findLastKey = findLastKey;
	    lodash.has = has;
	    lodash.identity = identity;
	    lodash.indexOf = indexOf;
	    lodash.isArguments = isArguments;
	    lodash.isArray = isArray;
	    lodash.isBoolean = isBoolean;
	    lodash.isDate = isDate;
	    lodash.isElement = isElement;
	    lodash.isEmpty = isEmpty;
	    lodash.isEqual = isEqual;
	    lodash.isFinite = isFinite;
	    lodash.isFunction = isFunction;
	    lodash.isNaN = isNaN;
	    lodash.isNull = isNull;
	    lodash.isNumber = isNumber;
	    lodash.isObject = isObject;
	    lodash.isPlainObject = isPlainObject;
	    lodash.isRegExp = isRegExp;
	    lodash.isString = isString;
	    lodash.isUndefined = isUndefined;
	    lodash.lastIndexOf = lastIndexOf;
	    lodash.mixin = mixin;
	    lodash.noConflict = noConflict;
	    lodash.noop = noop;
	    lodash.now = now;
	    lodash.parseInt = parseInt;
	    lodash.random = random;
	    lodash.reduce = reduce;
	    lodash.reduceRight = reduceRight;
	    lodash.result = result;
	    lodash.runInContext = runInContext;
	    lodash.size = size;
	    lodash.some = some;
	    lodash.sortedIndex = sortedIndex;
	    lodash.template = template;
	    lodash.unescape = unescape;
	    lodash.uniqueId = uniqueId;

	    // add aliases
	    lodash.all = every;
	    lodash.any = some;
	    lodash.detect = find;
	    lodash.findWhere = find;
	    lodash.foldl = reduce;
	    lodash.foldr = reduceRight;
	    lodash.include = contains;
	    lodash.inject = reduce;

	    mixin(function() {
	      var source = {}
	      forOwn(lodash, function(func, methodName) {
	        if (!lodash.prototype[methodName]) {
	          source[methodName] = func;
	        }
	      });
	      return source;
	    }(), false);

	    /*--------------------------------------------------------------------------*/

	    // add functions capable of returning wrapped and unwrapped values when chaining
	    lodash.first = first;
	    lodash.last = last;
	    lodash.sample = sample;

	    // add aliases
	    lodash.take = first;
	    lodash.head = first;

	    forOwn(lodash, function(func, methodName) {
	      var callbackable = methodName !== 'sample';
	      if (!lodash.prototype[methodName]) {
	        lodash.prototype[methodName]= function(n, guard) {
	          var chainAll = this.__chain__,
	              result = func(this.__wrapped__, n, guard);

	          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
	            ? result
	            : new lodashWrapper(result, chainAll);
	        };
	      }
	    });

	    /*--------------------------------------------------------------------------*/

	    /**
	     * The semantic version number.
	     *
	     * @static
	     * @memberOf _
	     * @type string
	     */
	    lodash.VERSION = '2.4.1';

	    // add "Chaining" functions to the wrapper
	    lodash.prototype.chain = wrapperChain;
	    lodash.prototype.toString = wrapperToString;
	    lodash.prototype.value = wrapperValueOf;
	    lodash.prototype.valueOf = wrapperValueOf;

	    // add `Array` functions that return unwrapped values
	    baseEach(['join', 'pop', 'shift'], function(methodName) {
	      var func = arrayRef[methodName];
	      lodash.prototype[methodName] = function() {
	        var chainAll = this.__chain__,
	            result = func.apply(this.__wrapped__, arguments);

	        return chainAll
	          ? new lodashWrapper(result, chainAll)
	          : result;
	      };
	    });

	    // add `Array` functions that return the existing wrapped value
	    baseEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
	      var func = arrayRef[methodName];
	      lodash.prototype[methodName] = function() {
	        func.apply(this.__wrapped__, arguments);
	        return this;
	      };
	    });

	    // add `Array` functions that return new wrapped values
	    baseEach(['concat', 'slice', 'splice'], function(methodName) {
	      var func = arrayRef[methodName];
	      lodash.prototype[methodName] = function() {
	        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
	      };
	    });

	    // avoid array-like object bugs with `Array#shift` and `Array#splice`
	    // in IE < 9, Firefox < 10, Narwhal, and RingoJS
	    if (!support.spliceObjects) {
	      baseEach(['pop', 'shift', 'splice'], function(methodName) {
	        var func = arrayRef[methodName],
	            isSplice = methodName == 'splice';

	        lodash.prototype[methodName] = function() {
	          var chainAll = this.__chain__,
	              value = this.__wrapped__,
	              result = func.apply(value, arguments);

	          if (value.length === 0) {
	            delete value[0];
	          }
	          return (chainAll || isSplice)
	            ? new lodashWrapper(result, chainAll)
	            : result;
	        };
	      });
	    }

	    return lodash;
	  }

	  /*--------------------------------------------------------------------------*/

	  // expose Lo-Dash
	  var _ = runInContext();

	  // some AMD build optimizers like r.js check for condition patterns like the following:
	  if (true) {
	    // Expose Lo-Dash to the global object even when an AMD loader is present in
	    // case Lo-Dash is loaded with a RequireJS shim config.
	    // See http://requirejs.org/docs/api.html#config-shim
	    root._ = _;

	    // define as an anonymous module so, through path mapping, it can be
	    // referenced as the "underscore" module
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	  // check for `exports` after `define` in case a build optimizer adds an `exports` object
	  else if (freeExports && freeModule) {
	    // in Node.js or RingoJS
	    if (moduleExports) {
	      (freeModule.exports = _)._ = _;
	    }
	    // in Narwhal or Rhino -require
	    else {
	      freeExports._ = _;
	    }
	  }
	  else {
	    // in a browser or Rhino
	    root._ = _;
	  }
	}.call(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(42)(module), (function() { return this; }())))

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var extend = _.extend

	/**
	 * The exposed Vue constructor.
	 *
	 * API conventions:
	 * - public API methods/properties are prefiexed with `$`
	 * - internal methods/properties are prefixed with `_`
	 * - non-prefixed properties are assumed to be proxied user
	 *   data.
	 *
	 * @constructor
	 * @param {Object} [options]
	 * @public
	 */

	function Vue (options) {
	  this._init(options)
	}

	/**
	 * Mixin global API
	 */

	extend(Vue, __webpack_require__(20))

	/**
	 * Vue and every constructor that extends Vue has an
	 * associated options object, which can be accessed during
	 * compilation steps as `this.constructor.options`.
	 *
	 * These can be seen as the default options of every
	 * Vue instance.
	 */

	Vue.options = {
	  directives  : __webpack_require__(26),
	  filters     : __webpack_require__(27),
	  partials    : {},
	  transitions : {},
	  components  : {}
	}

	/**
	 * Build up the prototype
	 */

	var p = Vue.prototype

	/**
	 * $data has a setter which does a bunch of
	 * teardown/setup work
	 */

	Object.defineProperty(p, '$data', {
	  get: function () {
	    return this._data
	  },
	  set: function (newData) {
	    this._setData(newData)
	  }
	})

	/**
	 * Mixin internal instance methods
	 */

	extend(p, __webpack_require__(28))
	extend(p, __webpack_require__(29))
	extend(p, __webpack_require__(30))
	extend(p, __webpack_require__(31))

	/**
	 * Mixin public API methods
	 */

	extend(p, __webpack_require__(21))
	extend(p, __webpack_require__(22))
	extend(p, __webpack_require__(23))
	extend(p, __webpack_require__(24))
	extend(p, __webpack_require__(25))

	module.exports = _.Vue = Vue

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var helpers = __webpack_require__(34)

	/**
	 * @return {Reactor}
	 */
	exports.Reactor = __webpack_require__(35)

	/**
	 * @return {Store}
	 */
	exports.Store = __webpack_require__(36)

	/**
	 * @return {GetterRecord}
	 */
	exports.Getter = __webpack_require__(37)

	exports.KeyPath = __webpack_require__(38)

	// export the immutable library
	exports.Immutable = __webpack_require__(40)

	// expose helper functions
	exports.toJS = helpers.toJS
	exports.toImmutable = helpers.toImmutable
	exports.isImmutable = helpers.isImmutable
	exports.evaluate = __webpack_require__(39)


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var prefixConstants = __webpack_require__(32)

	module.exports = prefixConstants('UI', {
	  LOADING_START: null,
	  LOADING_FINISH: null,

	  INIT_REGION: null,
	  SET_REGION_COMPONENT: null,
	  SHOW_REGION: null,
	  HIDE_REGION: null,
	  TEARDOWN_REGION: null,
	})


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var IMap = __webpack_require__(41).Map
	var actionTypes = __webpack_require__(14)
	var Store = __webpack_require__(13).Store

	module.exports = Store({
	  getInitialState:function() {
	    return {}
	  },

	  initialize:function() {
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
	  return state.set(payload.regionId, IMap({
	    regionId: payload.regionId,
	    isVisible: !!payload.isVisible,
	    componentId: null,
	  }))
	}

	/**
	 * Shows a component on a region
	 * payload.regionId
	 * payload.componentId
	 */
	function showComponent(state, payload) {
	  return state.set(payload.regionId, IMap({
	    regionId: payload.regionId,
	    isVisible: !!payload.isVisible,
	    componentId: payload.componentId,
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


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var actionTypes = __webpack_require__(14)
	var Store = __webpack_require__(13).Store

	module.exports = Store({
	  getInitialState:function() {
	    return {}
	  },

	  initialize:function() {
	    this.on(actionTypes.REGISTER_COMPONENT, registerComponent)
	  }
	})

	/**
	 * payload.id
	 * payload.component
	 */
	function registerComponent(state, payload) {
	  return state.set(payload.id, payload.component)
	}


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  template: __webpack_require__(33),

	  data:function() {
	    return {
	      region: {
	        componentId: null,
	        isVisible: false,
	      }
	    }
	  },

	  ready:function() {
	    this.$sync('region', ['ui/regions', this.$el.id])
	  }
	}


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(11)
	var page = __webpack_require__(43)

	/**
	 * @param {{ match: string|regex, handle: array<function> }}
	 */
	function loadRoute(route) {
	  var args = _.filter([route.match].concat(route.handle))

	  if (args.length === 1) {
	    throw new Error("Must supply `handle` functions to defineRoutes")
	  }

	  // register route with PageJS
	  page.apply(page, args)
	}

	module.exports = {
	  /**
	   * @param {array<{ match: string|regex, handle: array<function> }}
	   */
	  defineRoutes:function(routes) {
	    if (_.isArray(routes)) {
	      routes.forEach(loadRoute)
	    } else {
	      loadRoute(routes)
	    }
	  },

	  go: function(url) {
	    page(url)
	  },

	  start: function() {
	    page.start()
	  },

	  stop: function() {
	    page.stop()
	  },
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var lang   = __webpack_require__(50)
	var extend = lang.extend

	extend(exports, lang)
	extend(exports, __webpack_require__(51))
	extend(exports, __webpack_require__(52))
	extend(exports, __webpack_require__(53))
	extend(exports, __webpack_require__(54))

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var mergeOptions = __webpack_require__(44)

	/**
	 * Expose useful internals
	 */

	exports.util       = _
	exports.nextTick   = _.nextTick
	exports.config     = __webpack_require__(45)

	/**
	 * Each instance constructor, including Vue, has a unique
	 * cid. This enables us to create wrapped "child
	 * constructors" for prototypal inheritance and cache them.
	 */

	exports.cid = 0
	var cid = 1

	/**
	 * Class inehritance
	 *
	 * @param {Object} extendOptions
	 */

	exports.extend = function (extendOptions) {
	  extendOptions = extendOptions || {}
	  var Super = this
	  var Sub = createClass(extendOptions.name || 'VueComponent')
	  Sub.prototype = Object.create(Super.prototype)
	  Sub.prototype.constructor = Sub
	  Sub.cid = cid++
	  Sub.options = mergeOptions(
	    Super.options,
	    extendOptions
	  )
	  Sub['super'] = Super
	  // allow further extension
	  Sub.extend = Super.extend
	  // create asset registers, so extended classes
	  // can have their private assets too.
	  createAssetRegisters(Sub)
	  return Sub
	}

	/**
	 * A function that returns a sub-class constructor with the
	 * given name. This gives us much nicer output when
	 * logging instances in the console.
	 *
	 * @param {String} name
	 * @return {Function}
	 */

	function createClass (name) {
	  return new Function(
	    'return function ' + _.camelize(name, true) +
	    ' (options) { this._init(options) }'
	  )()
	}

	/**
	 * Plugin system
	 *
	 * @param {Object} plugin
	 */

	exports.use = function (plugin) {
	  // additional parameters
	  var args = _.toArray(arguments, 1)
	  args.unshift(this)
	  if (typeof plugin.install === 'function') {
	    plugin.install.apply(plugin, args)
	  } else {
	    plugin.apply(null, args)
	  }
	  return this
	}

	/**
	 * Define asset registration methods on a constructor.
	 *
	 * @param {Function} Constructor
	 */

	var assetTypes = [
	  'directive',
	  'filter',
	  'partial',
	  'transition'
	]

	function createAssetRegisters (Constructor) {

	  /* Asset registration methods share the same signature:
	   *
	   * @param {String} id
	   * @param {*} definition
	   */

	  assetTypes.forEach(function (type) {
	    Constructor[type] = function (id, definition) {
	      if (!definition) {
	        return this.options[type + 's'][id]
	      } else {
	        this.options[type + 's'][id] = definition
	      }
	    }
	  })

	  /**
	   * Component registration needs to automatically invoke
	   * Vue.extend on object values.
	   *
	   * @param {String} id
	   * @param {Object|Function} definition
	   */

	  Constructor.component = function (id, definition) {
	    if (!definition) {
	      return this.options.components[id]
	    } else {
	      if (_.isPlainObject(definition)) {
	        definition.name = id
	        definition = _.Vue.extend(definition)
	      }
	      this.options.components[id] = definition
	    }
	  }
	}

	createAssetRegisters(exports)

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var Watcher = __webpack_require__(46)
	var Path = __webpack_require__(55)
	var textParser = __webpack_require__(56)
	var dirParser = __webpack_require__(57)
	var expParser = __webpack_require__(58)
	var filterRE = /[^|]\|[^|]/

	/**
	 * Get the value from an expression on this vm.
	 *
	 * @param {String} exp
	 * @return {*}
	 */

	exports.$get = function (exp) {
	  var res = expParser.parse(exp)
	  if (res) {
	    return res.get.call(this, this)
	  }
	}

	/**
	 * Set the value from an expression on this vm.
	 * The expression must be a valid left-hand
	 * expression in an assignment.
	 *
	 * @param {String} exp
	 * @param {*} val
	 */

	exports.$set = function (exp, val) {
	  var res = expParser.parse(exp, true)
	  if (res && res.set) {
	    res.set.call(this, this, val)
	  }
	}

	/**
	 * Add a property on the VM
	 *
	 * @param {String} key
	 * @param {*} val
	 */

	exports.$add = function (key, val) {
	  this._data.$add(key, val)
	}

	/**
	 * Delete a property on the VM
	 *
	 * @param {String} key
	 */

	exports.$delete = function (key) {
	  this._data.$delete(key)
	}

	/**
	 * Watch an expression, trigger callback when its
	 * value changes.
	 *
	 * @param {String} exp
	 * @param {Function} cb
	 * @param {Boolean} [deep]
	 * @param {Boolean} [immediate]
	 * @return {Function} - unwatchFn
	 */

	exports.$watch = function (exp, cb, deep, immediate) {
	  var vm = this
	  var key = deep ? exp + '**deep**' : exp
	  var watcher = vm._userWatchers[key]
	  var wrappedCb = function (val, oldVal) {
	    cb.call(vm, val, oldVal)
	  }
	  if (!watcher) {
	    watcher = vm._userWatchers[key] =
	      new Watcher(vm, exp, wrappedCb, null, false, deep)
	  } else {
	    watcher.addCb(wrappedCb)
	  }
	  if (immediate) {
	    wrappedCb(watcher.value)
	  }
	  return function unwatchFn () {
	    watcher.removeCb(wrappedCb)
	    if (!watcher.active) {
	      vm._userWatchers[key] = null
	    }
	  }
	}

	/**
	 * Evaluate a text directive, including filters.
	 *
	 * @param {String} text
	 * @return {String}
	 */

	exports.$eval = function (text) {
	  // check for filters.
	  if (filterRE.test(text)) {
	    var dir = dirParser.parse(text)[0]
	    // the filter regex check might give false positive
	    // for pipes inside strings, so it's possible that
	    // we don't get any filters here
	    return dir.filters
	      ? _.applyFilters(
	          this.$get(dir.expression),
	          _.resolveFilters(this, dir.filters).read,
	          this
	        )
	      : this.$get(dir.expression)
	  } else {
	    // no filter
	    return this.$get(text)
	  }
	}

	/**
	 * Interpolate a piece of template text.
	 *
	 * @param {String} text
	 * @return {String}
	 */

	exports.$interpolate = function (text) {
	  var tokens = textParser.parse(text)
	  var vm = this
	  if (tokens) {
	    return tokens.length === 1
	      ? vm.$eval(tokens[0].value)
	      : tokens.map(function (token) {
	          return token.tag
	            ? vm.$eval(token.value)
	            : token.value
	        }).join('')
	  } else {
	    return text
	  }
	}

	/**
	 * Log instance data as a plain JS object
	 * so that it is easier to inspect in console.
	 * This method assumes console is available.
	 *
	 * @param {String} [path]
	 */

	exports.$log = function (path) {
	  var data = path
	    ? Path.get(this, path)
	    : this._data
	  console.log(JSON.parse(JSON.stringify(data)))
	}

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var transition = __webpack_require__(59)

	/**
	 * Append instance to target
	 *
	 * @param {Node} target
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$appendTo = function (target, cb, withTransition) {
	  target = query(target)
	  var targetIsDetached = !_.inDoc(target)
	  var op = withTransition === false || targetIsDetached
	    ? append
	    : transition.append
	  insert(this, target, op, targetIsDetached, cb)
	  return this
	}

	/**
	 * Prepend instance to target
	 *
	 * @param {Node} target
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$prependTo = function (target, cb, withTransition) {
	  target = query(target)
	  if (target.hasChildNodes()) {
	    this.$before(target.firstChild, cb, withTransition)
	  } else {
	    this.$appendTo(target, cb, withTransition)
	  }
	  return this
	}

	/**
	 * Insert instance before target
	 *
	 * @param {Node} target
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$before = function (target, cb, withTransition) {
	  target = query(target)
	  var targetIsDetached = !_.inDoc(target)
	  var op = withTransition === false || targetIsDetached
	    ? before
	    : transition.before
	  insert(this, target, op, targetIsDetached, cb)
	  return this
	}

	/**
	 * Insert instance after target
	 *
	 * @param {Node} target
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$after = function (target, cb, withTransition) {
	  target = query(target)
	  if (target.nextSibling) {
	    this.$before(target.nextSibling, cb, withTransition)
	  } else {
	    this.$appendTo(target.parentNode, cb, withTransition)
	  }
	  return this
	}

	/**
	 * Remove instance from DOM
	 *
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$remove = function (cb, withTransition) {
	  var inDoc = this._isAttached && _.inDoc(this.$el)
	  // if we are not in document, no need to check
	  // for transitions
	  if (!inDoc) withTransition = false
	  var op
	  var self = this
	  var realCb = function () {
	    if (inDoc) self._callHook('detached')
	    if (cb) cb()
	  }
	  if (
	    this._isBlock &&
	    !this._blockFragment.hasChildNodes()
	  ) {
	    op = withTransition === false
	      ? append
	      : transition.removeThenAppend 
	    blockOp(this, this._blockFragment, op, realCb)
	  } else {
	    op = withTransition === false
	      ? remove
	      : transition.remove
	    op(this.$el, this, realCb)
	  }
	  return this
	}

	/**
	 * Shared DOM insertion function.
	 *
	 * @param {Vue} vm
	 * @param {Element} target
	 * @param {Function} op
	 * @param {Boolean} targetIsDetached
	 * @param {Function} [cb]
	 */

	function insert (vm, target, op, targetIsDetached, cb) {
	  var shouldCallHook =
	    !targetIsDetached &&
	    !vm._isAttached &&
	    !_.inDoc(vm.$el)
	  if (vm._isBlock) {
	    blockOp(vm, target, op, cb)
	  } else {
	    op(vm.$el, target, vm, cb)
	  }
	  if (shouldCallHook) {
	    vm._callHook('attached')
	  }
	}

	/**
	 * Execute a transition operation on a block instance,
	 * iterating through all its block nodes.
	 *
	 * @param {Vue} vm
	 * @param {Node} target
	 * @param {Function} op
	 * @param {Function} cb
	 */

	function blockOp (vm, target, op, cb) {
	  var current = vm._blockStart
	  var end = vm._blockEnd
	  var next
	  while (next !== end) {
	    next = current.nextSibling
	    op(current, target, vm)
	    current = next
	  }
	  op(end, target, vm, cb)
	}

	/**
	 * Check for selectors
	 *
	 * @param {String|Element} el
	 */

	function query (el) {
	  return typeof el === 'string'
	    ? document.querySelector(el)
	    : el
	}

	/**
	 * Append operation that takes a callback.
	 *
	 * @param {Node} el
	 * @param {Node} target
	 * @param {Vue} vm - unused
	 * @param {Function} [cb]
	 */

	function append (el, target, vm, cb) {
	  target.appendChild(el)
	  if (cb) cb()
	}

	/**
	 * InsertBefore operation that takes a callback.
	 *
	 * @param {Node} el
	 * @param {Node} target
	 * @param {Vue} vm - unused
	 * @param {Function} [cb]
	 */

	function before (el, target, vm, cb) {
	  _.before(el, target)
	  if (cb) cb()
	}

	/**
	 * Remove operation that takes a callback.
	 *
	 * @param {Node} el
	 * @param {Vue} vm - unused
	 * @param {Function} [cb]
	 */

	function remove (el, vm, cb) {
	  _.remove(el)
	  if (cb) cb()
	}

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)

	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 */

	exports.$on = function (event, fn) {
	  (this._events[event] || (this._events[event] = []))
	    .push(fn)
	  modifyListenerCount(this, event, 1)
	  return this
	}

	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 */

	exports.$once = function (event, fn) {
	  var self = this
	  function on () {
	    self.$off(event, on)
	    fn.apply(this, arguments)
	  }
	  on.fn = fn
	  this.$on(event, on)
	  return this
	}

	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 */

	exports.$off = function (event, fn) {
	  var cbs
	  // all
	  if (!arguments.length) {
	    if (this.$parent) {
	      for (event in this._events) {
	        cbs = this._events[event]
	        if (cbs) {
	          modifyListenerCount(this, event, -cbs.length)
	        }
	      }
	    }
	    this._events = {}
	    return this
	  }
	  // specific event
	  cbs = this._events[event]
	  if (!cbs) {
	    return this
	  }
	  if (arguments.length === 1) {
	    modifyListenerCount(this, event, -cbs.length)
	    this._events[event] = null
	    return this
	  }
	  // specific handler
	  var cb
	  var i = cbs.length
	  while (i--) {
	    cb = cbs[i]
	    if (cb === fn || cb.fn === fn) {
	      modifyListenerCount(this, event, -1)
	      cbs.splice(i, 1)
	      break
	    }
	  }
	  return this
	}

	/**
	 * Trigger an event on self.
	 *
	 * @param {String} event
	 */

	exports.$emit = function (event) {
	  this._eventCancelled = false
	  var cbs = this._events[event]
	  if (cbs) {
	    // avoid leaking arguments:
	    // http://jsperf.com/closure-with-arguments
	    var i = arguments.length - 1
	    var args = new Array(i)
	    while (i--) {
	      args[i] = arguments[i + 1]
	    }
	    i = 0
	    cbs = cbs.length > 1
	      ? _.toArray(cbs)
	      : cbs
	    for (var l = cbs.length; i < l; i++) {
	      if (cbs[i].apply(this, args) === false) {
	        this._eventCancelled = true
	      }
	    }
	  }
	  return this
	}

	/**
	 * Recursively broadcast an event to all children instances.
	 *
	 * @param {String} event
	 * @param {...*} additional arguments
	 */

	exports.$broadcast = function (event) {
	  // if no child has registered for this event,
	  // then there's no need to broadcast.
	  if (!this._eventsCount[event]) return
	  var children = this._children
	  if (children) {
	    for (var i = 0, l = children.length; i < l; i++) {
	      var child = children[i]
	      child.$emit.apply(child, arguments)
	      if (!child._eventCancelled) {
	        child.$broadcast.apply(child, arguments)
	      }
	    }
	  }
	  return this
	}

	/**
	 * Recursively propagate an event up the parent chain.
	 *
	 * @param {String} event
	 * @param {...*} additional arguments
	 */

	exports.$dispatch = function () {
	  var parent = this.$parent
	  while (parent) {
	    parent.$emit.apply(parent, arguments)
	    parent = parent._eventCancelled
	      ? null
	      : parent.$parent
	  }
	  return this
	}

	/**
	 * Modify the listener counts on all parents.
	 * This bookkeeping allows $broadcast to return early when
	 * no child has listened to a certain event.
	 *
	 * @param {Vue} vm
	 * @param {String} event
	 * @param {Number} count
	 */

	var hookRE = /^hook:/
	function modifyListenerCount (vm, event, count) {
	  var parent = vm.$parent
	  // hooks do not get broadcasted so no need
	  // to do bookkeeping for them
	  if (!parent || !count || hookRE.test(event)) return
	  while (parent) {
	    parent._eventsCount[event] =
	      (parent._eventsCount[event] || 0) + count
	    parent = parent.$parent
	  }
	}

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)

	/**
	 * Create a child instance that prototypally inehrits
	 * data on parent. To achieve that we create an intermediate
	 * constructor with its prototype pointing to parent.
	 *
	 * @param {Object} opts
	 * @param {Function} [BaseCtor]
	 * @return {Vue}
	 * @public
	 */

	exports.$addChild = function (opts, BaseCtor) {
	  BaseCtor = BaseCtor || _.Vue
	  opts = opts || {}
	  var parent = this
	  var ChildVue
	  var inherit = opts.inherit !== undefined
	    ? opts.inherit
	    : BaseCtor.options.inherit
	  if (inherit) {
	    var ctors = parent._childCtors
	    if (!ctors) {
	      ctors = parent._childCtors = {}
	    }
	    ChildVue = ctors[BaseCtor.cid]
	    if (!ChildVue) {
	      var optionName = BaseCtor.options.name
	      var className = optionName
	        ? _.camelize(optionName, true)
	        : 'VueComponent'
	      ChildVue = new Function(
	        'return function ' + className + ' (options) {' +
	        'this.constructor = ' + className + ';' +
	        'this._init(options) }'
	      )()
	      ChildVue.options = BaseCtor.options
	      ChildVue.prototype = this
	      ctors[BaseCtor.cid] = ChildVue
	    }
	  } else {
	    ChildVue = BaseCtor
	  }
	  opts._parent = parent
	  opts._root = parent.$root
	  var child = new ChildVue(opts)
	  if (!this._children) {
	    this._children = []
	  }
	  this._children.push(child)
	  return child
	}

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var compile = __webpack_require__(60)

	/**
	 * Set instance target element and kick off the compilation
	 * process. The passed in `el` can be a selector string, an
	 * existing Element, or a DocumentFragment (for block
	 * instances).
	 *
	 * @param {Element|DocumentFragment|string} el
	 * @public
	 */

	exports.$mount = function (el) {
	  if (this._isCompiled) {
	    _.warn('$mount() should be called only once.')
	    return
	  }
	  if (!el) {
	    el = document.createElement('div')
	  } else if (typeof el === 'string') {
	    var selector = el
	    el = document.querySelector(el)
	    if (!el) {
	      _.warn('Cannot find element: ' + selector)
	      return
	    }
	  }
	  this._compile(el)
	  this._isCompiled = true
	  this._callHook('compiled')
	  if (_.inDoc(this.$el)) {
	    this._callHook('attached')
	    this._initDOMHooks()
	    ready.call(this)
	  } else {
	    this._initDOMHooks()
	    this.$once('hook:attached', ready)
	  }
	  return this
	}

	/**
	 * Mark an instance as ready.
	 */

	function ready () {
	  this._isAttached = true
	  this._isReady = true
	  this._callHook('ready')
	}

	/**
	 * Teardown an instance, unobserves the data, unbind all the
	 * directives, turn off all the event listeners, etc.
	 *
	 * @param {Boolean} remove - whether to remove the DOM node.
	 * @public
	 */

	exports.$destroy = function (remove) {
	  if (this._isBeingDestroyed) {
	    return
	  }
	  this._callHook('beforeDestroy')
	  this._isBeingDestroyed = true
	  var i
	  // remove self from parent. only necessary
	  // if parent is not being destroyed as well.
	  var parent = this.$parent
	  if (parent && !parent._isBeingDestroyed) {
	    i = parent._children.indexOf(this)
	    parent._children.splice(i, 1)
	  }
	  // destroy all children.
	  if (this._children) {
	    i = this._children.length
	    while (i--) {
	      this._children[i].$destroy()
	    }
	  }
	  // teardown all directives. this also tearsdown all
	  // directive-owned watchers.
	  i = this._directives.length
	  while (i--) {
	    this._directives[i]._teardown()
	  }
	  // teardown all user watchers.
	  for (i in this._userWatchers) {
	    this._userWatchers[i].teardown()
	  }
	  // remove reference to self on $el
	  if (this.$el) {
	    this.$el.__vue__ = null
	  }
	  // remove DOM element
	  var self = this
	  if (remove && this.$el) {
	    this.$remove(function () {
	      cleanup(self)
	    })
	  } else {
	    cleanup(self)
	  }
	}

	/**
	 * Clean up to ensure garbage collection.
	 * This is called after the leave transition if there
	 * is any.
	 *
	 * @param {Vue} vm
	 */

	function cleanup (vm) {
	  // remove reference from data ob
	  vm._data.__ob__.removeVm(vm)
	  vm._data =
	  vm._watchers =
	  vm._userWatchers =
	  vm._watcherList =
	  vm.$el =
	  vm.$parent =
	  vm.$root =
	  vm._children =
	  vm._bindings =
	  vm._directives = null
	  // call the last hook...
	  vm._isDestroyed = true
	  vm._callHook('destroyed')
	  // turn off all instance listeners.
	  vm.$off() 
	}

	/**
	 * Partially compile a piece of DOM and return a
	 * decompile function.
	 *
	 * @param {Element|DocumentFragment} el
	 * @return {Function}
	 */

	exports.$compile = function (el) {
	  return compile(el, this.$options, true)(this, el)
	}

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	// manipulation directives
	exports.text       = __webpack_require__(62)
	exports.html       = __webpack_require__(63)
	exports.attr       = __webpack_require__(64)
	exports.show       = __webpack_require__(65)
	exports['class']   = __webpack_require__(66)
	exports.el         = __webpack_require__(67)
	exports.ref        = __webpack_require__(68)
	exports.cloak      = __webpack_require__(69)
	exports.style      = __webpack_require__(70)
	exports.partial    = __webpack_require__(71)
	exports.transition = __webpack_require__(72)

	// event listener directives
	exports.on         = __webpack_require__(73)
	exports.model      = __webpack_require__(78)

	// child vm directives
	exports.component  = __webpack_require__(74)
	exports.repeat     = __webpack_require__(75)
	exports['if']      = __webpack_require__(76)
	exports['with']    = __webpack_require__(77)

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)

	/**
	 * Stringify value.
	 *
	 * @param {Number} indent
	 */

	exports.json = function (value, indent) {
	  return JSON.stringify(value, null, Number(indent) || 2)
	}

	/**
	 * 'abc' => 'Abc'
	 */

	exports.capitalize = function (value) {
	  if (!value && value !== 0) return ''
	  value = value.toString()
	  return value.charAt(0).toUpperCase() + value.slice(1)
	}

	/**
	 * 'abc' => 'ABC'
	 */

	exports.uppercase = function (value) {
	  return (value || value === 0)
	    ? value.toString().toUpperCase()
	    : ''
	}

	/**
	 * 'AbC' => 'abc'
	 */

	exports.lowercase = function (value) {
	  return (value || value === 0)
	    ? value.toString().toLowerCase()
	    : ''
	}

	/**
	 * 12345 => $12,345.00
	 *
	 * @param {String} sign
	 */

	var digitsRE = /(\d{3})(?=\d)/g

	exports.currency = function (value, sign) {
	  value = parseFloat(value)
	  if (!value && value !== 0) return ''
	  sign = sign || '$'
	  var s = Math.floor(Math.abs(value)).toString(),
	    i = s.length % 3,
	    h = i > 0
	      ? (s.slice(0, i) + (s.length > 3 ? ',' : ''))
	      : '',
	    f = '.' + value.toFixed(2).slice(-2)
	  return (value < 0 ? '-' : '') +
	    sign + h + s.slice(i).replace(digitsRE, '$1,') + f
	}

	/**
	 * 'item' => 'items'
	 *
	 * @params
	 *  an array of strings corresponding to
	 *  the single, double, triple ... forms of the word to
	 *  be pluralized. When the number to be pluralized
	 *  exceeds the length of the args, it will use the last
	 *  entry in the array.
	 *
	 *  e.g. ['single', 'double', 'triple', 'multiple']
	 */

	exports.pluralize = function (value) {
	  var args = _.toArray(arguments, 1)
	  return args.length > 1
	    ? (args[value % 10 - 1] || args[args.length - 1])
	    : (args[0] + (value === 1 ? '' : 's'))
	}

	/**
	 * A special filter that takes a handler function,
	 * wraps it so it only gets triggered on specific
	 * keypresses. v-on only.
	 *
	 * @param {String} key
	 */

	var keyCodes = {
	  enter    : 13,
	  tab      : 9,
	  'delete' : 46,
	  up       : 38,
	  left     : 37,
	  right    : 39,
	  down     : 40,
	  esc      : 27
	}

	exports.key = function (handler, key) {
	  if (!handler) return
	  var code = keyCodes[key]
	  if (!code) {
	    code = parseInt(key, 10)
	  }
	  return function (e) {
	    if (e.keyCode === code) {
	      return handler.call(this, e)
	    }
	  }
	}

	/**
	 * Install special array filters
	 */

	_.extend(exports, __webpack_require__(47))

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var mergeOptions = __webpack_require__(44)

	/**
	 * The main init sequence. This is called for every
	 * instance, including ones that are created from extended
	 * constructors.
	 *
	 * @param {Object} options - this options object should be
	 *                           the result of merging class
	 *                           options and the options passed
	 *                           in to the constructor.
	 */

	exports._init = function (options) {

	  options = options || {}

	  this.$el           = null
	  this.$parent       = options._parent
	  this.$root         = options._root || this
	  this.$             = {} // child vm references
	  this.$$            = {} // element references
	  this._watcherList  = [] // all watchers as an array
	  this._watchers     = {} // internal watchers as a hash
	  this._userWatchers = {} // user watchers as a hash
	  this._directives   = [] // all directives

	  // a flag to avoid this being observed
	  this._isVue = true

	  // events bookkeeping
	  this._events         = {}    // registered callbacks
	  this._eventsCount    = {}    // for $broadcast optimization
	  this._eventCancelled = false // for event cancellation

	  // block instance properties
	  this._isBlock     = false
	  this._blockStart  =          // @type {CommentNode}
	  this._blockEnd    = null     // @type {CommentNode}

	  // lifecycle state
	  this._isCompiled  =
	  this._isDestroyed =
	  this._isReady     =
	  this._isAttached  =
	  this._isBeingDestroyed = false

	  // children
	  this._children =         // @type {Array}
	  this._childCtors = null  // @type {Object} - hash to cache
	                           // child constructors

	  // merge options.
	  options = this.$options = mergeOptions(
	    this.constructor.options,
	    options,
	    this
	  )

	  // set data after merge.
	  this._data = options.data || {}

	  // initialize data observation and scope inheritance.
	  this._initScope()

	  // setup event system and option events.
	  this._initEvents()

	  // call created hook
	  this._callHook('created')

	  // if `el` option is passed, start compilation.
	  if (options.el) {
	    this.$mount(options.el)
	  }
	}

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var inDoc = _.inDoc

	/**
	 * Setup the instance's option events & watchers.
	 * If the value is a string, we pull it from the
	 * instance's methods by name.
	 */

	exports._initEvents = function () {
	  var options = this.$options
	  registerCallbacks(this, '$on', options.events)
	  registerCallbacks(this, '$watch', options.watch)
	}

	/**
	 * Register callbacks for option events and watchers.
	 *
	 * @param {Vue} vm
	 * @param {String} action
	 * @param {Object} hash
	 */

	function registerCallbacks (vm, action, hash) {
	  if (!hash) return
	  var handlers, key, i, j
	  for (key in hash) {
	    handlers = hash[key]
	    if (_.isArray(handlers)) {
	      for (i = 0, j = handlers.length; i < j; i++) {
	        register(vm, action, key, handlers[i])
	      }
	    } else {
	      register(vm, action, key, handlers)
	    }
	  }
	}

	/**
	 * Helper to register an event/watch callback.
	 *
	 * @param {Vue} vm
	 * @param {String} action
	 * @param {String} key
	 * @param {*} handler
	 */

	function register (vm, action, key, handler) {
	  var type = typeof handler
	  if (type === 'function') {
	    vm[action](key, handler)
	  } else if (type === 'string') {
	    var methods = vm.$options.methods
	    var method = methods && methods[handler]
	    if (method) {
	      vm[action](key, method)
	    } else {
	      _.warn(
	        'Unknown method: "' + handler + '" when ' +
	        'registering callback for ' + action +
	        ': "' + key + '".'
	      )
	    }
	  }
	}

	/**
	 * Setup recursive attached/detached calls
	 */

	exports._initDOMHooks = function () {
	  this.$on('hook:attached', onAttached)
	  this.$on('hook:detached', onDetached)
	}

	/**
	 * Callback to recursively call attached hook on children
	 */

	function onAttached () {
	  this._isAttached = true
	  var children = this._children
	  if (!children) return
	  for (var i = 0, l = children.length; i < l; i++) {
	    var child = children[i]
	    if (!child._isAttached && inDoc(child.$el)) {
	      child._callHook('attached')
	    }
	  }
	}

	/**
	 * Callback to recursively call detached hook on children
	 */

	function onDetached () {
	  this._isAttached = false
	  var children = this._children
	  if (!children) return
	  for (var i = 0, l = children.length; i < l; i++) {
	    var child = children[i]
	    if (child._isAttached && !inDoc(child.$el)) {
	      child._callHook('detached')
	    }
	  }
	}

	/**
	 * Trigger all handlers for a hook
	 *
	 * @param {String} hook
	 */

	exports._callHook = function (hook) {
	  var handlers = this.$options[hook]
	  if (handlers) {
	    for (var i = 0, j = handlers.length; i < j; i++) {
	      handlers[i].call(this)
	    }
	  }
	  this.$emit('hook:' + hook)
	}

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var Observer = __webpack_require__(79)
	var Binding = __webpack_require__(48)

	/**
	 * Setup the scope of an instance, which contains:
	 * - observed data
	 * - computed properties
	 * - user methods
	 * - meta properties
	 */

	exports._initScope = function () {
	  this._initData()
	  this._initComputed()
	  this._initMethods()
	  this._initMeta()
	}

	/**
	 * Initialize the data. 
	 */

	exports._initData = function () {
	  // proxy data on instance
	  var data = this._data
	  var keys = Object.keys(data)
	  var i = keys.length
	  var key
	  while (i--) {
	    key = keys[i]
	    if (!_.isReserved(key)) {
	      this._proxy(key)
	    }
	  }
	  // observe data
	  Observer.create(data).addVm(this)
	}

	/**
	 * Swap the isntance's $data. Called in $data's setter.
	 *
	 * @param {Object} newData
	 */

	exports._setData = function (newData) {
	  newData = newData || {}
	  var oldData = this._data
	  this._data = newData
	  var keys, key, i
	  // unproxy keys not present in new data
	  keys = Object.keys(oldData)
	  i = keys.length
	  while (i--) {
	    key = keys[i]
	    if (!_.isReserved(key) && !(key in newData)) {
	      this._unproxy(key)
	    }
	  }
	  // proxy keys not already proxied,
	  // and trigger change for changed values
	  keys = Object.keys(newData)
	  i = keys.length
	  while (i--) {
	    key = keys[i]
	    if (!this.hasOwnProperty(key) && !_.isReserved(key)) {
	      // new property
	      this._proxy(key)
	    }
	  }
	  oldData.__ob__.removeVm(this)
	  Observer.create(newData).addVm(this)
	  this._digest()
	}

	/**
	 * Proxy a property, so that
	 * vm.prop === vm._data.prop
	 *
	 * @param {String} key
	 */

	exports._proxy = function (key) {
	  // need to store ref to self here
	  // because these getter/setters might
	  // be called by child instances!
	  var self = this
	  Object.defineProperty(self, key, {
	    configurable: true,
	    enumerable: true,
	    get: function proxyGetter () {
	      return self._data[key]
	    },
	    set: function proxySetter (val) {
	      self._data[key] = val
	    }
	  })
	}

	/**
	 * Unproxy a property.
	 *
	 * @param {String} key
	 */

	exports._unproxy = function (key) {
	  delete this[key]
	}

	/**
	 * Force update on every watcher in scope.
	 */

	exports._digest = function () {
	  var i = this._watcherList.length
	  while (i--) {
	    this._watcherList[i].update()
	  }
	  var children = this._children
	  var child
	  if (children) {
	    i = children.length
	    while (i--) {
	      child = children[i]
	      if (child.$options.inherit) {
	        child._digest()
	      }
	    }
	  }
	}

	/**
	 * Setup computed properties. They are essentially
	 * special getter/setters
	 */

	function noop () {}
	exports._initComputed = function () {
	  var computed = this.$options.computed
	  if (computed) {
	    for (var key in computed) {
	      var userDef = computed[key]
	      var def = {
	        enumerable: true,
	        configurable: true
	      }
	      if (typeof userDef === 'function') {
	        def.get = _.bind(userDef, this)
	        def.set = noop
	      } else {
	        def.get = userDef.get
	          ? _.bind(userDef.get, this)
	          : noop
	        def.set = userDef.set
	          ? _.bind(userDef.set, this)
	          : noop
	      }
	      Object.defineProperty(this, key, def)
	    }
	  }
	}

	/**
	 * Setup instance methods. Methods must be bound to the
	 * instance since they might be called by children
	 * inheriting them.
	 */

	exports._initMethods = function () {
	  var methods = this.$options.methods
	  if (methods) {
	    for (var key in methods) {
	      this[key] = _.bind(methods[key], this)
	    }
	  }
	}

	/**
	 * Initialize meta information like $index, $key & $value.
	 */

	exports._initMeta = function () {
	  var metas = this.$options._meta
	  if (metas) {
	    for (var key in metas) {
	      this._defineMeta(key, metas[key])
	    }
	  }
	}

	/**
	 * Define a meta property, e.g $index, $key, $value
	 * which only exists on the vm instance but not in $data.
	 *
	 * @param {String} key
	 * @param {*} value
	 */

	exports._defineMeta = function (key, value) {
	  var binding = new Binding()
	  Object.defineProperty(this, key, {
	    enumerable: true,
	    configurable: true,
	    get: function metaGetter () {
	      if (Observer.target) {
	        Observer.target.addDep(binding)
	      }
	      return value
	    },
	    set: function metaSetter (val) {
	      if (val !== value) {
	        value = val
	        binding.notify()
	      }
	    }
	  })
	}

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var Directive = __webpack_require__(49)
	var compile = __webpack_require__(60)
	var transclude = __webpack_require__(61)

	/**
	 * Transclude, compile and link element.
	 *
	 * If a pre-compiled linker is available, that means the
	 * passed in element will be pre-transcluded and compiled
	 * as well - all we need to do is to call the linker.
	 *
	 * Otherwise we need to call transclude/compile/link here.
	 *
	 * @param {Element} el
	 * @return {Element}
	 */

	exports._compile = function (el) {
	  var options = this.$options
	  if (options._linker) {
	    this._initElement(el)
	    options._linker(this, el)
	  } else {
	    var raw = el
	    el = transclude(el, options)
	    this._initElement(el)
	    var linker = compile(el, options)
	    linker(this, el)
	    if (options.replace) {
	      _.replace(raw, el)
	    }
	  }
	  return el
	}

	/**
	 * Initialize instance element. Called in the public
	 * $mount() method.
	 *
	 * @param {Element} el
	 */

	exports._initElement = function (el) {
	  if (el instanceof DocumentFragment) {
	    this._isBlock = true
	    this.$el = this._blockStart = el.firstChild
	    this._blockEnd = el.lastChild
	    this._blockFragment = el
	  } else {
	    this.$el = el
	  }
	  this.$el.__vue__ = this
	  this._callHook('beforeCompile')
	}

	/**
	 * Create and bind a directive to an element.
	 *
	 * @param {String} name - directive name
	 * @param {Node} node   - target node
	 * @param {Object} desc - parsed directive descriptor
	 * @param {Object} def  - directive definition object
	 * @param {Function} [linker] - pre-compiled linker fn
	 */

	exports._bindDir = function (name, node, desc, def, linker) {
	  this._directives.push(
	    new Directive(name, node, this, desc, def, linker)
	  )
	}

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Prefixes constant definitions
	 *
	 * keyMirror('EXPERIMENTS', {
	 *   addItem: null,
	 *   removeItem: null
	 * })
	 *
	 * returns:
	 * {
	 *   addItem: 'EXERIMENTS#addItem',
	 *   removeItem: 'EXERIMENTS#removeItem',
	 * }
	 */
	module.exports = function(prefix, obj) {
	  var ret = {}
	  var pref = prefix+'#'
	  for (var key in obj) {
	    ret[key] = pref + key
	  }
	  return ret
	}


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "<div v-show=\"region.isVisible\" v-component=\"{{ region.componentId }}\"></div>\n";

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var Immutable = __webpack_require__(40)

	/**
	 * A collection of helpers for the ImmutableJS library
	 */

	/**
	 * @param {*} obj
	 * @return {boolean}
	 */
	function isImmutable(obj) {
	  return Immutable.Iterable.isIterable(obj)
	}
	/**
	 * Converts an Immutable Sequence to JS object
	 * Can be called on any type
	 */
	function toJS(arg) {
	  // arg instanceof Immutable.Sequence is unreleable
	  return (isImmutable(arg))
	    ? arg.toJS()
	    : arg;
	}

	/**
	 * Converts a JS object to an Immutable object, if it's
	 * already Immutable its a no-op
	 */
	function toImmutable(arg) {
	  return (isImmutable(arg))
	    ? arg
	    : Immutable.fromJS(arg)
	}

	exports.toJS = toJS
	exports.toImmutable = toImmutable
	exports.isImmutable = isImmutable


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var Immutable = __webpack_require__(40)
	var Map = Immutable.Map
	var logging = __webpack_require__(80)
	var ChangeObserver = __webpack_require__(81)
	var ChangeEmitter = __webpack_require__(82)
	var Getter = __webpack_require__(37)
	var KeyPath = __webpack_require__(38)
	var evaluate = __webpack_require__(39)

	// helper fns
	var toJS = __webpack_require__(34).toJS
	var coerceArray = __webpack_require__(83).coerceArray
	var each = __webpack_require__(83).each
	var partial = __webpack_require__(83).partial


	/**
	 * In Nuclear Reactors are where state is stored.  Reactors
	 * contain a "state" object which is an Immutable.Map
	 *
	 * The only way Reactors can change state is by reacting to
	 * messages.  To update staet, Reactor's dispatch messages to
	 * all registered cores, and the core returns it's new
	 * state based on the message
	 */

	  function Reactor(config) {"use strict";
	    if (!(this instanceof Reactor)) {
	      return new Reactor(config)
	    }
	    config = config || {}

	    /**
	     * The state for the whole cluster
	     */
	    this.state = Immutable.Map({})
	    /**
	     * Event bus that emits a change event anytime the state
	     * of the system changes
	     */
	    this.__changeEmitter = new ChangeEmitter()
	    /**
	     * Holds a map of id => reactor instance
	     */
	    this.__stores = Immutable.Map({})

	    this.__initialize(config)
	    /**
	     * Change observer interface to observe certain keypaths
	     * Created after __initialize so it starts with initialState
	     */
	    this.__changeObsever = new ChangeObserver(this.state, this.__changeEmitter)
	  }

	  /**
	   * Gets the Immutable state at the keyPath
	   * @param {array|string} ...keyPaths
	   * @param {function?} getFn
	   * @return {*}
	   */
	  Reactor.prototype.get=function() {"use strict";
	    return evaluate(this.state, Getter.fromArgs(arguments))
	  };

	  /**
	   * Gets the coerced state (to JS object) of the reactor by keyPath
	   * @param {array|string} ...keyPaths
	   * @param {function?} getFn
	   * @return {*}
	   */
	  Reactor.prototype.getJS=function() {"use strict";
	    return toJS(this.get.apply(this, arguments))
	  };

	  /**
	   * Returns a faux-reactor cursor to a specific keyPath
	   * This prefixes all `get` and `getJS` operations with a keyPath
	   *
	   * dispatch still dispatches to the entire reactor
	   */
	  Reactor.prototype.cursor=function(keyPath) {"use strict";
	    var reactor = this
	    var prefix = KeyPath(keyPath)

	    var prefixKeyPath = function(path) {
	      path = path || []
	      return prefix.concat(KeyPath(path))
	    }

	    return {
	      get: function() {
	        return evaluate(reactor.get(prefix), Getter.fromArgs(arguments))
	      },

	      getJS: reactor.getJS,

	      dispatch: reactor.dispatch.bind(reactor),

	      observe: function(getter, handler) {
	        var options = {
	          prefix: prefix
	        }
	        if (arguments.length === 1) {
	          options.handler = getter
	          options.getter = Getter()
	        } else {
	          if (KeyPath.isKeyPath(getter)) {
	            getter = Getter(getter)
	          }
	          options.getter = getter
	          options.handler = handler
	        }

	        return reactor.__changeObsever.onChange(options)
	      },

	      cursor: function(keyPath) {
	        return reactor.cursor.call(reactor, prefixKeyPath(keyPath))
	      }
	    }
	  };

	  /**
	   * Dispatches a single message
	   * @param {string} messageType
	   * @param {object|undefined} payload
	   */
	  Reactor.prototype.dispatch=function(messageType, payload) {"use strict";
	    var prevState = this.state

	    this.state = this.state.withMutations(function(state)  {
	      logging.dispatchStart(messageType, payload)

	      // let each core handle the message
	      this.__stores.forEach(function(store, id)  {
	        var currState = state.get(id)
	        var newState = store.handle(currState, messageType, payload)
	        state.set(id, newState)

	        logging.coreReact(id, currState, newState)
	      })

	      logging.dispatchEnd(state)
	    }.bind(this))

	    // write the new state to the output stream if changed
	    if (this.state !== prevState) {
	      this.__changeEmitter.emitChange(this.state, messageType, payload)
	    }
	  };

	  /**
	   * Attachs a store to a non-running or running nuclear reactor.  Will emit change
	   * @param {string} id
	   * @param {Store} store
	   * @param {boolean} silent whether to emit change
	   */
	  Reactor.prototype.attachStore=function(id, store, silent) {"use strict";
	    if (this.__stores.get(id)) {
	      throw new Error("Store already defined for id=" + id)
	    }

	    this.__stores = this.__stores.set(id, store)

	    this.state = this.state.set(id, store.getInitialStateWithComputeds())

	    if (!silent) {
	      this.__changeEmitter.emitChange(this.state, 'ATTACH_STORE', {
	        id: id,
	        store: store
	      })
	    }
	  };

	  /**
	   * Adds a change observer whenever a certain part of the reactor state changes
	   *
	   * 1. observe(handlerFn) - 1 argument, called anytime reactor.state changes
	   * 2. observe('foo.bar', handlerFn) - 2 arguments, called anytime foo.bar changes
	   *    with the value of reactor.get('foo.bar')
	   * 3. observe(['foo', 'bar'], handlerFn) same as above
	   * 4. observe(getter, handlerFn) called whenever any getter dependencies change with
	   *    the value of the getter
	   *
	   * Adds a change handler whenever certain deps change
	   * If only one argument is passed invoked the handler whenever
	   * the reactor state changes
	   *
	   * @param {KeyPath|Getter} getter
	   * @param {function} handler
	   * @return {function} unwatch function
	   */
	  Reactor.prototype.observe=function(getter, handler) {"use strict";
	    var options = {}
	    if (arguments.length === 1) {
	      options.handler = getter
	      options.getter = Getter()
	    } else {
	      if (KeyPath.isKeyPath(getter)) {
	        getter = Getter(getter)
	      }
	      options.getter = getter
	      options.handler = handler
	    }

	    this.__changeObsever.onChange(options)
	  };

	  /**
	   * Will set the state of a specific store or the entire reactor if storeId isn't present
	   * @param {string?} storeId
	   * @param {Immutable.Map} state
	   */
	  Reactor.prototype.loadState=function(storeId, state) {"use strict";
	    if (arguments.length === 1) {
	      // handle the case of loading the entire app state
	      state = storeId
	      if (!Immutable.Map.isMap(state)) {
	        throw new Error("Must pass Immutable.Map to loadState")
	      }

	      // update each store with the computed state derived from the store state
	      // that is being loaded
	      this.state = state.withMutations(function(state)  {
	        state.forEach(function(storeState, storeId)  {
	          var store = this.__stores.get(storeId)
	          if (store) {
	            state.set(storeId, store.executeComputeds(Map(), storeState))
	          }
	        }.bind(this))
	      }.bind(this))
	    } else {
	      // loading a single stores state, execute computeds to ensure syncing
	      var store = this.__stores.get(storeId)
	      var newState = store.executeComputeds(Map(), state)
	      this.state = this.state.set(storeId, newState)
	    }

	    this.__changeEmitter.emitChange(this.state, 'LOAD_STATE', {
	      args: Array.prototype.slice.call(arguments)
	    })
	  };

	  /**
	   * Resets the state of a reactor and returns back to initial state
	   */
	  Reactor.prototype.reset=function() {"use strict";
	    this.state = Immutable.Map()

	    this.state = this.state.withMutations(function(state)  {
	      this.__stores.forEach(function(store, id)  {
	        state.set(id, store.getInitialStateWithComputeds())
	      })
	    }.bind(this))

	    this.resetChangeListeners()
	  };

	  /**
	   * Takes an object of action functions that have `reactor` as the first argument
	   * and returns an object with all the functions partialed
	   * @param {object}
	   * @return {object}
	   */
	  Reactor.prototype.bindActions=function(actionGroup) {"use strict";
	    var group = {}
	    each(actionGroup, function(fn, name)  {
	      group[name] = partial(fn, this)
	    }.bind(this))
	    return group
	  };

	  /**
	   * Resets all change listeners and cleans up any straggling event handlers
	   */
	  Reactor.prototype.resetChangeListeners=function() {"use strict";
	    this.__changeEmitter.removeAllListeners()
	    this.__changeObsever = new ChangeObserver(this.state, this.__changeEmitter)
	  };

	  /**
	   * Initializes all stores
	   * This method can only be called once per reactor
	   * @param {object} config
	   */
	  Reactor.prototype.__initialize=function(config) {"use strict";
	    if (config.stores) {
	      each(config.stores, function(store, id)  {
	        this.attachStore(id, store, false)
	      }.bind(this))
	    }
	  };


	module.exports = Reactor


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var Immutable = __webpack_require__(40)
	var Map = __webpack_require__(40).Map
	var Getter = __webpack_require__(37)
	var evaluate = __webpack_require__(39)
	var hasChanged = __webpack_require__(84)

	var KeyPath = __webpack_require__(38)
	var each = __webpack_require__(83).each
	var toImmutable = __webpack_require__(34).toImmutable

	/**
	 * Stores define how a certain domain of the application should respond to actions
	 * taken on the whole system.  They manage their own section of the entire app state
	 * and have no knowledge about the other parts of the application state.
	 */

	  function Store(config) {"use strict";
	    if (!(this instanceof Store)) {
	      return new Store(config)
	    }

	    this.__handlers = Map({})
	    this.__computeds = Map({})

	    // extend the config on the object
	    each(config, function(fn, prop)  {
	      this[prop] = fn
	    }.bind(this))

	    this.initialize()
	  }

	  /**
	   * This method is overriden by extending classses to setup message handlers
	   * via `this.on` and to set up the initial state
	   *
	   * Anything returned from this function will be coerced into an ImmutableJS value
	   * and set as the initial state for the part of the ReactorCore
	   */
	  Store.prototype.initialize=function() {"use strict";
	    // extending classes implement to setup action handlers
	  };

	  /**
	   * Overridable method to get the initial state for this type of store
	   */
	  Store.prototype.getInitialState=function() {"use strict";
	    return Map()
	  };

	  /**
	   * Gets the initial state plus executes any registered computeds
	   */
	  Store.prototype.getInitialStateWithComputeds=function() {"use strict";
	    var initialState = toImmutable(this.getInitialState())
	    return this.executeComputeds(Map(), initialState)
	  };

	  /**
	   * Takes a current reactor state, action type and payload
	   * does the reaction and returns the new state
	   */
	  Store.prototype.handle=function(state, type, payload) {"use strict";
	    var handler = this.__handlers.get(type)

	    if (typeof handler === 'function') {
	      var newState = toImmutable(handler.call(this, state, payload, type))
	      return this.executeComputeds(state, newState)
	    }

	    return state
	  };

	  /**
	   * Binds an action type => handler
	   */
	  Store.prototype.on=function(actionType, handler) {"use strict";
	    this.__handlers = this.__handlers.set(actionType, handler)
	  };

	  /**
	   * Registers a local computed to this component.
	   * These computeds are calculated after every react happens on this State.
	   *
	   * These computeds keyPaths are relative to the local state passed to react,
	   * not the entire app state.
	   *
	   * @param {array|string} path to register the computed
	   * @param {Getter|array} getterArgs
	   */
	  Store.prototype.computed=function(path, getterArgs) {"use strict";
	    var keyPath = KeyPath(path)
	    if (this.__computeds.get(keyPath)) {
	      throw new Error("Already a computed at " + keyPath)
	    }

	    var computed = Getter.fromArgs(getterArgs)
	    this.__computeds = this.__computeds.set(keyPath, computed)
	  };

	  /**
	   * Executes the registered computeds on a passed in state object
	   * @param {Immutable.Map|*} prevState
	   * @param {Immutable.Map|*} state
	   * @return {Immutable.Map|*}
	   */
	  Store.prototype.executeComputeds=function(prevState, state) {"use strict";
	    if (this.__computeds.size === 0) {
	      return state
	    }

	    return state.withMutations(function(state)  {
	      this.__computeds.forEach(function(computed, keyPath)  {
	        if (hasChanged(prevState, state, computed.flatDeps)) {
	          state.setIn(keyPath, evaluate(state, computed))
	        }
	      })
	      return state
	    }.bind(this))
	  };


	function isStore(toTest) {
	  return (toTest instanceof Store)
	}

	module.exports = Store

	module.exports.isStore = isStore


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var KeyPath = __webpack_require__(38)
	var Immutable = __webpack_require__(40)
	var Record = Immutable.Record
	var isFunction = __webpack_require__(83).isFunction
	var isArray = __webpack_require__(83).isArray

	var identity = function(x)  {return x;}

	var Getter = Record({
	  deps: null,
	  flatDeps: null,
	  computeFn: null,
	})

	/**
	 * Checks if something is a GetterRecord
	 */
	function isGetter(toTest) {
	  return (toTest instanceof Getter)
	}

	/**
	 * Checks if something is a getter literal, ex: ['dep1', 'dep2', function(dep1, dep2) {...}]
	 * @param {*} toTest
	 * @return {boolean}
	 */
	function isGetterLike(toTest) {
	  return (isArray(toTest) && isFunction(toTest[toTest.length - 1]))
	}

	/**
	 * Coerce string deps to be array dep keyPaths
	 * ex: 'foo1.foo2' => ['foo1', 'foo2']
	 *
	 * @param {array<string|array<string>>}
	 * @return {<array<array<string>>}
	 */
	function coerceDeps(deps){
	  return deps.map(function(dep)  {
	    if (isGetter(dep)) {
	      // if the dep is an nested Getter simply return
	      return dep
	    }
	    return KeyPath(dep)
	  })
	}

	/**
	 * Recursive function to flatten deps of a getter
	 * @param {array<array<string>|Getter>} deps
	 * @return {array<array<string>>} unique flatten deps
	 */
	function flattenDeps(deps) {
	  var accum = Immutable.Set()

	  var coercedDeps = coerceDeps(deps)

	  accum = accum.withMutations(function(accum)  {
	    coercedDeps.forEach(function(dep)  {
	      if (isGetter(dep)) {
	        accum.union(flattenDeps(dep.deps))
	      } else {
	        accum = accum.add(dep)
	      }
	    })

	    return accum
	  })

	  return accum.toJS()
	}

	/**
	 * Wrap the Getter in a function that coerces args
	 *
	 * Takes the form createGetter('dep1', 'dep2', computeFn)
	 * or
	 * Takes the form createGetter('dep1', 'dep2') // identity function is used
	 *
	 * @return {GetterRecord}
	 */
	function createGetter() {
	  // createGetter() returns a blank getter
	  if (arguments.length === 0) {
	    return createGetter([])
	  }
	  var len = arguments.length
	  var deps
	  var computeFn
	  if (isFunction(arguments[len - 1])) {
	    // computeFn is provided
	    deps = Array.prototype.slice.call(arguments, 0, len - 1)
	    computeFn = arguments[len - 1]
	  } else {
	    // computeFn isnt provided use identity
	    deps = Array.prototype.slice.call(arguments, 0)
	    computeFn = identity
	  }

	  // compute the flatten deps, and cache since deps are immutable
	  // once they enter the record
	  var flatDeps = flattenDeps(deps)
	  var deps = coerceDeps(deps)

	  return new Getter({
	    deps: deps,
	    flatDeps: flatDeps,
	    computeFn: computeFn
	  })
	}

	/**
	 * Returns a getter from arguments
	 * @param {array} args or arguments
	 * @return {Getter}
	 */
	function fromArgs(args) {
	  if (args.length === 1 && isGetter(args[0])) {
	    // was passed a Getter
	    return args[0]
	  }
	  return createGetter.apply(null, args)
	}

	module.exports = createGetter

	module.exports.isGetter = isGetter

	module.exports.fromArgs = fromArgs


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(83).isArray
	var isNumber = __webpack_require__(83).isNumber
	var isString = __webpack_require__(83).isString
	var isFunction = __webpack_require__(83).isFunction
	/**
	 * Coerces a string/array into an array keypath
	 */
	module.exports = function(val) {
	  if (val == null || val === false) {
	    // null is a valid keypath, returns whole map/seq
	    return []
	  }
	  if (isNumber(val)) {
	    return [val]
	  }
	  if (!isArray(val)) {
	    return val.split('.')
	  }
	  return val
	}

	/**
	 * Checks if something is simply a keyPath and not a getter
	 * @param {*} toTest
	 * @return {boolean}
	 */
	module.exports.isKeyPath = function(toTest) {
	  return (
	    toTest == null ||
	    isNumber(toTest) ||
	    isString(toTest) ||
	    (isArray(toTest) && !isFunction(toTest[toTest.length - 1]))
	  )
	}


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var KeyPath = __webpack_require__(38)
	var Getter = __webpack_require__(37)

	/**
	 * General purpose getter function
	 */

	/**
	 * Getter forms:
	 * 'foo.bar'
	 * ['foor', 'bar']
	 * ['store1, 'foo', 'bar']
	 * ['foo', 'bar', function(fooValue, barValue) {...}]
	 * [['foo.bar'], 'baz', function(foobarValue, bazValue) {...}]
	 * [['store1', 'foo', 'bar', ['foo.bar'], 'baz', function(Store.foo.bar, foobarValue, bazValue) {...}]
	 *
	 * @param {Immutable.Map} state
	 * @param {string|array} getter
	 */
	module.exports = function evaluate(state, getter) {
	  if (getter == null || getter === false) {
	    return state
	  }

	  if (KeyPath.isKeyPath(getter)) {
	    if (state && state.getIn) {
	      return state.getIn(KeyPath(getter))
	    } else {
	      // account for the cases when state is a primitive value
	      return state
	    }
	  } else if (Getter.isGetter(getter)) {
	    // its of type Getter
	    var values = getter.deps.map(evaluate.bind(null, state))
	    return getter.computeFn.apply(null, values)
	  } else {
	    throw new Error("Evaluate must be passed a keyPath or Getter")
	  }
	}


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 *  Copyright (c) 2014, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */
	function universalModule() {
	  var $Object = Object;

	function createClass(ctor, methods, staticMethods, superClass) {
	  var proto;
	  if (superClass) {
	    var superProto = superClass.prototype;
	    proto = $Object.create(superProto);
	  } else {
	    proto = ctor.prototype;
	  }
	  $Object.keys(methods).forEach(function (key) {
	    proto[key] = methods[key];
	  });
	  $Object.keys(staticMethods).forEach(function (key) {
	    ctor[key] = staticMethods[key];
	  });
	  proto.constructor = ctor;
	  ctor.prototype = proto;
	  return ctor;
	}

	function superCall(self, proto, name, args) {
	  return $Object.getPrototypeOf(proto)[name].apply(self, args);
	}

	function defaultSuperCall(self, proto, args) {
	  superCall(self, proto, 'constructor', args);
	}

	var $traceurRuntime = {};
	$traceurRuntime.createClass = createClass;
	$traceurRuntime.superCall = superCall;
	$traceurRuntime.defaultSuperCall = defaultSuperCall;
	"use strict";
	function is(first, second) {
	  if (first === second) {
	    return first !== 0 || second !== 0 || 1 / first === 1 / second;
	  }
	  if (first !== first) {
	    return second !== second;
	  }
	  if (first && typeof first.equals === 'function') {
	    return first.equals(second);
	  }
	  return false;
	}
	function invariant(condition, error) {
	  if (!condition)
	    throw new Error(error);
	}
	var DELETE = 'delete';
	var SHIFT = 5;
	var SIZE = 1 << SHIFT;
	var MASK = SIZE - 1;
	var NOT_SET = {};
	var CHANGE_LENGTH = {value: false};
	var DID_ALTER = {value: false};
	function MakeRef(ref) {
	  ref.value = false;
	  return ref;
	}
	function SetRef(ref) {
	  ref && (ref.value = true);
	}
	function OwnerID() {}
	function arrCopy(arr, offset) {
	  offset = offset || 0;
	  var len = Math.max(0, arr.length - offset);
	  var newArr = new Array(len);
	  for (var ii = 0; ii < len; ii++) {
	    newArr[ii] = arr[ii + offset];
	  }
	  return newArr;
	}
	function assertNotInfinite(size) {
	  invariant(size !== Infinity, 'Cannot perform this action with an infinite size.');
	}
	function ensureSize(iter) {
	  if (iter.size === undefined) {
	    iter.size = iter.__iterate(returnTrue);
	  }
	  return iter.size;
	}
	function wrapIndex(iter, index) {
	  return index >= 0 ? (+index) : ensureSize(iter) + (+index);
	}
	function returnTrue() {
	  return true;
	}
	function wholeSlice(begin, end, size) {
	  return (begin === 0 || (size !== undefined && begin <= -size)) && (end === undefined || (size !== undefined && end >= size));
	}
	function resolveBegin(begin, size) {
	  return resolveIndex(begin, size, 0);
	}
	function resolveEnd(end, size) {
	  return resolveIndex(end, size, size);
	}
	function resolveIndex(index, size, defaultIndex) {
	  return index === undefined ? defaultIndex : index < 0 ? Math.max(0, size + index) : size === undefined ? index : Math.min(size, index);
	}
	function hash(o) {
	  if (!o) {
	    return 0;
	  }
	  if (o === true) {
	    return 1;
	  }
	  var type = typeof o;
	  if (type === 'number') {
	    if ((o | 0) === o) {
	      return o & HASH_MAX_VAL;
	    }
	    o = '' + o;
	    type = 'string';
	  }
	  if (type === 'string') {
	    return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
	  }
	  if (o.hashCode) {
	    return hash(typeof o.hashCode === 'function' ? o.hashCode() : o.hashCode);
	  }
	  return hashJSObj(o);
	}
	function cachedHashString(string) {
	  var hash = stringHashCache[string];
	  if (hash === undefined) {
	    hash = hashString(string);
	    if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
	      STRING_HASH_CACHE_SIZE = 0;
	      stringHashCache = {};
	    }
	    STRING_HASH_CACHE_SIZE++;
	    stringHashCache[string] = hash;
	  }
	  return hash;
	}
	function hashString(string) {
	  var hash = 0;
	  for (var ii = 0; ii < string.length; ii++) {
	    hash = (31 * hash + string.charCodeAt(ii)) & HASH_MAX_VAL;
	  }
	  return hash;
	}
	function hashJSObj(obj) {
	  var hash = weakMap && weakMap.get(obj);
	  if (hash)
	    return hash;
	  hash = obj[UID_HASH_KEY];
	  if (hash)
	    return hash;
	  if (!canDefineProperty) {
	    hash = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
	    if (hash)
	      return hash;
	    hash = getIENodeHash(obj);
	    if (hash)
	      return hash;
	  }
	  if (Object.isExtensible && !Object.isExtensible(obj)) {
	    throw new Error('Non-extensible objects are not allowed as keys.');
	  }
	  hash = ++objHashUID & HASH_MAX_VAL;
	  if (weakMap) {
	    weakMap.set(obj, hash);
	  } else if (canDefineProperty) {
	    Object.defineProperty(obj, UID_HASH_KEY, {
	      'enumerable': false,
	      'configurable': false,
	      'writable': false,
	      'value': hash
	    });
	  } else if (obj.propertyIsEnumerable && obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable) {
	    obj.propertyIsEnumerable = function() {
	      return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments);
	    };
	    obj.propertyIsEnumerable[UID_HASH_KEY] = hash;
	  } else if (obj.nodeType) {
	    obj[UID_HASH_KEY] = hash;
	  } else {
	    throw new Error('Unable to set a non-enumerable property on object.');
	  }
	  return hash;
	}
	var canDefineProperty = (function() {
	  try {
	    Object.defineProperty({}, 'x', {});
	    return true;
	  } catch (e) {
	    return false;
	  }
	}());
	function getIENodeHash(node) {
	  if (node && node.nodeType > 0) {
	    switch (node.nodeType) {
	      case 1:
	        return node.uniqueID;
	      case 9:
	        return node.documentElement && node.documentElement.uniqueID;
	    }
	  }
	}
	var weakMap = typeof WeakMap === 'function' && new WeakMap();
	var HASH_MAX_VAL = 0x7FFFFFFF;
	var objHashUID = 0;
	var UID_HASH_KEY = '__immutablehash__';
	if (typeof Symbol === 'function') {
	  UID_HASH_KEY = Symbol(UID_HASH_KEY);
	}
	var STRING_HASH_CACHE_MIN_STRLEN = 16;
	var STRING_HASH_CACHE_MAX_SIZE = 255;
	var STRING_HASH_CACHE_SIZE = 0;
	var stringHashCache = {};
	var ITERATE_KEYS = 0;
	var ITERATE_VALUES = 1;
	var ITERATE_ENTRIES = 2;
	var FAUX_ITERATOR_SYMBOL = '@@iterator';
	var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
	var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;
	var Iterator = function Iterator(next) {
	  this.next = next;
	};
	($traceurRuntime.createClass)(Iterator, {toString: function() {
	    return '[Iterator]';
	  }}, {});
	Iterator.KEYS = ITERATE_KEYS;
	Iterator.VALUES = ITERATE_VALUES;
	Iterator.ENTRIES = ITERATE_ENTRIES;
	var IteratorPrototype = Iterator.prototype;
	IteratorPrototype.inspect = IteratorPrototype.toSource = function() {
	  return this.toString();
	};
	IteratorPrototype[ITERATOR_SYMBOL] = function() {
	  return this;
	};
	function iteratorValue(type, k, v, iteratorResult) {
	  var value = type === 0 ? k : type === 1 ? v : [k, v];
	  iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
	    value: value,
	    done: false
	  });
	  return iteratorResult;
	}
	function iteratorDone() {
	  return {
	    value: undefined,
	    done: true
	  };
	}
	function hasIterator(maybeIterable) {
	  return !!_iteratorFn(maybeIterable);
	}
	function isIterator(maybeIterator) {
	  return maybeIterator && typeof maybeIterator.next === 'function';
	}
	function getIterator(iterable) {
	  var iteratorFn = _iteratorFn(iterable);
	  return iteratorFn && iteratorFn.call(iterable);
	}
	function _iteratorFn(iterable) {
	  var iteratorFn = iterable && ((REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) || iterable[FAUX_ITERATOR_SYMBOL]);
	  if (typeof iteratorFn === 'function') {
	    return iteratorFn;
	  }
	}
	var Iterable = function Iterable(value) {
	  return isIterable(value) ? value : Seq(value);
	};
	var $Iterable = Iterable;
	($traceurRuntime.createClass)(Iterable, {
	  toArray: function() {
	    assertNotInfinite(this.size);
	    var array = new Array(this.size || 0);
	    this.valueSeq().__iterate((function(v, i) {
	      array[i] = v;
	    }));
	    return array;
	  },
	  toIndexedSeq: function() {
	    return new ToIndexedSequence(this);
	  },
	  toJS: function() {
	    return this.toSeq().map((function(value) {
	      return value && typeof value.toJS === 'function' ? value.toJS() : value;
	    })).__toJS();
	  },
	  toKeyedSeq: function() {
	    return new ToKeyedSequence(this, true);
	  },
	  toMap: function() {
	    assertNotInfinite(this.size);
	    return Map(this.toKeyedSeq());
	  },
	  toObject: function() {
	    assertNotInfinite(this.size);
	    var object = {};
	    this.__iterate((function(v, k) {
	      object[k] = v;
	    }));
	    return object;
	  },
	  toOrderedMap: function() {
	    assertNotInfinite(this.size);
	    return OrderedMap(this.toKeyedSeq());
	  },
	  toOrderedSet: function() {
	    assertNotInfinite(this.size);
	    return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
	  },
	  toSet: function() {
	    assertNotInfinite(this.size);
	    return Set(isKeyed(this) ? this.valueSeq() : this);
	  },
	  toSetSeq: function() {
	    return new ToSetSequence(this);
	  },
	  toSeq: function() {
	    return isIndexed(this) ? this.toIndexedSeq() : isKeyed(this) ? this.toKeyedSeq() : this.toSetSeq();
	  },
	  toStack: function() {
	    assertNotInfinite(this.size);
	    return Stack(isKeyed(this) ? this.valueSeq() : this);
	  },
	  toList: function() {
	    assertNotInfinite(this.size);
	    return List(isKeyed(this) ? this.valueSeq() : this);
	  },
	  toString: function() {
	    return '[Iterable]';
	  },
	  __toString: function(head, tail) {
	    if (this.size === 0) {
	      return head + tail;
	    }
	    return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;
	  },
	  concat: function() {
	    for (var values = [],
	        $__2 = 0; $__2 < arguments.length; $__2++)
	      values[$__2] = arguments[$__2];
	    return reify(this, concatFactory(this, values));
	  },
	  contains: function(searchValue) {
	    return this.some((function(value) {
	      return is(value, searchValue);
	    }));
	  },
	  entries: function() {
	    return this.__iterator(ITERATE_ENTRIES);
	  },
	  every: function(predicate, context) {
	    var returnValue = true;
	    this.__iterate((function(v, k, c) {
	      if (!predicate.call(context, v, k, c)) {
	        returnValue = false;
	        return false;
	      }
	    }));
	    return returnValue;
	  },
	  filter: function(predicate, context) {
	    return reify(this, filterFactory(this, predicate, context, true));
	  },
	  find: function(predicate, context, notSetValue) {
	    var foundValue = notSetValue;
	    this.__iterate((function(v, k, c) {
	      if (predicate.call(context, v, k, c)) {
	        foundValue = v;
	        return false;
	      }
	    }));
	    return foundValue;
	  },
	  forEach: function(sideEffect, context) {
	    return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
	  },
	  join: function(separator) {
	    separator = separator !== undefined ? '' + separator : ',';
	    var joined = '';
	    var isFirst = true;
	    this.__iterate((function(v) {
	      isFirst ? (isFirst = false) : (joined += separator);
	      joined += v !== null && v !== undefined ? v : '';
	    }));
	    return joined;
	  },
	  keys: function() {
	    return this.__iterator(ITERATE_KEYS);
	  },
	  map: function(mapper, context) {
	    return reify(this, mapFactory(this, mapper, context));
	  },
	  reduce: function(reducer, initialReduction, context) {
	    var reduction;
	    var useFirst;
	    if (arguments.length < 2) {
	      useFirst = true;
	    } else {
	      reduction = initialReduction;
	    }
	    this.__iterate((function(v, k, c) {
	      if (useFirst) {
	        useFirst = false;
	        reduction = v;
	      } else {
	        reduction = reducer.call(context, reduction, v, k, c);
	      }
	    }));
	    return reduction;
	  },
	  reduceRight: function(reducer, initialReduction, context) {
	    var reversed = this.toKeyedSeq().reverse();
	    return reversed.reduce.apply(reversed, arguments);
	  },
	  reverse: function() {
	    return reify(this, reverseFactory(this, true));
	  },
	  slice: function(begin, end) {
	    if (wholeSlice(begin, end, this.size)) {
	      return this;
	    }
	    var resolvedBegin = resolveBegin(begin, this.size);
	    var resolvedEnd = resolveEnd(end, this.size);
	    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
	      return this.toSeq().cacheResult().slice(begin, end);
	    }
	    var skipped = resolvedBegin === 0 ? this : this.skip(resolvedBegin);
	    return reify(this, resolvedEnd === undefined || resolvedEnd === this.size ? skipped : skipped.take(resolvedEnd - resolvedBegin));
	  },
	  some: function(predicate, context) {
	    return !this.every(not(predicate), context);
	  },
	  sort: function(comparator) {
	    return reify(this, sortFactory(this, comparator));
	  },
	  values: function() {
	    return this.__iterator(ITERATE_VALUES);
	  },
	  butLast: function() {
	    return this.slice(0, -1);
	  },
	  count: function(predicate, context) {
	    return ensureSize(predicate ? this.toSeq().filter(predicate, context) : this);
	  },
	  countBy: function(grouper, context) {
	    return countByFactory(this, grouper, context);
	  },
	  equals: function(other) {
	    if (this === other) {
	      return true;
	    }
	    if (!other || typeof other.equals !== 'function') {
	      return false;
	    }
	    if (this.size !== undefined && other.size !== undefined) {
	      if (this.size !== other.size) {
	        return false;
	      }
	      if (this.size === 0 && other.size === 0) {
	        return true;
	      }
	    }
	    if (this.__hash !== undefined && other.__hash !== undefined && this.__hash !== other.__hash) {
	      return false;
	    }
	    return this.__deepEquals(other);
	  },
	  __deepEquals: function(other) {
	    return deepEqual(this, other);
	  },
	  entrySeq: function() {
	    var iterable = this;
	    if (iterable._cache) {
	      return new ArraySeq(iterable._cache);
	    }
	    var entriesSequence = iterable.toSeq().map(entryMapper).toIndexedSeq();
	    entriesSequence.fromEntrySeq = (function() {
	      return iterable.toSeq();
	    });
	    return entriesSequence;
	  },
	  filterNot: function(predicate, context) {
	    return this.filter(not(predicate), context);
	  },
	  findLast: function(predicate, context, notSetValue) {
	    return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
	  },
	  first: function() {
	    return this.find(returnTrue);
	  },
	  flatMap: function(mapper, context) {
	    return reify(this, flatMapFactory(this, mapper, context));
	  },
	  flatten: function(depth) {
	    return reify(this, flattenFactory(this, depth, true));
	  },
	  fromEntrySeq: function() {
	    return new FromEntriesSequence(this);
	  },
	  get: function(searchKey, notSetValue) {
	    return this.find((function(_, key) {
	      return is(key, searchKey);
	    }), undefined, notSetValue);
	  },
	  getIn: function(searchKeyPath, notSetValue) {
	    var nested = this;
	    if (searchKeyPath) {
	      for (var ii = 0; ii < searchKeyPath.length; ii++) {
	        nested = nested && nested.get ? nested.get(searchKeyPath[ii], NOT_SET) : NOT_SET;
	        if (nested === NOT_SET) {
	          return notSetValue;
	        }
	      }
	    }
	    return nested;
	  },
	  groupBy: function(grouper, context) {
	    return groupByFactory(this, grouper, context);
	  },
	  has: function(searchKey) {
	    return this.get(searchKey, NOT_SET) !== NOT_SET;
	  },
	  isSubset: function(iter) {
	    iter = typeof iter.contains === 'function' ? iter : $Iterable(iter);
	    return this.every((function(value) {
	      return iter.contains(value);
	    }));
	  },
	  isSuperset: function(iter) {
	    return iter.isSubset(this);
	  },
	  keySeq: function() {
	    return this.toSeq().map(keyMapper).toIndexedSeq();
	  },
	  last: function() {
	    return this.toSeq().reverse().first();
	  },
	  max: function(comparator) {
	    return maxFactory(this, comparator);
	  },
	  maxBy: function(mapper, comparator) {
	    return maxFactory(this, comparator, mapper);
	  },
	  min: function(comparator) {
	    return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator);
	  },
	  minBy: function(mapper, comparator) {
	    return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator, mapper);
	  },
	  rest: function() {
	    return this.slice(1);
	  },
	  skip: function(amount) {
	    return reify(this, skipFactory(this, amount, true));
	  },
	  skipLast: function(amount) {
	    return reify(this, this.toSeq().reverse().skip(amount).reverse());
	  },
	  skipWhile: function(predicate, context) {
	    return reify(this, skipWhileFactory(this, predicate, context, true));
	  },
	  skipUntil: function(predicate, context) {
	    return this.skipWhile(not(predicate), context);
	  },
	  sortBy: function(mapper, comparator) {
	    return reify(this, sortFactory(this, comparator, mapper));
	  },
	  take: function(amount) {
	    return reify(this, takeFactory(this, amount));
	  },
	  takeLast: function(amount) {
	    return reify(this, this.toSeq().reverse().take(amount).reverse());
	  },
	  takeWhile: function(predicate, context) {
	    return reify(this, takeWhileFactory(this, predicate, context));
	  },
	  takeUntil: function(predicate, context) {
	    return this.takeWhile(not(predicate), context);
	  },
	  valueSeq: function() {
	    return this.toIndexedSeq();
	  },
	  hashCode: function() {
	    return this.__hash || (this.__hash = this.size === Infinity ? 0 : this.reduce((function(h, v, k) {
	      return (h + (hash(v) ^ (v === k ? 0 : hash(k)))) & HASH_MAX_VAL;
	    }), 0));
	  }
	}, {});
	var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
	var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
	var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
	var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';
	var IterablePrototype = Iterable.prototype;
	IterablePrototype[IS_ITERABLE_SENTINEL] = true;
	IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;
	IterablePrototype.toJSON = IterablePrototype.toJS;
	IterablePrototype.__toJS = IterablePrototype.toArray;
	IterablePrototype.__toStringMapper = quoteString;
	IterablePrototype.inspect = IterablePrototype.toSource = function() {
	  return this.toString();
	};
	IterablePrototype.chain = IterablePrototype.flatMap;
	(function() {
	  try {
	    Object.defineProperty(IterablePrototype, 'length', {get: function() {
	        if (!Iterable.noLengthWarning) {
	          var stack;
	          try {
	            throw new Error();
	          } catch (error) {
	            stack = error.stack;
	          }
	          if (stack.indexOf('_wrapObject') === -1) {
	            console && console.warn && console.warn('iterable.length has been deprecated, ' + 'use iterable.size or iterable.count(). ' + 'This warning will become a silent error in a future version. ' + stack);
	            return this.size;
	          }
	        }
	      }});
	  } catch (e) {}
	})();
	var KeyedIterable = function KeyedIterable(value) {
	  return isKeyed(value) ? value : KeyedSeq(value);
	};
	($traceurRuntime.createClass)(KeyedIterable, {
	  flip: function() {
	    return reify(this, flipFactory(this));
	  },
	  findKey: function(predicate, context) {
	    var foundKey;
	    this.__iterate((function(v, k, c) {
	      if (predicate.call(context, v, k, c)) {
	        foundKey = k;
	        return false;
	      }
	    }));
	    return foundKey;
	  },
	  findLastKey: function(predicate, context) {
	    return this.toSeq().reverse().findKey(predicate, context);
	  },
	  keyOf: function(searchValue) {
	    return this.findKey((function(value) {
	      return is(value, searchValue);
	    }));
	  },
	  lastKeyOf: function(searchValue) {
	    return this.toSeq().reverse().keyOf(searchValue);
	  },
	  mapEntries: function(mapper, context) {
	    var $__0 = this;
	    var iterations = 0;
	    return reify(this, this.toSeq().map((function(v, k) {
	      return mapper.call(context, [k, v], iterations++, $__0);
	    })).fromEntrySeq());
	  },
	  mapKeys: function(mapper, context) {
	    var $__0 = this;
	    return reify(this, this.toSeq().flip().map((function(k, v) {
	      return mapper.call(context, k, v, $__0);
	    })).flip());
	  }
	}, {}, Iterable);
	var KeyedIterablePrototype = KeyedIterable.prototype;
	KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;
	KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;
	KeyedIterablePrototype.__toJS = IterablePrototype.toObject;
	KeyedIterablePrototype.__toStringMapper = (function(v, k) {
	  return k + ': ' + quoteString(v);
	});
	var IndexedIterable = function IndexedIterable(value) {
	  return isIndexed(value) ? value : IndexedSeq(value);
	};
	($traceurRuntime.createClass)(IndexedIterable, {
	  toKeyedSeq: function() {
	    return new ToKeyedSequence(this, false);
	  },
	  filter: function(predicate, context) {
	    return reify(this, filterFactory(this, predicate, context, false));
	  },
	  findIndex: function(predicate, context) {
	    var key = this.toKeyedSeq().findKey(predicate, context);
	    return key === undefined ? -1 : key;
	  },
	  indexOf: function(searchValue) {
	    var key = this.toKeyedSeq().keyOf(searchValue);
	    return key === undefined ? -1 : key;
	  },
	  lastIndexOf: function(searchValue) {
	    var key = this.toKeyedSeq().lastKeyOf(searchValue);
	    return key === undefined ? -1 : key;
	  },
	  reverse: function() {
	    return reify(this, reverseFactory(this, false));
	  },
	  splice: function(index, removeNum) {
	    var numArgs = arguments.length;
	    removeNum = Math.max(removeNum | 0, 0);
	    if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
	      return this;
	    }
	    index = resolveBegin(index, this.size);
	    var spliced = this.slice(0, index);
	    return reify(this, numArgs === 1 ? spliced : spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum)));
	  },
	  findLastIndex: function(predicate, context) {
	    var key = this.toKeyedSeq().findLastKey(predicate, context);
	    return key === undefined ? -1 : key;
	  },
	  first: function() {
	    return this.get(0);
	  },
	  flatten: function(depth) {
	    return reify(this, flattenFactory(this, depth, false));
	  },
	  get: function(index, notSetValue) {
	    index = wrapIndex(this, index);
	    return (index < 0 || (this.size === Infinity || (this.size !== undefined && index > this.size))) ? notSetValue : this.find((function(_, key) {
	      return key === index;
	    }), undefined, notSetValue);
	  },
	  has: function(index) {
	    index = wrapIndex(this, index);
	    return index >= 0 && (this.size !== undefined ? this.size === Infinity || index < this.size : this.indexOf(index) !== -1);
	  },
	  interpose: function(separator) {
	    return reify(this, interposeFactory(this, separator));
	  },
	  last: function() {
	    return this.get(-1);
	  },
	  skip: function(amount) {
	    var iter = this;
	    var skipSeq = skipFactory(iter, amount, false);
	    if (isSeq(iter) && skipSeq !== iter) {
	      skipSeq.get = function(index, notSetValue) {
	        index = wrapIndex(this, index);
	        return index >= 0 ? iter.get(index + amount, notSetValue) : notSetValue;
	      };
	    }
	    return reify(this, skipSeq);
	  },
	  skipWhile: function(predicate, context) {
	    return reify(this, skipWhileFactory(this, predicate, context, false));
	  },
	  take: function(amount) {
	    var iter = this;
	    var takeSeq = takeFactory(iter, amount);
	    if (isSeq(iter) && takeSeq !== iter) {
	      takeSeq.get = function(index, notSetValue) {
	        index = wrapIndex(this, index);
	        return index >= 0 && index < amount ? iter.get(index, notSetValue) : notSetValue;
	      };
	    }
	    return reify(this, takeSeq);
	  }
	}, {}, Iterable);
	IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;
	IndexedIterable.prototype[IS_ORDERED_SENTINEL] = true;
	var SetIterable = function SetIterable(value) {
	  return isIterable(value) && !isAssociative(value) ? value : SetSeq(value);
	};
	($traceurRuntime.createClass)(SetIterable, {
	  get: function(value, notSetValue) {
	    return this.has(value) ? value : notSetValue;
	  },
	  contains: function(value) {
	    return this.has(value);
	  },
	  keySeq: function() {
	    return this.valueSeq();
	  }
	}, {}, Iterable);
	SetIterable.prototype.has = IterablePrototype.contains;
	function isIterable(maybeIterable) {
	  return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);
	}
	function isKeyed(maybeKeyed) {
	  return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);
	}
	function isIndexed(maybeIndexed) {
	  return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);
	}
	function isAssociative(maybeAssociative) {
	  return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
	}
	function isOrdered(maybeOrdered) {
	  return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SENTINEL]);
	}
	Iterable.isIterable = isIterable;
	Iterable.isKeyed = isKeyed;
	Iterable.isIndexed = isIndexed;
	Iterable.isAssociative = isAssociative;
	Iterable.isOrdered = isOrdered;
	Iterable.Keyed = KeyedIterable;
	Iterable.Indexed = IndexedIterable;
	Iterable.Set = SetIterable;
	Iterable.Iterator = Iterator;
	function keyMapper(v, k) {
	  return k;
	}
	function entryMapper(v, k) {
	  return [k, v];
	}
	function not(predicate) {
	  return function() {
	    return !predicate.apply(this, arguments);
	  };
	}
	function neg(predicate) {
	  return function() {
	    return -predicate.apply(this, arguments);
	  };
	}
	function quoteString(value) {
	  return typeof value === 'string' ? JSON.stringify(value) : value;
	}
	function defaultNegComparator(a, b) {
	  return a > b ? -1 : a < b ? 1 : 0;
	}
	function deepEqual(a, b) {
	  var bothNotAssociative = !isAssociative(a) && !isAssociative(b);
	  if (isOrdered(a)) {
	    if (!isOrdered(b)) {
	      return false;
	    }
	    var entries = a.entries();
	    return b.every((function(v, k) {
	      var entry = entries.next().value;
	      return entry && is(entry[1], v) && (bothNotAssociative || is(entry[0], k));
	    })) && entries.next().done;
	  }
	  var flipped = false;
	  if (a.size === undefined) {
	    if (b.size === undefined) {
	      a.cacheResult();
	    } else {
	      flipped = true;
	      var _ = a;
	      a = b;
	      b = _;
	    }
	  }
	  var allEqual = true;
	  var bSize = b.__iterate((function(v, k) {
	    if (bothNotAssociative ? !a.has(v) : flipped ? !is(v, a.get(k, NOT_SET)) : !is(a.get(k, NOT_SET), v)) {
	      allEqual = false;
	      return false;
	    }
	  }));
	  return allEqual && a.size === bSize;
	}
	function mixin(ctor, methods) {
	  var proto = ctor.prototype;
	  var keyCopier = (function(key) {
	    proto[key] = methods[key];
	  });
	  Object.keys(methods).forEach(keyCopier);
	  Object.getOwnPropertySymbols && Object.getOwnPropertySymbols(methods).forEach(keyCopier);
	  return ctor;
	}
	var Seq = function Seq(value) {
	  return value === null || value === undefined ? emptySequence() : isIterable(value) ? value.toSeq() : seqFromValue(value);
	};
	var $Seq = Seq;
	($traceurRuntime.createClass)(Seq, {
	  toSeq: function() {
	    return this;
	  },
	  toString: function() {
	    return this.__toString('Seq {', '}');
	  },
	  cacheResult: function() {
	    if (!this._cache && this.__iterateUncached) {
	      this._cache = this.entrySeq().toArray();
	      this.size = this._cache.length;
	    }
	    return this;
	  },
	  __iterate: function(fn, reverse) {
	    return seqIterate(this, fn, reverse, true);
	  },
	  __iterator: function(type, reverse) {
	    return seqIterator(this, type, reverse, true);
	  }
	}, {of: function() {
	    return $Seq(arguments);
	  }}, Iterable);
	var KeyedSeq = function KeyedSeq(value) {
	  return value === null || value === undefined ? emptySequence().toKeyedSeq() : isIterable(value) ? (isKeyed(value) ? value.toSeq() : value.fromEntrySeq()) : keyedSeqFromValue(value);
	};
	var $KeyedSeq = KeyedSeq;
	($traceurRuntime.createClass)(KeyedSeq, {
	  toKeyedSeq: function() {
	    return this;
	  },
	  toSeq: function() {
	    return this;
	  }
	}, {of: function() {
	    return $KeyedSeq(arguments);
	  }}, Seq);
	mixin(KeyedSeq, KeyedIterable.prototype);
	var IndexedSeq = function IndexedSeq(value) {
	  return value === null || value === undefined ? emptySequence() : !isIterable(value) ? indexedSeqFromValue(value) : isKeyed(value) ? value.entrySeq() : value.toIndexedSeq();
	};
	var $IndexedSeq = IndexedSeq;
	($traceurRuntime.createClass)(IndexedSeq, {
	  toIndexedSeq: function() {
	    return this;
	  },
	  toString: function() {
	    return this.__toString('Seq [', ']');
	  },
	  __iterate: function(fn, reverse) {
	    return seqIterate(this, fn, reverse, false);
	  },
	  __iterator: function(type, reverse) {
	    return seqIterator(this, type, reverse, false);
	  }
	}, {of: function() {
	    return $IndexedSeq(arguments);
	  }}, Seq);
	mixin(IndexedSeq, IndexedIterable.prototype);
	var SetSeq = function SetSeq(value) {
	  return (value === null || value === undefined ? emptySequence() : !isIterable(value) ? indexedSeqFromValue(value) : isKeyed(value) ? value.entrySeq() : value).toSetSeq();
	};
	var $SetSeq = SetSeq;
	($traceurRuntime.createClass)(SetSeq, {toSetSeq: function() {
	    return this;
	  }}, {of: function() {
	    return $SetSeq(arguments);
	  }}, Seq);
	mixin(SetSeq, SetIterable.prototype);
	Seq.isSeq = isSeq;
	Seq.Keyed = KeyedSeq;
	Seq.Set = SetSeq;
	Seq.Indexed = IndexedSeq;
	var IS_SEQ_SENTINEL = '@@__IMMUTABLE_SEQ__@@';
	Seq.prototype[IS_SEQ_SENTINEL] = true;
	var ArraySeq = function ArraySeq(array) {
	  this._array = array;
	  this.size = array.length;
	};
	($traceurRuntime.createClass)(ArraySeq, {
	  get: function(index, notSetValue) {
	    return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
	  },
	  __iterate: function(fn, reverse) {
	    var array = this._array;
	    var maxIndex = array.length - 1;
	    for (var ii = 0; ii <= maxIndex; ii++) {
	      if (fn(array[reverse ? maxIndex - ii : ii], ii, this) === false) {
	        return ii + 1;
	      }
	    }
	    return ii;
	  },
	  __iterator: function(type, reverse) {
	    var array = this._array;
	    var maxIndex = array.length - 1;
	    var ii = 0;
	    return new Iterator((function() {
	      return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii, array[reverse ? maxIndex - ii++ : ii++]);
	    }));
	  }
	}, {}, IndexedSeq);
	var ObjectSeq = function ObjectSeq(object) {
	  var keys = Object.keys(object);
	  this._object = object;
	  this._keys = keys;
	  this.size = keys.length;
	};
	($traceurRuntime.createClass)(ObjectSeq, {
	  get: function(key, notSetValue) {
	    if (notSetValue !== undefined && !this.has(key)) {
	      return notSetValue;
	    }
	    return this._object[key];
	  },
	  has: function(key) {
	    return this._object.hasOwnProperty(key);
	  },
	  __iterate: function(fn, reverse) {
	    var object = this._object;
	    var keys = this._keys;
	    var maxIndex = keys.length - 1;
	    for (var ii = 0; ii <= maxIndex; ii++) {
	      var key = keys[reverse ? maxIndex - ii : ii];
	      if (fn(object[key], key, this) === false) {
	        return ii + 1;
	      }
	    }
	    return ii;
	  },
	  __iterator: function(type, reverse) {
	    var object = this._object;
	    var keys = this._keys;
	    var maxIndex = keys.length - 1;
	    var ii = 0;
	    return new Iterator((function() {
	      var key = keys[reverse ? maxIndex - ii : ii];
	      return ii++ > maxIndex ? iteratorDone() : iteratorValue(type, key, object[key]);
	    }));
	  }
	}, {}, KeyedSeq);
	ObjectSeq.prototype[IS_ORDERED_SENTINEL] = true;
	var IterableSeq = function IterableSeq(iterable) {
	  this._iterable = iterable;
	  this.size = iterable.length || iterable.size;
	};
	($traceurRuntime.createClass)(IterableSeq, {
	  __iterateUncached: function(fn, reverse) {
	    if (reverse) {
	      return this.cacheResult().__iterate(fn, reverse);
	    }
	    var iterable = this._iterable;
	    var iterator = getIterator(iterable);
	    var iterations = 0;
	    if (isIterator(iterator)) {
	      var step;
	      while (!(step = iterator.next()).done) {
	        if (fn(step.value, iterations++, this) === false) {
	          break;
	        }
	      }
	    }
	    return iterations;
	  },
	  __iteratorUncached: function(type, reverse) {
	    if (reverse) {
	      return this.cacheResult().__iterator(type, reverse);
	    }
	    var iterable = this._iterable;
	    var iterator = getIterator(iterable);
	    if (!isIterator(iterator)) {
	      return new Iterator(iteratorDone);
	    }
	    var iterations = 0;
	    return new Iterator((function() {
	      var step = iterator.next();
	      return step.done ? step : iteratorValue(type, iterations++, step.value);
	    }));
	  }
	}, {}, IndexedSeq);
	var IteratorSeq = function IteratorSeq(iterator) {
	  this._iterator = iterator;
	  this._iteratorCache = [];
	};
	($traceurRuntime.createClass)(IteratorSeq, {
	  __iterateUncached: function(fn, reverse) {
	    if (reverse) {
	      return this.cacheResult().__iterate(fn, reverse);
	    }
	    var iterator = this._iterator;
	    var cache = this._iteratorCache;
	    var iterations = 0;
	    while (iterations < cache.length) {
	      if (fn(cache[iterations], iterations++, this) === false) {
	        return iterations;
	      }
	    }
	    var step;
	    while (!(step = iterator.next()).done) {
	      var val = step.value;
	      cache[iterations] = val;
	      if (fn(val, iterations++, this) === false) {
	        break;
	      }
	    }
	    return iterations;
	  },
	  __iteratorUncached: function(type, reverse) {
	    if (reverse) {
	      return this.cacheResult().__iterator(type, reverse);
	    }
	    var iterator = this._iterator;
	    var cache = this._iteratorCache;
	    var iterations = 0;
	    return new Iterator((function() {
	      if (iterations >= cache.length) {
	        var step = iterator.next();
	        if (step.done) {
	          return step;
	        }
	        cache[iterations] = step.value;
	      }
	      return iteratorValue(type, iterations, cache[iterations++]);
	    }));
	  }
	}, {}, IndexedSeq);
	function isSeq(maybeSeq) {
	  return !!(maybeSeq && maybeSeq[IS_SEQ_SENTINEL]);
	}
	var EMPTY_SEQ;
	function emptySequence() {
	  return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
	}
	function keyedSeqFromValue(value) {
	  var seq = Array.isArray(value) ? new ArraySeq(value).fromEntrySeq() : isIterator(value) ? new IteratorSeq(value).fromEntrySeq() : hasIterator(value) ? new IterableSeq(value).fromEntrySeq() : typeof value === 'object' ? new ObjectSeq(value) : undefined;
	  if (!seq) {
	    throw new TypeError('Expected Array or iterable object of [k, v] entries, ' + 'or keyed object: ' + value);
	  }
	  return seq;
	}
	function indexedSeqFromValue(value) {
	  var seq = maybeIndexedSeqFromValue(value);
	  if (!seq) {
	    throw new TypeError('Expected Array or iterable object of values: ' + value);
	  }
	  return seq;
	}
	function seqFromValue(value) {
	  var seq = maybeIndexedSeqFromValue(value) || (typeof value === 'object' && new ObjectSeq(value));
	  if (!seq) {
	    throw new TypeError('Expected Array or iterable object of values, or keyed object: ' + value);
	  }
	  return seq;
	}
	function maybeIndexedSeqFromValue(value) {
	  return (isArrayLike(value) ? new ArraySeq(value) : isIterator(value) ? new IteratorSeq(value) : hasIterator(value) ? new IterableSeq(value) : undefined);
	}
	function isArrayLike(value) {
	  return value && typeof value.length === 'number';
	}
	function seqIterate(seq, fn, reverse, useKeys) {
	  assertNotInfinite(seq.size);
	  var cache = seq._cache;
	  if (cache) {
	    var maxIndex = cache.length - 1;
	    for (var ii = 0; ii <= maxIndex; ii++) {
	      var entry = cache[reverse ? maxIndex - ii : ii];
	      if (fn(entry[1], useKeys ? entry[0] : ii, seq) === false) {
	        return ii + 1;
	      }
	    }
	    return ii;
	  }
	  return seq.__iterateUncached(fn, reverse);
	}
	function seqIterator(seq, type, reverse, useKeys) {
	  var cache = seq._cache;
	  if (cache) {
	    var maxIndex = cache.length - 1;
	    var ii = 0;
	    return new Iterator((function() {
	      var entry = cache[reverse ? maxIndex - ii : ii];
	      return ii++ > maxIndex ? iteratorDone() : iteratorValue(type, useKeys ? entry[0] : ii - 1, entry[1]);
	    }));
	  }
	  return seq.__iteratorUncached(type, reverse);
	}
	function fromJS(json, converter) {
	  return converter ? _fromJSWith(converter, json, '', {'': json}) : _fromJSDefault(json);
	}
	function _fromJSWith(converter, json, key, parentJSON) {
	  if (Array.isArray(json)) {
	    return converter.call(parentJSON, key, IndexedSeq(json).map((function(v, k) {
	      return _fromJSWith(converter, v, k, json);
	    })));
	  }
	  if (isPlainObj(json)) {
	    return converter.call(parentJSON, key, KeyedSeq(json).map((function(v, k) {
	      return _fromJSWith(converter, v, k, json);
	    })));
	  }
	  return json;
	}
	function _fromJSDefault(json) {
	  if (Array.isArray(json)) {
	    return IndexedSeq(json).map(_fromJSDefault).toList();
	  }
	  if (isPlainObj(json)) {
	    return KeyedSeq(json).map(_fromJSDefault).toMap();
	  }
	  return json;
	}
	function isPlainObj(value) {
	  return value && value.constructor === Object;
	}
	var Collection = function Collection() {
	  throw TypeError('Abstract');
	};
	($traceurRuntime.createClass)(Collection, {}, {}, Iterable);
	var KeyedCollection = function KeyedCollection() {
	  $traceurRuntime.defaultSuperCall(this, $KeyedCollection.prototype, arguments);
	};
	var $KeyedCollection = KeyedCollection;
	($traceurRuntime.createClass)(KeyedCollection, {}, {}, Collection);
	mixin(KeyedCollection, KeyedIterable.prototype);
	var IndexedCollection = function IndexedCollection() {
	  $traceurRuntime.defaultSuperCall(this, $IndexedCollection.prototype, arguments);
	};
	var $IndexedCollection = IndexedCollection;
	($traceurRuntime.createClass)(IndexedCollection, {}, {}, Collection);
	mixin(IndexedCollection, IndexedIterable.prototype);
	var SetCollection = function SetCollection() {
	  $traceurRuntime.defaultSuperCall(this, $SetCollection.prototype, arguments);
	};
	var $SetCollection = SetCollection;
	($traceurRuntime.createClass)(SetCollection, {}, {}, Collection);
	mixin(SetCollection, SetIterable.prototype);
	Collection.Keyed = KeyedCollection;
	Collection.Indexed = IndexedCollection;
	Collection.Set = SetCollection;
	var Map = function Map(value) {
	  return value === null || value === undefined ? emptyMap() : isMap(value) ? value : emptyMap().merge(KeyedIterable(value));
	};
	($traceurRuntime.createClass)(Map, {
	  toString: function() {
	    return this.__toString('Map {', '}');
	  },
	  get: function(k, notSetValue) {
	    return this._root ? this._root.get(0, undefined, k, notSetValue) : notSetValue;
	  },
	  set: function(k, v) {
	    return updateMap(this, k, v);
	  },
	  setIn: function(keyPath, v) {
	    invariant(keyPath.length > 0, 'Requires non-empty key path.');
	    return this.updateIn(keyPath, (function() {
	      return v;
	    }));
	  },
	  remove: function(k) {
	    return updateMap(this, k, NOT_SET);
	  },
	  removeIn: function(keyPath) {
	    invariant(keyPath.length > 0, 'Requires non-empty key path.');
	    return this.updateIn(keyPath, (function() {
	      return NOT_SET;
	    }));
	  },
	  update: function(k, notSetValue, updater) {
	    return arguments.length === 1 ? k(this) : this.updateIn([k], notSetValue, updater);
	  },
	  updateIn: function(keyPath, notSetValue, updater) {
	    if (!updater) {
	      updater = notSetValue;
	      notSetValue = undefined;
	    }
	    return keyPath.length === 0 ? updater(this) : updateInDeepMap(this, keyPath, notSetValue, updater, 0);
	  },
	  clear: function() {
	    if (this.size === 0) {
	      return this;
	    }
	    if (this.__ownerID) {
	      this.size = 0;
	      this._root = null;
	      this.__hash = undefined;
	      this.__altered = true;
	      return this;
	    }
	    return emptyMap();
	  },
	  merge: function() {
	    return mergeIntoMapWith(this, undefined, arguments);
	  },
	  mergeWith: function(merger) {
	    for (var iters = [],
	        $__3 = 1; $__3 < arguments.length; $__3++)
	      iters[$__3 - 1] = arguments[$__3];
	    return mergeIntoMapWith(this, merger, iters);
	  },
	  mergeDeep: function() {
	    return mergeIntoMapWith(this, deepMerger(undefined), arguments);
	  },
	  mergeDeepWith: function(merger) {
	    for (var iters = [],
	        $__4 = 1; $__4 < arguments.length; $__4++)
	      iters[$__4 - 1] = arguments[$__4];
	    return mergeIntoMapWith(this, deepMerger(merger), iters);
	  },
	  sort: function(comparator) {
	    return OrderedMap(sortFactory(this, comparator));
	  },
	  sortBy: function(mapper, comparator) {
	    return OrderedMap(sortFactory(this, comparator, mapper));
	  },
	  withMutations: function(fn) {
	    var mutable = this.asMutable();
	    fn(mutable);
	    return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
	  },
	  asMutable: function() {
	    return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
	  },
	  asImmutable: function() {
	    return this.__ensureOwner();
	  },
	  wasAltered: function() {
	    return this.__altered;
	  },
	  __iterator: function(type, reverse) {
	    return new MapIterator(this, type, reverse);
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    var iterations = 0;
	    this._root && this._root.iterate((function(entry) {
	      iterations++;
	      return fn(entry[1], entry[0], $__0);
	    }), reverse);
	    return iterations;
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      this.__altered = false;
	      return this;
	    }
	    return makeMap(this.size, this._root, ownerID, this.__hash);
	  }
	}, {}, KeyedCollection);
	function isMap(maybeMap) {
	  return !!(maybeMap && maybeMap[IS_MAP_SENTINEL]);
	}
	Map.isMap = isMap;
	var IS_MAP_SENTINEL = '@@__IMMUTABLE_MAP__@@';
	var MapPrototype = Map.prototype;
	MapPrototype[IS_MAP_SENTINEL] = true;
	MapPrototype[DELETE] = MapPrototype.remove;
	var ArrayMapNode = function ArrayMapNode(ownerID, entries) {
	  this.ownerID = ownerID;
	  this.entries = entries;
	};
	var $ArrayMapNode = ArrayMapNode;
	($traceurRuntime.createClass)(ArrayMapNode, {
	  get: function(shift, keyHash, key, notSetValue) {
	    var entries = this.entries;
	    for (var ii = 0,
	        len = entries.length; ii < len; ii++) {
	      if (is(key, entries[ii][0])) {
	        return entries[ii][1];
	      }
	    }
	    return notSetValue;
	  },
	  update: function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	    var removed = value === NOT_SET;
	    var entries = this.entries;
	    var idx = 0;
	    for (var len = entries.length; idx < len; idx++) {
	      if (is(key, entries[idx][0])) {
	        break;
	      }
	    }
	    var exists = idx < len;
	    if (exists ? entries[idx][1] === value : removed) {
	      return this;
	    }
	    SetRef(didAlter);
	    (removed || !exists) && SetRef(didChangeSize);
	    if (removed && entries.length === 1) {
	      return;
	    }
	    if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
	      return createNodes(ownerID, entries, key, value);
	    }
	    var isEditable = ownerID && ownerID === this.ownerID;
	    var newEntries = isEditable ? entries : arrCopy(entries);
	    if (exists) {
	      if (removed) {
	        idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
	      } else {
	        newEntries[idx] = [key, value];
	      }
	    } else {
	      newEntries.push([key, value]);
	    }
	    if (isEditable) {
	      this.entries = newEntries;
	      return this;
	    }
	    return new $ArrayMapNode(ownerID, newEntries);
	  }
	}, {});
	var BitmapIndexedNode = function BitmapIndexedNode(ownerID, bitmap, nodes) {
	  this.ownerID = ownerID;
	  this.bitmap = bitmap;
	  this.nodes = nodes;
	};
	var $BitmapIndexedNode = BitmapIndexedNode;
	($traceurRuntime.createClass)(BitmapIndexedNode, {
	  get: function(shift, keyHash, key, notSetValue) {
	    if (keyHash === undefined) {
	      keyHash = hash(key);
	    }
	    var bit = (1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK));
	    var bitmap = this.bitmap;
	    return (bitmap & bit) === 0 ? notSetValue : this.nodes[popCount(bitmap & (bit - 1))].get(shift + SHIFT, keyHash, key, notSetValue);
	  },
	  update: function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	    if (keyHash === undefined) {
	      keyHash = hash(key);
	    }
	    var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
	    var bit = 1 << keyHashFrag;
	    var bitmap = this.bitmap;
	    var exists = (bitmap & bit) !== 0;
	    if (!exists && value === NOT_SET) {
	      return this;
	    }
	    var idx = popCount(bitmap & (bit - 1));
	    var nodes = this.nodes;
	    var node = exists ? nodes[idx] : undefined;
	    var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
	    if (newNode === node) {
	      return this;
	    }
	    if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
	      return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
	    }
	    if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
	      return nodes[idx ^ 1];
	    }
	    if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
	      return newNode;
	    }
	    var isEditable = ownerID && ownerID === this.ownerID;
	    var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
	    var newNodes = exists ? newNode ? setIn(nodes, idx, newNode, isEditable) : spliceOut(nodes, idx, isEditable) : spliceIn(nodes, idx, newNode, isEditable);
	    if (isEditable) {
	      this.bitmap = newBitmap;
	      this.nodes = newNodes;
	      return this;
	    }
	    return new $BitmapIndexedNode(ownerID, newBitmap, newNodes);
	  }
	}, {});
	var HashArrayMapNode = function HashArrayMapNode(ownerID, count, nodes) {
	  this.ownerID = ownerID;
	  this.count = count;
	  this.nodes = nodes;
	};
	var $HashArrayMapNode = HashArrayMapNode;
	($traceurRuntime.createClass)(HashArrayMapNode, {
	  get: function(shift, keyHash, key, notSetValue) {
	    if (keyHash === undefined) {
	      keyHash = hash(key);
	    }
	    var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
	    var node = this.nodes[idx];
	    return node ? node.get(shift + SHIFT, keyHash, key, notSetValue) : notSetValue;
	  },
	  update: function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	    if (keyHash === undefined) {
	      keyHash = hash(key);
	    }
	    var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
	    var removed = value === NOT_SET;
	    var nodes = this.nodes;
	    var node = nodes[idx];
	    if (removed && !node) {
	      return this;
	    }
	    var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
	    if (newNode === node) {
	      return this;
	    }
	    var newCount = this.count;
	    if (!node) {
	      newCount++;
	    } else if (!newNode) {
	      newCount--;
	      if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
	        return packNodes(ownerID, nodes, newCount, idx);
	      }
	    }
	    var isEditable = ownerID && ownerID === this.ownerID;
	    var newNodes = setIn(nodes, idx, newNode, isEditable);
	    if (isEditable) {
	      this.count = newCount;
	      this.nodes = newNodes;
	      return this;
	    }
	    return new $HashArrayMapNode(ownerID, newCount, newNodes);
	  }
	}, {});
	var HashCollisionNode = function HashCollisionNode(ownerID, keyHash, entries) {
	  this.ownerID = ownerID;
	  this.keyHash = keyHash;
	  this.entries = entries;
	};
	var $HashCollisionNode = HashCollisionNode;
	($traceurRuntime.createClass)(HashCollisionNode, {
	  get: function(shift, keyHash, key, notSetValue) {
	    var entries = this.entries;
	    for (var ii = 0,
	        len = entries.length; ii < len; ii++) {
	      if (is(key, entries[ii][0])) {
	        return entries[ii][1];
	      }
	    }
	    return notSetValue;
	  },
	  update: function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	    if (keyHash === undefined) {
	      keyHash = hash(key);
	    }
	    var removed = value === NOT_SET;
	    if (keyHash !== this.keyHash) {
	      if (removed) {
	        return this;
	      }
	      SetRef(didAlter);
	      SetRef(didChangeSize);
	      return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
	    }
	    var entries = this.entries;
	    var idx = 0;
	    for (var len = entries.length; idx < len; idx++) {
	      if (is(key, entries[idx][0])) {
	        break;
	      }
	    }
	    var exists = idx < len;
	    if (exists ? entries[idx][1] === value : removed) {
	      return this;
	    }
	    SetRef(didAlter);
	    (removed || !exists) && SetRef(didChangeSize);
	    if (removed && len === 2) {
	      return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
	    }
	    var isEditable = ownerID && ownerID === this.ownerID;
	    var newEntries = isEditable ? entries : arrCopy(entries);
	    if (exists) {
	      if (removed) {
	        idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
	      } else {
	        newEntries[idx] = [key, value];
	      }
	    } else {
	      newEntries.push([key, value]);
	    }
	    if (isEditable) {
	      this.entries = newEntries;
	      return this;
	    }
	    return new $HashCollisionNode(ownerID, this.keyHash, newEntries);
	  }
	}, {});
	var ValueNode = function ValueNode(ownerID, keyHash, entry) {
	  this.ownerID = ownerID;
	  this.keyHash = keyHash;
	  this.entry = entry;
	};
	var $ValueNode = ValueNode;
	($traceurRuntime.createClass)(ValueNode, {
	  get: function(shift, keyHash, key, notSetValue) {
	    return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
	  },
	  update: function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	    var removed = value === NOT_SET;
	    var keyMatch = is(key, this.entry[0]);
	    if (keyMatch ? value === this.entry[1] : removed) {
	      return this;
	    }
	    SetRef(didAlter);
	    if (removed) {
	      SetRef(didChangeSize);
	      return;
	    }
	    if (keyMatch) {
	      if (ownerID && ownerID === this.ownerID) {
	        this.entry[1] = value;
	        return this;
	      }
	      return new $ValueNode(ownerID, this.keyHash, [key, value]);
	    }
	    SetRef(didChangeSize);
	    return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
	  }
	}, {});
	ArrayMapNode.prototype.iterate = HashCollisionNode.prototype.iterate = function(fn, reverse) {
	  var entries = this.entries;
	  for (var ii = 0,
	      maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
	    if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
	      return false;
	    }
	  }
	};
	BitmapIndexedNode.prototype.iterate = HashArrayMapNode.prototype.iterate = function(fn, reverse) {
	  var nodes = this.nodes;
	  for (var ii = 0,
	      maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
	    var node = nodes[reverse ? maxIndex - ii : ii];
	    if (node && node.iterate(fn, reverse) === false) {
	      return false;
	    }
	  }
	};
	ValueNode.prototype.iterate = function(fn, reverse) {
	  return fn(this.entry);
	};
	var MapIterator = function MapIterator(map, type, reverse) {
	  this._type = type;
	  this._reverse = reverse;
	  this._stack = map._root && mapIteratorFrame(map._root);
	};
	($traceurRuntime.createClass)(MapIterator, {next: function() {
	    var type = this._type;
	    var stack = this._stack;
	    while (stack) {
	      var node = stack.node;
	      var index = stack.index++;
	      var maxIndex;
	      if (node.entry) {
	        if (index === 0) {
	          return mapIteratorValue(type, node.entry);
	        }
	      } else if (node.entries) {
	        maxIndex = node.entries.length - 1;
	        if (index <= maxIndex) {
	          return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
	        }
	      } else {
	        maxIndex = node.nodes.length - 1;
	        if (index <= maxIndex) {
	          var subNode = node.nodes[this._reverse ? maxIndex - index : index];
	          if (subNode) {
	            if (subNode.entry) {
	              return mapIteratorValue(type, subNode.entry);
	            }
	            stack = this._stack = mapIteratorFrame(subNode, stack);
	          }
	          continue;
	        }
	      }
	      stack = this._stack = this._stack.__prev;
	    }
	    return iteratorDone();
	  }}, {}, Iterator);
	function mapIteratorValue(type, entry) {
	  return iteratorValue(type, entry[0], entry[1]);
	}
	function mapIteratorFrame(node, prev) {
	  return {
	    node: node,
	    index: 0,
	    __prev: prev
	  };
	}
	function makeMap(size, root, ownerID, hash) {
	  var map = Object.create(MapPrototype);
	  map.size = size;
	  map._root = root;
	  map.__ownerID = ownerID;
	  map.__hash = hash;
	  map.__altered = false;
	  return map;
	}
	var EMPTY_MAP;
	function emptyMap() {
	  return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
	}
	function updateMap(map, k, v) {
	  var newRoot;
	  var newSize;
	  if (!map._root) {
	    if (v === NOT_SET) {
	      return map;
	    }
	    newSize = 1;
	    newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
	  } else {
	    var didChangeSize = MakeRef(CHANGE_LENGTH);
	    var didAlter = MakeRef(DID_ALTER);
	    newRoot = updateNode(map._root, map.__ownerID, 0, undefined, k, v, didChangeSize, didAlter);
	    if (!didAlter.value) {
	      return map;
	    }
	    newSize = map.size + (didChangeSize.value ? v === NOT_SET ? -1 : 1 : 0);
	  }
	  if (map.__ownerID) {
	    map.size = newSize;
	    map._root = newRoot;
	    map.__hash = undefined;
	    map.__altered = true;
	    return map;
	  }
	  return newRoot ? makeMap(newSize, newRoot) : emptyMap();
	}
	function updateNode(node, ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	  if (!node) {
	    if (value === NOT_SET) {
	      return node;
	    }
	    SetRef(didAlter);
	    SetRef(didChangeSize);
	    return new ValueNode(ownerID, keyHash, [key, value]);
	  }
	  return node.update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter);
	}
	function isLeafNode(node) {
	  return node.constructor === ValueNode || node.constructor === HashCollisionNode;
	}
	function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
	  if (node.keyHash === keyHash) {
	    return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
	  }
	  var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
	  var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
	  var newNode;
	  var nodes = idx1 === idx2 ? [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)] : ((newNode = new ValueNode(ownerID, keyHash, entry)), idx1 < idx2 ? [node, newNode] : [newNode, node]);
	  return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
	}
	function createNodes(ownerID, entries, key, value) {
	  if (!ownerID) {
	    ownerID = new OwnerID();
	  }
	  var node = new ValueNode(ownerID, hash(key), [key, value]);
	  for (var ii = 0; ii < entries.length; ii++) {
	    var entry = entries[ii];
	    node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
	  }
	  return node;
	}
	function packNodes(ownerID, nodes, count, excluding) {
	  var bitmap = 0;
	  var packedII = 0;
	  var packedNodes = new Array(count);
	  for (var ii = 0,
	      bit = 1,
	      len = nodes.length; ii < len; ii++, bit <<= 1) {
	    var node = nodes[ii];
	    if (node !== undefined && ii !== excluding) {
	      bitmap |= bit;
	      packedNodes[packedII++] = node;
	    }
	  }
	  return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
	}
	function expandNodes(ownerID, nodes, bitmap, including, node) {
	  var count = 0;
	  var expandedNodes = new Array(SIZE);
	  for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
	    expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
	  }
	  expandedNodes[including] = node;
	  return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
	}
	function mergeIntoMapWith(map, merger, iterables) {
	  var iters = [];
	  for (var ii = 0; ii < iterables.length; ii++) {
	    var value = iterables[ii];
	    var iter = KeyedIterable(value);
	    if (!isIterable(value)) {
	      iter = iter.map((function(v) {
	        return fromJS(v);
	      }));
	    }
	    iters.push(iter);
	  }
	  return mergeIntoCollectionWith(map, merger, iters);
	}
	function deepMerger(merger) {
	  return (function(existing, value) {
	    return existing && existing.mergeDeepWith && isIterable(value) ? existing.mergeDeepWith(merger, value) : merger ? merger(existing, value) : value;
	  });
	}
	function mergeIntoCollectionWith(collection, merger, iters) {
	  if (iters.length === 0) {
	    return collection;
	  }
	  return collection.withMutations((function(collection) {
	    var mergeIntoMap = merger ? (function(value, key) {
	      collection.update(key, NOT_SET, (function(existing) {
	        return existing === NOT_SET ? value : merger(existing, value);
	      }));
	    }) : (function(value, key) {
	      collection.set(key, value);
	    });
	    for (var ii = 0; ii < iters.length; ii++) {
	      iters[ii].forEach(mergeIntoMap);
	    }
	  }));
	}
	function updateInDeepMap(collection, keyPath, notSetValue, updater, offset) {
	  invariant(!collection || collection.set, 'updateIn with invalid keyPath');
	  var key = keyPath[offset];
	  var existing = collection ? collection.get(key, NOT_SET) : NOT_SET;
	  var existingValue = existing === NOT_SET ? undefined : existing;
	  var value = offset === keyPath.length - 1 ? updater(existing === NOT_SET ? notSetValue : existing) : updateInDeepMap(existingValue, keyPath, notSetValue, updater, offset + 1);
	  return value === existingValue ? collection : value === NOT_SET ? collection && collection.remove(key) : (collection || emptyMap()).set(key, value);
	}
	function popCount(x) {
	  x = x - ((x >> 1) & 0x55555555);
	  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
	  x = (x + (x >> 4)) & 0x0f0f0f0f;
	  x = x + (x >> 8);
	  x = x + (x >> 16);
	  return x & 0x7f;
	}
	function setIn(array, idx, val, canEdit) {
	  var newArray = canEdit ? array : arrCopy(array);
	  newArray[idx] = val;
	  return newArray;
	}
	function spliceIn(array, idx, val, canEdit) {
	  var newLen = array.length + 1;
	  if (canEdit && idx + 1 === newLen) {
	    array[idx] = val;
	    return array;
	  }
	  var newArray = new Array(newLen);
	  var after = 0;
	  for (var ii = 0; ii < newLen; ii++) {
	    if (ii === idx) {
	      newArray[ii] = val;
	      after = -1;
	    } else {
	      newArray[ii] = array[ii + after];
	    }
	  }
	  return newArray;
	}
	function spliceOut(array, idx, canEdit) {
	  var newLen = array.length - 1;
	  if (canEdit && idx === newLen) {
	    array.pop();
	    return array;
	  }
	  var newArray = new Array(newLen);
	  var after = 0;
	  for (var ii = 0; ii < newLen; ii++) {
	    if (ii === idx) {
	      after = 1;
	    }
	    newArray[ii] = array[ii + after];
	  }
	  return newArray;
	}
	var MAX_ARRAY_MAP_SIZE = SIZE / 4;
	var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
	var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;
	var ToKeyedSequence = function ToKeyedSequence(indexed, useKeys) {
	  this._iter = indexed;
	  this._useKeys = useKeys;
	  this.size = indexed.size;
	};
	($traceurRuntime.createClass)(ToKeyedSequence, {
	  get: function(key, notSetValue) {
	    return this._iter.get(key, notSetValue);
	  },
	  has: function(key) {
	    return this._iter.has(key);
	  },
	  valueSeq: function() {
	    return this._iter.valueSeq();
	  },
	  reverse: function() {
	    var $__0 = this;
	    var reversedSequence = reverseFactory(this, true);
	    if (!this._useKeys) {
	      reversedSequence.valueSeq = (function() {
	        return $__0._iter.toSeq().reverse();
	      });
	    }
	    return reversedSequence;
	  },
	  map: function(mapper, context) {
	    var $__0 = this;
	    var mappedSequence = mapFactory(this, mapper, context);
	    if (!this._useKeys) {
	      mappedSequence.valueSeq = (function() {
	        return $__0._iter.toSeq().map(mapper, context);
	      });
	    }
	    return mappedSequence;
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    var ii;
	    return this._iter.__iterate(this._useKeys ? (function(v, k) {
	      return fn(v, k, $__0);
	    }) : ((ii = reverse ? resolveSize(this) : 0), (function(v) {
	      return fn(v, reverse ? --ii : ii++, $__0);
	    })), reverse);
	  },
	  __iterator: function(type, reverse) {
	    if (this._useKeys) {
	      return this._iter.__iterator(type, reverse);
	    }
	    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
	    var ii = reverse ? resolveSize(this) : 0;
	    return new Iterator((function() {
	      var step = iterator.next();
	      return step.done ? step : iteratorValue(type, reverse ? --ii : ii++, step.value, step);
	    }));
	  }
	}, {}, KeyedSeq);
	ToKeyedSequence.prototype[IS_ORDERED_SENTINEL] = true;
	var ToIndexedSequence = function ToIndexedSequence(iter) {
	  this._iter = iter;
	  this.size = iter.size;
	};
	($traceurRuntime.createClass)(ToIndexedSequence, {
	  contains: function(value) {
	    return this._iter.contains(value);
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    var iterations = 0;
	    return this._iter.__iterate((function(v) {
	      return fn(v, iterations++, $__0);
	    }), reverse);
	  },
	  __iterator: function(type, reverse) {
	    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
	    var iterations = 0;
	    return new Iterator((function() {
	      var step = iterator.next();
	      return step.done ? step : iteratorValue(type, iterations++, step.value, step);
	    }));
	  }
	}, {}, IndexedSeq);
	var ToSetSequence = function ToSetSequence(iter) {
	  this._iter = iter;
	  this.size = iter.size;
	};
	($traceurRuntime.createClass)(ToSetSequence, {
	  has: function(key) {
	    return this._iter.contains(key);
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    return this._iter.__iterate((function(v) {
	      return fn(v, v, $__0);
	    }), reverse);
	  },
	  __iterator: function(type, reverse) {
	    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
	    return new Iterator((function() {
	      var step = iterator.next();
	      return step.done ? step : iteratorValue(type, step.value, step.value, step);
	    }));
	  }
	}, {}, SetSeq);
	var FromEntriesSequence = function FromEntriesSequence(entries) {
	  this._iter = entries;
	  this.size = entries.size;
	};
	($traceurRuntime.createClass)(FromEntriesSequence, {
	  entrySeq: function() {
	    return this._iter.toSeq();
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    return this._iter.__iterate((function(entry) {
	      if (entry) {
	        validateEntry(entry);
	        return fn(entry[1], entry[0], $__0);
	      }
	    }), reverse);
	  },
	  __iterator: function(type, reverse) {
	    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
	    return new Iterator((function() {
	      while (true) {
	        var step = iterator.next();
	        if (step.done) {
	          return step;
	        }
	        var entry = step.value;
	        if (entry) {
	          validateEntry(entry);
	          return type === ITERATE_ENTRIES ? step : iteratorValue(type, entry[0], entry[1], step);
	        }
	      }
	    }));
	  }
	}, {}, KeyedSeq);
	ToIndexedSequence.prototype.cacheResult = ToKeyedSequence.prototype.cacheResult = ToSetSequence.prototype.cacheResult = FromEntriesSequence.prototype.cacheResult = cacheResultThrough;
	function flipFactory(iterable) {
	  var flipSequence = makeSequence(iterable);
	  flipSequence._iter = iterable;
	  flipSequence.size = iterable.size;
	  flipSequence.flip = (function() {
	    return iterable;
	  });
	  flipSequence.reverse = function() {
	    var reversedSequence = iterable.reverse.apply(this);
	    reversedSequence.flip = (function() {
	      return iterable.reverse();
	    });
	    return reversedSequence;
	  };
	  flipSequence.has = (function(key) {
	    return iterable.contains(key);
	  });
	  flipSequence.contains = (function(key) {
	    return iterable.has(key);
	  });
	  flipSequence.cacheResult = cacheResultThrough;
	  flipSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    return iterable.__iterate((function(v, k) {
	      return fn(k, v, $__0) !== false;
	    }), reverse);
	  };
	  flipSequence.__iteratorUncached = function(type, reverse) {
	    if (type === ITERATE_ENTRIES) {
	      var iterator = iterable.__iterator(type, reverse);
	      return new Iterator((function() {
	        var step = iterator.next();
	        if (!step.done) {
	          var k = step.value[0];
	          step.value[0] = step.value[1];
	          step.value[1] = k;
	        }
	        return step;
	      }));
	    }
	    return iterable.__iterator(type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES, reverse);
	  };
	  return flipSequence;
	}
	function mapFactory(iterable, mapper, context) {
	  var mappedSequence = makeSequence(iterable);
	  mappedSequence.size = iterable.size;
	  mappedSequence.has = (function(key) {
	    return iterable.has(key);
	  });
	  mappedSequence.get = (function(key, notSetValue) {
	    var v = iterable.get(key, NOT_SET);
	    return v === NOT_SET ? notSetValue : mapper.call(context, v, key, iterable);
	  });
	  mappedSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    return iterable.__iterate((function(v, k, c) {
	      return fn(mapper.call(context, v, k, c), k, $__0) !== false;
	    }), reverse);
	  };
	  mappedSequence.__iteratorUncached = function(type, reverse) {
	    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
	    return new Iterator((function() {
	      var step = iterator.next();
	      if (step.done) {
	        return step;
	      }
	      var entry = step.value;
	      var key = entry[0];
	      return iteratorValue(type, key, mapper.call(context, entry[1], key, iterable), step);
	    }));
	  };
	  return mappedSequence;
	}
	function reverseFactory(iterable, useKeys) {
	  var reversedSequence = makeSequence(iterable);
	  reversedSequence._iter = iterable;
	  reversedSequence.size = iterable.size;
	  reversedSequence.reverse = (function() {
	    return iterable;
	  });
	  if (iterable.flip) {
	    reversedSequence.flip = function() {
	      var flipSequence = flipFactory(iterable);
	      flipSequence.reverse = (function() {
	        return iterable.flip();
	      });
	      return flipSequence;
	    };
	  }
	  reversedSequence.get = (function(key, notSetValue) {
	    return iterable.get(useKeys ? key : -1 - key, notSetValue);
	  });
	  reversedSequence.has = (function(key) {
	    return iterable.has(useKeys ? key : -1 - key);
	  });
	  reversedSequence.contains = (function(value) {
	    return iterable.contains(value);
	  });
	  reversedSequence.cacheResult = cacheResultThrough;
	  reversedSequence.__iterate = function(fn, reverse) {
	    var $__0 = this;
	    return iterable.__iterate((function(v, k) {
	      return fn(v, k, $__0);
	    }), !reverse);
	  };
	  reversedSequence.__iterator = (function(type, reverse) {
	    return iterable.__iterator(type, !reverse);
	  });
	  return reversedSequence;
	}
	function filterFactory(iterable, predicate, context, useKeys) {
	  var filterSequence = makeSequence(iterable);
	  if (useKeys) {
	    filterSequence.has = (function(key) {
	      var v = iterable.get(key, NOT_SET);
	      return v !== NOT_SET && !!predicate.call(context, v, key, iterable);
	    });
	    filterSequence.get = (function(key, notSetValue) {
	      var v = iterable.get(key, NOT_SET);
	      return v !== NOT_SET && predicate.call(context, v, key, iterable) ? v : notSetValue;
	    });
	  }
	  filterSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    var iterations = 0;
	    iterable.__iterate((function(v, k, c) {
	      if (predicate.call(context, v, k, c)) {
	        iterations++;
	        return fn(v, useKeys ? k : iterations - 1, $__0);
	      }
	    }), reverse);
	    return iterations;
	  };
	  filterSequence.__iteratorUncached = function(type, reverse) {
	    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
	    var iterations = 0;
	    return new Iterator((function() {
	      while (true) {
	        var step = iterator.next();
	        if (step.done) {
	          return step;
	        }
	        var entry = step.value;
	        var key = entry[0];
	        var value = entry[1];
	        if (predicate.call(context, value, key, iterable)) {
	          return iteratorValue(type, useKeys ? key : iterations++, value, step);
	        }
	      }
	    }));
	  };
	  return filterSequence;
	}
	function countByFactory(iterable, grouper, context) {
	  var groups = Map().asMutable();
	  iterable.__iterate((function(v, k) {
	    groups.update(grouper.call(context, v, k, iterable), 0, (function(a) {
	      return a + 1;
	    }));
	  }));
	  return groups.asImmutable();
	}
	function groupByFactory(iterable, grouper, context) {
	  var isKeyedIter = isKeyed(iterable);
	  var groups = Map().asMutable();
	  iterable.__iterate((function(v, k) {
	    groups.update(grouper.call(context, v, k, iterable), [], (function(a) {
	      return (a.push(isKeyedIter ? [k, v] : v), a);
	    }));
	  }));
	  var coerce = iterableClass(iterable);
	  return groups.map((function(arr) {
	    return reify(iterable, coerce(arr));
	  }));
	}
	function takeFactory(iterable, amount) {
	  if (amount > iterable.size) {
	    return iterable;
	  }
	  if (amount < 0) {
	    amount = 0;
	  }
	  var takeSequence = makeSequence(iterable);
	  takeSequence.size = iterable.size && Math.min(iterable.size, amount);
	  takeSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    if (amount === 0) {
	      return 0;
	    }
	    if (reverse) {
	      return this.cacheResult().__iterate(fn, reverse);
	    }
	    var iterations = 0;
	    iterable.__iterate((function(v, k) {
	      return ++iterations && fn(v, k, $__0) !== false && iterations < amount;
	    }));
	    return iterations;
	  };
	  takeSequence.__iteratorUncached = function(type, reverse) {
	    if (reverse) {
	      return this.cacheResult().__iterator(type, reverse);
	    }
	    var iterator = amount && iterable.__iterator(type, reverse);
	    var iterations = 0;
	    return new Iterator((function() {
	      if (iterations++ > amount) {
	        return iteratorDone();
	      }
	      return iterator.next();
	    }));
	  };
	  return takeSequence;
	}
	function takeWhileFactory(iterable, predicate, context) {
	  var takeSequence = makeSequence(iterable);
	  takeSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    if (reverse) {
	      return this.cacheResult().__iterate(fn, reverse);
	    }
	    var iterations = 0;
	    iterable.__iterate((function(v, k, c) {
	      return predicate.call(context, v, k, c) && ++iterations && fn(v, k, $__0);
	    }));
	    return iterations;
	  };
	  takeSequence.__iteratorUncached = function(type, reverse) {
	    var $__0 = this;
	    if (reverse) {
	      return this.cacheResult().__iterator(type, reverse);
	    }
	    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
	    var iterating = true;
	    return new Iterator((function() {
	      if (!iterating) {
	        return iteratorDone();
	      }
	      var step = iterator.next();
	      if (step.done) {
	        return step;
	      }
	      var entry = step.value;
	      var k = entry[0];
	      var v = entry[1];
	      if (!predicate.call(context, v, k, $__0)) {
	        iterating = false;
	        return iteratorDone();
	      }
	      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
	    }));
	  };
	  return takeSequence;
	}
	function skipFactory(iterable, amount, useKeys) {
	  if (amount <= 0) {
	    return iterable;
	  }
	  var skipSequence = makeSequence(iterable);
	  skipSequence.size = iterable.size && Math.max(0, iterable.size - amount);
	  skipSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    if (reverse) {
	      return this.cacheResult().__iterate(fn, reverse);
	    }
	    var skipped = 0;
	    var isSkipping = true;
	    var iterations = 0;
	    iterable.__iterate((function(v, k) {
	      if (!(isSkipping && (isSkipping = skipped++ < amount))) {
	        iterations++;
	        return fn(v, useKeys ? k : iterations - 1, $__0);
	      }
	    }));
	    return iterations;
	  };
	  skipSequence.__iteratorUncached = function(type, reverse) {
	    if (reverse) {
	      return this.cacheResult().__iterator(type, reverse);
	    }
	    var iterator = amount && iterable.__iterator(type, reverse);
	    var skipped = 0;
	    var iterations = 0;
	    return new Iterator((function() {
	      while (skipped < amount) {
	        skipped++;
	        iterator.next();
	      }
	      var step = iterator.next();
	      if (useKeys || type === ITERATE_VALUES) {
	        return step;
	      } else if (type === ITERATE_KEYS) {
	        return iteratorValue(type, iterations++, undefined, step);
	      } else {
	        return iteratorValue(type, iterations++, step.value[1], step);
	      }
	    }));
	  };
	  return skipSequence;
	}
	function skipWhileFactory(iterable, predicate, context, useKeys) {
	  var skipSequence = makeSequence(iterable);
	  skipSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    if (reverse) {
	      return this.cacheResult().__iterate(fn, reverse);
	    }
	    var isSkipping = true;
	    var iterations = 0;
	    iterable.__iterate((function(v, k, c) {
	      if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
	        iterations++;
	        return fn(v, useKeys ? k : iterations - 1, $__0);
	      }
	    }));
	    return iterations;
	  };
	  skipSequence.__iteratorUncached = function(type, reverse) {
	    var $__0 = this;
	    if (reverse) {
	      return this.cacheResult().__iterator(type, reverse);
	    }
	    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
	    var skipping = true;
	    var iterations = 0;
	    return new Iterator((function() {
	      var step,
	          k,
	          v;
	      do {
	        step = iterator.next();
	        if (step.done) {
	          if (useKeys || type === ITERATE_VALUES) {
	            return step;
	          } else if (type === ITERATE_KEYS) {
	            return iteratorValue(type, iterations++, undefined, step);
	          } else {
	            return iteratorValue(type, iterations++, step.value[1], step);
	          }
	        }
	        var entry = step.value;
	        k = entry[0];
	        v = entry[1];
	        skipping && (skipping = predicate.call(context, v, k, $__0));
	      } while (skipping);
	      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
	    }));
	  };
	  return skipSequence;
	}
	function concatFactory(iterable, values) {
	  var isKeyedIterable = isKeyed(iterable);
	  var iters = new ArraySeq([iterable].concat(values)).map((function(v) {
	    if (!isIterable(v)) {
	      v = isKeyedIterable ? keyedSeqFromValue(v) : indexedSeqFromValue(Array.isArray(v) ? v : [v]);
	    } else if (isKeyedIterable) {
	      v = KeyedIterable(v);
	    }
	    return v;
	  }));
	  if (isKeyedIterable) {
	    iters = iters.toKeyedSeq();
	  } else if (!isIndexed(iterable)) {
	    iters = iters.toSetSeq();
	  }
	  var flat = iters.flatten(true);
	  flat.size = iters.reduce((function(sum, seq) {
	    if (sum !== undefined) {
	      var size = seq.size;
	      if (size !== undefined) {
	        return sum + size;
	      }
	    }
	  }), 0);
	  return flat;
	}
	function flattenFactory(iterable, depth, useKeys) {
	  var flatSequence = makeSequence(iterable);
	  flatSequence.__iterateUncached = function(fn, reverse) {
	    var iterations = 0;
	    var stopped = false;
	    function flatDeep(iter, currentDepth) {
	      var $__0 = this;
	      iter.__iterate((function(v, k) {
	        if ((!depth || currentDepth < depth) && isIterable(v)) {
	          flatDeep(v, currentDepth + 1);
	        } else if (fn(v, useKeys ? k : iterations++, $__0) === false) {
	          stopped = true;
	        }
	        return !stopped;
	      }), reverse);
	    }
	    flatDeep(iterable, 0);
	    return iterations;
	  };
	  flatSequence.__iteratorUncached = function(type, reverse) {
	    var iterator = iterable.__iterator(type, reverse);
	    var stack = [];
	    var iterations = 0;
	    return new Iterator((function() {
	      while (iterator) {
	        var step = iterator.next();
	        if (step.done !== false) {
	          iterator = stack.pop();
	          continue;
	        }
	        var v = step.value;
	        if (type === ITERATE_ENTRIES) {
	          v = v[1];
	        }
	        if ((!depth || stack.length < depth) && isIterable(v)) {
	          stack.push(iterator);
	          iterator = v.__iterator(type, reverse);
	        } else {
	          return useKeys ? step : iteratorValue(type, iterations++, v, step);
	        }
	      }
	      return iteratorDone();
	    }));
	  };
	  return flatSequence;
	}
	function flatMapFactory(iterable, mapper, context) {
	  var coerce = iterableClass(iterable);
	  return iterable.toSeq().map((function(v, k) {
	    return coerce(mapper.call(context, v, k, iterable));
	  })).flatten(true);
	}
	function interposeFactory(iterable, separator) {
	  var interposedSequence = makeSequence(iterable);
	  interposedSequence.size = iterable.size && iterable.size * 2 - 1;
	  interposedSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    var iterations = 0;
	    iterable.__iterate((function(v, k) {
	      return (!iterations || fn(separator, iterations++, $__0) !== false) && fn(v, iterations++, $__0) !== false;
	    }), reverse);
	    return iterations;
	  };
	  interposedSequence.__iteratorUncached = function(type, reverse) {
	    var iterator = iterable.__iterator(ITERATE_VALUES, reverse);
	    var iterations = 0;
	    var step;
	    return new Iterator((function() {
	      if (!step || iterations % 2) {
	        step = iterator.next();
	        if (step.done) {
	          return step;
	        }
	      }
	      return iterations % 2 ? iteratorValue(type, iterations++, separator) : iteratorValue(type, iterations++, step.value, step);
	    }));
	  };
	  return interposedSequence;
	}
	function sortFactory(iterable, comparator, mapper) {
	  if (!comparator) {
	    comparator = defaultComparator;
	  }
	  var isKeyedIterable = isKeyed(iterable);
	  var index = 0;
	  var entries = iterable.toSeq().map((function(v, k) {
	    return [k, v, index++, mapper ? mapper(v, k, iterable) : v];
	  })).toArray();
	  entries.sort((function(a, b) {
	    return comparator(a[3], b[3]) || a[2] - b[2];
	  })).forEach(isKeyedIterable ? (function(v, i) {
	    entries[i].length = 2;
	  }) : (function(v, i) {
	    entries[i] = v[1];
	  }));
	  return isKeyedIterable ? KeyedSeq(entries) : isIndexed(iterable) ? IndexedSeq(entries) : SetSeq(entries);
	}
	function maxFactory(iterable, comparator, mapper) {
	  if (!comparator) {
	    comparator = defaultComparator;
	  }
	  if (mapper) {
	    var entry = iterable.toSeq().map((function(v, k) {
	      return [v, mapper(v, k, iterable)];
	    })).reduce((function(max, next) {
	      return comparator(next[1], max[1]) > 0 ? next : max;
	    }));
	    return entry && entry[0];
	  } else {
	    return iterable.reduce((function(max, next) {
	      return comparator(next, max) > 0 ? next : max;
	    }));
	  }
	}
	function reify(iter, seq) {
	  return isSeq(iter) ? seq : iter.constructor(seq);
	}
	function validateEntry(entry) {
	  if (entry !== Object(entry)) {
	    throw new TypeError('Expected [K, V] tuple: ' + entry);
	  }
	}
	function resolveSize(iter) {
	  assertNotInfinite(iter.size);
	  return ensureSize(iter);
	}
	function iterableClass(iterable) {
	  return isKeyed(iterable) ? KeyedIterable : isIndexed(iterable) ? IndexedIterable : SetIterable;
	}
	function makeSequence(iterable) {
	  return Object.create((isKeyed(iterable) ? KeyedSeq : isIndexed(iterable) ? IndexedSeq : SetSeq).prototype);
	}
	function cacheResultThrough() {
	  if (this._iter.cacheResult) {
	    this._iter.cacheResult();
	    this.size = this._iter.size;
	    return this;
	  } else {
	    return Seq.prototype.cacheResult.call(this);
	  }
	}
	function defaultComparator(a, b) {
	  return a > b ? 1 : a < b ? -1 : 0;
	}
	var List = function List(value) {
	  var empty = emptyList();
	  if (value === null || value === undefined) {
	    return empty;
	  }
	  if (isList(value)) {
	    return value;
	  }
	  value = IndexedIterable(value);
	  var size = value.size;
	  if (size === 0) {
	    return empty;
	  }
	  if (size > 0 && size < SIZE) {
	    return makeList(0, size, SHIFT, null, new VNode(value.toArray()));
	  }
	  return empty.merge(value);
	};
	($traceurRuntime.createClass)(List, {
	  toString: function() {
	    return this.__toString('List [', ']');
	  },
	  get: function(index, notSetValue) {
	    index = wrapIndex(this, index);
	    if (index < 0 || index >= this.size) {
	      return notSetValue;
	    }
	    index += this._origin;
	    var node = listNodeFor(this, index);
	    return node && node.array[index & MASK];
	  },
	  set: function(index, value) {
	    return updateList(this, index, value);
	  },
	  remove: function(index) {
	    return !this.has(index) ? this : index === 0 ? this.shift() : index === this.size - 1 ? this.pop() : this.splice(index, 1);
	  },
	  clear: function() {
	    if (this.size === 0) {
	      return this;
	    }
	    if (this.__ownerID) {
	      this.size = this._origin = this._capacity = 0;
	      this._level = SHIFT;
	      this._root = this._tail = null;
	      this.__hash = undefined;
	      this.__altered = true;
	      return this;
	    }
	    return emptyList();
	  },
	  push: function() {
	    var values = arguments;
	    var oldSize = this.size;
	    return this.withMutations((function(list) {
	      setListBounds(list, 0, oldSize + values.length);
	      for (var ii = 0; ii < values.length; ii++) {
	        list.set(oldSize + ii, values[ii]);
	      }
	    }));
	  },
	  pop: function() {
	    return setListBounds(this, 0, -1);
	  },
	  unshift: function() {
	    var values = arguments;
	    return this.withMutations((function(list) {
	      setListBounds(list, -values.length);
	      for (var ii = 0; ii < values.length; ii++) {
	        list.set(ii, values[ii]);
	      }
	    }));
	  },
	  shift: function() {
	    return setListBounds(this, 1);
	  },
	  merge: function() {
	    return mergeIntoListWith(this, undefined, arguments);
	  },
	  mergeWith: function(merger) {
	    for (var iters = [],
	        $__5 = 1; $__5 < arguments.length; $__5++)
	      iters[$__5 - 1] = arguments[$__5];
	    return mergeIntoListWith(this, merger, iters);
	  },
	  mergeDeep: function() {
	    return mergeIntoListWith(this, deepMerger(undefined), arguments);
	  },
	  mergeDeepWith: function(merger) {
	    for (var iters = [],
	        $__6 = 1; $__6 < arguments.length; $__6++)
	      iters[$__6 - 1] = arguments[$__6];
	    return mergeIntoListWith(this, deepMerger(merger), iters);
	  },
	  setSize: function(size) {
	    return setListBounds(this, 0, size);
	  },
	  slice: function(begin, end) {
	    var size = this.size;
	    if (wholeSlice(begin, end, size)) {
	      return this;
	    }
	    return setListBounds(this, resolveBegin(begin, size), resolveEnd(end, size));
	  },
	  __iterator: function(type, reverse) {
	    return new ListIterator(this, type, reverse);
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    var iterations = 0;
	    var eachFn = (function(v) {
	      return fn(v, iterations++, $__0);
	    });
	    var tailOffset = getTailOffset(this._capacity);
	    if (reverse) {
	      iterateVNode(this._tail, 0, tailOffset - this._origin, this._capacity - this._origin, eachFn, reverse) && iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse);
	    } else {
	      iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse) && iterateVNode(this._tail, 0, tailOffset - this._origin, this._capacity - this._origin, eachFn, reverse);
	    }
	    return iterations;
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      return this;
	    }
	    return makeList(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);
	  }
	}, {of: function() {
	    return this(arguments);
	  }}, IndexedCollection);
	function isList(maybeList) {
	  return !!(maybeList && maybeList[IS_LIST_SENTINEL]);
	}
	List.isList = isList;
	var IS_LIST_SENTINEL = '@@__IMMUTABLE_LIST__@@';
	var ListPrototype = List.prototype;
	ListPrototype[IS_LIST_SENTINEL] = true;
	ListPrototype[DELETE] = ListPrototype.remove;
	ListPrototype.setIn = MapPrototype.setIn;
	ListPrototype.removeIn = MapPrototype.removeIn;
	ListPrototype.update = MapPrototype.update;
	ListPrototype.updateIn = MapPrototype.updateIn;
	ListPrototype.withMutations = MapPrototype.withMutations;
	ListPrototype.asMutable = MapPrototype.asMutable;
	ListPrototype.asImmutable = MapPrototype.asImmutable;
	ListPrototype.wasAltered = MapPrototype.wasAltered;
	var VNode = function VNode(array, ownerID) {
	  this.array = array;
	  this.ownerID = ownerID;
	};
	var $VNode = VNode;
	($traceurRuntime.createClass)(VNode, {
	  removeBefore: function(ownerID, level, index) {
	    if (index === level ? 1 << level : 0 || this.array.length === 0) {
	      return this;
	    }
	    var originIndex = (index >>> level) & MASK;
	    if (originIndex >= this.array.length) {
	      return new $VNode([], ownerID);
	    }
	    var removingFirst = originIndex === 0;
	    var newChild;
	    if (level > 0) {
	      var oldChild = this.array[originIndex];
	      newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
	      if (newChild === oldChild && removingFirst) {
	        return this;
	      }
	    }
	    if (removingFirst && !newChild) {
	      return this;
	    }
	    var editable = editableVNode(this, ownerID);
	    if (!removingFirst) {
	      for (var ii = 0; ii < originIndex; ii++) {
	        editable.array[ii] = undefined;
	      }
	    }
	    if (newChild) {
	      editable.array[originIndex] = newChild;
	    }
	    return editable;
	  },
	  removeAfter: function(ownerID, level, index) {
	    if (index === level ? 1 << level : 0 || this.array.length === 0) {
	      return this;
	    }
	    var sizeIndex = ((index - 1) >>> level) & MASK;
	    if (sizeIndex >= this.array.length) {
	      return this;
	    }
	    var removingLast = sizeIndex === this.array.length - 1;
	    var newChild;
	    if (level > 0) {
	      var oldChild = this.array[sizeIndex];
	      newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
	      if (newChild === oldChild && removingLast) {
	        return this;
	      }
	    }
	    if (removingLast && !newChild) {
	      return this;
	    }
	    var editable = editableVNode(this, ownerID);
	    if (!removingLast) {
	      editable.array.pop();
	    }
	    if (newChild) {
	      editable.array[sizeIndex] = newChild;
	    }
	    return editable;
	  }
	}, {});
	function iterateVNode(node, level, offset, max, fn, reverse) {
	  var ii;
	  var array = node && node.array;
	  if (level === 0) {
	    var from = offset < 0 ? -offset : 0;
	    var to = max - offset;
	    if (to > SIZE) {
	      to = SIZE;
	    }
	    for (ii = from; ii < to; ii++) {
	      if (fn(array && array[reverse ? from + to - 1 - ii : ii]) === false) {
	        return false;
	      }
	    }
	  } else {
	    var step = 1 << level;
	    var newLevel = level - SHIFT;
	    for (ii = 0; ii <= MASK; ii++) {
	      var levelIndex = reverse ? MASK - ii : ii;
	      var newOffset = offset + (levelIndex << level);
	      if (newOffset < max && newOffset + step > 0) {
	        var nextNode = array && array[levelIndex];
	        if (!iterateVNode(nextNode, newLevel, newOffset, max, fn, reverse)) {
	          return false;
	        }
	      }
	    }
	  }
	  return true;
	}
	var ListIterator = function ListIterator(list, type, reverse) {
	  this._type = type;
	  this._reverse = !!reverse;
	  this._maxIndex = list.size - 1;
	  var tailOffset = getTailOffset(list._capacity);
	  var rootStack = listIteratorFrame(list._root && list._root.array, list._level, -list._origin, tailOffset - list._origin - 1);
	  var tailStack = listIteratorFrame(list._tail && list._tail.array, 0, tailOffset - list._origin, list._capacity - list._origin - 1);
	  this._stack = reverse ? tailStack : rootStack;
	  this._stack.__prev = reverse ? rootStack : tailStack;
	};
	($traceurRuntime.createClass)(ListIterator, {next: function() {
	    var stack = this._stack;
	    while (stack) {
	      var array = stack.array;
	      var rawIndex = stack.index++;
	      if (this._reverse) {
	        rawIndex = MASK - rawIndex;
	        if (rawIndex > stack.rawMax) {
	          rawIndex = stack.rawMax;
	          stack.index = SIZE - rawIndex;
	        }
	      }
	      if (rawIndex >= 0 && rawIndex < SIZE && rawIndex <= stack.rawMax) {
	        var value = array && array[rawIndex];
	        if (stack.level === 0) {
	          var type = this._type;
	          var index;
	          if (type !== 1) {
	            index = stack.offset + (rawIndex << stack.level);
	            if (this._reverse) {
	              index = this._maxIndex - index;
	            }
	          }
	          return iteratorValue(type, index, value);
	        } else {
	          this._stack = stack = listIteratorFrame(value && value.array, stack.level - SHIFT, stack.offset + (rawIndex << stack.level), stack.max, stack);
	        }
	        continue;
	      }
	      stack = this._stack = this._stack.__prev;
	    }
	    return iteratorDone();
	  }}, {}, Iterator);
	function listIteratorFrame(array, level, offset, max, prevFrame) {
	  return {
	    array: array,
	    level: level,
	    offset: offset,
	    max: max,
	    rawMax: ((max - offset) >> level),
	    index: 0,
	    __prev: prevFrame
	  };
	}
	function makeList(origin, capacity, level, root, tail, ownerID, hash) {
	  var list = Object.create(ListPrototype);
	  list.size = capacity - origin;
	  list._origin = origin;
	  list._capacity = capacity;
	  list._level = level;
	  list._root = root;
	  list._tail = tail;
	  list.__ownerID = ownerID;
	  list.__hash = hash;
	  list.__altered = false;
	  return list;
	}
	var EMPTY_LIST;
	function emptyList() {
	  return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
	}
	function updateList(list, index, value) {
	  index = wrapIndex(list, index);
	  if (index >= list.size || index < 0) {
	    return list.withMutations((function(list) {
	      index < 0 ? setListBounds(list, index).set(0, value) : setListBounds(list, 0, index + 1).set(index, value);
	    }));
	  }
	  index += list._origin;
	  var newTail = list._tail;
	  var newRoot = list._root;
	  var didAlter = MakeRef(DID_ALTER);
	  if (index >= getTailOffset(list._capacity)) {
	    newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
	  } else {
	    newRoot = updateVNode(newRoot, list.__ownerID, list._level, index, value, didAlter);
	  }
	  if (!didAlter.value) {
	    return list;
	  }
	  if (list.__ownerID) {
	    list._root = newRoot;
	    list._tail = newTail;
	    list.__hash = undefined;
	    list.__altered = true;
	    return list;
	  }
	  return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
	}
	function updateVNode(node, ownerID, level, index, value, didAlter) {
	  var idx = (index >>> level) & MASK;
	  var nodeHas = node && idx < node.array.length;
	  if (!nodeHas && value === undefined) {
	    return node;
	  }
	  var newNode;
	  if (level > 0) {
	    var lowerNode = node && node.array[idx];
	    var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
	    if (newLowerNode === lowerNode) {
	      return node;
	    }
	    newNode = editableVNode(node, ownerID);
	    newNode.array[idx] = newLowerNode;
	    return newNode;
	  }
	  if (nodeHas && node.array[idx] === value) {
	    return node;
	  }
	  SetRef(didAlter);
	  newNode = editableVNode(node, ownerID);
	  if (value === undefined && idx === newNode.array.length - 1) {
	    newNode.array.pop();
	  } else {
	    newNode.array[idx] = value;
	  }
	  return newNode;
	}
	function editableVNode(node, ownerID) {
	  if (ownerID && node && ownerID === node.ownerID) {
	    return node;
	  }
	  return new VNode(node ? node.array.slice() : [], ownerID);
	}
	function listNodeFor(list, rawIndex) {
	  if (rawIndex >= getTailOffset(list._capacity)) {
	    return list._tail;
	  }
	  if (rawIndex < 1 << (list._level + SHIFT)) {
	    var node = list._root;
	    var level = list._level;
	    while (node && level > 0) {
	      node = node.array[(rawIndex >>> level) & MASK];
	      level -= SHIFT;
	    }
	    return node;
	  }
	}
	function setListBounds(list, begin, end) {
	  var owner = list.__ownerID || new OwnerID();
	  var oldOrigin = list._origin;
	  var oldCapacity = list._capacity;
	  var newOrigin = oldOrigin + begin;
	  var newCapacity = end === undefined ? oldCapacity : end < 0 ? oldCapacity + end : oldOrigin + end;
	  if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
	    return list;
	  }
	  if (newOrigin >= newCapacity) {
	    return list.clear();
	  }
	  var newLevel = list._level;
	  var newRoot = list._root;
	  var offsetShift = 0;
	  while (newOrigin + offsetShift < 0) {
	    newRoot = new VNode(newRoot && newRoot.array.length ? [undefined, newRoot] : [], owner);
	    newLevel += SHIFT;
	    offsetShift += 1 << newLevel;
	  }
	  if (offsetShift) {
	    newOrigin += offsetShift;
	    oldOrigin += offsetShift;
	    newCapacity += offsetShift;
	    oldCapacity += offsetShift;
	  }
	  var oldTailOffset = getTailOffset(oldCapacity);
	  var newTailOffset = getTailOffset(newCapacity);
	  while (newTailOffset >= 1 << (newLevel + SHIFT)) {
	    newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
	    newLevel += SHIFT;
	  }
	  var oldTail = list._tail;
	  var newTail = newTailOffset < oldTailOffset ? listNodeFor(list, newCapacity - 1) : newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;
	  if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length) {
	    newRoot = editableVNode(newRoot, owner);
	    var node = newRoot;
	    for (var level = newLevel; level > SHIFT; level -= SHIFT) {
	      var idx = (oldTailOffset >>> level) & MASK;
	      node = node.array[idx] = editableVNode(node.array[idx], owner);
	    }
	    node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
	  }
	  if (newCapacity < oldCapacity) {
	    newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
	  }
	  if (newOrigin >= newTailOffset) {
	    newOrigin -= newTailOffset;
	    newCapacity -= newTailOffset;
	    newLevel = SHIFT;
	    newRoot = null;
	    newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);
	  } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
	    offsetShift = 0;
	    while (newRoot) {
	      var beginIndex = (newOrigin >>> newLevel) & MASK;
	      if (beginIndex !== (newTailOffset >>> newLevel) & MASK) {
	        break;
	      }
	      if (beginIndex) {
	        offsetShift += (1 << newLevel) * beginIndex;
	      }
	      newLevel -= SHIFT;
	      newRoot = newRoot.array[beginIndex];
	    }
	    if (newRoot && newOrigin > oldOrigin) {
	      newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
	    }
	    if (newRoot && newTailOffset < oldTailOffset) {
	      newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
	    }
	    if (offsetShift) {
	      newOrigin -= offsetShift;
	      newCapacity -= offsetShift;
	    }
	  }
	  if (list.__ownerID) {
	    list.size = newCapacity - newOrigin;
	    list._origin = newOrigin;
	    list._capacity = newCapacity;
	    list._level = newLevel;
	    list._root = newRoot;
	    list._tail = newTail;
	    list.__hash = undefined;
	    list.__altered = true;
	    return list;
	  }
	  return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
	}
	function mergeIntoListWith(list, merger, iterables) {
	  var iters = [];
	  var maxSize = 0;
	  for (var ii = 0; ii < iterables.length; ii++) {
	    var value = iterables[ii];
	    var iter = IndexedIterable(value);
	    if (iter.size > maxSize) {
	      maxSize = iter.size;
	    }
	    if (!isIterable(value)) {
	      iter = iter.map((function(v) {
	        return fromJS(v);
	      }));
	    }
	    iters.push(iter);
	  }
	  if (maxSize > list.size) {
	    list = list.setSize(maxSize);
	  }
	  return mergeIntoCollectionWith(list, merger, iters);
	}
	function getTailOffset(size) {
	  return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
	}
	var OrderedMap = function OrderedMap(value) {
	  return value === null || value === undefined ? emptyOrderedMap() : isOrderedMap(value) ? value : emptyOrderedMap().merge(KeyedIterable(value));
	};
	($traceurRuntime.createClass)(OrderedMap, {
	  toString: function() {
	    return this.__toString('OrderedMap {', '}');
	  },
	  get: function(k, notSetValue) {
	    var index = this._map.get(k);
	    return index !== undefined ? this._list.get(index)[1] : notSetValue;
	  },
	  clear: function() {
	    if (this.size === 0) {
	      return this;
	    }
	    if (this.__ownerID) {
	      this.size = 0;
	      this._map.clear();
	      this._list.clear();
	      return this;
	    }
	    return emptyOrderedMap();
	  },
	  set: function(k, v) {
	    return updateOrderedMap(this, k, v);
	  },
	  remove: function(k) {
	    return updateOrderedMap(this, k, NOT_SET);
	  },
	  wasAltered: function() {
	    return this._map.wasAltered() || this._list.wasAltered();
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    return this._list.__iterate((function(entry) {
	      return entry && fn(entry[1], entry[0], $__0);
	    }), reverse);
	  },
	  __iterator: function(type, reverse) {
	    return this._list.fromEntrySeq().__iterator(type, reverse);
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    var newMap = this._map.__ensureOwner(ownerID);
	    var newList = this._list.__ensureOwner(ownerID);
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      this._map = newMap;
	      this._list = newList;
	      return this;
	    }
	    return makeOrderedMap(newMap, newList, ownerID, this.__hash);
	  }
	}, {of: function() {
	    return this(arguments);
	  }}, Map);
	function isOrderedMap(maybeOrderedMap) {
	  return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
	}
	OrderedMap.isOrderedMap = isOrderedMap;
	OrderedMap.prototype[IS_ORDERED_SENTINEL] = true;
	OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;
	function makeOrderedMap(map, list, ownerID, hash) {
	  var omap = Object.create(OrderedMap.prototype);
	  omap.size = map ? map.size : 0;
	  omap._map = map;
	  omap._list = list;
	  omap.__ownerID = ownerID;
	  omap.__hash = hash;
	  return omap;
	}
	var EMPTY_ORDERED_MAP;
	function emptyOrderedMap() {
	  return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()));
	}
	function updateOrderedMap(omap, k, v) {
	  var map = omap._map;
	  var list = omap._list;
	  var i = map.get(k);
	  var has = i !== undefined;
	  var newMap;
	  var newList;
	  if (v === NOT_SET) {
	    if (!has) {
	      return omap;
	    }
	    if (list.size >= SIZE && list.size >= map.size * 2) {
	      newList = list.filter((function(entry, idx) {
	        return entry !== undefined && i !== idx;
	      }));
	      newMap = newList.toKeyedSeq().map((function(entry) {
	        return entry[0];
	      })).flip().toMap();
	      if (omap.__ownerID) {
	        newMap.__ownerID = newList.__ownerID = omap.__ownerID;
	      }
	    } else {
	      newMap = map.remove(k);
	      newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
	    }
	  } else {
	    if (has) {
	      if (v === list.get(i)[1]) {
	        return omap;
	      }
	      newMap = map;
	      newList = list.set(i, [k, v]);
	    } else {
	      newMap = map.set(k, list.size);
	      newList = list.set(list.size, [k, v]);
	    }
	  }
	  if (omap.__ownerID) {
	    omap.size = newMap.size;
	    omap._map = newMap;
	    omap._list = newList;
	    omap.__hash = undefined;
	    return omap;
	  }
	  return makeOrderedMap(newMap, newList);
	}
	var Stack = function Stack(value) {
	  return value === null || value === undefined ? emptyStack() : isStack(value) ? value : emptyStack().unshiftAll(value);
	};
	var $Stack = Stack;
	($traceurRuntime.createClass)(Stack, {
	  toString: function() {
	    return this.__toString('Stack [', ']');
	  },
	  get: function(index, notSetValue) {
	    var head = this._head;
	    while (head && index--) {
	      head = head.next;
	    }
	    return head ? head.value : notSetValue;
	  },
	  peek: function() {
	    return this._head && this._head.value;
	  },
	  push: function() {
	    if (arguments.length === 0) {
	      return this;
	    }
	    var newSize = this.size + arguments.length;
	    var head = this._head;
	    for (var ii = arguments.length - 1; ii >= 0; ii--) {
	      head = {
	        value: arguments[ii],
	        next: head
	      };
	    }
	    if (this.__ownerID) {
	      this.size = newSize;
	      this._head = head;
	      this.__hash = undefined;
	      this.__altered = true;
	      return this;
	    }
	    return makeStack(newSize, head);
	  },
	  pushAll: function(iter) {
	    iter = IndexedIterable(iter);
	    if (iter.size === 0) {
	      return this;
	    }
	    var newSize = this.size;
	    var head = this._head;
	    iter.reverse().forEach((function(value) {
	      newSize++;
	      head = {
	        value: value,
	        next: head
	      };
	    }));
	    if (this.__ownerID) {
	      this.size = newSize;
	      this._head = head;
	      this.__hash = undefined;
	      this.__altered = true;
	      return this;
	    }
	    return makeStack(newSize, head);
	  },
	  pop: function() {
	    return this.slice(1);
	  },
	  unshift: function() {
	    return this.push.apply(this, arguments);
	  },
	  unshiftAll: function(iter) {
	    return this.pushAll(iter);
	  },
	  shift: function() {
	    return this.pop.apply(this, arguments);
	  },
	  clear: function() {
	    if (this.size === 0) {
	      return this;
	    }
	    if (this.__ownerID) {
	      this.size = 0;
	      this._head = undefined;
	      this.__hash = undefined;
	      this.__altered = true;
	      return this;
	    }
	    return emptyStack();
	  },
	  slice: function(begin, end) {
	    if (wholeSlice(begin, end, this.size)) {
	      return this;
	    }
	    var resolvedBegin = resolveBegin(begin, this.size);
	    var resolvedEnd = resolveEnd(end, this.size);
	    if (resolvedEnd !== this.size) {
	      return $traceurRuntime.superCall(this, $Stack.prototype, "slice", [begin, end]);
	    }
	    var newSize = this.size - resolvedBegin;
	    var head = this._head;
	    while (resolvedBegin--) {
	      head = head.next;
	    }
	    if (this.__ownerID) {
	      this.size = newSize;
	      this._head = head;
	      this.__hash = undefined;
	      this.__altered = true;
	      return this;
	    }
	    return makeStack(newSize, head);
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      this.__altered = false;
	      return this;
	    }
	    return makeStack(this.size, this._head, ownerID, this.__hash);
	  },
	  __iterate: function(fn, reverse) {
	    if (reverse) {
	      return this.toSeq().cacheResult.__iterate(fn, reverse);
	    }
	    var iterations = 0;
	    var node = this._head;
	    while (node) {
	      if (fn(node.value, iterations++, this) === false) {
	        break;
	      }
	      node = node.next;
	    }
	    return iterations;
	  },
	  __iterator: function(type, reverse) {
	    if (reverse) {
	      return this.toSeq().cacheResult().__iterator(type, reverse);
	    }
	    var iterations = 0;
	    var node = this._head;
	    return new Iterator((function() {
	      if (node) {
	        var value = node.value;
	        node = node.next;
	        return iteratorValue(type, iterations++, value);
	      }
	      return iteratorDone();
	    }));
	  }
	}, {of: function() {
	    return this(arguments);
	  }}, IndexedCollection);
	function isStack(maybeStack) {
	  return !!(maybeStack && maybeStack[IS_STACK_SENTINEL]);
	}
	Stack.isStack = isStack;
	var IS_STACK_SENTINEL = '@@__IMMUTABLE_STACK__@@';
	var StackPrototype = Stack.prototype;
	StackPrototype[IS_STACK_SENTINEL] = true;
	StackPrototype.withMutations = MapPrototype.withMutations;
	StackPrototype.asMutable = MapPrototype.asMutable;
	StackPrototype.asImmutable = MapPrototype.asImmutable;
	StackPrototype.wasAltered = MapPrototype.wasAltered;
	function makeStack(size, head, ownerID, hash) {
	  var map = Object.create(StackPrototype);
	  map.size = size;
	  map._head = head;
	  map.__ownerID = ownerID;
	  map.__hash = hash;
	  map.__altered = false;
	  return map;
	}
	var EMPTY_STACK;
	function emptyStack() {
	  return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
	}
	var Set = function Set(value) {
	  return value === null || value === undefined ? emptySet() : isSet(value) ? value : emptySet().union(SetIterable(value));
	};
	($traceurRuntime.createClass)(Set, {
	  toString: function() {
	    return this.__toString('Set {', '}');
	  },
	  has: function(value) {
	    return this._map.has(value);
	  },
	  add: function(value) {
	    return updateSet(this, this._map.set(value, true));
	  },
	  remove: function(value) {
	    return updateSet(this, this._map.remove(value));
	  },
	  clear: function() {
	    return updateSet(this, this._map.clear());
	  },
	  union: function() {
	    var iters = arguments;
	    if (iters.length === 0) {
	      return this;
	    }
	    return this.withMutations((function(set) {
	      for (var ii = 0; ii < iters.length; ii++) {
	        SetIterable(iters[ii]).forEach((function(value) {
	          return set.add(value);
	        }));
	      }
	    }));
	  },
	  intersect: function() {
	    for (var iters = [],
	        $__7 = 0; $__7 < arguments.length; $__7++)
	      iters[$__7] = arguments[$__7];
	    if (iters.length === 0) {
	      return this;
	    }
	    iters = iters.map((function(iter) {
	      return SetIterable(iter);
	    }));
	    var originalSet = this;
	    return this.withMutations((function(set) {
	      originalSet.forEach((function(value) {
	        if (!iters.every((function(iter) {
	          return iter.contains(value);
	        }))) {
	          set.remove(value);
	        }
	      }));
	    }));
	  },
	  subtract: function() {
	    for (var iters = [],
	        $__8 = 0; $__8 < arguments.length; $__8++)
	      iters[$__8] = arguments[$__8];
	    if (iters.length === 0) {
	      return this;
	    }
	    iters = iters.map((function(iter) {
	      return SetIterable(iter);
	    }));
	    var originalSet = this;
	    return this.withMutations((function(set) {
	      originalSet.forEach((function(value) {
	        if (iters.some((function(iter) {
	          return iter.contains(value);
	        }))) {
	          set.remove(value);
	        }
	      }));
	    }));
	  },
	  merge: function() {
	    return this.union.apply(this, arguments);
	  },
	  mergeWith: function(merger) {
	    for (var iters = [],
	        $__9 = 1; $__9 < arguments.length; $__9++)
	      iters[$__9 - 1] = arguments[$__9];
	    return this.union.apply(this, iters);
	  },
	  sort: function(comparator) {
	    return OrderedSet(sortFactory(this, comparator));
	  },
	  sortBy: function(mapper, comparator) {
	    return OrderedSet(sortFactory(this, comparator, mapper));
	  },
	  wasAltered: function() {
	    return this._map.wasAltered();
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    return this._map.__iterate((function(_, k) {
	      return fn(k, k, $__0);
	    }), reverse);
	  },
	  __iterator: function(type, reverse) {
	    return this._map.map((function(_, k) {
	      return k;
	    })).__iterator(type, reverse);
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    var newMap = this._map.__ensureOwner(ownerID);
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      this._map = newMap;
	      return this;
	    }
	    return this.__make(newMap, ownerID);
	  }
	}, {
	  of: function() {
	    return this(arguments);
	  },
	  fromKeys: function(value) {
	    return this(KeyedIterable(value).keySeq());
	  }
	}, SetCollection);
	function isSet(maybeSet) {
	  return !!(maybeSet && maybeSet[IS_SET_SENTINEL]);
	}
	Set.isSet = isSet;
	var IS_SET_SENTINEL = '@@__IMMUTABLE_SET__@@';
	var SetPrototype = Set.prototype;
	SetPrototype[IS_SET_SENTINEL] = true;
	SetPrototype[DELETE] = SetPrototype.remove;
	SetPrototype.mergeDeep = SetPrototype.merge;
	SetPrototype.mergeDeepWith = SetPrototype.mergeWith;
	SetPrototype.withMutations = MapPrototype.withMutations;
	SetPrototype.asMutable = MapPrototype.asMutable;
	SetPrototype.asImmutable = MapPrototype.asImmutable;
	SetPrototype.__empty = emptySet;
	SetPrototype.__make = makeSet;
	function updateSet(set, newMap) {
	  if (set.__ownerID) {
	    set.size = newMap.size;
	    set._map = newMap;
	    return set;
	  }
	  return newMap === set._map ? set : newMap.size === 0 ? set.__empty() : set.__make(newMap);
	}
	function makeSet(map, ownerID) {
	  var set = Object.create(SetPrototype);
	  set.size = map ? map.size : 0;
	  set._map = map;
	  set.__ownerID = ownerID;
	  return set;
	}
	var EMPTY_SET;
	function emptySet() {
	  return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
	}
	var OrderedSet = function OrderedSet(value) {
	  return value === null || value === undefined ? emptyOrderedSet() : isOrderedSet(value) ? value : emptyOrderedSet().union(SetIterable(value));
	};
	($traceurRuntime.createClass)(OrderedSet, {toString: function() {
	    return this.__toString('OrderedSet {', '}');
	  }}, {
	  of: function() {
	    return this(arguments);
	  },
	  fromKeys: function(value) {
	    return this(KeyedIterable(value).keySeq());
	  }
	}, Set);
	function isOrderedSet(maybeOrderedSet) {
	  return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
	}
	OrderedSet.isOrderedSet = isOrderedSet;
	var OrderedSetPrototype = OrderedSet.prototype;
	OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;
	OrderedSetPrototype.__empty = emptyOrderedSet;
	OrderedSetPrototype.__make = makeOrderedSet;
	function makeOrderedSet(map, ownerID) {
	  var set = Object.create(OrderedSetPrototype);
	  set.size = map ? map.size : 0;
	  set._map = map;
	  set.__ownerID = ownerID;
	  return set;
	}
	var EMPTY_ORDERED_SET;
	function emptyOrderedSet() {
	  return EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()));
	}
	var Record = function Record(defaultValues, name) {
	  var RecordType = function Record(values) {
	    if (!(this instanceof RecordType)) {
	      return new RecordType(values);
	    }
	    this._map = Map(values);
	  };
	  var keys = Object.keys(defaultValues);
	  var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
	  RecordTypePrototype.constructor = RecordType;
	  name && (RecordTypePrototype._name = name);
	  RecordTypePrototype._defaultValues = defaultValues;
	  RecordTypePrototype._keys = keys;
	  RecordTypePrototype.size = keys.length;
	  try {
	    keys.forEach((function(key) {
	      Object.defineProperty(RecordType.prototype, key, {
	        get: function() {
	          return this.get(key);
	        },
	        set: function(value) {
	          invariant(this.__ownerID, 'Cannot set on an immutable record.');
	          this.set(key, value);
	        }
	      });
	    }));
	  } catch (error) {}
	  return RecordType;
	};
	($traceurRuntime.createClass)(Record, {
	  toString: function() {
	    return this.__toString(recordName(this) + ' {', '}');
	  },
	  has: function(k) {
	    return this._defaultValues.hasOwnProperty(k);
	  },
	  get: function(k, notSetValue) {
	    if (!this.has(k)) {
	      return notSetValue;
	    }
	    var defaultVal = this._defaultValues[k];
	    return this._map ? this._map.get(k, defaultVal) : defaultVal;
	  },
	  clear: function() {
	    if (this.__ownerID) {
	      this._map && this._map.clear();
	      return this;
	    }
	    var SuperRecord = Object.getPrototypeOf(this).constructor;
	    return SuperRecord._empty || (SuperRecord._empty = makeRecord(this, emptyMap()));
	  },
	  set: function(k, v) {
	    if (!this.has(k)) {
	      throw new Error('Cannot set unknown key "' + k + '" on ' + recordName(this));
	    }
	    var newMap = this._map && this._map.set(k, v);
	    if (this.__ownerID || newMap === this._map) {
	      return this;
	    }
	    return makeRecord(this, newMap);
	  },
	  remove: function(k) {
	    if (!this.has(k)) {
	      return this;
	    }
	    var newMap = this._map && this._map.remove(k);
	    if (this.__ownerID || newMap === this._map) {
	      return this;
	    }
	    return makeRecord(this, newMap);
	  },
	  wasAltered: function() {
	    return this._map.wasAltered();
	  },
	  __iterator: function(type, reverse) {
	    var $__0 = this;
	    return KeyedIterable(this._defaultValues).map((function(_, k) {
	      return $__0.get(k);
	    })).__iterator(type, reverse);
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    return KeyedIterable(this._defaultValues).map((function(_, k) {
	      return $__0.get(k);
	    })).__iterate(fn, reverse);
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    var newMap = this._map && this._map.__ensureOwner(ownerID);
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      this._map = newMap;
	      return this;
	    }
	    return makeRecord(this, newMap, ownerID);
	  }
	}, {}, KeyedCollection);
	var RecordPrototype = Record.prototype;
	RecordPrototype[DELETE] = RecordPrototype.remove;
	RecordPrototype.merge = MapPrototype.merge;
	RecordPrototype.mergeWith = MapPrototype.mergeWith;
	RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
	RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
	RecordPrototype.update = MapPrototype.update;
	RecordPrototype.updateIn = MapPrototype.updateIn;
	RecordPrototype.withMutations = MapPrototype.withMutations;
	RecordPrototype.asMutable = MapPrototype.asMutable;
	RecordPrototype.asImmutable = MapPrototype.asImmutable;
	function makeRecord(likeRecord, map, ownerID) {
	  var record = Object.create(Object.getPrototypeOf(likeRecord));
	  record._map = map;
	  record.__ownerID = ownerID;
	  return record;
	}
	function recordName(record) {
	  return record._name || record.constructor.name;
	}
	var Range = function Range(start, end, step) {
	  if (!(this instanceof $Range)) {
	    return new $Range(start, end, step);
	  }
	  invariant(step !== 0, 'Cannot step a Range by 0');
	  start = start || 0;
	  if (end === undefined) {
	    end = Infinity;
	  }
	  if (start === end && __EMPTY_RANGE) {
	    return __EMPTY_RANGE;
	  }
	  step = step === undefined ? 1 : Math.abs(step);
	  if (end < start) {
	    step = -step;
	  }
	  this._start = start;
	  this._end = end;
	  this._step = step;
	  this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
	};
	var $Range = Range;
	($traceurRuntime.createClass)(Range, {
	  toString: function() {
	    if (this.size === 0) {
	      return 'Range []';
	    }
	    return 'Range [ ' + this._start + '...' + this._end + (this._step > 1 ? ' by ' + this._step : '') + ' ]';
	  },
	  get: function(index, notSetValue) {
	    return this.has(index) ? this._start + wrapIndex(this, index) * this._step : notSetValue;
	  },
	  contains: function(searchValue) {
	    var possibleIndex = (searchValue - this._start) / this._step;
	    return possibleIndex >= 0 && possibleIndex < this.size && possibleIndex === Math.floor(possibleIndex);
	  },
	  slice: function(begin, end) {
	    if (wholeSlice(begin, end, this.size)) {
	      return this;
	    }
	    begin = resolveBegin(begin, this.size);
	    end = resolveEnd(end, this.size);
	    if (end <= begin) {
	      return __EMPTY_RANGE;
	    }
	    return new $Range(this.get(begin, this._end), this.get(end, this._end), this._step);
	  },
	  indexOf: function(searchValue) {
	    var offsetValue = searchValue - this._start;
	    if (offsetValue % this._step === 0) {
	      var index = offsetValue / this._step;
	      if (index >= 0 && index < this.size) {
	        return index;
	      }
	    }
	    return -1;
	  },
	  lastIndexOf: function(searchValue) {
	    return this.indexOf(searchValue);
	  },
	  take: function(amount) {
	    return this.slice(0, Math.max(0, amount));
	  },
	  skip: function(amount) {
	    return this.slice(Math.max(0, amount));
	  },
	  __iterate: function(fn, reverse) {
	    var maxIndex = this.size - 1;
	    var step = this._step;
	    var value = reverse ? this._start + maxIndex * step : this._start;
	    for (var ii = 0; ii <= maxIndex; ii++) {
	      if (fn(value, ii, this) === false) {
	        return ii + 1;
	      }
	      value += reverse ? -step : step;
	    }
	    return ii;
	  },
	  __iterator: function(type, reverse) {
	    var maxIndex = this.size - 1;
	    var step = this._step;
	    var value = reverse ? this._start + maxIndex * step : this._start;
	    var ii = 0;
	    return new Iterator((function() {
	      var v = value;
	      value += reverse ? -step : step;
	      return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii++, v);
	    }));
	  },
	  __deepEquals: function(other) {
	    return other instanceof $Range ? this._start === other._start && this._end === other._end && this._step === other._step : deepEqual(this, other);
	  }
	}, {}, IndexedSeq);
	var RangePrototype = Range.prototype;
	RangePrototype.__toJS = RangePrototype.toArray;
	RangePrototype.first = ListPrototype.first;
	RangePrototype.last = ListPrototype.last;
	var __EMPTY_RANGE = Range(0, 0);
	var Repeat = function Repeat(value, times) {
	  if (times <= 0 && EMPTY_REPEAT) {
	    return EMPTY_REPEAT;
	  }
	  if (!(this instanceof $Repeat)) {
	    return new $Repeat(value, times);
	  }
	  this._value = value;
	  this.size = times === undefined ? Infinity : Math.max(0, times);
	  if (this.size === 0) {
	    EMPTY_REPEAT = this;
	  }
	};
	var $Repeat = Repeat;
	($traceurRuntime.createClass)(Repeat, {
	  toString: function() {
	    if (this.size === 0) {
	      return 'Repeat []';
	    }
	    return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
	  },
	  get: function(index, notSetValue) {
	    return this.has(index) ? this._value : notSetValue;
	  },
	  contains: function(searchValue) {
	    return is(this._value, searchValue);
	  },
	  slice: function(begin, end) {
	    var size = this.size;
	    return wholeSlice(begin, end, size) ? this : new $Repeat(this._value, resolveEnd(end, size) - resolveBegin(begin, size));
	  },
	  reverse: function() {
	    return this;
	  },
	  indexOf: function(searchValue) {
	    if (is(this._value, searchValue)) {
	      return 0;
	    }
	    return -1;
	  },
	  lastIndexOf: function(searchValue) {
	    if (is(this._value, searchValue)) {
	      return this.size;
	    }
	    return -1;
	  },
	  __iterate: function(fn, reverse) {
	    for (var ii = 0; ii < this.size; ii++) {
	      if (fn(this._value, ii, this) === false) {
	        return ii + 1;
	      }
	    }
	    return ii;
	  },
	  __iterator: function(type, reverse) {
	    var $__0 = this;
	    var ii = 0;
	    return new Iterator((function() {
	      return ii < $__0.size ? iteratorValue(type, ii++, $__0._value) : iteratorDone();
	    }));
	  },
	  __deepEquals: function(other) {
	    return other instanceof $Repeat ? is(this._value, other._value) : deepEqual(other);
	  }
	}, {}, IndexedSeq);
	var RepeatPrototype = Repeat.prototype;
	RepeatPrototype.last = RepeatPrototype.first;
	RepeatPrototype.has = RangePrototype.has;
	RepeatPrototype.take = RangePrototype.take;
	RepeatPrototype.skip = RangePrototype.skip;
	RepeatPrototype.__toJS = RangePrototype.__toJS;
	var EMPTY_REPEAT;
	var Immutable = {
	  Iterable: Iterable,
	  Seq: Seq,
	  Collection: Collection,
	  Map: Map,
	  OrderedMap: OrderedMap,
	  List: List,
	  Stack: Stack,
	  Set: Set,
	  OrderedSet: OrderedSet,
	  Record: Record,
	  Range: Range,
	  Repeat: Repeat,
	  is: is,
	  fromJS: fromJS
	};

	  return Immutable;
	}
	true ? module.exports = universalModule() :
	  typeof define === 'function' && define.amd ? define(universalModule) :
	    Immutable = universalModule();


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 *  Copyright (c) 2014, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */
	function universalModule() {
	  var $Object = Object;

	function createClass(ctor, methods, staticMethods, superClass) {
	  var proto;
	  if (superClass) {
	    var superProto = superClass.prototype;
	    proto = $Object.create(superProto);
	  } else {
	    proto = ctor.prototype;
	  }
	  $Object.keys(methods).forEach(function (key) {
	    proto[key] = methods[key];
	  });
	  $Object.keys(staticMethods).forEach(function (key) {
	    ctor[key] = staticMethods[key];
	  });
	  proto.constructor = ctor;
	  ctor.prototype = proto;
	  return ctor;
	}

	function superCall(self, proto, name, args) {
	  return $Object.getPrototypeOf(proto)[name].apply(self, args);
	}

	function defaultSuperCall(self, proto, args) {
	  superCall(self, proto, 'constructor', args);
	}

	var $traceurRuntime = {};
	$traceurRuntime.createClass = createClass;
	$traceurRuntime.superCall = superCall;
	$traceurRuntime.defaultSuperCall = defaultSuperCall;
	"use strict";
	function is(first, second) {
	  if (first === second) {
	    return first !== 0 || second !== 0 || 1 / first === 1 / second;
	  }
	  if (first !== first) {
	    return second !== second;
	  }
	  if (first && typeof first.equals === 'function') {
	    return first.equals(second);
	  }
	  return false;
	}
	function invariant(condition, error) {
	  if (!condition)
	    throw new Error(error);
	}
	var DELETE = 'delete';
	var SHIFT = 5;
	var SIZE = 1 << SHIFT;
	var MASK = SIZE - 1;
	var NOT_SET = {};
	var CHANGE_LENGTH = {value: false};
	var DID_ALTER = {value: false};
	function MakeRef(ref) {
	  ref.value = false;
	  return ref;
	}
	function SetRef(ref) {
	  ref && (ref.value = true);
	}
	function OwnerID() {}
	function arrCopy(arr, offset) {
	  offset = offset || 0;
	  var len = Math.max(0, arr.length - offset);
	  var newArr = new Array(len);
	  for (var ii = 0; ii < len; ii++) {
	    newArr[ii] = arr[ii + offset];
	  }
	  return newArr;
	}
	function assertNotInfinite(size) {
	  invariant(size !== Infinity, 'Cannot perform this action with an infinite size.');
	}
	function ensureSize(iter) {
	  if (iter.size === undefined) {
	    iter.size = iter.__iterate(returnTrue);
	  }
	  return iter.size;
	}
	function wrapIndex(iter, index) {
	  return index >= 0 ? (+index) : ensureSize(iter) + (+index);
	}
	function returnTrue() {
	  return true;
	}
	function wholeSlice(begin, end, size) {
	  return (begin === 0 || (size !== undefined && begin <= -size)) && (end === undefined || (size !== undefined && end >= size));
	}
	function resolveBegin(begin, size) {
	  return resolveIndex(begin, size, 0);
	}
	function resolveEnd(end, size) {
	  return resolveIndex(end, size, size);
	}
	function resolveIndex(index, size, defaultIndex) {
	  return index === undefined ? defaultIndex : index < 0 ? Math.max(0, size + index) : size === undefined ? index : Math.min(size, index);
	}
	function hash(o) {
	  if (!o) {
	    return 0;
	  }
	  if (o === true) {
	    return 1;
	  }
	  var type = typeof o;
	  if (type === 'number') {
	    if ((o | 0) === o) {
	      return o & HASH_MAX_VAL;
	    }
	    o = '' + o;
	    type = 'string';
	  }
	  if (type === 'string') {
	    return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
	  }
	  if (o.hashCode) {
	    return hash(typeof o.hashCode === 'function' ? o.hashCode() : o.hashCode);
	  }
	  return hashJSObj(o);
	}
	function cachedHashString(string) {
	  var hash = stringHashCache[string];
	  if (hash === undefined) {
	    hash = hashString(string);
	    if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
	      STRING_HASH_CACHE_SIZE = 0;
	      stringHashCache = {};
	    }
	    STRING_HASH_CACHE_SIZE++;
	    stringHashCache[string] = hash;
	  }
	  return hash;
	}
	function hashString(string) {
	  var hash = 0;
	  for (var ii = 0; ii < string.length; ii++) {
	    hash = (31 * hash + string.charCodeAt(ii)) & HASH_MAX_VAL;
	  }
	  return hash;
	}
	function hashJSObj(obj) {
	  var hash = weakMap && weakMap.get(obj);
	  if (hash)
	    return hash;
	  hash = obj[UID_HASH_KEY];
	  if (hash)
	    return hash;
	  if (!canDefineProperty) {
	    hash = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
	    if (hash)
	      return hash;
	    hash = getIENodeHash(obj);
	    if (hash)
	      return hash;
	  }
	  if (Object.isExtensible && !Object.isExtensible(obj)) {
	    throw new Error('Non-extensible objects are not allowed as keys.');
	  }
	  hash = ++objHashUID & HASH_MAX_VAL;
	  if (weakMap) {
	    weakMap.set(obj, hash);
	  } else if (canDefineProperty) {
	    Object.defineProperty(obj, UID_HASH_KEY, {
	      'enumerable': false,
	      'configurable': false,
	      'writable': false,
	      'value': hash
	    });
	  } else if (obj.propertyIsEnumerable && obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable) {
	    obj.propertyIsEnumerable = function() {
	      return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments);
	    };
	    obj.propertyIsEnumerable[UID_HASH_KEY] = hash;
	  } else if (obj.nodeType) {
	    obj[UID_HASH_KEY] = hash;
	  } else {
	    throw new Error('Unable to set a non-enumerable property on object.');
	  }
	  return hash;
	}
	var canDefineProperty = (function() {
	  try {
	    Object.defineProperty({}, 'x', {});
	    return true;
	  } catch (e) {
	    return false;
	  }
	}());
	function getIENodeHash(node) {
	  if (node && node.nodeType > 0) {
	    switch (node.nodeType) {
	      case 1:
	        return node.uniqueID;
	      case 9:
	        return node.documentElement && node.documentElement.uniqueID;
	    }
	  }
	}
	var weakMap = typeof WeakMap === 'function' && new WeakMap();
	var HASH_MAX_VAL = 0x7FFFFFFF;
	var objHashUID = 0;
	var UID_HASH_KEY = '__immutablehash__';
	if (typeof Symbol === 'function') {
	  UID_HASH_KEY = Symbol(UID_HASH_KEY);
	}
	var STRING_HASH_CACHE_MIN_STRLEN = 16;
	var STRING_HASH_CACHE_MAX_SIZE = 255;
	var STRING_HASH_CACHE_SIZE = 0;
	var stringHashCache = {};
	var ITERATE_KEYS = 0;
	var ITERATE_VALUES = 1;
	var ITERATE_ENTRIES = 2;
	var FAUX_ITERATOR_SYMBOL = '@@iterator';
	var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
	var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;
	var Iterator = function Iterator(next) {
	  this.next = next;
	};
	($traceurRuntime.createClass)(Iterator, {toString: function() {
	    return '[Iterator]';
	  }}, {});
	Iterator.KEYS = ITERATE_KEYS;
	Iterator.VALUES = ITERATE_VALUES;
	Iterator.ENTRIES = ITERATE_ENTRIES;
	var IteratorPrototype = Iterator.prototype;
	IteratorPrototype.inspect = IteratorPrototype.toSource = function() {
	  return this.toString();
	};
	IteratorPrototype[ITERATOR_SYMBOL] = function() {
	  return this;
	};
	function iteratorValue(type, k, v, iteratorResult) {
	  var value = type === 0 ? k : type === 1 ? v : [k, v];
	  iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
	    value: value,
	    done: false
	  });
	  return iteratorResult;
	}
	function iteratorDone() {
	  return {
	    value: undefined,
	    done: true
	  };
	}
	function hasIterator(maybeIterable) {
	  return !!_iteratorFn(maybeIterable);
	}
	function isIterator(maybeIterator) {
	  return maybeIterator && typeof maybeIterator.next === 'function';
	}
	function getIterator(iterable) {
	  var iteratorFn = _iteratorFn(iterable);
	  return iteratorFn && iteratorFn.call(iterable);
	}
	function _iteratorFn(iterable) {
	  var iteratorFn = iterable && ((REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) || iterable[FAUX_ITERATOR_SYMBOL]);
	  if (typeof iteratorFn === 'function') {
	    return iteratorFn;
	  }
	}
	var Iterable = function Iterable(value) {
	  return isIterable(value) ? value : Seq(value);
	};
	var $Iterable = Iterable;
	($traceurRuntime.createClass)(Iterable, {
	  toArray: function() {
	    assertNotInfinite(this.size);
	    var array = new Array(this.size || 0);
	    this.valueSeq().__iterate((function(v, i) {
	      array[i] = v;
	    }));
	    return array;
	  },
	  toIndexedSeq: function() {
	    return new ToIndexedSequence(this);
	  },
	  toJS: function() {
	    return this.toSeq().map((function(value) {
	      return value && typeof value.toJS === 'function' ? value.toJS() : value;
	    })).__toJS();
	  },
	  toKeyedSeq: function() {
	    return new ToKeyedSequence(this, true);
	  },
	  toMap: function() {
	    assertNotInfinite(this.size);
	    return Map(this.toKeyedSeq());
	  },
	  toObject: function() {
	    assertNotInfinite(this.size);
	    var object = {};
	    this.__iterate((function(v, k) {
	      object[k] = v;
	    }));
	    return object;
	  },
	  toOrderedMap: function() {
	    assertNotInfinite(this.size);
	    return OrderedMap(this.toKeyedSeq());
	  },
	  toOrderedSet: function() {
	    assertNotInfinite(this.size);
	    return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
	  },
	  toSet: function() {
	    assertNotInfinite(this.size);
	    return Set(isKeyed(this) ? this.valueSeq() : this);
	  },
	  toSetSeq: function() {
	    return new ToSetSequence(this);
	  },
	  toSeq: function() {
	    return isIndexed(this) ? this.toIndexedSeq() : isKeyed(this) ? this.toKeyedSeq() : this.toSetSeq();
	  },
	  toStack: function() {
	    assertNotInfinite(this.size);
	    return Stack(isKeyed(this) ? this.valueSeq() : this);
	  },
	  toList: function() {
	    assertNotInfinite(this.size);
	    return List(isKeyed(this) ? this.valueSeq() : this);
	  },
	  toString: function() {
	    return '[Iterable]';
	  },
	  __toString: function(head, tail) {
	    if (this.size === 0) {
	      return head + tail;
	    }
	    return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;
	  },
	  concat: function() {
	    for (var values = [],
	        $__2 = 0; $__2 < arguments.length; $__2++)
	      values[$__2] = arguments[$__2];
	    return reify(this, concatFactory(this, values));
	  },
	  contains: function(searchValue) {
	    return this.some((function(value) {
	      return is(value, searchValue);
	    }));
	  },
	  entries: function() {
	    return this.__iterator(ITERATE_ENTRIES);
	  },
	  every: function(predicate, context) {
	    var returnValue = true;
	    this.__iterate((function(v, k, c) {
	      if (!predicate.call(context, v, k, c)) {
	        returnValue = false;
	        return false;
	      }
	    }));
	    return returnValue;
	  },
	  filter: function(predicate, context) {
	    return reify(this, filterFactory(this, predicate, context, true));
	  },
	  find: function(predicate, context, notSetValue) {
	    var foundValue = notSetValue;
	    this.__iterate((function(v, k, c) {
	      if (predicate.call(context, v, k, c)) {
	        foundValue = v;
	        return false;
	      }
	    }));
	    return foundValue;
	  },
	  forEach: function(sideEffect, context) {
	    return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
	  },
	  join: function(separator) {
	    separator = separator !== undefined ? '' + separator : ',';
	    var joined = '';
	    var isFirst = true;
	    this.__iterate((function(v) {
	      isFirst ? (isFirst = false) : (joined += separator);
	      joined += v !== null && v !== undefined ? v : '';
	    }));
	    return joined;
	  },
	  keys: function() {
	    return this.__iterator(ITERATE_KEYS);
	  },
	  map: function(mapper, context) {
	    return reify(this, mapFactory(this, mapper, context));
	  },
	  reduce: function(reducer, initialReduction, context) {
	    var reduction;
	    var useFirst;
	    if (arguments.length < 2) {
	      useFirst = true;
	    } else {
	      reduction = initialReduction;
	    }
	    this.__iterate((function(v, k, c) {
	      if (useFirst) {
	        useFirst = false;
	        reduction = v;
	      } else {
	        reduction = reducer.call(context, reduction, v, k, c);
	      }
	    }));
	    return reduction;
	  },
	  reduceRight: function(reducer, initialReduction, context) {
	    var reversed = this.toKeyedSeq().reverse();
	    return reversed.reduce.apply(reversed, arguments);
	  },
	  reverse: function() {
	    return reify(this, reverseFactory(this, true));
	  },
	  slice: function(begin, end) {
	    if (wholeSlice(begin, end, this.size)) {
	      return this;
	    }
	    var resolvedBegin = resolveBegin(begin, this.size);
	    var resolvedEnd = resolveEnd(end, this.size);
	    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
	      return this.toSeq().cacheResult().slice(begin, end);
	    }
	    var skipped = resolvedBegin === 0 ? this : this.skip(resolvedBegin);
	    return reify(this, resolvedEnd === undefined || resolvedEnd === this.size ? skipped : skipped.take(resolvedEnd - resolvedBegin));
	  },
	  some: function(predicate, context) {
	    return !this.every(not(predicate), context);
	  },
	  sort: function(comparator) {
	    return reify(this, sortFactory(this, comparator));
	  },
	  values: function() {
	    return this.__iterator(ITERATE_VALUES);
	  },
	  butLast: function() {
	    return this.slice(0, -1);
	  },
	  count: function(predicate, context) {
	    return ensureSize(predicate ? this.toSeq().filter(predicate, context) : this);
	  },
	  countBy: function(grouper, context) {
	    return countByFactory(this, grouper, context);
	  },
	  equals: function(other) {
	    if (this === other) {
	      return true;
	    }
	    if (!other || typeof other.equals !== 'function') {
	      return false;
	    }
	    if (this.size !== undefined && other.size !== undefined) {
	      if (this.size !== other.size) {
	        return false;
	      }
	      if (this.size === 0 && other.size === 0) {
	        return true;
	      }
	    }
	    if (this.__hash !== undefined && other.__hash !== undefined && this.__hash !== other.__hash) {
	      return false;
	    }
	    return this.__deepEquals(other);
	  },
	  __deepEquals: function(other) {
	    return deepEqual(this, other);
	  },
	  entrySeq: function() {
	    var iterable = this;
	    if (iterable._cache) {
	      return new ArraySeq(iterable._cache);
	    }
	    var entriesSequence = iterable.toSeq().map(entryMapper).toIndexedSeq();
	    entriesSequence.fromEntrySeq = (function() {
	      return iterable.toSeq();
	    });
	    return entriesSequence;
	  },
	  filterNot: function(predicate, context) {
	    return this.filter(not(predicate), context);
	  },
	  findLast: function(predicate, context, notSetValue) {
	    return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
	  },
	  first: function() {
	    return this.find(returnTrue);
	  },
	  flatMap: function(mapper, context) {
	    return reify(this, flatMapFactory(this, mapper, context));
	  },
	  flatten: function(depth) {
	    return reify(this, flattenFactory(this, depth, true));
	  },
	  fromEntrySeq: function() {
	    return new FromEntriesSequence(this);
	  },
	  get: function(searchKey, notSetValue) {
	    return this.find((function(_, key) {
	      return is(key, searchKey);
	    }), undefined, notSetValue);
	  },
	  getIn: function(searchKeyPath, notSetValue) {
	    var nested = this;
	    if (searchKeyPath) {
	      for (var ii = 0; ii < searchKeyPath.length; ii++) {
	        nested = nested && nested.get ? nested.get(searchKeyPath[ii], NOT_SET) : NOT_SET;
	        if (nested === NOT_SET) {
	          return notSetValue;
	        }
	      }
	    }
	    return nested;
	  },
	  groupBy: function(grouper, context) {
	    return groupByFactory(this, grouper, context);
	  },
	  has: function(searchKey) {
	    return this.get(searchKey, NOT_SET) !== NOT_SET;
	  },
	  isSubset: function(iter) {
	    iter = typeof iter.contains === 'function' ? iter : $Iterable(iter);
	    return this.every((function(value) {
	      return iter.contains(value);
	    }));
	  },
	  isSuperset: function(iter) {
	    return iter.isSubset(this);
	  },
	  keySeq: function() {
	    return this.toSeq().map(keyMapper).toIndexedSeq();
	  },
	  last: function() {
	    return this.toSeq().reverse().first();
	  },
	  max: function(comparator) {
	    return maxFactory(this, comparator);
	  },
	  maxBy: function(mapper, comparator) {
	    return maxFactory(this, comparator, mapper);
	  },
	  min: function(comparator) {
	    return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator);
	  },
	  minBy: function(mapper, comparator) {
	    return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator, mapper);
	  },
	  rest: function() {
	    return this.slice(1);
	  },
	  skip: function(amount) {
	    return reify(this, skipFactory(this, amount, true));
	  },
	  skipLast: function(amount) {
	    return reify(this, this.toSeq().reverse().skip(amount).reverse());
	  },
	  skipWhile: function(predicate, context) {
	    return reify(this, skipWhileFactory(this, predicate, context, true));
	  },
	  skipUntil: function(predicate, context) {
	    return this.skipWhile(not(predicate), context);
	  },
	  sortBy: function(mapper, comparator) {
	    return reify(this, sortFactory(this, comparator, mapper));
	  },
	  take: function(amount) {
	    return reify(this, takeFactory(this, amount));
	  },
	  takeLast: function(amount) {
	    return reify(this, this.toSeq().reverse().take(amount).reverse());
	  },
	  takeWhile: function(predicate, context) {
	    return reify(this, takeWhileFactory(this, predicate, context));
	  },
	  takeUntil: function(predicate, context) {
	    return this.takeWhile(not(predicate), context);
	  },
	  valueSeq: function() {
	    return this.toIndexedSeq();
	  },
	  hashCode: function() {
	    return this.__hash || (this.__hash = this.size === Infinity ? 0 : this.reduce((function(h, v, k) {
	      return (h + (hash(v) ^ (v === k ? 0 : hash(k)))) & HASH_MAX_VAL;
	    }), 0));
	  }
	}, {});
	var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
	var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
	var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
	var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';
	var IterablePrototype = Iterable.prototype;
	IterablePrototype[IS_ITERABLE_SENTINEL] = true;
	IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;
	IterablePrototype.toJSON = IterablePrototype.toJS;
	IterablePrototype.__toJS = IterablePrototype.toArray;
	IterablePrototype.__toStringMapper = quoteString;
	IterablePrototype.inspect = IterablePrototype.toSource = function() {
	  return this.toString();
	};
	IterablePrototype.chain = IterablePrototype.flatMap;
	(function() {
	  try {
	    Object.defineProperty(IterablePrototype, 'length', {get: function() {
	        if (!Iterable.noLengthWarning) {
	          var stack;
	          try {
	            throw new Error();
	          } catch (error) {
	            stack = error.stack;
	          }
	          if (stack.indexOf('_wrapObject') === -1) {
	            console && console.warn && console.warn('iterable.length has been deprecated, ' + 'use iterable.size or iterable.count(). ' + 'This warning will become a silent error in a future version. ' + stack);
	            return this.size;
	          }
	        }
	      }});
	  } catch (e) {}
	})();
	var KeyedIterable = function KeyedIterable(value) {
	  return isKeyed(value) ? value : KeyedSeq(value);
	};
	($traceurRuntime.createClass)(KeyedIterable, {
	  flip: function() {
	    return reify(this, flipFactory(this));
	  },
	  findKey: function(predicate, context) {
	    var foundKey;
	    this.__iterate((function(v, k, c) {
	      if (predicate.call(context, v, k, c)) {
	        foundKey = k;
	        return false;
	      }
	    }));
	    return foundKey;
	  },
	  findLastKey: function(predicate, context) {
	    return this.toSeq().reverse().findKey(predicate, context);
	  },
	  keyOf: function(searchValue) {
	    return this.findKey((function(value) {
	      return is(value, searchValue);
	    }));
	  },
	  lastKeyOf: function(searchValue) {
	    return this.toSeq().reverse().keyOf(searchValue);
	  },
	  mapEntries: function(mapper, context) {
	    var $__0 = this;
	    var iterations = 0;
	    return reify(this, this.toSeq().map((function(v, k) {
	      return mapper.call(context, [k, v], iterations++, $__0);
	    })).fromEntrySeq());
	  },
	  mapKeys: function(mapper, context) {
	    var $__0 = this;
	    return reify(this, this.toSeq().flip().map((function(k, v) {
	      return mapper.call(context, k, v, $__0);
	    })).flip());
	  }
	}, {}, Iterable);
	var KeyedIterablePrototype = KeyedIterable.prototype;
	KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;
	KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;
	KeyedIterablePrototype.__toJS = IterablePrototype.toObject;
	KeyedIterablePrototype.__toStringMapper = (function(v, k) {
	  return k + ': ' + quoteString(v);
	});
	var IndexedIterable = function IndexedIterable(value) {
	  return isIndexed(value) ? value : IndexedSeq(value);
	};
	($traceurRuntime.createClass)(IndexedIterable, {
	  toKeyedSeq: function() {
	    return new ToKeyedSequence(this, false);
	  },
	  filter: function(predicate, context) {
	    return reify(this, filterFactory(this, predicate, context, false));
	  },
	  findIndex: function(predicate, context) {
	    var key = this.toKeyedSeq().findKey(predicate, context);
	    return key === undefined ? -1 : key;
	  },
	  indexOf: function(searchValue) {
	    var key = this.toKeyedSeq().keyOf(searchValue);
	    return key === undefined ? -1 : key;
	  },
	  lastIndexOf: function(searchValue) {
	    var key = this.toKeyedSeq().lastKeyOf(searchValue);
	    return key === undefined ? -1 : key;
	  },
	  reverse: function() {
	    return reify(this, reverseFactory(this, false));
	  },
	  splice: function(index, removeNum) {
	    var numArgs = arguments.length;
	    removeNum = Math.max(removeNum | 0, 0);
	    if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
	      return this;
	    }
	    index = resolveBegin(index, this.size);
	    var spliced = this.slice(0, index);
	    return reify(this, numArgs === 1 ? spliced : spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum)));
	  },
	  findLastIndex: function(predicate, context) {
	    var key = this.toKeyedSeq().findLastKey(predicate, context);
	    return key === undefined ? -1 : key;
	  },
	  first: function() {
	    return this.get(0);
	  },
	  flatten: function(depth) {
	    return reify(this, flattenFactory(this, depth, false));
	  },
	  get: function(index, notSetValue) {
	    index = wrapIndex(this, index);
	    return (index < 0 || (this.size === Infinity || (this.size !== undefined && index > this.size))) ? notSetValue : this.find((function(_, key) {
	      return key === index;
	    }), undefined, notSetValue);
	  },
	  has: function(index) {
	    index = wrapIndex(this, index);
	    return index >= 0 && (this.size !== undefined ? this.size === Infinity || index < this.size : this.indexOf(index) !== -1);
	  },
	  interpose: function(separator) {
	    return reify(this, interposeFactory(this, separator));
	  },
	  last: function() {
	    return this.get(-1);
	  },
	  skip: function(amount) {
	    var iter = this;
	    var skipSeq = skipFactory(iter, amount, false);
	    if (isSeq(iter) && skipSeq !== iter) {
	      skipSeq.get = function(index, notSetValue) {
	        index = wrapIndex(this, index);
	        return index >= 0 ? iter.get(index + amount, notSetValue) : notSetValue;
	      };
	    }
	    return reify(this, skipSeq);
	  },
	  skipWhile: function(predicate, context) {
	    return reify(this, skipWhileFactory(this, predicate, context, false));
	  },
	  take: function(amount) {
	    var iter = this;
	    var takeSeq = takeFactory(iter, amount);
	    if (isSeq(iter) && takeSeq !== iter) {
	      takeSeq.get = function(index, notSetValue) {
	        index = wrapIndex(this, index);
	        return index >= 0 && index < amount ? iter.get(index, notSetValue) : notSetValue;
	      };
	    }
	    return reify(this, takeSeq);
	  }
	}, {}, Iterable);
	IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;
	IndexedIterable.prototype[IS_ORDERED_SENTINEL] = true;
	var SetIterable = function SetIterable(value) {
	  return isIterable(value) && !isAssociative(value) ? value : SetSeq(value);
	};
	($traceurRuntime.createClass)(SetIterable, {
	  get: function(value, notSetValue) {
	    return this.has(value) ? value : notSetValue;
	  },
	  contains: function(value) {
	    return this.has(value);
	  },
	  keySeq: function() {
	    return this.valueSeq();
	  }
	}, {}, Iterable);
	SetIterable.prototype.has = IterablePrototype.contains;
	function isIterable(maybeIterable) {
	  return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);
	}
	function isKeyed(maybeKeyed) {
	  return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);
	}
	function isIndexed(maybeIndexed) {
	  return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);
	}
	function isAssociative(maybeAssociative) {
	  return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
	}
	function isOrdered(maybeOrdered) {
	  return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SENTINEL]);
	}
	Iterable.isIterable = isIterable;
	Iterable.isKeyed = isKeyed;
	Iterable.isIndexed = isIndexed;
	Iterable.isAssociative = isAssociative;
	Iterable.isOrdered = isOrdered;
	Iterable.Keyed = KeyedIterable;
	Iterable.Indexed = IndexedIterable;
	Iterable.Set = SetIterable;
	Iterable.Iterator = Iterator;
	function keyMapper(v, k) {
	  return k;
	}
	function entryMapper(v, k) {
	  return [k, v];
	}
	function not(predicate) {
	  return function() {
	    return !predicate.apply(this, arguments);
	  };
	}
	function neg(predicate) {
	  return function() {
	    return -predicate.apply(this, arguments);
	  };
	}
	function quoteString(value) {
	  return typeof value === 'string' ? JSON.stringify(value) : value;
	}
	function defaultNegComparator(a, b) {
	  return a > b ? -1 : a < b ? 1 : 0;
	}
	function deepEqual(a, b) {
	  var bothNotAssociative = !isAssociative(a) && !isAssociative(b);
	  if (isOrdered(a)) {
	    if (!isOrdered(b)) {
	      return false;
	    }
	    var entries = a.entries();
	    return b.every((function(v, k) {
	      var entry = entries.next().value;
	      return entry && is(entry[1], v) && (bothNotAssociative || is(entry[0], k));
	    })) && entries.next().done;
	  }
	  var flipped = false;
	  if (a.size === undefined) {
	    if (b.size === undefined) {
	      a.cacheResult();
	    } else {
	      flipped = true;
	      var _ = a;
	      a = b;
	      b = _;
	    }
	  }
	  var allEqual = true;
	  var bSize = b.__iterate((function(v, k) {
	    if (bothNotAssociative ? !a.has(v) : flipped ? !is(v, a.get(k, NOT_SET)) : !is(a.get(k, NOT_SET), v)) {
	      allEqual = false;
	      return false;
	    }
	  }));
	  return allEqual && a.size === bSize;
	}
	function mixin(ctor, methods) {
	  var proto = ctor.prototype;
	  var keyCopier = (function(key) {
	    proto[key] = methods[key];
	  });
	  Object.keys(methods).forEach(keyCopier);
	  Object.getOwnPropertySymbols && Object.getOwnPropertySymbols(methods).forEach(keyCopier);
	  return ctor;
	}
	var Seq = function Seq(value) {
	  return value === null || value === undefined ? emptySequence() : isIterable(value) ? value.toSeq() : seqFromValue(value);
	};
	var $Seq = Seq;
	($traceurRuntime.createClass)(Seq, {
	  toSeq: function() {
	    return this;
	  },
	  toString: function() {
	    return this.__toString('Seq {', '}');
	  },
	  cacheResult: function() {
	    if (!this._cache && this.__iterateUncached) {
	      this._cache = this.entrySeq().toArray();
	      this.size = this._cache.length;
	    }
	    return this;
	  },
	  __iterate: function(fn, reverse) {
	    return seqIterate(this, fn, reverse, true);
	  },
	  __iterator: function(type, reverse) {
	    return seqIterator(this, type, reverse, true);
	  }
	}, {of: function() {
	    return $Seq(arguments);
	  }}, Iterable);
	var KeyedSeq = function KeyedSeq(value) {
	  return value === null || value === undefined ? emptySequence().toKeyedSeq() : isIterable(value) ? (isKeyed(value) ? value.toSeq() : value.fromEntrySeq()) : keyedSeqFromValue(value);
	};
	var $KeyedSeq = KeyedSeq;
	($traceurRuntime.createClass)(KeyedSeq, {
	  toKeyedSeq: function() {
	    return this;
	  },
	  toSeq: function() {
	    return this;
	  }
	}, {of: function() {
	    return $KeyedSeq(arguments);
	  }}, Seq);
	mixin(KeyedSeq, KeyedIterable.prototype);
	var IndexedSeq = function IndexedSeq(value) {
	  return value === null || value === undefined ? emptySequence() : !isIterable(value) ? indexedSeqFromValue(value) : isKeyed(value) ? value.entrySeq() : value.toIndexedSeq();
	};
	var $IndexedSeq = IndexedSeq;
	($traceurRuntime.createClass)(IndexedSeq, {
	  toIndexedSeq: function() {
	    return this;
	  },
	  toString: function() {
	    return this.__toString('Seq [', ']');
	  },
	  __iterate: function(fn, reverse) {
	    return seqIterate(this, fn, reverse, false);
	  },
	  __iterator: function(type, reverse) {
	    return seqIterator(this, type, reverse, false);
	  }
	}, {of: function() {
	    return $IndexedSeq(arguments);
	  }}, Seq);
	mixin(IndexedSeq, IndexedIterable.prototype);
	var SetSeq = function SetSeq(value) {
	  return (value === null || value === undefined ? emptySequence() : !isIterable(value) ? indexedSeqFromValue(value) : isKeyed(value) ? value.entrySeq() : value).toSetSeq();
	};
	var $SetSeq = SetSeq;
	($traceurRuntime.createClass)(SetSeq, {toSetSeq: function() {
	    return this;
	  }}, {of: function() {
	    return $SetSeq(arguments);
	  }}, Seq);
	mixin(SetSeq, SetIterable.prototype);
	Seq.isSeq = isSeq;
	Seq.Keyed = KeyedSeq;
	Seq.Set = SetSeq;
	Seq.Indexed = IndexedSeq;
	var IS_SEQ_SENTINEL = '@@__IMMUTABLE_SEQ__@@';
	Seq.prototype[IS_SEQ_SENTINEL] = true;
	var ArraySeq = function ArraySeq(array) {
	  this._array = array;
	  this.size = array.length;
	};
	($traceurRuntime.createClass)(ArraySeq, {
	  get: function(index, notSetValue) {
	    return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
	  },
	  __iterate: function(fn, reverse) {
	    var array = this._array;
	    var maxIndex = array.length - 1;
	    for (var ii = 0; ii <= maxIndex; ii++) {
	      if (fn(array[reverse ? maxIndex - ii : ii], ii, this) === false) {
	        return ii + 1;
	      }
	    }
	    return ii;
	  },
	  __iterator: function(type, reverse) {
	    var array = this._array;
	    var maxIndex = array.length - 1;
	    var ii = 0;
	    return new Iterator((function() {
	      return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii, array[reverse ? maxIndex - ii++ : ii++]);
	    }));
	  }
	}, {}, IndexedSeq);
	var ObjectSeq = function ObjectSeq(object) {
	  var keys = Object.keys(object);
	  this._object = object;
	  this._keys = keys;
	  this.size = keys.length;
	};
	($traceurRuntime.createClass)(ObjectSeq, {
	  get: function(key, notSetValue) {
	    if (notSetValue !== undefined && !this.has(key)) {
	      return notSetValue;
	    }
	    return this._object[key];
	  },
	  has: function(key) {
	    return this._object.hasOwnProperty(key);
	  },
	  __iterate: function(fn, reverse) {
	    var object = this._object;
	    var keys = this._keys;
	    var maxIndex = keys.length - 1;
	    for (var ii = 0; ii <= maxIndex; ii++) {
	      var key = keys[reverse ? maxIndex - ii : ii];
	      if (fn(object[key], key, this) === false) {
	        return ii + 1;
	      }
	    }
	    return ii;
	  },
	  __iterator: function(type, reverse) {
	    var object = this._object;
	    var keys = this._keys;
	    var maxIndex = keys.length - 1;
	    var ii = 0;
	    return new Iterator((function() {
	      var key = keys[reverse ? maxIndex - ii : ii];
	      return ii++ > maxIndex ? iteratorDone() : iteratorValue(type, key, object[key]);
	    }));
	  }
	}, {}, KeyedSeq);
	ObjectSeq.prototype[IS_ORDERED_SENTINEL] = true;
	var IterableSeq = function IterableSeq(iterable) {
	  this._iterable = iterable;
	  this.size = iterable.length || iterable.size;
	};
	($traceurRuntime.createClass)(IterableSeq, {
	  __iterateUncached: function(fn, reverse) {
	    if (reverse) {
	      return this.cacheResult().__iterate(fn, reverse);
	    }
	    var iterable = this._iterable;
	    var iterator = getIterator(iterable);
	    var iterations = 0;
	    if (isIterator(iterator)) {
	      var step;
	      while (!(step = iterator.next()).done) {
	        if (fn(step.value, iterations++, this) === false) {
	          break;
	        }
	      }
	    }
	    return iterations;
	  },
	  __iteratorUncached: function(type, reverse) {
	    if (reverse) {
	      return this.cacheResult().__iterator(type, reverse);
	    }
	    var iterable = this._iterable;
	    var iterator = getIterator(iterable);
	    if (!isIterator(iterator)) {
	      return new Iterator(iteratorDone);
	    }
	    var iterations = 0;
	    return new Iterator((function() {
	      var step = iterator.next();
	      return step.done ? step : iteratorValue(type, iterations++, step.value);
	    }));
	  }
	}, {}, IndexedSeq);
	var IteratorSeq = function IteratorSeq(iterator) {
	  this._iterator = iterator;
	  this._iteratorCache = [];
	};
	($traceurRuntime.createClass)(IteratorSeq, {
	  __iterateUncached: function(fn, reverse) {
	    if (reverse) {
	      return this.cacheResult().__iterate(fn, reverse);
	    }
	    var iterator = this._iterator;
	    var cache = this._iteratorCache;
	    var iterations = 0;
	    while (iterations < cache.length) {
	      if (fn(cache[iterations], iterations++, this) === false) {
	        return iterations;
	      }
	    }
	    var step;
	    while (!(step = iterator.next()).done) {
	      var val = step.value;
	      cache[iterations] = val;
	      if (fn(val, iterations++, this) === false) {
	        break;
	      }
	    }
	    return iterations;
	  },
	  __iteratorUncached: function(type, reverse) {
	    if (reverse) {
	      return this.cacheResult().__iterator(type, reverse);
	    }
	    var iterator = this._iterator;
	    var cache = this._iteratorCache;
	    var iterations = 0;
	    return new Iterator((function() {
	      if (iterations >= cache.length) {
	        var step = iterator.next();
	        if (step.done) {
	          return step;
	        }
	        cache[iterations] = step.value;
	      }
	      return iteratorValue(type, iterations, cache[iterations++]);
	    }));
	  }
	}, {}, IndexedSeq);
	function isSeq(maybeSeq) {
	  return !!(maybeSeq && maybeSeq[IS_SEQ_SENTINEL]);
	}
	var EMPTY_SEQ;
	function emptySequence() {
	  return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
	}
	function keyedSeqFromValue(value) {
	  var seq = Array.isArray(value) ? new ArraySeq(value).fromEntrySeq() : isIterator(value) ? new IteratorSeq(value).fromEntrySeq() : hasIterator(value) ? new IterableSeq(value).fromEntrySeq() : typeof value === 'object' ? new ObjectSeq(value) : undefined;
	  if (!seq) {
	    throw new TypeError('Expected Array or iterable object of [k, v] entries, ' + 'or keyed object: ' + value);
	  }
	  return seq;
	}
	function indexedSeqFromValue(value) {
	  var seq = maybeIndexedSeqFromValue(value);
	  if (!seq) {
	    throw new TypeError('Expected Array or iterable object of values: ' + value);
	  }
	  return seq;
	}
	function seqFromValue(value) {
	  var seq = maybeIndexedSeqFromValue(value) || (typeof value === 'object' && new ObjectSeq(value));
	  if (!seq) {
	    throw new TypeError('Expected Array or iterable object of values, or keyed object: ' + value);
	  }
	  return seq;
	}
	function maybeIndexedSeqFromValue(value) {
	  return (isArrayLike(value) ? new ArraySeq(value) : isIterator(value) ? new IteratorSeq(value) : hasIterator(value) ? new IterableSeq(value) : undefined);
	}
	function isArrayLike(value) {
	  return value && typeof value.length === 'number';
	}
	function seqIterate(seq, fn, reverse, useKeys) {
	  assertNotInfinite(seq.size);
	  var cache = seq._cache;
	  if (cache) {
	    var maxIndex = cache.length - 1;
	    for (var ii = 0; ii <= maxIndex; ii++) {
	      var entry = cache[reverse ? maxIndex - ii : ii];
	      if (fn(entry[1], useKeys ? entry[0] : ii, seq) === false) {
	        return ii + 1;
	      }
	    }
	    return ii;
	  }
	  return seq.__iterateUncached(fn, reverse);
	}
	function seqIterator(seq, type, reverse, useKeys) {
	  var cache = seq._cache;
	  if (cache) {
	    var maxIndex = cache.length - 1;
	    var ii = 0;
	    return new Iterator((function() {
	      var entry = cache[reverse ? maxIndex - ii : ii];
	      return ii++ > maxIndex ? iteratorDone() : iteratorValue(type, useKeys ? entry[0] : ii - 1, entry[1]);
	    }));
	  }
	  return seq.__iteratorUncached(type, reverse);
	}
	function fromJS(json, converter) {
	  return converter ? _fromJSWith(converter, json, '', {'': json}) : _fromJSDefault(json);
	}
	function _fromJSWith(converter, json, key, parentJSON) {
	  if (Array.isArray(json)) {
	    return converter.call(parentJSON, key, IndexedSeq(json).map((function(v, k) {
	      return _fromJSWith(converter, v, k, json);
	    })));
	  }
	  if (isPlainObj(json)) {
	    return converter.call(parentJSON, key, KeyedSeq(json).map((function(v, k) {
	      return _fromJSWith(converter, v, k, json);
	    })));
	  }
	  return json;
	}
	function _fromJSDefault(json) {
	  if (Array.isArray(json)) {
	    return IndexedSeq(json).map(_fromJSDefault).toList();
	  }
	  if (isPlainObj(json)) {
	    return KeyedSeq(json).map(_fromJSDefault).toMap();
	  }
	  return json;
	}
	function isPlainObj(value) {
	  return value && value.constructor === Object;
	}
	var Collection = function Collection() {
	  throw TypeError('Abstract');
	};
	($traceurRuntime.createClass)(Collection, {}, {}, Iterable);
	var KeyedCollection = function KeyedCollection() {
	  $traceurRuntime.defaultSuperCall(this, $KeyedCollection.prototype, arguments);
	};
	var $KeyedCollection = KeyedCollection;
	($traceurRuntime.createClass)(KeyedCollection, {}, {}, Collection);
	mixin(KeyedCollection, KeyedIterable.prototype);
	var IndexedCollection = function IndexedCollection() {
	  $traceurRuntime.defaultSuperCall(this, $IndexedCollection.prototype, arguments);
	};
	var $IndexedCollection = IndexedCollection;
	($traceurRuntime.createClass)(IndexedCollection, {}, {}, Collection);
	mixin(IndexedCollection, IndexedIterable.prototype);
	var SetCollection = function SetCollection() {
	  $traceurRuntime.defaultSuperCall(this, $SetCollection.prototype, arguments);
	};
	var $SetCollection = SetCollection;
	($traceurRuntime.createClass)(SetCollection, {}, {}, Collection);
	mixin(SetCollection, SetIterable.prototype);
	Collection.Keyed = KeyedCollection;
	Collection.Indexed = IndexedCollection;
	Collection.Set = SetCollection;
	var Map = function Map(value) {
	  return value === null || value === undefined ? emptyMap() : isMap(value) ? value : emptyMap().merge(KeyedIterable(value));
	};
	($traceurRuntime.createClass)(Map, {
	  toString: function() {
	    return this.__toString('Map {', '}');
	  },
	  get: function(k, notSetValue) {
	    return this._root ? this._root.get(0, undefined, k, notSetValue) : notSetValue;
	  },
	  set: function(k, v) {
	    return updateMap(this, k, v);
	  },
	  setIn: function(keyPath, v) {
	    invariant(keyPath.length > 0, 'Requires non-empty key path.');
	    return this.updateIn(keyPath, (function() {
	      return v;
	    }));
	  },
	  remove: function(k) {
	    return updateMap(this, k, NOT_SET);
	  },
	  removeIn: function(keyPath) {
	    invariant(keyPath.length > 0, 'Requires non-empty key path.');
	    return this.updateIn(keyPath, (function() {
	      return NOT_SET;
	    }));
	  },
	  update: function(k, notSetValue, updater) {
	    return arguments.length === 1 ? k(this) : this.updateIn([k], notSetValue, updater);
	  },
	  updateIn: function(keyPath, notSetValue, updater) {
	    if (!updater) {
	      updater = notSetValue;
	      notSetValue = undefined;
	    }
	    return keyPath.length === 0 ? updater(this) : updateInDeepMap(this, keyPath, notSetValue, updater, 0);
	  },
	  clear: function() {
	    if (this.size === 0) {
	      return this;
	    }
	    if (this.__ownerID) {
	      this.size = 0;
	      this._root = null;
	      this.__hash = undefined;
	      this.__altered = true;
	      return this;
	    }
	    return emptyMap();
	  },
	  merge: function() {
	    return mergeIntoMapWith(this, undefined, arguments);
	  },
	  mergeWith: function(merger) {
	    for (var iters = [],
	        $__3 = 1; $__3 < arguments.length; $__3++)
	      iters[$__3 - 1] = arguments[$__3];
	    return mergeIntoMapWith(this, merger, iters);
	  },
	  mergeDeep: function() {
	    return mergeIntoMapWith(this, deepMerger(undefined), arguments);
	  },
	  mergeDeepWith: function(merger) {
	    for (var iters = [],
	        $__4 = 1; $__4 < arguments.length; $__4++)
	      iters[$__4 - 1] = arguments[$__4];
	    return mergeIntoMapWith(this, deepMerger(merger), iters);
	  },
	  sort: function(comparator) {
	    return OrderedMap(sortFactory(this, comparator));
	  },
	  sortBy: function(mapper, comparator) {
	    return OrderedMap(sortFactory(this, comparator, mapper));
	  },
	  withMutations: function(fn) {
	    var mutable = this.asMutable();
	    fn(mutable);
	    return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
	  },
	  asMutable: function() {
	    return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
	  },
	  asImmutable: function() {
	    return this.__ensureOwner();
	  },
	  wasAltered: function() {
	    return this.__altered;
	  },
	  __iterator: function(type, reverse) {
	    return new MapIterator(this, type, reverse);
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    var iterations = 0;
	    this._root && this._root.iterate((function(entry) {
	      iterations++;
	      return fn(entry[1], entry[0], $__0);
	    }), reverse);
	    return iterations;
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      this.__altered = false;
	      return this;
	    }
	    return makeMap(this.size, this._root, ownerID, this.__hash);
	  }
	}, {}, KeyedCollection);
	function isMap(maybeMap) {
	  return !!(maybeMap && maybeMap[IS_MAP_SENTINEL]);
	}
	Map.isMap = isMap;
	var IS_MAP_SENTINEL = '@@__IMMUTABLE_MAP__@@';
	var MapPrototype = Map.prototype;
	MapPrototype[IS_MAP_SENTINEL] = true;
	MapPrototype[DELETE] = MapPrototype.remove;
	var ArrayMapNode = function ArrayMapNode(ownerID, entries) {
	  this.ownerID = ownerID;
	  this.entries = entries;
	};
	var $ArrayMapNode = ArrayMapNode;
	($traceurRuntime.createClass)(ArrayMapNode, {
	  get: function(shift, keyHash, key, notSetValue) {
	    var entries = this.entries;
	    for (var ii = 0,
	        len = entries.length; ii < len; ii++) {
	      if (is(key, entries[ii][0])) {
	        return entries[ii][1];
	      }
	    }
	    return notSetValue;
	  },
	  update: function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	    var removed = value === NOT_SET;
	    var entries = this.entries;
	    var idx = 0;
	    for (var len = entries.length; idx < len; idx++) {
	      if (is(key, entries[idx][0])) {
	        break;
	      }
	    }
	    var exists = idx < len;
	    if (exists ? entries[idx][1] === value : removed) {
	      return this;
	    }
	    SetRef(didAlter);
	    (removed || !exists) && SetRef(didChangeSize);
	    if (removed && entries.length === 1) {
	      return;
	    }
	    if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
	      return createNodes(ownerID, entries, key, value);
	    }
	    var isEditable = ownerID && ownerID === this.ownerID;
	    var newEntries = isEditable ? entries : arrCopy(entries);
	    if (exists) {
	      if (removed) {
	        idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
	      } else {
	        newEntries[idx] = [key, value];
	      }
	    } else {
	      newEntries.push([key, value]);
	    }
	    if (isEditable) {
	      this.entries = newEntries;
	      return this;
	    }
	    return new $ArrayMapNode(ownerID, newEntries);
	  }
	}, {});
	var BitmapIndexedNode = function BitmapIndexedNode(ownerID, bitmap, nodes) {
	  this.ownerID = ownerID;
	  this.bitmap = bitmap;
	  this.nodes = nodes;
	};
	var $BitmapIndexedNode = BitmapIndexedNode;
	($traceurRuntime.createClass)(BitmapIndexedNode, {
	  get: function(shift, keyHash, key, notSetValue) {
	    if (keyHash === undefined) {
	      keyHash = hash(key);
	    }
	    var bit = (1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK));
	    var bitmap = this.bitmap;
	    return (bitmap & bit) === 0 ? notSetValue : this.nodes[popCount(bitmap & (bit - 1))].get(shift + SHIFT, keyHash, key, notSetValue);
	  },
	  update: function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	    if (keyHash === undefined) {
	      keyHash = hash(key);
	    }
	    var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
	    var bit = 1 << keyHashFrag;
	    var bitmap = this.bitmap;
	    var exists = (bitmap & bit) !== 0;
	    if (!exists && value === NOT_SET) {
	      return this;
	    }
	    var idx = popCount(bitmap & (bit - 1));
	    var nodes = this.nodes;
	    var node = exists ? nodes[idx] : undefined;
	    var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
	    if (newNode === node) {
	      return this;
	    }
	    if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
	      return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
	    }
	    if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
	      return nodes[idx ^ 1];
	    }
	    if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
	      return newNode;
	    }
	    var isEditable = ownerID && ownerID === this.ownerID;
	    var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
	    var newNodes = exists ? newNode ? setIn(nodes, idx, newNode, isEditable) : spliceOut(nodes, idx, isEditable) : spliceIn(nodes, idx, newNode, isEditable);
	    if (isEditable) {
	      this.bitmap = newBitmap;
	      this.nodes = newNodes;
	      return this;
	    }
	    return new $BitmapIndexedNode(ownerID, newBitmap, newNodes);
	  }
	}, {});
	var HashArrayMapNode = function HashArrayMapNode(ownerID, count, nodes) {
	  this.ownerID = ownerID;
	  this.count = count;
	  this.nodes = nodes;
	};
	var $HashArrayMapNode = HashArrayMapNode;
	($traceurRuntime.createClass)(HashArrayMapNode, {
	  get: function(shift, keyHash, key, notSetValue) {
	    if (keyHash === undefined) {
	      keyHash = hash(key);
	    }
	    var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
	    var node = this.nodes[idx];
	    return node ? node.get(shift + SHIFT, keyHash, key, notSetValue) : notSetValue;
	  },
	  update: function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	    if (keyHash === undefined) {
	      keyHash = hash(key);
	    }
	    var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
	    var removed = value === NOT_SET;
	    var nodes = this.nodes;
	    var node = nodes[idx];
	    if (removed && !node) {
	      return this;
	    }
	    var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
	    if (newNode === node) {
	      return this;
	    }
	    var newCount = this.count;
	    if (!node) {
	      newCount++;
	    } else if (!newNode) {
	      newCount--;
	      if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
	        return packNodes(ownerID, nodes, newCount, idx);
	      }
	    }
	    var isEditable = ownerID && ownerID === this.ownerID;
	    var newNodes = setIn(nodes, idx, newNode, isEditable);
	    if (isEditable) {
	      this.count = newCount;
	      this.nodes = newNodes;
	      return this;
	    }
	    return new $HashArrayMapNode(ownerID, newCount, newNodes);
	  }
	}, {});
	var HashCollisionNode = function HashCollisionNode(ownerID, keyHash, entries) {
	  this.ownerID = ownerID;
	  this.keyHash = keyHash;
	  this.entries = entries;
	};
	var $HashCollisionNode = HashCollisionNode;
	($traceurRuntime.createClass)(HashCollisionNode, {
	  get: function(shift, keyHash, key, notSetValue) {
	    var entries = this.entries;
	    for (var ii = 0,
	        len = entries.length; ii < len; ii++) {
	      if (is(key, entries[ii][0])) {
	        return entries[ii][1];
	      }
	    }
	    return notSetValue;
	  },
	  update: function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	    if (keyHash === undefined) {
	      keyHash = hash(key);
	    }
	    var removed = value === NOT_SET;
	    if (keyHash !== this.keyHash) {
	      if (removed) {
	        return this;
	      }
	      SetRef(didAlter);
	      SetRef(didChangeSize);
	      return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
	    }
	    var entries = this.entries;
	    var idx = 0;
	    for (var len = entries.length; idx < len; idx++) {
	      if (is(key, entries[idx][0])) {
	        break;
	      }
	    }
	    var exists = idx < len;
	    if (exists ? entries[idx][1] === value : removed) {
	      return this;
	    }
	    SetRef(didAlter);
	    (removed || !exists) && SetRef(didChangeSize);
	    if (removed && len === 2) {
	      return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
	    }
	    var isEditable = ownerID && ownerID === this.ownerID;
	    var newEntries = isEditable ? entries : arrCopy(entries);
	    if (exists) {
	      if (removed) {
	        idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
	      } else {
	        newEntries[idx] = [key, value];
	      }
	    } else {
	      newEntries.push([key, value]);
	    }
	    if (isEditable) {
	      this.entries = newEntries;
	      return this;
	    }
	    return new $HashCollisionNode(ownerID, this.keyHash, newEntries);
	  }
	}, {});
	var ValueNode = function ValueNode(ownerID, keyHash, entry) {
	  this.ownerID = ownerID;
	  this.keyHash = keyHash;
	  this.entry = entry;
	};
	var $ValueNode = ValueNode;
	($traceurRuntime.createClass)(ValueNode, {
	  get: function(shift, keyHash, key, notSetValue) {
	    return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
	  },
	  update: function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	    var removed = value === NOT_SET;
	    var keyMatch = is(key, this.entry[0]);
	    if (keyMatch ? value === this.entry[1] : removed) {
	      return this;
	    }
	    SetRef(didAlter);
	    if (removed) {
	      SetRef(didChangeSize);
	      return;
	    }
	    if (keyMatch) {
	      if (ownerID && ownerID === this.ownerID) {
	        this.entry[1] = value;
	        return this;
	      }
	      return new $ValueNode(ownerID, this.keyHash, [key, value]);
	    }
	    SetRef(didChangeSize);
	    return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
	  }
	}, {});
	ArrayMapNode.prototype.iterate = HashCollisionNode.prototype.iterate = function(fn, reverse) {
	  var entries = this.entries;
	  for (var ii = 0,
	      maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
	    if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
	      return false;
	    }
	  }
	};
	BitmapIndexedNode.prototype.iterate = HashArrayMapNode.prototype.iterate = function(fn, reverse) {
	  var nodes = this.nodes;
	  for (var ii = 0,
	      maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
	    var node = nodes[reverse ? maxIndex - ii : ii];
	    if (node && node.iterate(fn, reverse) === false) {
	      return false;
	    }
	  }
	};
	ValueNode.prototype.iterate = function(fn, reverse) {
	  return fn(this.entry);
	};
	var MapIterator = function MapIterator(map, type, reverse) {
	  this._type = type;
	  this._reverse = reverse;
	  this._stack = map._root && mapIteratorFrame(map._root);
	};
	($traceurRuntime.createClass)(MapIterator, {next: function() {
	    var type = this._type;
	    var stack = this._stack;
	    while (stack) {
	      var node = stack.node;
	      var index = stack.index++;
	      var maxIndex;
	      if (node.entry) {
	        if (index === 0) {
	          return mapIteratorValue(type, node.entry);
	        }
	      } else if (node.entries) {
	        maxIndex = node.entries.length - 1;
	        if (index <= maxIndex) {
	          return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
	        }
	      } else {
	        maxIndex = node.nodes.length - 1;
	        if (index <= maxIndex) {
	          var subNode = node.nodes[this._reverse ? maxIndex - index : index];
	          if (subNode) {
	            if (subNode.entry) {
	              return mapIteratorValue(type, subNode.entry);
	            }
	            stack = this._stack = mapIteratorFrame(subNode, stack);
	          }
	          continue;
	        }
	      }
	      stack = this._stack = this._stack.__prev;
	    }
	    return iteratorDone();
	  }}, {}, Iterator);
	function mapIteratorValue(type, entry) {
	  return iteratorValue(type, entry[0], entry[1]);
	}
	function mapIteratorFrame(node, prev) {
	  return {
	    node: node,
	    index: 0,
	    __prev: prev
	  };
	}
	function makeMap(size, root, ownerID, hash) {
	  var map = Object.create(MapPrototype);
	  map.size = size;
	  map._root = root;
	  map.__ownerID = ownerID;
	  map.__hash = hash;
	  map.__altered = false;
	  return map;
	}
	var EMPTY_MAP;
	function emptyMap() {
	  return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
	}
	function updateMap(map, k, v) {
	  var newRoot;
	  var newSize;
	  if (!map._root) {
	    if (v === NOT_SET) {
	      return map;
	    }
	    newSize = 1;
	    newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
	  } else {
	    var didChangeSize = MakeRef(CHANGE_LENGTH);
	    var didAlter = MakeRef(DID_ALTER);
	    newRoot = updateNode(map._root, map.__ownerID, 0, undefined, k, v, didChangeSize, didAlter);
	    if (!didAlter.value) {
	      return map;
	    }
	    newSize = map.size + (didChangeSize.value ? v === NOT_SET ? -1 : 1 : 0);
	  }
	  if (map.__ownerID) {
	    map.size = newSize;
	    map._root = newRoot;
	    map.__hash = undefined;
	    map.__altered = true;
	    return map;
	  }
	  return newRoot ? makeMap(newSize, newRoot) : emptyMap();
	}
	function updateNode(node, ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	  if (!node) {
	    if (value === NOT_SET) {
	      return node;
	    }
	    SetRef(didAlter);
	    SetRef(didChangeSize);
	    return new ValueNode(ownerID, keyHash, [key, value]);
	  }
	  return node.update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter);
	}
	function isLeafNode(node) {
	  return node.constructor === ValueNode || node.constructor === HashCollisionNode;
	}
	function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
	  if (node.keyHash === keyHash) {
	    return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
	  }
	  var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
	  var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
	  var newNode;
	  var nodes = idx1 === idx2 ? [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)] : ((newNode = new ValueNode(ownerID, keyHash, entry)), idx1 < idx2 ? [node, newNode] : [newNode, node]);
	  return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
	}
	function createNodes(ownerID, entries, key, value) {
	  if (!ownerID) {
	    ownerID = new OwnerID();
	  }
	  var node = new ValueNode(ownerID, hash(key), [key, value]);
	  for (var ii = 0; ii < entries.length; ii++) {
	    var entry = entries[ii];
	    node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
	  }
	  return node;
	}
	function packNodes(ownerID, nodes, count, excluding) {
	  var bitmap = 0;
	  var packedII = 0;
	  var packedNodes = new Array(count);
	  for (var ii = 0,
	      bit = 1,
	      len = nodes.length; ii < len; ii++, bit <<= 1) {
	    var node = nodes[ii];
	    if (node !== undefined && ii !== excluding) {
	      bitmap |= bit;
	      packedNodes[packedII++] = node;
	    }
	  }
	  return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
	}
	function expandNodes(ownerID, nodes, bitmap, including, node) {
	  var count = 0;
	  var expandedNodes = new Array(SIZE);
	  for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
	    expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
	  }
	  expandedNodes[including] = node;
	  return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
	}
	function mergeIntoMapWith(map, merger, iterables) {
	  var iters = [];
	  for (var ii = 0; ii < iterables.length; ii++) {
	    var value = iterables[ii];
	    var iter = KeyedIterable(value);
	    if (!isIterable(value)) {
	      iter = iter.map((function(v) {
	        return fromJS(v);
	      }));
	    }
	    iters.push(iter);
	  }
	  return mergeIntoCollectionWith(map, merger, iters);
	}
	function deepMerger(merger) {
	  return (function(existing, value) {
	    return existing && existing.mergeDeepWith && isIterable(value) ? existing.mergeDeepWith(merger, value) : merger ? merger(existing, value) : value;
	  });
	}
	function mergeIntoCollectionWith(collection, merger, iters) {
	  if (iters.length === 0) {
	    return collection;
	  }
	  return collection.withMutations((function(collection) {
	    var mergeIntoMap = merger ? (function(value, key) {
	      collection.update(key, NOT_SET, (function(existing) {
	        return existing === NOT_SET ? value : merger(existing, value);
	      }));
	    }) : (function(value, key) {
	      collection.set(key, value);
	    });
	    for (var ii = 0; ii < iters.length; ii++) {
	      iters[ii].forEach(mergeIntoMap);
	    }
	  }));
	}
	function updateInDeepMap(collection, keyPath, notSetValue, updater, offset) {
	  invariant(!collection || collection.set, 'updateIn with invalid keyPath');
	  var key = keyPath[offset];
	  var existing = collection ? collection.get(key, NOT_SET) : NOT_SET;
	  var existingValue = existing === NOT_SET ? undefined : existing;
	  var value = offset === keyPath.length - 1 ? updater(existing === NOT_SET ? notSetValue : existing) : updateInDeepMap(existingValue, keyPath, notSetValue, updater, offset + 1);
	  return value === existingValue ? collection : value === NOT_SET ? collection && collection.remove(key) : (collection || emptyMap()).set(key, value);
	}
	function popCount(x) {
	  x = x - ((x >> 1) & 0x55555555);
	  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
	  x = (x + (x >> 4)) & 0x0f0f0f0f;
	  x = x + (x >> 8);
	  x = x + (x >> 16);
	  return x & 0x7f;
	}
	function setIn(array, idx, val, canEdit) {
	  var newArray = canEdit ? array : arrCopy(array);
	  newArray[idx] = val;
	  return newArray;
	}
	function spliceIn(array, idx, val, canEdit) {
	  var newLen = array.length + 1;
	  if (canEdit && idx + 1 === newLen) {
	    array[idx] = val;
	    return array;
	  }
	  var newArray = new Array(newLen);
	  var after = 0;
	  for (var ii = 0; ii < newLen; ii++) {
	    if (ii === idx) {
	      newArray[ii] = val;
	      after = -1;
	    } else {
	      newArray[ii] = array[ii + after];
	    }
	  }
	  return newArray;
	}
	function spliceOut(array, idx, canEdit) {
	  var newLen = array.length - 1;
	  if (canEdit && idx === newLen) {
	    array.pop();
	    return array;
	  }
	  var newArray = new Array(newLen);
	  var after = 0;
	  for (var ii = 0; ii < newLen; ii++) {
	    if (ii === idx) {
	      after = 1;
	    }
	    newArray[ii] = array[ii + after];
	  }
	  return newArray;
	}
	var MAX_ARRAY_MAP_SIZE = SIZE / 4;
	var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
	var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;
	var ToKeyedSequence = function ToKeyedSequence(indexed, useKeys) {
	  this._iter = indexed;
	  this._useKeys = useKeys;
	  this.size = indexed.size;
	};
	($traceurRuntime.createClass)(ToKeyedSequence, {
	  get: function(key, notSetValue) {
	    return this._iter.get(key, notSetValue);
	  },
	  has: function(key) {
	    return this._iter.has(key);
	  },
	  valueSeq: function() {
	    return this._iter.valueSeq();
	  },
	  reverse: function() {
	    var $__0 = this;
	    var reversedSequence = reverseFactory(this, true);
	    if (!this._useKeys) {
	      reversedSequence.valueSeq = (function() {
	        return $__0._iter.toSeq().reverse();
	      });
	    }
	    return reversedSequence;
	  },
	  map: function(mapper, context) {
	    var $__0 = this;
	    var mappedSequence = mapFactory(this, mapper, context);
	    if (!this._useKeys) {
	      mappedSequence.valueSeq = (function() {
	        return $__0._iter.toSeq().map(mapper, context);
	      });
	    }
	    return mappedSequence;
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    var ii;
	    return this._iter.__iterate(this._useKeys ? (function(v, k) {
	      return fn(v, k, $__0);
	    }) : ((ii = reverse ? resolveSize(this) : 0), (function(v) {
	      return fn(v, reverse ? --ii : ii++, $__0);
	    })), reverse);
	  },
	  __iterator: function(type, reverse) {
	    if (this._useKeys) {
	      return this._iter.__iterator(type, reverse);
	    }
	    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
	    var ii = reverse ? resolveSize(this) : 0;
	    return new Iterator((function() {
	      var step = iterator.next();
	      return step.done ? step : iteratorValue(type, reverse ? --ii : ii++, step.value, step);
	    }));
	  }
	}, {}, KeyedSeq);
	ToKeyedSequence.prototype[IS_ORDERED_SENTINEL] = true;
	var ToIndexedSequence = function ToIndexedSequence(iter) {
	  this._iter = iter;
	  this.size = iter.size;
	};
	($traceurRuntime.createClass)(ToIndexedSequence, {
	  contains: function(value) {
	    return this._iter.contains(value);
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    var iterations = 0;
	    return this._iter.__iterate((function(v) {
	      return fn(v, iterations++, $__0);
	    }), reverse);
	  },
	  __iterator: function(type, reverse) {
	    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
	    var iterations = 0;
	    return new Iterator((function() {
	      var step = iterator.next();
	      return step.done ? step : iteratorValue(type, iterations++, step.value, step);
	    }));
	  }
	}, {}, IndexedSeq);
	var ToSetSequence = function ToSetSequence(iter) {
	  this._iter = iter;
	  this.size = iter.size;
	};
	($traceurRuntime.createClass)(ToSetSequence, {
	  has: function(key) {
	    return this._iter.contains(key);
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    return this._iter.__iterate((function(v) {
	      return fn(v, v, $__0);
	    }), reverse);
	  },
	  __iterator: function(type, reverse) {
	    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
	    return new Iterator((function() {
	      var step = iterator.next();
	      return step.done ? step : iteratorValue(type, step.value, step.value, step);
	    }));
	  }
	}, {}, SetSeq);
	var FromEntriesSequence = function FromEntriesSequence(entries) {
	  this._iter = entries;
	  this.size = entries.size;
	};
	($traceurRuntime.createClass)(FromEntriesSequence, {
	  entrySeq: function() {
	    return this._iter.toSeq();
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    return this._iter.__iterate((function(entry) {
	      if (entry) {
	        validateEntry(entry);
	        return fn(entry[1], entry[0], $__0);
	      }
	    }), reverse);
	  },
	  __iterator: function(type, reverse) {
	    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
	    return new Iterator((function() {
	      while (true) {
	        var step = iterator.next();
	        if (step.done) {
	          return step;
	        }
	        var entry = step.value;
	        if (entry) {
	          validateEntry(entry);
	          return type === ITERATE_ENTRIES ? step : iteratorValue(type, entry[0], entry[1], step);
	        }
	      }
	    }));
	  }
	}, {}, KeyedSeq);
	ToIndexedSequence.prototype.cacheResult = ToKeyedSequence.prototype.cacheResult = ToSetSequence.prototype.cacheResult = FromEntriesSequence.prototype.cacheResult = cacheResultThrough;
	function flipFactory(iterable) {
	  var flipSequence = makeSequence(iterable);
	  flipSequence._iter = iterable;
	  flipSequence.size = iterable.size;
	  flipSequence.flip = (function() {
	    return iterable;
	  });
	  flipSequence.reverse = function() {
	    var reversedSequence = iterable.reverse.apply(this);
	    reversedSequence.flip = (function() {
	      return iterable.reverse();
	    });
	    return reversedSequence;
	  };
	  flipSequence.has = (function(key) {
	    return iterable.contains(key);
	  });
	  flipSequence.contains = (function(key) {
	    return iterable.has(key);
	  });
	  flipSequence.cacheResult = cacheResultThrough;
	  flipSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    return iterable.__iterate((function(v, k) {
	      return fn(k, v, $__0) !== false;
	    }), reverse);
	  };
	  flipSequence.__iteratorUncached = function(type, reverse) {
	    if (type === ITERATE_ENTRIES) {
	      var iterator = iterable.__iterator(type, reverse);
	      return new Iterator((function() {
	        var step = iterator.next();
	        if (!step.done) {
	          var k = step.value[0];
	          step.value[0] = step.value[1];
	          step.value[1] = k;
	        }
	        return step;
	      }));
	    }
	    return iterable.__iterator(type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES, reverse);
	  };
	  return flipSequence;
	}
	function mapFactory(iterable, mapper, context) {
	  var mappedSequence = makeSequence(iterable);
	  mappedSequence.size = iterable.size;
	  mappedSequence.has = (function(key) {
	    return iterable.has(key);
	  });
	  mappedSequence.get = (function(key, notSetValue) {
	    var v = iterable.get(key, NOT_SET);
	    return v === NOT_SET ? notSetValue : mapper.call(context, v, key, iterable);
	  });
	  mappedSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    return iterable.__iterate((function(v, k, c) {
	      return fn(mapper.call(context, v, k, c), k, $__0) !== false;
	    }), reverse);
	  };
	  mappedSequence.__iteratorUncached = function(type, reverse) {
	    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
	    return new Iterator((function() {
	      var step = iterator.next();
	      if (step.done) {
	        return step;
	      }
	      var entry = step.value;
	      var key = entry[0];
	      return iteratorValue(type, key, mapper.call(context, entry[1], key, iterable), step);
	    }));
	  };
	  return mappedSequence;
	}
	function reverseFactory(iterable, useKeys) {
	  var reversedSequence = makeSequence(iterable);
	  reversedSequence._iter = iterable;
	  reversedSequence.size = iterable.size;
	  reversedSequence.reverse = (function() {
	    return iterable;
	  });
	  if (iterable.flip) {
	    reversedSequence.flip = function() {
	      var flipSequence = flipFactory(iterable);
	      flipSequence.reverse = (function() {
	        return iterable.flip();
	      });
	      return flipSequence;
	    };
	  }
	  reversedSequence.get = (function(key, notSetValue) {
	    return iterable.get(useKeys ? key : -1 - key, notSetValue);
	  });
	  reversedSequence.has = (function(key) {
	    return iterable.has(useKeys ? key : -1 - key);
	  });
	  reversedSequence.contains = (function(value) {
	    return iterable.contains(value);
	  });
	  reversedSequence.cacheResult = cacheResultThrough;
	  reversedSequence.__iterate = function(fn, reverse) {
	    var $__0 = this;
	    return iterable.__iterate((function(v, k) {
	      return fn(v, k, $__0);
	    }), !reverse);
	  };
	  reversedSequence.__iterator = (function(type, reverse) {
	    return iterable.__iterator(type, !reverse);
	  });
	  return reversedSequence;
	}
	function filterFactory(iterable, predicate, context, useKeys) {
	  var filterSequence = makeSequence(iterable);
	  if (useKeys) {
	    filterSequence.has = (function(key) {
	      var v = iterable.get(key, NOT_SET);
	      return v !== NOT_SET && !!predicate.call(context, v, key, iterable);
	    });
	    filterSequence.get = (function(key, notSetValue) {
	      var v = iterable.get(key, NOT_SET);
	      return v !== NOT_SET && predicate.call(context, v, key, iterable) ? v : notSetValue;
	    });
	  }
	  filterSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    var iterations = 0;
	    iterable.__iterate((function(v, k, c) {
	      if (predicate.call(context, v, k, c)) {
	        iterations++;
	        return fn(v, useKeys ? k : iterations - 1, $__0);
	      }
	    }), reverse);
	    return iterations;
	  };
	  filterSequence.__iteratorUncached = function(type, reverse) {
	    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
	    var iterations = 0;
	    return new Iterator((function() {
	      while (true) {
	        var step = iterator.next();
	        if (step.done) {
	          return step;
	        }
	        var entry = step.value;
	        var key = entry[0];
	        var value = entry[1];
	        if (predicate.call(context, value, key, iterable)) {
	          return iteratorValue(type, useKeys ? key : iterations++, value, step);
	        }
	      }
	    }));
	  };
	  return filterSequence;
	}
	function countByFactory(iterable, grouper, context) {
	  var groups = Map().asMutable();
	  iterable.__iterate((function(v, k) {
	    groups.update(grouper.call(context, v, k, iterable), 0, (function(a) {
	      return a + 1;
	    }));
	  }));
	  return groups.asImmutable();
	}
	function groupByFactory(iterable, grouper, context) {
	  var isKeyedIter = isKeyed(iterable);
	  var groups = Map().asMutable();
	  iterable.__iterate((function(v, k) {
	    groups.update(grouper.call(context, v, k, iterable), [], (function(a) {
	      return (a.push(isKeyedIter ? [k, v] : v), a);
	    }));
	  }));
	  var coerce = iterableClass(iterable);
	  return groups.map((function(arr) {
	    return reify(iterable, coerce(arr));
	  }));
	}
	function takeFactory(iterable, amount) {
	  if (amount > iterable.size) {
	    return iterable;
	  }
	  if (amount < 0) {
	    amount = 0;
	  }
	  var takeSequence = makeSequence(iterable);
	  takeSequence.size = iterable.size && Math.min(iterable.size, amount);
	  takeSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    if (amount === 0) {
	      return 0;
	    }
	    if (reverse) {
	      return this.cacheResult().__iterate(fn, reverse);
	    }
	    var iterations = 0;
	    iterable.__iterate((function(v, k) {
	      return ++iterations && fn(v, k, $__0) !== false && iterations < amount;
	    }));
	    return iterations;
	  };
	  takeSequence.__iteratorUncached = function(type, reverse) {
	    if (reverse) {
	      return this.cacheResult().__iterator(type, reverse);
	    }
	    var iterator = amount && iterable.__iterator(type, reverse);
	    var iterations = 0;
	    return new Iterator((function() {
	      if (iterations++ > amount) {
	        return iteratorDone();
	      }
	      return iterator.next();
	    }));
	  };
	  return takeSequence;
	}
	function takeWhileFactory(iterable, predicate, context) {
	  var takeSequence = makeSequence(iterable);
	  takeSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    if (reverse) {
	      return this.cacheResult().__iterate(fn, reverse);
	    }
	    var iterations = 0;
	    iterable.__iterate((function(v, k, c) {
	      return predicate.call(context, v, k, c) && ++iterations && fn(v, k, $__0);
	    }));
	    return iterations;
	  };
	  takeSequence.__iteratorUncached = function(type, reverse) {
	    var $__0 = this;
	    if (reverse) {
	      return this.cacheResult().__iterator(type, reverse);
	    }
	    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
	    var iterating = true;
	    return new Iterator((function() {
	      if (!iterating) {
	        return iteratorDone();
	      }
	      var step = iterator.next();
	      if (step.done) {
	        return step;
	      }
	      var entry = step.value;
	      var k = entry[0];
	      var v = entry[1];
	      if (!predicate.call(context, v, k, $__0)) {
	        iterating = false;
	        return iteratorDone();
	      }
	      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
	    }));
	  };
	  return takeSequence;
	}
	function skipFactory(iterable, amount, useKeys) {
	  if (amount <= 0) {
	    return iterable;
	  }
	  var skipSequence = makeSequence(iterable);
	  skipSequence.size = iterable.size && Math.max(0, iterable.size - amount);
	  skipSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    if (reverse) {
	      return this.cacheResult().__iterate(fn, reverse);
	    }
	    var skipped = 0;
	    var isSkipping = true;
	    var iterations = 0;
	    iterable.__iterate((function(v, k) {
	      if (!(isSkipping && (isSkipping = skipped++ < amount))) {
	        iterations++;
	        return fn(v, useKeys ? k : iterations - 1, $__0);
	      }
	    }));
	    return iterations;
	  };
	  skipSequence.__iteratorUncached = function(type, reverse) {
	    if (reverse) {
	      return this.cacheResult().__iterator(type, reverse);
	    }
	    var iterator = amount && iterable.__iterator(type, reverse);
	    var skipped = 0;
	    var iterations = 0;
	    return new Iterator((function() {
	      while (skipped < amount) {
	        skipped++;
	        iterator.next();
	      }
	      var step = iterator.next();
	      if (useKeys || type === ITERATE_VALUES) {
	        return step;
	      } else if (type === ITERATE_KEYS) {
	        return iteratorValue(type, iterations++, undefined, step);
	      } else {
	        return iteratorValue(type, iterations++, step.value[1], step);
	      }
	    }));
	  };
	  return skipSequence;
	}
	function skipWhileFactory(iterable, predicate, context, useKeys) {
	  var skipSequence = makeSequence(iterable);
	  skipSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    if (reverse) {
	      return this.cacheResult().__iterate(fn, reverse);
	    }
	    var isSkipping = true;
	    var iterations = 0;
	    iterable.__iterate((function(v, k, c) {
	      if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
	        iterations++;
	        return fn(v, useKeys ? k : iterations - 1, $__0);
	      }
	    }));
	    return iterations;
	  };
	  skipSequence.__iteratorUncached = function(type, reverse) {
	    var $__0 = this;
	    if (reverse) {
	      return this.cacheResult().__iterator(type, reverse);
	    }
	    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
	    var skipping = true;
	    var iterations = 0;
	    return new Iterator((function() {
	      var step,
	          k,
	          v;
	      do {
	        step = iterator.next();
	        if (step.done) {
	          if (useKeys || type === ITERATE_VALUES) {
	            return step;
	          } else if (type === ITERATE_KEYS) {
	            return iteratorValue(type, iterations++, undefined, step);
	          } else {
	            return iteratorValue(type, iterations++, step.value[1], step);
	          }
	        }
	        var entry = step.value;
	        k = entry[0];
	        v = entry[1];
	        skipping && (skipping = predicate.call(context, v, k, $__0));
	      } while (skipping);
	      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
	    }));
	  };
	  return skipSequence;
	}
	function concatFactory(iterable, values) {
	  var isKeyedIterable = isKeyed(iterable);
	  var iters = new ArraySeq([iterable].concat(values)).map((function(v) {
	    if (!isIterable(v)) {
	      v = isKeyedIterable ? keyedSeqFromValue(v) : indexedSeqFromValue(Array.isArray(v) ? v : [v]);
	    } else if (isKeyedIterable) {
	      v = KeyedIterable(v);
	    }
	    return v;
	  }));
	  if (isKeyedIterable) {
	    iters = iters.toKeyedSeq();
	  } else if (!isIndexed(iterable)) {
	    iters = iters.toSetSeq();
	  }
	  var flat = iters.flatten(true);
	  flat.size = iters.reduce((function(sum, seq) {
	    if (sum !== undefined) {
	      var size = seq.size;
	      if (size !== undefined) {
	        return sum + size;
	      }
	    }
	  }), 0);
	  return flat;
	}
	function flattenFactory(iterable, depth, useKeys) {
	  var flatSequence = makeSequence(iterable);
	  flatSequence.__iterateUncached = function(fn, reverse) {
	    var iterations = 0;
	    var stopped = false;
	    function flatDeep(iter, currentDepth) {
	      var $__0 = this;
	      iter.__iterate((function(v, k) {
	        if ((!depth || currentDepth < depth) && isIterable(v)) {
	          flatDeep(v, currentDepth + 1);
	        } else if (fn(v, useKeys ? k : iterations++, $__0) === false) {
	          stopped = true;
	        }
	        return !stopped;
	      }), reverse);
	    }
	    flatDeep(iterable, 0);
	    return iterations;
	  };
	  flatSequence.__iteratorUncached = function(type, reverse) {
	    var iterator = iterable.__iterator(type, reverse);
	    var stack = [];
	    var iterations = 0;
	    return new Iterator((function() {
	      while (iterator) {
	        var step = iterator.next();
	        if (step.done !== false) {
	          iterator = stack.pop();
	          continue;
	        }
	        var v = step.value;
	        if (type === ITERATE_ENTRIES) {
	          v = v[1];
	        }
	        if ((!depth || stack.length < depth) && isIterable(v)) {
	          stack.push(iterator);
	          iterator = v.__iterator(type, reverse);
	        } else {
	          return useKeys ? step : iteratorValue(type, iterations++, v, step);
	        }
	      }
	      return iteratorDone();
	    }));
	  };
	  return flatSequence;
	}
	function flatMapFactory(iterable, mapper, context) {
	  var coerce = iterableClass(iterable);
	  return iterable.toSeq().map((function(v, k) {
	    return coerce(mapper.call(context, v, k, iterable));
	  })).flatten(true);
	}
	function interposeFactory(iterable, separator) {
	  var interposedSequence = makeSequence(iterable);
	  interposedSequence.size = iterable.size && iterable.size * 2 - 1;
	  interposedSequence.__iterateUncached = function(fn, reverse) {
	    var $__0 = this;
	    var iterations = 0;
	    iterable.__iterate((function(v, k) {
	      return (!iterations || fn(separator, iterations++, $__0) !== false) && fn(v, iterations++, $__0) !== false;
	    }), reverse);
	    return iterations;
	  };
	  interposedSequence.__iteratorUncached = function(type, reverse) {
	    var iterator = iterable.__iterator(ITERATE_VALUES, reverse);
	    var iterations = 0;
	    var step;
	    return new Iterator((function() {
	      if (!step || iterations % 2) {
	        step = iterator.next();
	        if (step.done) {
	          return step;
	        }
	      }
	      return iterations % 2 ? iteratorValue(type, iterations++, separator) : iteratorValue(type, iterations++, step.value, step);
	    }));
	  };
	  return interposedSequence;
	}
	function sortFactory(iterable, comparator, mapper) {
	  if (!comparator) {
	    comparator = defaultComparator;
	  }
	  var isKeyedIterable = isKeyed(iterable);
	  var index = 0;
	  var entries = iterable.toSeq().map((function(v, k) {
	    return [k, v, index++, mapper ? mapper(v, k, iterable) : v];
	  })).toArray();
	  entries.sort((function(a, b) {
	    return comparator(a[3], b[3]) || a[2] - b[2];
	  })).forEach(isKeyedIterable ? (function(v, i) {
	    entries[i].length = 2;
	  }) : (function(v, i) {
	    entries[i] = v[1];
	  }));
	  return isKeyedIterable ? KeyedSeq(entries) : isIndexed(iterable) ? IndexedSeq(entries) : SetSeq(entries);
	}
	function maxFactory(iterable, comparator, mapper) {
	  if (!comparator) {
	    comparator = defaultComparator;
	  }
	  if (mapper) {
	    var entry = iterable.toSeq().map((function(v, k) {
	      return [v, mapper(v, k, iterable)];
	    })).reduce((function(max, next) {
	      return comparator(next[1], max[1]) > 0 ? next : max;
	    }));
	    return entry && entry[0];
	  } else {
	    return iterable.reduce((function(max, next) {
	      return comparator(next, max) > 0 ? next : max;
	    }));
	  }
	}
	function reify(iter, seq) {
	  return isSeq(iter) ? seq : iter.constructor(seq);
	}
	function validateEntry(entry) {
	  if (entry !== Object(entry)) {
	    throw new TypeError('Expected [K, V] tuple: ' + entry);
	  }
	}
	function resolveSize(iter) {
	  assertNotInfinite(iter.size);
	  return ensureSize(iter);
	}
	function iterableClass(iterable) {
	  return isKeyed(iterable) ? KeyedIterable : isIndexed(iterable) ? IndexedIterable : SetIterable;
	}
	function makeSequence(iterable) {
	  return Object.create((isKeyed(iterable) ? KeyedSeq : isIndexed(iterable) ? IndexedSeq : SetSeq).prototype);
	}
	function cacheResultThrough() {
	  if (this._iter.cacheResult) {
	    this._iter.cacheResult();
	    this.size = this._iter.size;
	    return this;
	  } else {
	    return Seq.prototype.cacheResult.call(this);
	  }
	}
	function defaultComparator(a, b) {
	  return a > b ? 1 : a < b ? -1 : 0;
	}
	var List = function List(value) {
	  var empty = emptyList();
	  if (value === null || value === undefined) {
	    return empty;
	  }
	  if (isList(value)) {
	    return value;
	  }
	  value = IndexedIterable(value);
	  var size = value.size;
	  if (size === 0) {
	    return empty;
	  }
	  if (size > 0 && size < SIZE) {
	    return makeList(0, size, SHIFT, null, new VNode(value.toArray()));
	  }
	  return empty.merge(value);
	};
	($traceurRuntime.createClass)(List, {
	  toString: function() {
	    return this.__toString('List [', ']');
	  },
	  get: function(index, notSetValue) {
	    index = wrapIndex(this, index);
	    if (index < 0 || index >= this.size) {
	      return notSetValue;
	    }
	    index += this._origin;
	    var node = listNodeFor(this, index);
	    return node && node.array[index & MASK];
	  },
	  set: function(index, value) {
	    return updateList(this, index, value);
	  },
	  remove: function(index) {
	    return !this.has(index) ? this : index === 0 ? this.shift() : index === this.size - 1 ? this.pop() : this.splice(index, 1);
	  },
	  clear: function() {
	    if (this.size === 0) {
	      return this;
	    }
	    if (this.__ownerID) {
	      this.size = this._origin = this._capacity = 0;
	      this._level = SHIFT;
	      this._root = this._tail = null;
	      this.__hash = undefined;
	      this.__altered = true;
	      return this;
	    }
	    return emptyList();
	  },
	  push: function() {
	    var values = arguments;
	    var oldSize = this.size;
	    return this.withMutations((function(list) {
	      setListBounds(list, 0, oldSize + values.length);
	      for (var ii = 0; ii < values.length; ii++) {
	        list.set(oldSize + ii, values[ii]);
	      }
	    }));
	  },
	  pop: function() {
	    return setListBounds(this, 0, -1);
	  },
	  unshift: function() {
	    var values = arguments;
	    return this.withMutations((function(list) {
	      setListBounds(list, -values.length);
	      for (var ii = 0; ii < values.length; ii++) {
	        list.set(ii, values[ii]);
	      }
	    }));
	  },
	  shift: function() {
	    return setListBounds(this, 1);
	  },
	  merge: function() {
	    return mergeIntoListWith(this, undefined, arguments);
	  },
	  mergeWith: function(merger) {
	    for (var iters = [],
	        $__5 = 1; $__5 < arguments.length; $__5++)
	      iters[$__5 - 1] = arguments[$__5];
	    return mergeIntoListWith(this, merger, iters);
	  },
	  mergeDeep: function() {
	    return mergeIntoListWith(this, deepMerger(undefined), arguments);
	  },
	  mergeDeepWith: function(merger) {
	    for (var iters = [],
	        $__6 = 1; $__6 < arguments.length; $__6++)
	      iters[$__6 - 1] = arguments[$__6];
	    return mergeIntoListWith(this, deepMerger(merger), iters);
	  },
	  setSize: function(size) {
	    return setListBounds(this, 0, size);
	  },
	  slice: function(begin, end) {
	    var size = this.size;
	    if (wholeSlice(begin, end, size)) {
	      return this;
	    }
	    return setListBounds(this, resolveBegin(begin, size), resolveEnd(end, size));
	  },
	  __iterator: function(type, reverse) {
	    return new ListIterator(this, type, reverse);
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    var iterations = 0;
	    var eachFn = (function(v) {
	      return fn(v, iterations++, $__0);
	    });
	    var tailOffset = getTailOffset(this._capacity);
	    if (reverse) {
	      iterateVNode(this._tail, 0, tailOffset - this._origin, this._capacity - this._origin, eachFn, reverse) && iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse);
	    } else {
	      iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse) && iterateVNode(this._tail, 0, tailOffset - this._origin, this._capacity - this._origin, eachFn, reverse);
	    }
	    return iterations;
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      return this;
	    }
	    return makeList(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);
	  }
	}, {of: function() {
	    return this(arguments);
	  }}, IndexedCollection);
	function isList(maybeList) {
	  return !!(maybeList && maybeList[IS_LIST_SENTINEL]);
	}
	List.isList = isList;
	var IS_LIST_SENTINEL = '@@__IMMUTABLE_LIST__@@';
	var ListPrototype = List.prototype;
	ListPrototype[IS_LIST_SENTINEL] = true;
	ListPrototype[DELETE] = ListPrototype.remove;
	ListPrototype.setIn = MapPrototype.setIn;
	ListPrototype.removeIn = MapPrototype.removeIn;
	ListPrototype.update = MapPrototype.update;
	ListPrototype.updateIn = MapPrototype.updateIn;
	ListPrototype.withMutations = MapPrototype.withMutations;
	ListPrototype.asMutable = MapPrototype.asMutable;
	ListPrototype.asImmutable = MapPrototype.asImmutable;
	ListPrototype.wasAltered = MapPrototype.wasAltered;
	var VNode = function VNode(array, ownerID) {
	  this.array = array;
	  this.ownerID = ownerID;
	};
	var $VNode = VNode;
	($traceurRuntime.createClass)(VNode, {
	  removeBefore: function(ownerID, level, index) {
	    if (index === level ? 1 << level : 0 || this.array.length === 0) {
	      return this;
	    }
	    var originIndex = (index >>> level) & MASK;
	    if (originIndex >= this.array.length) {
	      return new $VNode([], ownerID);
	    }
	    var removingFirst = originIndex === 0;
	    var newChild;
	    if (level > 0) {
	      var oldChild = this.array[originIndex];
	      newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
	      if (newChild === oldChild && removingFirst) {
	        return this;
	      }
	    }
	    if (removingFirst && !newChild) {
	      return this;
	    }
	    var editable = editableVNode(this, ownerID);
	    if (!removingFirst) {
	      for (var ii = 0; ii < originIndex; ii++) {
	        editable.array[ii] = undefined;
	      }
	    }
	    if (newChild) {
	      editable.array[originIndex] = newChild;
	    }
	    return editable;
	  },
	  removeAfter: function(ownerID, level, index) {
	    if (index === level ? 1 << level : 0 || this.array.length === 0) {
	      return this;
	    }
	    var sizeIndex = ((index - 1) >>> level) & MASK;
	    if (sizeIndex >= this.array.length) {
	      return this;
	    }
	    var removingLast = sizeIndex === this.array.length - 1;
	    var newChild;
	    if (level > 0) {
	      var oldChild = this.array[sizeIndex];
	      newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
	      if (newChild === oldChild && removingLast) {
	        return this;
	      }
	    }
	    if (removingLast && !newChild) {
	      return this;
	    }
	    var editable = editableVNode(this, ownerID);
	    if (!removingLast) {
	      editable.array.pop();
	    }
	    if (newChild) {
	      editable.array[sizeIndex] = newChild;
	    }
	    return editable;
	  }
	}, {});
	function iterateVNode(node, level, offset, max, fn, reverse) {
	  var ii;
	  var array = node && node.array;
	  if (level === 0) {
	    var from = offset < 0 ? -offset : 0;
	    var to = max - offset;
	    if (to > SIZE) {
	      to = SIZE;
	    }
	    for (ii = from; ii < to; ii++) {
	      if (fn(array && array[reverse ? from + to - 1 - ii : ii]) === false) {
	        return false;
	      }
	    }
	  } else {
	    var step = 1 << level;
	    var newLevel = level - SHIFT;
	    for (ii = 0; ii <= MASK; ii++) {
	      var levelIndex = reverse ? MASK - ii : ii;
	      var newOffset = offset + (levelIndex << level);
	      if (newOffset < max && newOffset + step > 0) {
	        var nextNode = array && array[levelIndex];
	        if (!iterateVNode(nextNode, newLevel, newOffset, max, fn, reverse)) {
	          return false;
	        }
	      }
	    }
	  }
	  return true;
	}
	var ListIterator = function ListIterator(list, type, reverse) {
	  this._type = type;
	  this._reverse = !!reverse;
	  this._maxIndex = list.size - 1;
	  var tailOffset = getTailOffset(list._capacity);
	  var rootStack = listIteratorFrame(list._root && list._root.array, list._level, -list._origin, tailOffset - list._origin - 1);
	  var tailStack = listIteratorFrame(list._tail && list._tail.array, 0, tailOffset - list._origin, list._capacity - list._origin - 1);
	  this._stack = reverse ? tailStack : rootStack;
	  this._stack.__prev = reverse ? rootStack : tailStack;
	};
	($traceurRuntime.createClass)(ListIterator, {next: function() {
	    var stack = this._stack;
	    while (stack) {
	      var array = stack.array;
	      var rawIndex = stack.index++;
	      if (this._reverse) {
	        rawIndex = MASK - rawIndex;
	        if (rawIndex > stack.rawMax) {
	          rawIndex = stack.rawMax;
	          stack.index = SIZE - rawIndex;
	        }
	      }
	      if (rawIndex >= 0 && rawIndex < SIZE && rawIndex <= stack.rawMax) {
	        var value = array && array[rawIndex];
	        if (stack.level === 0) {
	          var type = this._type;
	          var index;
	          if (type !== 1) {
	            index = stack.offset + (rawIndex << stack.level);
	            if (this._reverse) {
	              index = this._maxIndex - index;
	            }
	          }
	          return iteratorValue(type, index, value);
	        } else {
	          this._stack = stack = listIteratorFrame(value && value.array, stack.level - SHIFT, stack.offset + (rawIndex << stack.level), stack.max, stack);
	        }
	        continue;
	      }
	      stack = this._stack = this._stack.__prev;
	    }
	    return iteratorDone();
	  }}, {}, Iterator);
	function listIteratorFrame(array, level, offset, max, prevFrame) {
	  return {
	    array: array,
	    level: level,
	    offset: offset,
	    max: max,
	    rawMax: ((max - offset) >> level),
	    index: 0,
	    __prev: prevFrame
	  };
	}
	function makeList(origin, capacity, level, root, tail, ownerID, hash) {
	  var list = Object.create(ListPrototype);
	  list.size = capacity - origin;
	  list._origin = origin;
	  list._capacity = capacity;
	  list._level = level;
	  list._root = root;
	  list._tail = tail;
	  list.__ownerID = ownerID;
	  list.__hash = hash;
	  list.__altered = false;
	  return list;
	}
	var EMPTY_LIST;
	function emptyList() {
	  return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
	}
	function updateList(list, index, value) {
	  index = wrapIndex(list, index);
	  if (index >= list.size || index < 0) {
	    return list.withMutations((function(list) {
	      index < 0 ? setListBounds(list, index).set(0, value) : setListBounds(list, 0, index + 1).set(index, value);
	    }));
	  }
	  index += list._origin;
	  var newTail = list._tail;
	  var newRoot = list._root;
	  var didAlter = MakeRef(DID_ALTER);
	  if (index >= getTailOffset(list._capacity)) {
	    newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
	  } else {
	    newRoot = updateVNode(newRoot, list.__ownerID, list._level, index, value, didAlter);
	  }
	  if (!didAlter.value) {
	    return list;
	  }
	  if (list.__ownerID) {
	    list._root = newRoot;
	    list._tail = newTail;
	    list.__hash = undefined;
	    list.__altered = true;
	    return list;
	  }
	  return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
	}
	function updateVNode(node, ownerID, level, index, value, didAlter) {
	  var idx = (index >>> level) & MASK;
	  var nodeHas = node && idx < node.array.length;
	  if (!nodeHas && value === undefined) {
	    return node;
	  }
	  var newNode;
	  if (level > 0) {
	    var lowerNode = node && node.array[idx];
	    var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
	    if (newLowerNode === lowerNode) {
	      return node;
	    }
	    newNode = editableVNode(node, ownerID);
	    newNode.array[idx] = newLowerNode;
	    return newNode;
	  }
	  if (nodeHas && node.array[idx] === value) {
	    return node;
	  }
	  SetRef(didAlter);
	  newNode = editableVNode(node, ownerID);
	  if (value === undefined && idx === newNode.array.length - 1) {
	    newNode.array.pop();
	  } else {
	    newNode.array[idx] = value;
	  }
	  return newNode;
	}
	function editableVNode(node, ownerID) {
	  if (ownerID && node && ownerID === node.ownerID) {
	    return node;
	  }
	  return new VNode(node ? node.array.slice() : [], ownerID);
	}
	function listNodeFor(list, rawIndex) {
	  if (rawIndex >= getTailOffset(list._capacity)) {
	    return list._tail;
	  }
	  if (rawIndex < 1 << (list._level + SHIFT)) {
	    var node = list._root;
	    var level = list._level;
	    while (node && level > 0) {
	      node = node.array[(rawIndex >>> level) & MASK];
	      level -= SHIFT;
	    }
	    return node;
	  }
	}
	function setListBounds(list, begin, end) {
	  var owner = list.__ownerID || new OwnerID();
	  var oldOrigin = list._origin;
	  var oldCapacity = list._capacity;
	  var newOrigin = oldOrigin + begin;
	  var newCapacity = end === undefined ? oldCapacity : end < 0 ? oldCapacity + end : oldOrigin + end;
	  if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
	    return list;
	  }
	  if (newOrigin >= newCapacity) {
	    return list.clear();
	  }
	  var newLevel = list._level;
	  var newRoot = list._root;
	  var offsetShift = 0;
	  while (newOrigin + offsetShift < 0) {
	    newRoot = new VNode(newRoot && newRoot.array.length ? [undefined, newRoot] : [], owner);
	    newLevel += SHIFT;
	    offsetShift += 1 << newLevel;
	  }
	  if (offsetShift) {
	    newOrigin += offsetShift;
	    oldOrigin += offsetShift;
	    newCapacity += offsetShift;
	    oldCapacity += offsetShift;
	  }
	  var oldTailOffset = getTailOffset(oldCapacity);
	  var newTailOffset = getTailOffset(newCapacity);
	  while (newTailOffset >= 1 << (newLevel + SHIFT)) {
	    newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
	    newLevel += SHIFT;
	  }
	  var oldTail = list._tail;
	  var newTail = newTailOffset < oldTailOffset ? listNodeFor(list, newCapacity - 1) : newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;
	  if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length) {
	    newRoot = editableVNode(newRoot, owner);
	    var node = newRoot;
	    for (var level = newLevel; level > SHIFT; level -= SHIFT) {
	      var idx = (oldTailOffset >>> level) & MASK;
	      node = node.array[idx] = editableVNode(node.array[idx], owner);
	    }
	    node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
	  }
	  if (newCapacity < oldCapacity) {
	    newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
	  }
	  if (newOrigin >= newTailOffset) {
	    newOrigin -= newTailOffset;
	    newCapacity -= newTailOffset;
	    newLevel = SHIFT;
	    newRoot = null;
	    newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);
	  } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
	    offsetShift = 0;
	    while (newRoot) {
	      var beginIndex = (newOrigin >>> newLevel) & MASK;
	      if (beginIndex !== (newTailOffset >>> newLevel) & MASK) {
	        break;
	      }
	      if (beginIndex) {
	        offsetShift += (1 << newLevel) * beginIndex;
	      }
	      newLevel -= SHIFT;
	      newRoot = newRoot.array[beginIndex];
	    }
	    if (newRoot && newOrigin > oldOrigin) {
	      newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
	    }
	    if (newRoot && newTailOffset < oldTailOffset) {
	      newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
	    }
	    if (offsetShift) {
	      newOrigin -= offsetShift;
	      newCapacity -= offsetShift;
	    }
	  }
	  if (list.__ownerID) {
	    list.size = newCapacity - newOrigin;
	    list._origin = newOrigin;
	    list._capacity = newCapacity;
	    list._level = newLevel;
	    list._root = newRoot;
	    list._tail = newTail;
	    list.__hash = undefined;
	    list.__altered = true;
	    return list;
	  }
	  return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
	}
	function mergeIntoListWith(list, merger, iterables) {
	  var iters = [];
	  var maxSize = 0;
	  for (var ii = 0; ii < iterables.length; ii++) {
	    var value = iterables[ii];
	    var iter = IndexedIterable(value);
	    if (iter.size > maxSize) {
	      maxSize = iter.size;
	    }
	    if (!isIterable(value)) {
	      iter = iter.map((function(v) {
	        return fromJS(v);
	      }));
	    }
	    iters.push(iter);
	  }
	  if (maxSize > list.size) {
	    list = list.setSize(maxSize);
	  }
	  return mergeIntoCollectionWith(list, merger, iters);
	}
	function getTailOffset(size) {
	  return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
	}
	var OrderedMap = function OrderedMap(value) {
	  return value === null || value === undefined ? emptyOrderedMap() : isOrderedMap(value) ? value : emptyOrderedMap().merge(KeyedIterable(value));
	};
	($traceurRuntime.createClass)(OrderedMap, {
	  toString: function() {
	    return this.__toString('OrderedMap {', '}');
	  },
	  get: function(k, notSetValue) {
	    var index = this._map.get(k);
	    return index !== undefined ? this._list.get(index)[1] : notSetValue;
	  },
	  clear: function() {
	    if (this.size === 0) {
	      return this;
	    }
	    if (this.__ownerID) {
	      this.size = 0;
	      this._map.clear();
	      this._list.clear();
	      return this;
	    }
	    return emptyOrderedMap();
	  },
	  set: function(k, v) {
	    return updateOrderedMap(this, k, v);
	  },
	  remove: function(k) {
	    return updateOrderedMap(this, k, NOT_SET);
	  },
	  wasAltered: function() {
	    return this._map.wasAltered() || this._list.wasAltered();
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    return this._list.__iterate((function(entry) {
	      return entry && fn(entry[1], entry[0], $__0);
	    }), reverse);
	  },
	  __iterator: function(type, reverse) {
	    return this._list.fromEntrySeq().__iterator(type, reverse);
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    var newMap = this._map.__ensureOwner(ownerID);
	    var newList = this._list.__ensureOwner(ownerID);
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      this._map = newMap;
	      this._list = newList;
	      return this;
	    }
	    return makeOrderedMap(newMap, newList, ownerID, this.__hash);
	  }
	}, {of: function() {
	    return this(arguments);
	  }}, Map);
	function isOrderedMap(maybeOrderedMap) {
	  return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
	}
	OrderedMap.isOrderedMap = isOrderedMap;
	OrderedMap.prototype[IS_ORDERED_SENTINEL] = true;
	OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;
	function makeOrderedMap(map, list, ownerID, hash) {
	  var omap = Object.create(OrderedMap.prototype);
	  omap.size = map ? map.size : 0;
	  omap._map = map;
	  omap._list = list;
	  omap.__ownerID = ownerID;
	  omap.__hash = hash;
	  return omap;
	}
	var EMPTY_ORDERED_MAP;
	function emptyOrderedMap() {
	  return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()));
	}
	function updateOrderedMap(omap, k, v) {
	  var map = omap._map;
	  var list = omap._list;
	  var i = map.get(k);
	  var has = i !== undefined;
	  var newMap;
	  var newList;
	  if (v === NOT_SET) {
	    if (!has) {
	      return omap;
	    }
	    if (list.size >= SIZE && list.size >= map.size * 2) {
	      newList = list.filter((function(entry, idx) {
	        return entry !== undefined && i !== idx;
	      }));
	      newMap = newList.toKeyedSeq().map((function(entry) {
	        return entry[0];
	      })).flip().toMap();
	      if (omap.__ownerID) {
	        newMap.__ownerID = newList.__ownerID = omap.__ownerID;
	      }
	    } else {
	      newMap = map.remove(k);
	      newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
	    }
	  } else {
	    if (has) {
	      if (v === list.get(i)[1]) {
	        return omap;
	      }
	      newMap = map;
	      newList = list.set(i, [k, v]);
	    } else {
	      newMap = map.set(k, list.size);
	      newList = list.set(list.size, [k, v]);
	    }
	  }
	  if (omap.__ownerID) {
	    omap.size = newMap.size;
	    omap._map = newMap;
	    omap._list = newList;
	    omap.__hash = undefined;
	    return omap;
	  }
	  return makeOrderedMap(newMap, newList);
	}
	var Stack = function Stack(value) {
	  return value === null || value === undefined ? emptyStack() : isStack(value) ? value : emptyStack().unshiftAll(value);
	};
	var $Stack = Stack;
	($traceurRuntime.createClass)(Stack, {
	  toString: function() {
	    return this.__toString('Stack [', ']');
	  },
	  get: function(index, notSetValue) {
	    var head = this._head;
	    while (head && index--) {
	      head = head.next;
	    }
	    return head ? head.value : notSetValue;
	  },
	  peek: function() {
	    return this._head && this._head.value;
	  },
	  push: function() {
	    if (arguments.length === 0) {
	      return this;
	    }
	    var newSize = this.size + arguments.length;
	    var head = this._head;
	    for (var ii = arguments.length - 1; ii >= 0; ii--) {
	      head = {
	        value: arguments[ii],
	        next: head
	      };
	    }
	    if (this.__ownerID) {
	      this.size = newSize;
	      this._head = head;
	      this.__hash = undefined;
	      this.__altered = true;
	      return this;
	    }
	    return makeStack(newSize, head);
	  },
	  pushAll: function(iter) {
	    iter = IndexedIterable(iter);
	    if (iter.size === 0) {
	      return this;
	    }
	    var newSize = this.size;
	    var head = this._head;
	    iter.reverse().forEach((function(value) {
	      newSize++;
	      head = {
	        value: value,
	        next: head
	      };
	    }));
	    if (this.__ownerID) {
	      this.size = newSize;
	      this._head = head;
	      this.__hash = undefined;
	      this.__altered = true;
	      return this;
	    }
	    return makeStack(newSize, head);
	  },
	  pop: function() {
	    return this.slice(1);
	  },
	  unshift: function() {
	    return this.push.apply(this, arguments);
	  },
	  unshiftAll: function(iter) {
	    return this.pushAll(iter);
	  },
	  shift: function() {
	    return this.pop.apply(this, arguments);
	  },
	  clear: function() {
	    if (this.size === 0) {
	      return this;
	    }
	    if (this.__ownerID) {
	      this.size = 0;
	      this._head = undefined;
	      this.__hash = undefined;
	      this.__altered = true;
	      return this;
	    }
	    return emptyStack();
	  },
	  slice: function(begin, end) {
	    if (wholeSlice(begin, end, this.size)) {
	      return this;
	    }
	    var resolvedBegin = resolveBegin(begin, this.size);
	    var resolvedEnd = resolveEnd(end, this.size);
	    if (resolvedEnd !== this.size) {
	      return $traceurRuntime.superCall(this, $Stack.prototype, "slice", [begin, end]);
	    }
	    var newSize = this.size - resolvedBegin;
	    var head = this._head;
	    while (resolvedBegin--) {
	      head = head.next;
	    }
	    if (this.__ownerID) {
	      this.size = newSize;
	      this._head = head;
	      this.__hash = undefined;
	      this.__altered = true;
	      return this;
	    }
	    return makeStack(newSize, head);
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      this.__altered = false;
	      return this;
	    }
	    return makeStack(this.size, this._head, ownerID, this.__hash);
	  },
	  __iterate: function(fn, reverse) {
	    if (reverse) {
	      return this.toSeq().cacheResult.__iterate(fn, reverse);
	    }
	    var iterations = 0;
	    var node = this._head;
	    while (node) {
	      if (fn(node.value, iterations++, this) === false) {
	        break;
	      }
	      node = node.next;
	    }
	    return iterations;
	  },
	  __iterator: function(type, reverse) {
	    if (reverse) {
	      return this.toSeq().cacheResult().__iterator(type, reverse);
	    }
	    var iterations = 0;
	    var node = this._head;
	    return new Iterator((function() {
	      if (node) {
	        var value = node.value;
	        node = node.next;
	        return iteratorValue(type, iterations++, value);
	      }
	      return iteratorDone();
	    }));
	  }
	}, {of: function() {
	    return this(arguments);
	  }}, IndexedCollection);
	function isStack(maybeStack) {
	  return !!(maybeStack && maybeStack[IS_STACK_SENTINEL]);
	}
	Stack.isStack = isStack;
	var IS_STACK_SENTINEL = '@@__IMMUTABLE_STACK__@@';
	var StackPrototype = Stack.prototype;
	StackPrototype[IS_STACK_SENTINEL] = true;
	StackPrototype.withMutations = MapPrototype.withMutations;
	StackPrototype.asMutable = MapPrototype.asMutable;
	StackPrototype.asImmutable = MapPrototype.asImmutable;
	StackPrototype.wasAltered = MapPrototype.wasAltered;
	function makeStack(size, head, ownerID, hash) {
	  var map = Object.create(StackPrototype);
	  map.size = size;
	  map._head = head;
	  map.__ownerID = ownerID;
	  map.__hash = hash;
	  map.__altered = false;
	  return map;
	}
	var EMPTY_STACK;
	function emptyStack() {
	  return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
	}
	var Set = function Set(value) {
	  return value === null || value === undefined ? emptySet() : isSet(value) ? value : emptySet().union(SetIterable(value));
	};
	($traceurRuntime.createClass)(Set, {
	  toString: function() {
	    return this.__toString('Set {', '}');
	  },
	  has: function(value) {
	    return this._map.has(value);
	  },
	  add: function(value) {
	    return updateSet(this, this._map.set(value, true));
	  },
	  remove: function(value) {
	    return updateSet(this, this._map.remove(value));
	  },
	  clear: function() {
	    return updateSet(this, this._map.clear());
	  },
	  union: function() {
	    var iters = arguments;
	    if (iters.length === 0) {
	      return this;
	    }
	    return this.withMutations((function(set) {
	      for (var ii = 0; ii < iters.length; ii++) {
	        SetIterable(iters[ii]).forEach((function(value) {
	          return set.add(value);
	        }));
	      }
	    }));
	  },
	  intersect: function() {
	    for (var iters = [],
	        $__7 = 0; $__7 < arguments.length; $__7++)
	      iters[$__7] = arguments[$__7];
	    if (iters.length === 0) {
	      return this;
	    }
	    iters = iters.map((function(iter) {
	      return SetIterable(iter);
	    }));
	    var originalSet = this;
	    return this.withMutations((function(set) {
	      originalSet.forEach((function(value) {
	        if (!iters.every((function(iter) {
	          return iter.contains(value);
	        }))) {
	          set.remove(value);
	        }
	      }));
	    }));
	  },
	  subtract: function() {
	    for (var iters = [],
	        $__8 = 0; $__8 < arguments.length; $__8++)
	      iters[$__8] = arguments[$__8];
	    if (iters.length === 0) {
	      return this;
	    }
	    iters = iters.map((function(iter) {
	      return SetIterable(iter);
	    }));
	    var originalSet = this;
	    return this.withMutations((function(set) {
	      originalSet.forEach((function(value) {
	        if (iters.some((function(iter) {
	          return iter.contains(value);
	        }))) {
	          set.remove(value);
	        }
	      }));
	    }));
	  },
	  merge: function() {
	    return this.union.apply(this, arguments);
	  },
	  mergeWith: function(merger) {
	    for (var iters = [],
	        $__9 = 1; $__9 < arguments.length; $__9++)
	      iters[$__9 - 1] = arguments[$__9];
	    return this.union.apply(this, iters);
	  },
	  sort: function(comparator) {
	    return OrderedSet(sortFactory(this, comparator));
	  },
	  sortBy: function(mapper, comparator) {
	    return OrderedSet(sortFactory(this, comparator, mapper));
	  },
	  wasAltered: function() {
	    return this._map.wasAltered();
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    return this._map.__iterate((function(_, k) {
	      return fn(k, k, $__0);
	    }), reverse);
	  },
	  __iterator: function(type, reverse) {
	    return this._map.map((function(_, k) {
	      return k;
	    })).__iterator(type, reverse);
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    var newMap = this._map.__ensureOwner(ownerID);
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      this._map = newMap;
	      return this;
	    }
	    return this.__make(newMap, ownerID);
	  }
	}, {
	  of: function() {
	    return this(arguments);
	  },
	  fromKeys: function(value) {
	    return this(KeyedIterable(value).keySeq());
	  }
	}, SetCollection);
	function isSet(maybeSet) {
	  return !!(maybeSet && maybeSet[IS_SET_SENTINEL]);
	}
	Set.isSet = isSet;
	var IS_SET_SENTINEL = '@@__IMMUTABLE_SET__@@';
	var SetPrototype = Set.prototype;
	SetPrototype[IS_SET_SENTINEL] = true;
	SetPrototype[DELETE] = SetPrototype.remove;
	SetPrototype.mergeDeep = SetPrototype.merge;
	SetPrototype.mergeDeepWith = SetPrototype.mergeWith;
	SetPrototype.withMutations = MapPrototype.withMutations;
	SetPrototype.asMutable = MapPrototype.asMutable;
	SetPrototype.asImmutable = MapPrototype.asImmutable;
	SetPrototype.__empty = emptySet;
	SetPrototype.__make = makeSet;
	function updateSet(set, newMap) {
	  if (set.__ownerID) {
	    set.size = newMap.size;
	    set._map = newMap;
	    return set;
	  }
	  return newMap === set._map ? set : newMap.size === 0 ? set.__empty() : set.__make(newMap);
	}
	function makeSet(map, ownerID) {
	  var set = Object.create(SetPrototype);
	  set.size = map ? map.size : 0;
	  set._map = map;
	  set.__ownerID = ownerID;
	  return set;
	}
	var EMPTY_SET;
	function emptySet() {
	  return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
	}
	var OrderedSet = function OrderedSet(value) {
	  return value === null || value === undefined ? emptyOrderedSet() : isOrderedSet(value) ? value : emptyOrderedSet().union(SetIterable(value));
	};
	($traceurRuntime.createClass)(OrderedSet, {toString: function() {
	    return this.__toString('OrderedSet {', '}');
	  }}, {
	  of: function() {
	    return this(arguments);
	  },
	  fromKeys: function(value) {
	    return this(KeyedIterable(value).keySeq());
	  }
	}, Set);
	function isOrderedSet(maybeOrderedSet) {
	  return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
	}
	OrderedSet.isOrderedSet = isOrderedSet;
	var OrderedSetPrototype = OrderedSet.prototype;
	OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;
	OrderedSetPrototype.__empty = emptyOrderedSet;
	OrderedSetPrototype.__make = makeOrderedSet;
	function makeOrderedSet(map, ownerID) {
	  var set = Object.create(OrderedSetPrototype);
	  set.size = map ? map.size : 0;
	  set._map = map;
	  set.__ownerID = ownerID;
	  return set;
	}
	var EMPTY_ORDERED_SET;
	function emptyOrderedSet() {
	  return EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()));
	}
	var Record = function Record(defaultValues, name) {
	  var RecordType = function Record(values) {
	    if (!(this instanceof RecordType)) {
	      return new RecordType(values);
	    }
	    this._map = Map(values);
	  };
	  var keys = Object.keys(defaultValues);
	  var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
	  RecordTypePrototype.constructor = RecordType;
	  name && (RecordTypePrototype._name = name);
	  RecordTypePrototype._defaultValues = defaultValues;
	  RecordTypePrototype._keys = keys;
	  RecordTypePrototype.size = keys.length;
	  try {
	    keys.forEach((function(key) {
	      Object.defineProperty(RecordType.prototype, key, {
	        get: function() {
	          return this.get(key);
	        },
	        set: function(value) {
	          invariant(this.__ownerID, 'Cannot set on an immutable record.');
	          this.set(key, value);
	        }
	      });
	    }));
	  } catch (error) {}
	  return RecordType;
	};
	($traceurRuntime.createClass)(Record, {
	  toString: function() {
	    return this.__toString(recordName(this) + ' {', '}');
	  },
	  has: function(k) {
	    return this._defaultValues.hasOwnProperty(k);
	  },
	  get: function(k, notSetValue) {
	    if (!this.has(k)) {
	      return notSetValue;
	    }
	    var defaultVal = this._defaultValues[k];
	    return this._map ? this._map.get(k, defaultVal) : defaultVal;
	  },
	  clear: function() {
	    if (this.__ownerID) {
	      this._map && this._map.clear();
	      return this;
	    }
	    var SuperRecord = Object.getPrototypeOf(this).constructor;
	    return SuperRecord._empty || (SuperRecord._empty = makeRecord(this, emptyMap()));
	  },
	  set: function(k, v) {
	    if (!this.has(k)) {
	      throw new Error('Cannot set unknown key "' + k + '" on ' + recordName(this));
	    }
	    var newMap = this._map && this._map.set(k, v);
	    if (this.__ownerID || newMap === this._map) {
	      return this;
	    }
	    return makeRecord(this, newMap);
	  },
	  remove: function(k) {
	    if (!this.has(k)) {
	      return this;
	    }
	    var newMap = this._map && this._map.remove(k);
	    if (this.__ownerID || newMap === this._map) {
	      return this;
	    }
	    return makeRecord(this, newMap);
	  },
	  wasAltered: function() {
	    return this._map.wasAltered();
	  },
	  __iterator: function(type, reverse) {
	    var $__0 = this;
	    return KeyedIterable(this._defaultValues).map((function(_, k) {
	      return $__0.get(k);
	    })).__iterator(type, reverse);
	  },
	  __iterate: function(fn, reverse) {
	    var $__0 = this;
	    return KeyedIterable(this._defaultValues).map((function(_, k) {
	      return $__0.get(k);
	    })).__iterate(fn, reverse);
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    var newMap = this._map && this._map.__ensureOwner(ownerID);
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      this._map = newMap;
	      return this;
	    }
	    return makeRecord(this, newMap, ownerID);
	  }
	}, {}, KeyedCollection);
	var RecordPrototype = Record.prototype;
	RecordPrototype[DELETE] = RecordPrototype.remove;
	RecordPrototype.merge = MapPrototype.merge;
	RecordPrototype.mergeWith = MapPrototype.mergeWith;
	RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
	RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
	RecordPrototype.update = MapPrototype.update;
	RecordPrototype.updateIn = MapPrototype.updateIn;
	RecordPrototype.withMutations = MapPrototype.withMutations;
	RecordPrototype.asMutable = MapPrototype.asMutable;
	RecordPrototype.asImmutable = MapPrototype.asImmutable;
	function makeRecord(likeRecord, map, ownerID) {
	  var record = Object.create(Object.getPrototypeOf(likeRecord));
	  record._map = map;
	  record.__ownerID = ownerID;
	  return record;
	}
	function recordName(record) {
	  return record._name || record.constructor.name;
	}
	var Range = function Range(start, end, step) {
	  if (!(this instanceof $Range)) {
	    return new $Range(start, end, step);
	  }
	  invariant(step !== 0, 'Cannot step a Range by 0');
	  start = start || 0;
	  if (end === undefined) {
	    end = Infinity;
	  }
	  if (start === end && __EMPTY_RANGE) {
	    return __EMPTY_RANGE;
	  }
	  step = step === undefined ? 1 : Math.abs(step);
	  if (end < start) {
	    step = -step;
	  }
	  this._start = start;
	  this._end = end;
	  this._step = step;
	  this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
	};
	var $Range = Range;
	($traceurRuntime.createClass)(Range, {
	  toString: function() {
	    if (this.size === 0) {
	      return 'Range []';
	    }
	    return 'Range [ ' + this._start + '...' + this._end + (this._step > 1 ? ' by ' + this._step : '') + ' ]';
	  },
	  get: function(index, notSetValue) {
	    return this.has(index) ? this._start + wrapIndex(this, index) * this._step : notSetValue;
	  },
	  contains: function(searchValue) {
	    var possibleIndex = (searchValue - this._start) / this._step;
	    return possibleIndex >= 0 && possibleIndex < this.size && possibleIndex === Math.floor(possibleIndex);
	  },
	  slice: function(begin, end) {
	    if (wholeSlice(begin, end, this.size)) {
	      return this;
	    }
	    begin = resolveBegin(begin, this.size);
	    end = resolveEnd(end, this.size);
	    if (end <= begin) {
	      return __EMPTY_RANGE;
	    }
	    return new $Range(this.get(begin, this._end), this.get(end, this._end), this._step);
	  },
	  indexOf: function(searchValue) {
	    var offsetValue = searchValue - this._start;
	    if (offsetValue % this._step === 0) {
	      var index = offsetValue / this._step;
	      if (index >= 0 && index < this.size) {
	        return index;
	      }
	    }
	    return -1;
	  },
	  lastIndexOf: function(searchValue) {
	    return this.indexOf(searchValue);
	  },
	  take: function(amount) {
	    return this.slice(0, Math.max(0, amount));
	  },
	  skip: function(amount) {
	    return this.slice(Math.max(0, amount));
	  },
	  __iterate: function(fn, reverse) {
	    var maxIndex = this.size - 1;
	    var step = this._step;
	    var value = reverse ? this._start + maxIndex * step : this._start;
	    for (var ii = 0; ii <= maxIndex; ii++) {
	      if (fn(value, ii, this) === false) {
	        return ii + 1;
	      }
	      value += reverse ? -step : step;
	    }
	    return ii;
	  },
	  __iterator: function(type, reverse) {
	    var maxIndex = this.size - 1;
	    var step = this._step;
	    var value = reverse ? this._start + maxIndex * step : this._start;
	    var ii = 0;
	    return new Iterator((function() {
	      var v = value;
	      value += reverse ? -step : step;
	      return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii++, v);
	    }));
	  },
	  __deepEquals: function(other) {
	    return other instanceof $Range ? this._start === other._start && this._end === other._end && this._step === other._step : deepEqual(this, other);
	  }
	}, {}, IndexedSeq);
	var RangePrototype = Range.prototype;
	RangePrototype.__toJS = RangePrototype.toArray;
	RangePrototype.first = ListPrototype.first;
	RangePrototype.last = ListPrototype.last;
	var __EMPTY_RANGE = Range(0, 0);
	var Repeat = function Repeat(value, times) {
	  if (times <= 0 && EMPTY_REPEAT) {
	    return EMPTY_REPEAT;
	  }
	  if (!(this instanceof $Repeat)) {
	    return new $Repeat(value, times);
	  }
	  this._value = value;
	  this.size = times === undefined ? Infinity : Math.max(0, times);
	  if (this.size === 0) {
	    EMPTY_REPEAT = this;
	  }
	};
	var $Repeat = Repeat;
	($traceurRuntime.createClass)(Repeat, {
	  toString: function() {
	    if (this.size === 0) {
	      return 'Repeat []';
	    }
	    return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
	  },
	  get: function(index, notSetValue) {
	    return this.has(index) ? this._value : notSetValue;
	  },
	  contains: function(searchValue) {
	    return is(this._value, searchValue);
	  },
	  slice: function(begin, end) {
	    var size = this.size;
	    return wholeSlice(begin, end, size) ? this : new $Repeat(this._value, resolveEnd(end, size) - resolveBegin(begin, size));
	  },
	  reverse: function() {
	    return this;
	  },
	  indexOf: function(searchValue) {
	    if (is(this._value, searchValue)) {
	      return 0;
	    }
	    return -1;
	  },
	  lastIndexOf: function(searchValue) {
	    if (is(this._value, searchValue)) {
	      return this.size;
	    }
	    return -1;
	  },
	  __iterate: function(fn, reverse) {
	    for (var ii = 0; ii < this.size; ii++) {
	      if (fn(this._value, ii, this) === false) {
	        return ii + 1;
	      }
	    }
	    return ii;
	  },
	  __iterator: function(type, reverse) {
	    var $__0 = this;
	    var ii = 0;
	    return new Iterator((function() {
	      return ii < $__0.size ? iteratorValue(type, ii++, $__0._value) : iteratorDone();
	    }));
	  },
	  __deepEquals: function(other) {
	    return other instanceof $Repeat ? is(this._value, other._value) : deepEqual(other);
	  }
	}, {}, IndexedSeq);
	var RepeatPrototype = Repeat.prototype;
	RepeatPrototype.last = RepeatPrototype.first;
	RepeatPrototype.has = RangePrototype.has;
	RepeatPrototype.take = RangePrototype.take;
	RepeatPrototype.skip = RangePrototype.skip;
	RepeatPrototype.__toJS = RangePrototype.__toJS;
	var EMPTY_REPEAT;
	var Immutable = {
	  Iterable: Iterable,
	  Seq: Seq,
	  Collection: Collection,
	  Map: Map,
	  OrderedMap: OrderedMap,
	  List: List,
	  Stack: Stack,
	  Set: Set,
	  OrderedSet: OrderedSet,
	  Record: Record,
	  Range: Range,
	  Repeat: Repeat,
	  is: is,
	  fromJS: fromJS
	};

	  return Immutable;
	}
	true ? module.exports = universalModule() :
	  typeof define === 'function' && define.amd ? define(universalModule) :
	    Immutable = universalModule();


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	  /* globals require, module */

	/**
	   * Module dependencies.
	   */

	  var pathtoRegexp = __webpack_require__(97);

	  /**
	   * Module exports.
	   */

	  module.exports = page;

	  /**
	   * To work properly with the URL
	   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
	   */

	  var location = window.history.location || window.location;

	  /**
	   * Perform initial dispatch.
	   */

	  var dispatch = true;

	  /**
	   * Base path.
	   */

	  var base = '';

	  /**
	   * Running flag.
	   */

	  var running;

	  /**
	  * HashBang option
	  */

	  var hashbang = false;

	  /**
	   * Register `path` with callback `fn()`,
	   * or route `path`, or `page.start()`.
	   *
	   *   page(fn);
	   *   page('*', fn);
	   *   page('/user/:id', load, user);
	   *   page('/user/' + user.id, { some: 'thing' });
	   *   page('/user/' + user.id);
	   *   page();
	   *
	   * @param {String|Function} path
	   * @param {Function} fn...
	   * @api public
	   */

	  function page(path, fn) {
	    // <callback>
	    if ('function' === typeof path) {
	      return page('*', path);
	    }

	    // route <path> to <callback ...>
	    if ('function' === typeof fn) {
	      var route = new Route(path);
	      for (var i = 1; i < arguments.length; ++i) {
	        page.callbacks.push(route.middleware(arguments[i]));
	      }
	    // show <path> with [state]
	    } else if ('string' == typeof path) {
	      'string' === typeof fn
	        ? page.redirect(path, fn)
	        : page.show(path, fn);
	    // start [options]
	    } else {
	      page.start(path);
	    }
	  }

	  /**
	   * Callback functions.
	   */

	  page.callbacks = [];

	  /**
	   * Get or set basepath to `path`.
	   *
	   * @param {String} path
	   * @api public
	   */

	  page.base = function(path){
	    if (0 === arguments.length) return base;
	    base = path;
	  };

	  /**
	   * Bind with the given `options`.
	   *
	   * Options:
	   *
	   *    - `click` bind to click events [true]
	   *    - `popstate` bind to popstate [true]
	   *    - `dispatch` perform initial dispatch [true]
	   *
	   * @param {Object} options
	   * @api public
	   */

	  page.start = function(options){
	    options = options || {};
	    if (running) return;
	    running = true;
	    if (false === options.dispatch) dispatch = false;
	    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
	    if (false !== options.click) window.addEventListener('click', onclick, false);
	    if (true === options.hashbang) hashbang = true;
	    if (!dispatch) return;
	    var url = (hashbang && ~location.hash.indexOf('#!'))
	      ? location.hash.substr(2) + location.search
	      : location.pathname + location.search + location.hash;
	    page.replace(url, null, true, dispatch);
	  };

	  /**
	   * Unbind click and popstate event handlers.
	   *
	   * @api public
	   */

	  page.stop = function(){
	    if (!running) return;
	    running = false;
	    window.removeEventListener('click', onclick, false);
	    window.removeEventListener('popstate', onpopstate, false);
	  };

	  /**
	   * Show `path` with optional `state` object.
	   *
	   * @param {String} path
	   * @param {Object} state
	   * @param {Boolean} dispatch
	   * @return {Context}
	   * @api public
	   */

	  page.show = function(path, state, dispatch){
	    var ctx = new Context(path, state);
	    if (false !== dispatch) page.dispatch(ctx);
	    if (false !== ctx.handled) ctx.pushState();
	    return ctx;
	  };

	  /**
	   * Show `path` with optional `state` object.
	   *
	   * @param {String} from
	   * @param {String} to
	   * @api public
	   */
	  page.redirect = function(from, to) {
	    page(from, function (e) {
	      setTimeout(function() {
	        page.replace(to);
	      });
	    });
	  };

	  /**
	   * Replace `path` with optional `state` object.
	   *
	   * @param {String} path
	   * @param {Object} state
	   * @return {Context}
	   * @api public
	   */

	  page.replace = function(path, state, init, dispatch){
	    var ctx = new Context(path, state);
	    ctx.init = init;
	    ctx.save(); // save before dispatching, which may redirect
	    if (false !== dispatch) page.dispatch(ctx);
	    return ctx;
	  };

	  /**
	   * Dispatch the given `ctx`.
	   *
	   * @param {Object} ctx
	   * @api private
	   */

	  page.dispatch = function(ctx){
	    var i = 0;

	    function next() {
	      var fn = page.callbacks[i++];
	      if (!fn) return unhandled(ctx);
	      fn(ctx, next);
	    }

	    next();
	  };

	  /**
	   * Unhandled `ctx`. When it's not the initial
	   * popstate then redirect. If you wish to handle
	   * 404s on your own use `page('*', callback)`.
	   *
	   * @param {Context} ctx
	   * @api private
	   */

	  function unhandled(ctx) {
	    if (ctx.handled) return;
	    var current;

	    if (hashbang) {
	      current = base + location.hash.replace('#!','');
	    } else {
	      current = location.pathname + location.search;
	    }

	    if (current === ctx.canonicalPath) return;
	    page.stop();
	    ctx.handled = false;
	    location.href = ctx.canonicalPath;
	  }

	  /**
	   * Initialize a new "request" `Context`
	   * with the given `path` and optional initial `state`.
	   *
	   * @param {String} path
	   * @param {Object} state
	   * @api public
	   */

	  function Context(path, state) {
	    if ('/' === path[0] && 0 !== path.indexOf(base)) path = base + path;
	    var i = path.indexOf('?');

	    this.canonicalPath = path;
	    this.path = path.replace(base, '') || '/';

	    this.title = document.title;
	    this.state = state || {};
	    this.state.path = path;
	    this.querystring = ~i
	      ? path.slice(i + 1)
	      : '';
	    this.pathname = ~i
	      ? path.slice(0, i)
	      : path;
	    this.params = [];

	    // fragment
	    this.hash = '';
	    if (!~this.path.indexOf('#')) return;
	    var parts = this.path.split('#');
	    this.path = parts[0];
	    this.hash = parts[1] || '';
	    this.querystring = this.querystring.split('#')[0];
	  }

	  /**
	   * Expose `Context`.
	   */

	  page.Context = Context;

	  /**
	   * Push state.
	   *
	   * @api private
	   */

	  Context.prototype.pushState = function(){
	    history.pushState(this.state
	      , this.title
	      , hashbang && this.path !== '/'
	        ? '#!' + this.path
	        : this.canonicalPath);
	  };

	  /**
	   * Save the context state.
	   *
	   * @api public
	   */

	  Context.prototype.save = function(){
	    history.replaceState(this.state
	      , this.title
	      , hashbang && this.path !== '/'
	        ? '#!' + this.path
	        : this.canonicalPath);
	  };

	  /**
	   * Initialize `Route` with the given HTTP `path`,
	   * and an array of `callbacks` and `options`.
	   *
	   * Options:
	   *
	   *   - `sensitive`    enable case-sensitive routes
	   *   - `strict`       enable strict matching for trailing slashes
	   *
	   * @param {String} path
	   * @param {Object} options.
	   * @api private
	   */

	  function Route(path, options) {
	    options = options || {};
	    this.path = (path === '*') ? '(.*)' : path;
	    this.method = 'GET';
	    this.regexp = pathtoRegexp(this.path,
	      this.keys = [],
	      options.sensitive,
	      options.strict);
	  }

	  /**
	   * Expose `Route`.
	   */

	  page.Route = Route;

	  /**
	   * Return route middleware with
	   * the given callback `fn()`.
	   *
	   * @param {Function} fn
	   * @return {Function}
	   * @api public
	   */

	  Route.prototype.middleware = function(fn){
	    var self = this;
	    return function(ctx, next){
	      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
	      next();
	    };
	  };

	  /**
	   * Check if this route matches `path`, if so
	   * populate `params`.
	   *
	   * @param {String} path
	   * @param {Array} params
	   * @return {Boolean}
	   * @api private
	   */

	  Route.prototype.match = function(path, params){
	    var keys = this.keys,
	        qsIndex = path.indexOf('?'),
	        pathname = ~qsIndex
	          ? path.slice(0, qsIndex)
	          : path,
	        m = this.regexp.exec(decodeURIComponent(pathname));

	    if (!m) return false;

	    for (var i = 1, len = m.length; i < len; ++i) {
	      var key = keys[i - 1];

	      var val = 'string' === typeof m[i]
	        ? decodeURIComponent(m[i])
	        : m[i];

	      if (key) {
	        params[key.name] = undefined !== params[key.name]
	          ? params[key.name]
	          : val;
	      } else {
	        params.push(val);
	      }
	    }

	    return true;
	  };

	  /**
	   * Handle "populate" events.
	   */

	  function onpopstate(e) {
	    if (e.state) {
	      var path = e.state.path;
	      page.replace(path, e.state);
	    }
	  }

	  /**
	   * Handle "click" events.
	   */

	  function onclick(e) {
	    if (1 != which(e)) return;
	    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
	    if (e.defaultPrevented) return;

	    // ensure link
	    var el = e.target;
	    while (el && 'A' != el.nodeName) el = el.parentNode;
	    if (!el || 'A' != el.nodeName) return;

	    // ensure non-hash for the same path
	    var link = el.getAttribute('href');
	    if (el.pathname === location.pathname && (el.hash || '#' === link)) return;

	    // Check for mailto: in the href
	    if (link && link.indexOf("mailto:") > -1) return;

	    // check target
	    if (el.target) return;

	    // x-origin
	    if (!sameOrigin(el.href)) return;

	    // rebuild path
	    var path = el.pathname + el.search + (el.hash || '');

	    // same page
	    var orig = path;

	    path = path.replace(base, '');

	    if (base && orig === path) return;

	    e.preventDefault();
	    page.show(orig);
	  }

	  /**
	   * Event button.
	   */

	  function which(e) {
	    e = e || window.event;
	    return null === e.which
	      ? e.button
	      : e.which;
	  }

	  /**
	   * Check if `href` is the same origin.
	   */

	  function sameOrigin(href) {
	    var origin = location.protocol + '//' + location.hostname;
	    if (location.port) origin += ':' + location.port;
	    return (href && (0 === href.indexOf(origin)));
	  }

	  page.sameOrigin = sameOrigin;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var extend = _.extend

	/**
	 * Option overwriting strategies are functions that handle
	 * how to merge a parent option value and a child option
	 * value into the final value.
	 *
	 * All strategy functions follow the same signature:
	 *
	 * @param {*} parentVal
	 * @param {*} childVal
	 * @param {Vue} [vm]
	 */

	var strats = Object.create(null)

	/**
	 * Data
	 */

	strats.data = function (parentVal, childVal, vm) {
	  // in a class merge, both should be functions
	  // so we just return child if it exists
	  if (!vm) {
	    if (childVal && typeof childVal !== 'function') {
	      _.warn(
	        'The "data" option should be a function ' +
	        'that returns a per-instance value in component ' +
	        'definitions.'
	      )
	      return
	    }
	    return childVal || parentVal
	  }
	  var instanceData = typeof childVal === 'function'
	    ? childVal.call(vm)
	    : childVal
	  var defaultData = typeof parentVal === 'function'
	    ? parentVal.call(vm)
	    : undefined
	  if (instanceData) {
	    // mix default data into instance data
	    for (var key in defaultData) {
	      if (!instanceData.hasOwnProperty(key)) {
	        instanceData.$add(key, defaultData[key])
	      }
	    }
	    return instanceData
	  } else {
	    return defaultData
	  }
	}

	/**
	 * El
	 */

	strats.el = function (parentVal, childVal, vm) {
	  if (!vm && childVal && typeof childVal !== 'function') {
	    _.warn(
	      'The "el" option should be a function ' +
	      'that returns a per-instance value in component ' +
	      'definitions.'
	    )
	    return
	  }
	  var ret = childVal || parentVal
	  // invoke the element factory if this is instance merge
	  return vm && typeof ret === 'function'
	    ? ret.call(vm)
	    : ret
	}

	/**
	 * Hooks and param attributes are merged as arrays.
	 */

	strats.created =
	strats.ready =
	strats.attached =
	strats.detached =
	strats.beforeCompile =
	strats.compiled =
	strats.beforeDestroy =
	strats.destroyed =
	strats.paramAttributes = function (parentVal, childVal) {
	  return childVal
	    ? parentVal
	      ? parentVal.concat(childVal)
	      : _.isArray(childVal)
	        ? childVal
	        : [childVal]
	    : parentVal
	}

	/**
	 * Assets
	 *
	 * When a vm is present (instance creation), we need to do
	 * a three-way merge between constructor options, instance
	 * options and parent options.
	 */

	strats.directives =
	strats.filters =
	strats.partials =
	strats.transitions =
	strats.components = function (parentVal, childVal, vm, key) {
	  var ret = Object.create(
	    vm && vm.$parent
	      ? vm.$parent.$options[key]
	      : _.Vue.options[key]
	  )
	  if (parentVal) {
	    var keys = Object.keys(parentVal)
	    var i = keys.length
	    var field
	    while (i--) {
	      field = keys[i]
	      ret[field] = parentVal[field]
	    }
	  }
	  if (childVal) extend(ret, childVal)
	  return ret
	}

	/**
	 * Events & Watchers.
	 *
	 * Events & watchers hashes should not overwrite one
	 * another, so we merge them as arrays.
	 */

	strats.watch =
	strats.events = function (parentVal, childVal) {
	  if (!childVal) return parentVal
	  if (!parentVal) return childVal
	  var ret = {}
	  extend(ret, parentVal)
	  for (var key in childVal) {
	    var parent = ret[key]
	    var child = childVal[key]
	    ret[key] = parent
	      ? parent.concat(child)
	      : [child]
	  }
	  return ret
	}

	/**
	 * Other object hashes.
	 */

	strats.methods =
	strats.computed = function (parentVal, childVal) {
	  if (!childVal) return parentVal
	  if (!parentVal) return childVal
	  var ret = Object.create(parentVal)
	  extend(ret, childVal)
	  return ret
	}

	/**
	 * Default strategy.
	 */

	var defaultStrat = function (parentVal, childVal) {
	  return childVal === undefined
	    ? parentVal
	    : childVal
	}

	/**
	 * Make sure component options get converted to actual
	 * constructors.
	 *
	 * @param {Object} components
	 */

	function guardComponents (components) {
	  if (components) {
	    var def
	    for (var key in components) {
	      def = components[key]
	      if (_.isPlainObject(def)) {
	        def.name = key
	        components[key] = _.Vue.extend(def)
	      }
	    }
	  }
	}

	/**
	 * Merge two option objects into a new one.
	 * Core utility used in both instantiation and inheritance.
	 *
	 * @param {Object} parent
	 * @param {Object} child
	 * @param {Vue} [vm] - if vm is present, indicates this is
	 *                     an instantiation merge.
	 */

	module.exports = function mergeOptions (parent, child, vm) {
	  guardComponents(child.components)
	  var options = {}
	  var key
	  for (key in parent) {
	    merge(parent[key], child[key], key)
	  }
	  for (key in child) {
	    if (!(parent.hasOwnProperty(key))) {
	      merge(parent[key], child[key], key)
	    }
	  }
	  var mixins = child.mixins
	  if (mixins) {
	    for (var i = 0, l = mixins.length; i < l; i++) {
	      for (key in mixins[i]) {
	        merge(options[key], mixins[i][key], key)
	      }
	    }
	  }
	  function merge (parentVal, childVal, key) {
	    var strat = strats[key] || defaultStrat
	    options[key] = strat(parentVal, childVal, vm, key)
	  }
	  return options
	}

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {

	  /**
	   * The prefix to look for when parsing directives.
	   *
	   * @type {String}
	   */

	  prefix: 'v-',

	  /**
	   * Whether to print debug messages.
	   * Also enables stack trace for warnings.
	   *
	   * @type {Boolean}
	   */

	  debug: false,

	  /**
	   * Whether to suppress warnings.
	   *
	   * @type {Boolean}
	   */

	  silent: false,

	  /**
	   * Whether allow observer to alter data objects'
	   * __proto__.
	   *
	   * @type {Boolean}
	   */

	  proto: true,

	  /**
	   * Whether to parse mustache tags in templates.
	   *
	   * @type {Boolean}
	   */

	  interpolate: true,

	  /**
	   * Whether to use async rendering.
	   */

	  async: true,

	  /**
	   * Internal flag to indicate the delimiters have been
	   * changed.
	   *
	   * @type {Boolean}
	   */

	  _delimitersChanged: true

	}

	/**
	 * Interpolation delimiters.
	 * We need to mark the changed flag so that the text parser
	 * knows it needs to recompile the regex.
	 *
	 * @type {Array<String>}
	 */

	var delimiters = ['{{', '}}']
	Object.defineProperty(module.exports, 'delimiters', {
	  get: function () {
	    return delimiters
	  },
	  set: function (val) {
	    delimiters = val
	    this._delimitersChanged = true
	  }
	})

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var config = __webpack_require__(45)
	var Observer = __webpack_require__(79)
	var expParser = __webpack_require__(58)
	var Batcher = __webpack_require__(85)

	var batcher = new Batcher()
	var uid = 0

	/**
	 * A watcher parses an expression, collects dependencies,
	 * and fires callback when the expression value changes.
	 * This is used for both the $watch() api and directives.
	 *
	 * @param {Vue} vm
	 * @param {String} expression
	 * @param {Function} cb
	 * @param {Array} [filters]
	 * @param {Boolean} [needSet]
	 * @param {Boolean} [deep]
	 * @constructor
	 */

	function Watcher (vm, expression, cb, filters, needSet, deep) {
	  this.vm = vm
	  vm._watcherList.push(this)
	  this.expression = expression
	  this.cbs = [cb]
	  this.id = ++uid // uid for batching
	  this.active = true
	  this.deep = deep
	  this.deps = Object.create(null)
	  // setup filters if any.
	  // We delegate directive filters here to the watcher
	  // because they need to be included in the dependency
	  // collection process.
	  this.readFilters = filters && filters.read
	  this.writeFilters = filters && filters.write
	  // parse expression for getter/setter
	  var res = expParser.parse(expression, needSet)
	  this.getter = res.get
	  this.setter = res.set
	  this.value = this.get()
	}

	var p = Watcher.prototype

	/**
	 * Add a binding dependency to this directive.
	 *
	 * @param {Binding} binding
	 */

	p.addDep = function (binding) {
	  var id = binding.id
	  if (!this.newDeps[id]) {
	    this.newDeps[id] = binding
	    if (!this.deps[id]) {
	      this.deps[id] = binding
	      binding.addSub(this)
	    }
	  }
	}

	/**
	 * Evaluate the getter, and re-collect dependencies.
	 */

	p.get = function () {
	  this.beforeGet()
	  var vm = this.vm
	  var value
	  try {
	    value = this.getter.call(vm, vm)
	  } catch (e) {}
	  // use JSON.stringify to "touch" every property
	  // so they are all tracked as dependencies for
	  // deep watching
	  if (this.deep) JSON.stringify(value)
	  value = _.applyFilters(value, this.readFilters, vm)
	  this.afterGet()
	  return value
	}

	/**
	 * Set the corresponding value with the setter.
	 *
	 * @param {*} value
	 */

	p.set = function (value) {
	  var vm = this.vm
	  value = _.applyFilters(
	    value, this.writeFilters, vm, this.value
	  )
	  try {
	    this.setter.call(vm, vm, value)
	  } catch (e) {}
	}

	/**
	 * Prepare for dependency collection.
	 */

	p.beforeGet = function () {
	  Observer.target = this
	  this.newDeps = {}
	}

	/**
	 * Clean up for dependency collection.
	 */

	p.afterGet = function () {
	  Observer.target = null
	  for (var id in this.deps) {
	    if (!this.newDeps[id]) {
	      this.deps[id].removeSub(this)
	    }
	  }
	  this.deps = this.newDeps
	}

	/**
	 * Subscriber interface.
	 * Will be called when a dependency changes.
	 */

	p.update = function () {
	  if (config.async) {
	    batcher.push(this)
	  } else {
	    this.run()
	  }
	}

	/**
	 * Batcher job interface.
	 * Will be called by the batcher.
	 */

	p.run = function () {
	  if (this.active) {
	    var value = this.get()
	    if (
	      (typeof value === 'object' && value !== null) ||
	      value !== this.value
	    ) {
	      var oldValue = this.value
	      this.value = value
	      var cbs = this.cbs
	      for (var i = 0, l = cbs.length; i < l; i++) {
	        cbs[i](value, oldValue)
	        // if a callback also removed other callbacks,
	        // we need to adjust the loop accordingly.
	        var removed = l - cbs.length
	        if (removed) {
	          i -= removed
	          l -= removed
	        }
	      }
	    }
	  }
	}

	/**
	 * Add a callback.
	 *
	 * @param {Function} cb
	 */

	p.addCb = function (cb) {
	  this.cbs.push(cb)
	}

	/**
	 * Remove a callback.
	 *
	 * @param {Function} cb
	 */

	p.removeCb = function (cb) {
	  var cbs = this.cbs
	  if (cbs.length > 1) {
	    var i = cbs.indexOf(cb)
	    if (i > -1) {
	      cbs.splice(i, 1)
	    }
	  } else if (cb === cbs[0]) {
	    this.teardown()
	  }
	}

	/**
	 * Remove self from all dependencies' subcriber list.
	 */

	p.teardown = function () {
	  if (this.active) {
	    // remove self from vm's watcher list
	    // we can skip this if the vm if being destroyed
	    // which can improve teardown performance.
	    if (!this.vm._isBeingDestroyed) {
	      var list = this.vm._watcherList
	      list.splice(list.indexOf(this))
	    }
	    for (var id in this.deps) {
	      this.deps[id].removeSub(this)
	    }
	    this.active = false
	    this.vm = this.cbs = this.value = null
	  }
	}

	module.exports = Watcher

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var Path = __webpack_require__(55)

	/**
	 * Filter filter for v-repeat
	 *
	 * @param {String} searchKey
	 * @param {String} [delimiter]
	 * @param {String} dataKey
	 */

	exports.filterBy = function (arr, searchKey, delimiter, dataKey) {
	  // allow optional `in` delimiter
	  // because why not
	  if (delimiter && delimiter !== 'in') {
	    dataKey = delimiter
	  }
	  // get the search string
	  var search =
	    _.stripQuotes(searchKey) ||
	    this.$get(searchKey)
	  if (!search) {
	    return arr
	  }
	  search = search.toLowerCase()
	  // get the optional dataKey
	  dataKey =
	    dataKey &&
	    (_.stripQuotes(dataKey) || this.$get(dataKey))
	  return arr.filter(function (item) {
	    return dataKey
	      ? contains(Path.get(item, dataKey), search)
	      : contains(item, search)
	  })
	}

	/**
	 * Filter filter for v-repeat
	 *
	 * @param {String} sortKey
	 * @param {String} reverseKey
	 */

	exports.orderBy = function (arr, sortKey, reverseKey) {
	  var key =
	    _.stripQuotes(sortKey) ||
	    this.$get(sortKey)
	  if (!key) {
	    return arr
	  }
	  var order = 1
	  if (reverseKey) {
	    if (reverseKey === '-1') {
	      order = -1
	    } else if (reverseKey.charCodeAt(0) === 0x21) { // !
	      reverseKey = reverseKey.slice(1)
	      order = this.$get(reverseKey) ? 1 : -1
	    } else {
	      order = this.$get(reverseKey) ? -1 : 1
	    }
	  }
	  // sort on a copy to avoid mutating original array
	  return arr.slice().sort(function (a, b) {
	    a = Path.get(a, key)
	    b = Path.get(b, key)
	    return a === b ? 0 : a > b ? order : -order
	  })
	}

	/**
	 * String contain helper
	 *
	 * @param {*} val
	 * @param {String} search
	 */

	function contains (val, search) {
	  if (_.isObject(val)) {
	    for (var key in val) {
	      if (contains(val[key], search)) {
	        return true
	      }
	    }
	  } else if (val != null) {
	    return val.toString().toLowerCase().indexOf(search) > -1
	  }
	}

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var uid = 0

	/**
	 * A binding is an observable that can have multiple
	 * directives subscribing to it.
	 *
	 * @constructor
	 */

	function Binding () {
	  this.id = ++uid
	  this.subs = []
	}

	var p = Binding.prototype

	/**
	 * Add a directive subscriber.
	 *
	 * @param {Directive} sub
	 */

	p.addSub = function (sub) {
	  this.subs.push(sub)
	}

	/**
	 * Remove a directive subscriber.
	 *
	 * @param {Directive} sub
	 */

	p.removeSub = function (sub) {
	  if (this.subs.length) {
	    var i = this.subs.indexOf(sub)
	    if (i > -1) this.subs.splice(i, 1)
	  }
	}

	/**
	 * Notify all subscribers of a new value.
	 */

	p.notify = function () {
	  for (var i = 0, l = this.subs.length; i < l; i++) {
	    this.subs[i].update()
	  }
	}

	module.exports = Binding

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var config = __webpack_require__(45)
	var Watcher = __webpack_require__(46)
	var textParser = __webpack_require__(56)
	var expParser = __webpack_require__(58)

	/**
	 * A directive links a DOM element with a piece of data,
	 * which is the result of evaluating an expression.
	 * It registers a watcher with the expression and calls
	 * the DOM update function when a change is triggered.
	 *
	 * @param {String} name
	 * @param {Node} el
	 * @param {Vue} vm
	 * @param {Object} descriptor
	 *                 - {String} expression
	 *                 - {String} [arg]
	 *                 - {Array<Object>} [filters]
	 * @param {Object} def - directive definition object
	 * @param {Function} [linker] - pre-compiled linker function
	 * @constructor
	 */

	function Directive (name, el, vm, descriptor, def, linker) {
	  // public
	  this.name = name
	  this.el = el
	  this.vm = vm
	  // copy descriptor props
	  this.raw = descriptor.raw
	  this.expression = descriptor.expression
	  this.arg = descriptor.arg
	  this.filters = _.resolveFilters(vm, descriptor.filters)
	  // private
	  this._linker = linker
	  this._locked = false
	  this._bound = false
	  // init
	  this._bind(def)
	}

	var p = Directive.prototype

	/**
	 * Initialize the directive, mixin definition properties,
	 * setup the watcher, call definition bind() and update()
	 * if present.
	 *
	 * @param {Object} def
	 */

	p._bind = function (def) {
	  if (this.name !== 'cloak' && this.el.removeAttribute) {
	    this.el.removeAttribute(config.prefix + this.name)
	  }
	  if (typeof def === 'function') {
	    this.update = def
	  } else {
	    _.extend(this, def)
	  }
	  this._watcherExp = this.expression
	  this._checkDynamicLiteral()
	  if (this.bind) {
	    this.bind()
	  }
	  if (
	    this.update && this._watcherExp &&
	    (!this.isLiteral || this._isDynamicLiteral) &&
	    !this._checkStatement()
	  ) {
	    // use raw expression as identifier because filters
	    // make them different watchers
	    var watcher = this.vm._watchers[this.raw]
	    // wrapped updater for context
	    var dir = this
	    var update = this._update = function (val, oldVal) {
	      if (!dir._locked) {
	        dir.update(val, oldVal)
	      }
	    }
	    if (!watcher) {
	      watcher = this.vm._watchers[this.raw] = new Watcher(
	        this.vm,
	        this._watcherExp,
	        update, // callback
	        this.filters,
	        this.twoWay // need setter
	      )
	    } else {
	      watcher.addCb(update)
	    }
	    this._watcher = watcher
	    if (this._initValue != null) {
	      watcher.set(this._initValue)
	    } else {
	      this.update(watcher.value)
	    }
	  }
	  this._bound = true
	}

	/**
	 * check if this is a dynamic literal binding.
	 *
	 * e.g. v-component="{{currentView}}"
	 */

	p._checkDynamicLiteral = function () {
	  var expression = this.expression
	  if (expression && this.isLiteral) {
	    var tokens = textParser.parse(expression)
	    if (tokens) {
	      var exp = textParser.tokensToExp(tokens)
	      this.expression = this.vm.$get(exp)
	      this._watcherExp = exp
	      this._isDynamicLiteral = true
	    }
	  }
	}

	/**
	 * Check if the directive is a function caller
	 * and if the expression is a callable one. If both true,
	 * we wrap up the expression and use it as the event
	 * handler.
	 *
	 * e.g. v-on="click: a++"
	 *
	 * @return {Boolean}
	 */

	p._checkStatement = function () {
	  var expression = this.expression
	  if (
	    expression && this.acceptStatement &&
	    !expParser.pathTestRE.test(expression)
	  ) {
	    var fn = expParser.parse(expression).get
	    var vm = this.vm
	    var handler = function () {
	      fn.call(vm, vm)
	    }
	    if (this.filters) {
	      handler = _.applyFilters(
	        handler,
	        this.filters.read,
	        vm
	      )
	    }
	    this.update(handler)
	    return true
	  }
	}

	/**
	 * Teardown the watcher and call unbind.
	 */

	p._teardown = function () {
	  if (this._bound) {
	    if (this.unbind) {
	      this.unbind()
	    }
	    var watcher = this._watcher
	    if (watcher && watcher.active) {
	      watcher.removeCb(this._update)
	      if (!watcher.active) {
	        this.vm._watchers[this.raw] = null
	      }
	    }
	    this._bound = false
	    this.vm = this.el = this._watcher = null
	  }
	}

	/**
	 * Set the corresponding value with the setter.
	 * This should only be used in two-way directives
	 * e.g. v-model.
	 *
	 * @param {*} value
	 * @param {Boolean} lock - prevent wrtie triggering update.
	 * @public
	 */

	p.set = function (value, lock) {
	  if (this.twoWay) {
	    if (lock) {
	      this._locked = true
	    }
	    this._watcher.set(value)
	    if (lock) {
	      var self = this
	      _.nextTick(function () {
	        self._locked = false        
	      })
	    }
	  }
	}

	module.exports = Directive

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Check is a string starts with $ or _
	 *
	 * @param {String} str
	 * @return {Boolean}
	 */

	exports.isReserved = function (str) {
	  var c = str.charCodeAt(0)
	  return c === 0x24 || c === 0x5F
	}

	/**
	 * Guard text output, make sure undefined outputs
	 * empty string
	 *
	 * @param {*} value
	 * @return {String}
	 */

	exports.toString = function (value) {
	  return value == null
	    ? ''
	    : value.toString()
	}

	/**
	 * Check and convert possible numeric numbers before
	 * setting back to data
	 *
	 * @param {*} value
	 * @return {*|Number}
	 */

	exports.toNumber = function (value) {
	  return (
	    isNaN(value) ||
	    value === null ||
	    typeof value === 'boolean'
	  ) ? value
	    : Number(value)
	}

	/**
	 * Strip quotes from a string
	 *
	 * @param {String} str
	 * @return {String | false}
	 */

	exports.stripQuotes = function (str) {
	  var a = str.charCodeAt(0)
	  var b = str.charCodeAt(str.length - 1)
	  return a === b && (a === 0x22 || a === 0x27)
	    ? str.slice(1, -1)
	    : false
	}

	/**
	 * Camelize a hyphen-delmited string.
	 *
	 * @param {String} str
	 * @return {String}
	 */

	var camelRE = /[-_](\w)/g
	var capitalCamelRE = /(?:^|[-_])(\w)/g

	exports.camelize = function (str, cap) {
	  var RE = cap ? capitalCamelRE : camelRE
	  return str.replace(RE, function (_, c) {
	    return c ? c.toUpperCase () : '';
	  })
	}

	/**
	 * Simple bind, faster than native
	 *
	 * @param {Function} fn
	 * @param {Object} ctx
	 * @return {Function}
	 */

	exports.bind = function (fn, ctx) {
	  return function () {
	    return fn.apply(ctx, arguments)
	  }
	}

	/**
	 * Convert an Array-like object to a real Array.
	 *
	 * @param {Array-like} list
	 * @param {Number} [start] - start index
	 * @return {Array}
	 */

	exports.toArray = function (list, start) {
	  start = start || 0
	  var i = list.length - start
	  var ret = new Array(i)
	  while (i--) {
	    ret[i] = list[i + start]
	  }
	  return ret
	}

	/**
	 * Mix properties into target object.
	 *
	 * @param {Object} to
	 * @param {Object} from
	 */

	exports.extend = function (to, from) {
	  for (var key in from) {
	    to[key] = from[key]
	  }
	}

	/**
	 * Quick object check - this is primarily used to tell
	 * Objects from primitive values when we know the value
	 * is a JSON-compliant type.
	 *
	 * @param {*} obj
	 * @return {Boolean}
	 */

	exports.isObject = function (obj) {
	  return obj && typeof obj === 'object'
	}

	/**
	 * Strict object type check. Only returns true
	 * for plain JavaScript objects.
	 *
	 * @param {*} obj
	 * @return {Boolean}
	 */

	var toString = Object.prototype.toString
	exports.isPlainObject = function (obj) {
	  return toString.call(obj) === '[object Object]'
	}

	/**
	 * Array type check.
	 *
	 * @param {*} obj
	 * @return {Boolean}
	 */

	exports.isArray = function (obj) {
	  return Array.isArray(obj)
	}

	/**
	 * Define a non-enumerable property
	 *
	 * @param {Object} obj
	 * @param {String} key
	 * @param {*} val
	 * @param {Boolean} [enumerable]
	 */

	exports.define = function (obj, key, val, enumerable) {
	  Object.defineProperty(obj, key, {
	    value        : val,
	    enumerable   : !!enumerable,
	    writable     : true,
	    configurable : true
	  })
	}

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Can we use __proto__?
	 *
	 * @type {Boolean}
	 */

	exports.hasProto = '__proto__' in {}

	/**
	 * Indicates we have a window
	 *
	 * @type {Boolean}
	 */

	var toString = Object.prototype.toString
	var inBrowser = exports.inBrowser =
	  typeof window !== 'undefined' &&
	  toString.call(window) !== '[object Object]'

	/**
	 * Defer a task to the start of the next event loop
	 *
	 * @param {Function} cb
	 * @param {Object} ctx
	 */

	var defer = inBrowser
	  ? (window.requestAnimationFrame ||
	    window.webkitRequestAnimationFrame ||
	    setTimeout)
	  : setTimeout

	exports.nextTick = function (cb, ctx) {
	  if (ctx) {
	    defer(function () { cb.call(ctx) }, 0)
	  } else {
	    defer(cb, 0)
	  }
	}

	/**
	 * Detect if we are in IE9...
	 *
	 * @type {Boolean}
	 */

	exports.isIE9 =
	  inBrowser &&
	  navigator.userAgent.indexOf('MSIE 9.0') > 0

	/**
	 * Sniff transition/animation events
	 */

	if (inBrowser && !exports.isIE9) {
	  var isWebkitTrans =
	    window.ontransitionend === undefined &&
	    window.onwebkittransitionend !== undefined
	  var isWebkitAnim =
	    window.onanimationend === undefined &&
	    window.onwebkitanimationend !== undefined
	  exports.transitionProp = isWebkitTrans
	    ? 'WebkitTransition'
	    : 'transition'
	  exports.transitionEndEvent = isWebkitTrans
	    ? 'webkitTransitionEnd'
	    : 'transitionend'
	  exports.animationProp = isWebkitAnim
	    ? 'WebkitAnimation'
	    : 'animation'
	  exports.animationEndEvent = isWebkitAnim
	    ? 'webkitAnimationEnd'
	    : 'animationend'
	}

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(45)

	/**
	 * Check if a node is in the document.
	 *
	 * @param {Node} node
	 * @return {Boolean}
	 */

	var doc =
	  typeof document !== 'undefined' &&
	  document.documentElement

	exports.inDoc = function (node) {
	  return doc && doc.contains(node)
	}

	/**
	 * Extract an attribute from a node.
	 *
	 * @param {Node} node
	 * @param {String} attr
	 */

	exports.attr = function (node, attr) {
	  attr = config.prefix + attr
	  var val = node.getAttribute(attr)
	  if (val !== null) {
	    node.removeAttribute(attr)
	  }
	  return val
	}

	/**
	 * Insert el before target
	 *
	 * @param {Element} el
	 * @param {Element} target 
	 */

	exports.before = function (el, target) {
	  target.parentNode.insertBefore(el, target)
	}

	/**
	 * Insert el after target
	 *
	 * @param {Element} el
	 * @param {Element} target 
	 */

	exports.after = function (el, target) {
	  if (target.nextSibling) {
	    exports.before(el, target.nextSibling)
	  } else {
	    target.parentNode.appendChild(el)
	  }
	}

	/**
	 * Remove el from DOM
	 *
	 * @param {Element} el
	 */

	exports.remove = function (el) {
	  el.parentNode.removeChild(el)
	}

	/**
	 * Prepend el to target
	 *
	 * @param {Element} el
	 * @param {Element} target 
	 */

	exports.prepend = function (el, target) {
	  if (target.firstChild) {
	    exports.before(el, target.firstChild)
	  } else {
	    target.appendChild(el)
	  }
	}

	/**
	 * Replace target with el
	 *
	 * @param {Element} target
	 * @param {Element} el
	 */

	exports.replace = function (target, el) {
	  var parent = target.parentNode
	  if (parent) {
	    parent.replaceChild(el, target)
	  }
	}

	/**
	 * Copy attributes from one element to another.
	 *
	 * @param {Element} from
	 * @param {Element} to
	 */

	exports.copyAttributes = function (from, to) {
	  if (from.hasAttributes()) {
	    var attrs = from.attributes
	    for (var i = 0, l = attrs.length; i < l; i++) {
	      var attr = attrs[i]
	      to.setAttribute(attr.name, attr.value)
	    }
	  }
	}

	/**
	 * Add event listener shorthand.
	 *
	 * @param {Element} el
	 * @param {String} event
	 * @param {Function} cb
	 */

	exports.on = function (el, event, cb) {
	  el.addEventListener(event, cb)
	}

	/**
	 * Remove event listener shorthand.
	 *
	 * @param {Element} el
	 * @param {String} event
	 * @param {Function} cb
	 */

	exports.off = function (el, event, cb) {
	  el.removeEventListener(event, cb)
	}

	/**
	 * Add class with compatibility for IE & SVG
	 *
	 * @param {Element} el
	 * @param {Strong} cls
	 */

	exports.addClass = function (el, cls) {
	  if (el.classList) {
	    el.classList.add(cls)
	  } else {
	    var cur = ' ' + (el.getAttribute('class') || '') + ' '
	    if (cur.indexOf(' ' + cls + ' ') < 0) {
	      el.setAttribute('class', (cur + cls).trim())
	    }
	  }
	}

	/**
	 * Remove class with compatibility for IE & SVG
	 *
	 * @param {Element} el
	 * @param {Strong} cls
	 */

	exports.removeClass = function (el, cls) {
	  if (el.classList) {
	    el.classList.remove(cls)
	  } else {
	    var cur = ' ' + (el.getAttribute('class') || '') + ' '
	    var tar = ' ' + cls + ' '
	    while (cur.indexOf(tar) >= 0) {
	      cur = cur.replace(tar, ' ')
	    }
	    el.setAttribute('class', cur.trim())
	  }
	}

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(54)

	/**
	 * Resolve read & write filters for a vm instance. The
	 * filters descriptor Array comes from the directive parser.
	 *
	 * This is extracted into its own utility so it can
	 * be used in multiple scenarios.
	 *
	 * @param {Vue} vm
	 * @param {Array<Object>} filters
	 * @param {Object} [target]
	 * @return {Object}
	 */

	exports.resolveFilters = function (vm, filters, target) {
	  if (!filters) {
	    return
	  }
	  var res = target || {}
	  // var registry = vm.$options.filters
	  filters.forEach(function (f) {
	    var def = vm.$options.filters[f.name]
	    _.assertAsset(def, 'filter', f.name)
	    if (!def) return
	    var args = f.args
	    var reader, writer
	    if (typeof def === 'function') {
	      reader = def
	    } else {
	      reader = def.read
	      writer = def.write
	    }
	    if (reader) {
	      if (!res.read) res.read = []
	      res.read.push(function (value) {
	        return args
	          ? reader.apply(vm, [value].concat(args))
	          : reader.call(vm, value)
	      })
	    }
	    if (writer) {
	      if (!res.write) res.write = []
	      res.write.push(function (value, oldVal) {
	        return args
	          ? writer.apply(vm, [value, oldVal].concat(args))
	          : writer.call(vm, value, oldVal)
	      })
	    }
	  })
	  return res
	}

	/**
	 * Apply filters to a value
	 *
	 * @param {*} value
	 * @param {Array} filters
	 * @param {Vue} vm
	 * @param {*} oldVal
	 * @return {*}
	 */

	exports.applyFilters = function (value, filters, vm, oldVal) {
	  if (!filters) {
	    return value
	  }
	  for (var i = 0, l = filters.length; i < l; i++) {
	    value = filters[i].call(vm, value, oldVal)
	  }
	  return value
	}

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(45)

	/**
	 * Enable debug utilities. The enableDebug() function and
	 * all _.log() & _.warn() calls will be dropped in the
	 * minified production build.
	 */

	enableDebug()

	function enableDebug () {
	  var hasConsole = typeof console !== 'undefined'
	  
	  /**
	   * Log a message.
	   *
	   * @param {String} msg
	   */

	  exports.log = function (msg) {
	    if (hasConsole && config.debug) {
	      console.log('[Vue info]: ' + msg)
	    }
	  }

	  /**
	   * We've got a problem here.
	   *
	   * @param {String} msg
	   */

	  exports.warn = function (msg) {
	    if (hasConsole && !config.silent) {
	      console.warn('[Vue warn]: ' + msg)
	      if (config.debug && console.trace) {
	        console.trace()
	      }
	    }
	  }

	  /**
	   * Assert asset exists
	   */

	  exports.assertAsset = function (val, type, id) {
	    if (!val) {
	      exports.warn('Failed to resolve ' + type + ': ' + id)
	    }
	  }
	}

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var Cache = __webpack_require__(86)
	var pathCache = new Cache(1000)
	var identRE = /^[$_a-zA-Z]+[\w$]*$/

	/**
	 * Path-parsing algorithm scooped from Polymer/observe-js
	 */

	var pathStateMachine = {
	  'beforePath': {
	    'ws': ['beforePath'],
	    'ident': ['inIdent', 'append'],
	    '[': ['beforeElement'],
	    'eof': ['afterPath']
	  },

	  'inPath': {
	    'ws': ['inPath'],
	    '.': ['beforeIdent'],
	    '[': ['beforeElement'],
	    'eof': ['afterPath']
	  },

	  'beforeIdent': {
	    'ws': ['beforeIdent'],
	    'ident': ['inIdent', 'append']
	  },

	  'inIdent': {
	    'ident': ['inIdent', 'append'],
	    '0': ['inIdent', 'append'],
	    'number': ['inIdent', 'append'],
	    'ws': ['inPath', 'push'],
	    '.': ['beforeIdent', 'push'],
	    '[': ['beforeElement', 'push'],
	    'eof': ['afterPath', 'push']
	  },

	  'beforeElement': {
	    'ws': ['beforeElement'],
	    '0': ['afterZero', 'append'],
	    'number': ['inIndex', 'append'],
	    "'": ['inSingleQuote', 'append', ''],
	    '"': ['inDoubleQuote', 'append', '']
	  },

	  'afterZero': {
	    'ws': ['afterElement', 'push'],
	    ']': ['inPath', 'push']
	  },

	  'inIndex': {
	    '0': ['inIndex', 'append'],
	    'number': ['inIndex', 'append'],
	    'ws': ['afterElement'],
	    ']': ['inPath', 'push']
	  },

	  'inSingleQuote': {
	    "'": ['afterElement'],
	    'eof': 'error',
	    'else': ['inSingleQuote', 'append']
	  },

	  'inDoubleQuote': {
	    '"': ['afterElement'],
	    'eof': 'error',
	    'else': ['inDoubleQuote', 'append']
	  },

	  'afterElement': {
	    'ws': ['afterElement'],
	    ']': ['inPath', 'push']
	  }
	}

	function noop () {}

	/**
	 * Determine the type of a character in a keypath.
	 *
	 * @param {Char} char
	 * @return {String} type
	 */

	function getPathCharType (char) {
	  if (char === undefined) {
	    return 'eof'
	  }

	  var code = char.charCodeAt(0)

	  switch(code) {
	    case 0x5B: // [
	    case 0x5D: // ]
	    case 0x2E: // .
	    case 0x22: // "
	    case 0x27: // '
	    case 0x30: // 0
	      return char

	    case 0x5F: // _
	    case 0x24: // $
	      return 'ident'

	    case 0x20: // Space
	    case 0x09: // Tab
	    case 0x0A: // Newline
	    case 0x0D: // Return
	    case 0xA0:  // No-break space
	    case 0xFEFF:  // Byte Order Mark
	    case 0x2028:  // Line Separator
	    case 0x2029:  // Paragraph Separator
	      return 'ws'
	  }

	  // a-z, A-Z
	  if ((0x61 <= code && code <= 0x7A) ||
	      (0x41 <= code && code <= 0x5A)) {
	    return 'ident'
	  }

	  // 1-9
	  if (0x31 <= code && code <= 0x39) {
	    return 'number'
	  }

	  return 'else'
	}

	/**
	 * Parse a string path into an array of segments
	 * Todo implement cache
	 *
	 * @param {String} path
	 * @return {Array|undefined}
	 */

	function parsePath (path) {
	  var keys = []
	  var index = -1
	  var mode = 'beforePath'
	  var c, newChar, key, type, transition, action, typeMap

	  var actions = {
	    push: function() {
	      if (key === undefined) {
	        return
	      }
	      keys.push(key)
	      key = undefined
	    },
	    append: function() {
	      if (key === undefined) {
	        key = newChar
	      } else {
	        key += newChar
	      }
	    }
	  }

	  function maybeUnescapeQuote () {
	    var nextChar = path[index + 1]
	    if ((mode === 'inSingleQuote' && nextChar === "'") ||
	        (mode === 'inDoubleQuote' && nextChar === '"')) {
	      index++
	      newChar = nextChar
	      actions.append()
	      return true
	    }
	  }

	  while (mode) {
	    index++
	    c = path[index]

	    if (c === '\\' && maybeUnescapeQuote()) {
	      continue
	    }

	    type = getPathCharType(c)
	    typeMap = pathStateMachine[mode]
	    transition = typeMap[type] || typeMap['else'] || 'error'

	    if (transition === 'error') {
	      return // parse error
	    }

	    mode = transition[0]
	    action = actions[transition[1]] || noop
	    newChar = transition[2] === undefined
	      ? c
	      : transition[2]
	    action()

	    if (mode === 'afterPath') {
	      return keys
	    }
	  }
	}

	/**
	 * Format a accessor segment based on its type.
	 *
	 * @param {String} key
	 * @return {Boolean}
	 */

	function formatAccessor(key) {
	  if (identRE.test(key)) { // identifier
	    return '.' + key
	  } else if (+key === key >>> 0) { // bracket index
	    return '[' + key + ']';
	  } else { // bracket string
	    return '["' + key.replace(/"/g, '\\"') + '"]';
	  }
	}

	/**
	 * Compiles a getter function with a fixed path.
	 *
	 * @param {Array} path
	 * @return {Function}
	 */

	exports.compileGetter = function (path) {
	  var body =
	    'try{return o' +
	    path.map(formatAccessor).join('') +
	    '}catch(e){};'
	  return new Function('o', body)
	}

	/**
	 * External parse that check for a cache hit first
	 *
	 * @param {String} path
	 * @return {Array|undefined}
	 */

	exports.parse = function (path) {
	  var hit = pathCache.get(path)
	  if (!hit) {
	    hit = parsePath(path)
	    if (hit) {
	      hit.get = exports.compileGetter(hit)
	      pathCache.put(path, hit)
	    }
	  }
	  return hit
	}

	/**
	 * Get from an object from a path string
	 *
	 * @param {Object} obj
	 * @param {String} path
	 */

	exports.get = function (obj, path) {
	  path = exports.parse(path)
	  if (path) {
	    return path.get(obj)
	  }
	}

	/**
	 * Set on an object from a path
	 *
	 * @param {Object} obj
	 * @param {String | Array} path
	 * @param {*} val
	 */

	exports.set = function (obj, path, val) {
	  if (typeof path === 'string') {
	    path = exports.parse(path)
	  }
	  if (!path || !_.isObject(obj)) {
	    return false
	  }
	  var last, key
	  for (var i = 0, l = path.length - 1; i < l; i++) {
	    last = obj
	    key = path[i]
	    obj = obj[key]
	    if (!_.isObject(obj)) {
	      obj = {}
	      last.$add(key, obj)
	    }
	  }
	  key = path[i]
	  if (key in obj) {
	    obj[key] = val
	  } else {
	    obj.$add(key, val)
	  }
	  return true
	}

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var Cache = __webpack_require__(86)
	var config = __webpack_require__(45)
	var dirParser = __webpack_require__(57)
	var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g
	var cache, tagRE, htmlRE, firstChar, lastChar

	/**
	 * Escape a string so it can be used in a RegExp
	 * constructor.
	 *
	 * @param {String} str
	 */

	function escapeRegex (str) {
	  return str.replace(regexEscapeRE, '\\$&')
	}

	/**
	 * Compile the interpolation tag regex.
	 *
	 * @return {RegExp}
	 */

	function compileRegex () {
	  config._delimitersChanged = false
	  var open = config.delimiters[0]
	  var close = config.delimiters[1]
	  firstChar = open.charAt(0)
	  lastChar = close.charAt(close.length - 1)
	  var firstCharRE = escapeRegex(firstChar)
	  var lastCharRE = escapeRegex(lastChar)
	  var openRE = escapeRegex(open)
	  var closeRE = escapeRegex(close)
	  tagRE = new RegExp(
	    firstCharRE + '?' + openRE +
	    '(.+?)' +
	    closeRE + lastCharRE + '?',
	    'g'
	  )
	  htmlRE = new RegExp(
	    '^' + firstCharRE + openRE +
	    '.*' +
	    closeRE + lastCharRE + '$'
	  )
	  // reset cache
	  cache = new Cache(1000)
	}

	/**
	 * Parse a template text string into an array of tokens.
	 *
	 * @param {String} text
	 * @return {Array<Object> | null}
	 *               - {String} type
	 *               - {String} value
	 *               - {Boolean} [html]
	 *               - {Boolean} [oneTime]
	 */

	exports.parse = function (text) {
	  if (config._delimitersChanged) {
	    compileRegex()
	  }
	  var hit = cache.get(text)
	  if (hit) {
	    return hit
	  }
	  if (!tagRE.test(text)) {
	    return null
	  }
	  var tokens = []
	  var lastIndex = tagRE.lastIndex = 0
	  var match, index, value, first, oneTime, partial
	  /* jshint boss:true */
	  while (match = tagRE.exec(text)) {
	    index = match.index
	    // push text token
	    if (index > lastIndex) {
	      tokens.push({
	        value: text.slice(lastIndex, index)
	      })
	    }
	    // tag token
	    first = match[1].charCodeAt(0)
	    oneTime = first === 0x2A // *
	    partial = first === 0x3E // >
	    value = (oneTime || partial)
	      ? match[1].slice(1)
	      : match[1]
	    tokens.push({
	      tag: true,
	      value: value.trim(),
	      html: htmlRE.test(match[0]),
	      oneTime: oneTime,
	      partial: partial
	    })
	    lastIndex = index + match[0].length
	  }
	  if (lastIndex < text.length) {
	    tokens.push({
	      value: text.slice(lastIndex)
	    })
	  }
	  cache.put(text, tokens)
	  return tokens
	}

	/**
	 * Format a list of tokens into an expression.
	 * e.g. tokens parsed from 'a {{b}} c' can be serialized
	 * into one single expression as '"a " + b + " c"'.
	 *
	 * @param {Array} tokens
	 * @param {Vue} [vm]
	 * @return {String}
	 */

	exports.tokensToExp = function (tokens, vm) {
	  return tokens.length > 1
	    ? tokens.map(function (token) {
	        return formatToken(token, vm)
	      }).join('+')
	    : formatToken(tokens[0], vm, true)
	}

	/**
	 * Format a single token.
	 *
	 * @param {Object} token
	 * @param {Vue} [vm]
	 * @param {Boolean} single
	 * @return {String}
	 */

	function formatToken (token, vm, single) {
	  return token.tag
	    ? vm && token.oneTime
	      ? '"' + vm.$eval(token.value) + '"'
	      : single
	        ? token.value
	        : inlineFilters(token.value)
	    : '"' + token.value + '"'
	}

	/**
	 * For an attribute with multiple interpolation tags,
	 * e.g. attr="some-{{thing | filter}}", in order to combine
	 * the whole thing into a single watchable expression, we
	 * have to inline those filters. This function does exactly
	 * that. This is a bit hacky but it avoids heavy changes
	 * to directive parser and watcher mechanism.
	 *
	 * @param {String} exp
	 * @return {String}
	 */

	var filterRE = /[^|]\|[^|]/
	function inlineFilters (exp) {
	  if (!filterRE.test(exp)) {
	    return '(' + exp + ')'
	  } else {
	    var dir = dirParser.parse(exp)[0]
	    if (!dir.filters) {
	      return '(' + exp + ')'
	    } else {
	      exp = dir.expression
	      for (var i = 0, l = dir.filters.length; i < l; i++) {
	        var filter = dir.filters[i]
	        var args = filter.args
	          ? ',"' + filter.args.join('","') + '"'
	          : ''
	        exp = 'this.$options.filters["' + filter.name + '"]' +
	          '.apply(this,[' + exp + args + '])'
	      }
	      return exp
	    }
	  }
	}

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var Cache = __webpack_require__(86)
	var cache = new Cache(1000)
	var argRE = /^[^\{\?]+$|^'[^']*'$|^"[^"]*"$/
	var filterTokenRE = /[^\s'"]+|'[^']+'|"[^"]+"/g

	/**
	 * Parser state
	 */

	var str
	var c, i, l
	var inSingle
	var inDouble
	var curly
	var square
	var paren
	var begin
	var argIndex
	var dirs
	var dir
	var lastFilterIndex
	var arg

	/**
	 * Push a directive object into the result Array
	 */

	function pushDir () {
	  dir.raw = str.slice(begin, i).trim()
	  if (dir.expression === undefined) {
	    dir.expression = str.slice(argIndex, i).trim()
	  } else if (lastFilterIndex !== begin) {
	    pushFilter()
	  }
	  if (i === 0 || dir.expression) {
	    dirs.push(dir)
	  }
	}

	/**
	 * Push a filter to the current directive object
	 */

	function pushFilter () {
	  var exp = str.slice(lastFilterIndex, i).trim()
	  var filter
	  if (exp) {
	    filter = {}
	    var tokens = exp.match(filterTokenRE)
	    filter.name = tokens[0]
	    filter.args = tokens.length > 1 ? tokens.slice(1) : null
	  }
	  if (filter) {
	    (dir.filters = dir.filters || []).push(filter)
	  }
	  lastFilterIndex = i + 1
	}

	/**
	 * Parse a directive string into an Array of AST-like
	 * objects representing directives.
	 *
	 * Example:
	 *
	 * "click: a = a + 1 | uppercase" will yield:
	 * {
	 *   arg: 'click',
	 *   expression: 'a = a + 1',
	 *   filters: [
	 *     { name: 'uppercase', args: null }
	 *   ]
	 * }
	 *
	 * @param {String} str
	 * @return {Array<Object>}
	 */

	exports.parse = function (s) {

	  var hit = cache.get(s)
	  if (hit) {
	    return hit
	  }

	  // reset parser state
	  str = s
	  inSingle = inDouble = false
	  curly = square = paren = begin = argIndex = 0
	  lastFilterIndex = 0
	  dirs = []
	  dir = {}
	  arg = null

	  for (i = 0, l = str.length; i < l; i++) {
	    c = str.charCodeAt(i)
	    if (inSingle) {
	      // check single quote
	      if (c === 0x27) inSingle = !inSingle
	    } else if (inDouble) {
	      // check double quote
	      if (c === 0x22) inDouble = !inDouble
	    } else if (
	      c === 0x2C && // comma
	      !paren && !curly && !square
	    ) {
	      // reached the end of a directive
	      pushDir()
	      // reset & skip the comma
	      dir = {}
	      begin = argIndex = lastFilterIndex = i + 1
	    } else if (
	      c === 0x3A && // colon
	      !dir.expression &&
	      !dir.arg
	    ) {
	      // argument
	      arg = str.slice(begin, i).trim()
	      // test for valid argument here
	      // since we may have caught stuff like first half of
	      // an object literal or a ternary expression.
	      if (argRE.test(arg)) {
	        argIndex = i + 1
	        dir.arg = _.stripQuotes(arg) || arg
	      }
	    } else if (
	      c === 0x7C && // pipe
	      str.charCodeAt(i + 1) !== 0x7C &&
	      str.charCodeAt(i - 1) !== 0x7C
	    ) {
	      if (dir.expression === undefined) {
	        // first filter, end of expression
	        lastFilterIndex = i + 1
	        dir.expression = str.slice(argIndex, i).trim()
	      } else {
	        // already has filter
	        pushFilter()
	      }
	    } else {
	      switch (c) {
	        case 0x22: inDouble = true; break // "
	        case 0x27: inSingle = true; break // '
	        case 0x28: paren++; break         // (
	        case 0x29: paren--; break         // )
	        case 0x5B: square++; break        // [
	        case 0x5D: square--; break        // ]
	        case 0x7B: curly++; break         // {
	        case 0x7D: curly--; break         // }
	      }
	    }
	  }

	  if (i === 0 || begin !== i) {
	    pushDir()
	  }

	  cache.put(s, dirs)
	  return dirs
	}

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var Path = __webpack_require__(55)
	var Cache = __webpack_require__(86)
	var expressionCache = new Cache(1000)

	var keywords =
	  'Math,break,case,catch,continue,debugger,default,' +
	  'delete,do,else,false,finally,for,function,if,in,' +
	  'instanceof,new,null,return,switch,this,throw,true,try,' +
	  'typeof,var,void,while,with,undefined,abstract,boolean,' +
	  'byte,char,class,const,double,enum,export,extends,' +
	  'final,float,goto,implements,import,int,interface,long,' +
	  'native,package,private,protected,public,short,static,' +
	  'super,synchronized,throws,transient,volatile,' +
	  'arguments,let,yield'

	var wsRE = /\s/g
	var newlineRE = /\n/g
	var saveRE = /[\{,]\s*[\w\$_]+\s*:|'[^']*'|"[^"]*"/g
	var restoreRE = /"(\d+)"/g
	var pathTestRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*$/
	var pathReplaceRE = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g
	var keywordsRE = new RegExp('^(' + keywords.replace(/,/g, '\\b|') + '\\b)')

	/**
	 * Save / Rewrite / Restore
	 *
	 * When rewriting paths found in an expression, it is
	 * possible for the same letter sequences to be found in
	 * strings and Object literal property keys. Therefore we
	 * remove and store these parts in a temporary array, and
	 * restore them after the path rewrite.
	 */

	var saved = []

	/**
	 * Save replacer
	 *
	 * @param {String} str
	 * @return {String} - placeholder with index
	 */

	function save (str) {
	  var i = saved.length
	  saved[i] = str.replace(newlineRE, '\\n')
	  return '"' + i + '"'
	}

	/**
	 * Path rewrite replacer
	 *
	 * @param {String} raw
	 * @return {String}
	 */

	function rewrite (raw) {
	  var c = raw.charAt(0)
	  var path = raw.slice(1)
	  if (keywordsRE.test(path)) {
	    return raw
	  } else {
	    path = path.indexOf('"') > -1
	      ? path.replace(restoreRE, restore)
	      : path
	    return c + 'scope.' + path
	  }
	}

	/**
	 * Restore replacer
	 *
	 * @param {String} str
	 * @param {String} i - matched save index
	 * @return {String}
	 */

	function restore (str, i) {
	  return saved[i]
	}

	/**
	 * Rewrite an expression, prefixing all path accessors with
	 * `scope.` and generate getter/setter functions.
	 *
	 * @param {String} exp
	 * @param {Boolean} needSet
	 * @return {Function}
	 */

	function compileExpFns (exp, needSet) {
	  // reset state
	  saved.length = 0
	  // save strings and object literal keys
	  var body = exp
	    .replace(saveRE, save)
	    .replace(wsRE, '')
	  // rewrite all paths
	  // pad 1 space here becaue the regex matches 1 extra char
	  body = (' ' + body)
	    .replace(pathReplaceRE, rewrite)
	    .replace(restoreRE, restore)
	  var getter = makeGetter(body)
	  if (getter) {
	    return {
	      get: getter,
	      body: body,
	      set: needSet
	        ? makeSetter(body)
	        : null
	    }
	  }
	}

	/**
	 * Compile getter setters for a simple path.
	 *
	 * @param {String} exp
	 * @return {Function}
	 */

	function compilePathFns (exp) {
	  var getter, path
	  if (exp.indexOf('[') < 0) {
	    // really simple path
	    path = exp.split('.')
	    getter = Path.compileGetter(path)
	  } else {
	    // do the real parsing
	    path = Path.parse(exp)
	    getter = path.get
	  }
	  return {
	    get: getter,
	    // always generate setter for simple paths
	    set: function (obj, val) {
	      Path.set(obj, path, val)
	    }
	  }
	}

	/**
	 * Build a getter function. Requires eval.
	 *
	 * We isolate the try/catch so it doesn't affect the
	 * optimization of the parse function when it is not called.
	 *
	 * @param {String} body
	 * @return {Function|undefined}
	 */

	function makeGetter (body) {
	  try {
	    return new Function('scope', 'return ' + body + ';')
	  } catch (e) {
	    _.warn(
	      'Invalid expression. ' + 
	      'Generated function body: ' + body
	    )
	  }
	}

	/**
	 * Build a setter function.
	 *
	 * This is only needed in rare situations like "a[b]" where
	 * a settable path requires dynamic evaluation.
	 *
	 * This setter function may throw error when called if the
	 * expression body is not a valid left-hand expression in
	 * assignment.
	 *
	 * @param {String} body
	 * @return {Function|undefined}
	 */

	function makeSetter (body) {
	  try {
	    return new Function('scope', 'value', body + '=value;')
	  } catch (e) {
	    _.warn('Invalid setter function body: ' + body)
	  }
	}

	/**
	 * Check for setter existence on a cache hit.
	 *
	 * @param {Function} hit
	 */

	function checkSetter (hit) {
	  if (!hit.set) {
	    hit.set = makeSetter(hit.body)
	  }
	}

	/**
	 * Parse an expression into re-written getter/setters.
	 *
	 * @param {String} exp
	 * @param {Boolean} needSet
	 * @return {Function}
	 */

	exports.parse = function (exp, needSet) {
	  exp = exp.trim()
	  // try cache
	  var hit = expressionCache.get(exp)
	  if (hit) {
	    if (needSet) {
	      checkSetter(hit)
	    }
	    return hit
	  }
	  // we do a simple path check to optimize for them.
	  // the check fails valid paths with unusal whitespaces,
	  // but that's too rare and we don't care.
	  var res = pathTestRE.test(exp)
	    ? compilePathFns(exp)
	    : compileExpFns(exp, needSet)
	  expressionCache.put(exp, res)
	  return res
	}

	// Export the pathRegex for external use
	exports.pathTestRE = pathTestRE

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var applyCSSTransition = __webpack_require__(87)
	var applyJSTransition = __webpack_require__(88)

	/**
	 * Append with transition.
	 *
	 * @oaram {Element} el
	 * @param {Element} target
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	exports.append = function (el, target, vm, cb) {
	  apply(el, 1, function () {
	    target.appendChild(el)
	  }, vm, cb)
	}

	/**
	 * InsertBefore with transition.
	 *
	 * @oaram {Element} el
	 * @param {Element} target
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	exports.before = function (el, target, vm, cb) {
	  apply(el, 1, function () {
	    _.before(el, target)
	  }, vm, cb)
	}

	/**
	 * Remove with transition.
	 *
	 * @oaram {Element} el
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	exports.remove = function (el, vm, cb) {
	  apply(el, -1, function () {
	    _.remove(el)
	  }, vm, cb)
	}

	/**
	 * Remove by appending to another parent with transition.
	 * This is only used in block operations.
	 *
	 * @oaram {Element} el
	 * @param {Element} target
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	exports.removeThenAppend = function (el, target, vm, cb) {
	  apply(el, -1, function () {
	    target.appendChild(el)
	  }, vm, cb)
	}

	/**
	 * Append the childNodes of a fragment to target.
	 *
	 * @param {DocumentFragment} block
	 * @param {Node} target
	 * @param {Vue} vm
	 */

	exports.blockAppend = function (block, target, vm) {
	  var nodes = _.toArray(block.childNodes)
	  for (var i = 0, l = nodes.length; i < l; i++) {
	    exports.before(nodes[i], target, vm)
	  }
	}

	/**
	 * Remove a block of nodes between two edge nodes.
	 *
	 * @param {Node} start
	 * @param {Node} end
	 * @param {Vue} vm
	 */

	exports.blockRemove = function (start, end, vm) {
	  var node = start.nextSibling
	  var next
	  while (node !== end) {
	    next = node.nextSibling
	    exports.remove(node, vm)
	    node = next
	  }
	}

	/**
	 * Apply transitions with an operation callback.
	 *
	 * @oaram {Element} el
	 * @param {Number} direction
	 *                  1: enter
	 *                 -1: leave
	 * @param {Function} op - the actual DOM operation
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	var apply = exports.apply = function (el, direction, op, vm, cb) {
	  var transData = el.__v_trans
	  if (
	    !transData ||
	    !vm._isCompiled ||
	    // if the vm is being manipulated by a parent directive
	    // during the parent's compilation phase, skip the
	    // animation.
	    (vm.$parent && !vm.$parent._isCompiled)
	  ) {
	    op()
	    if (cb) cb()
	    return
	  }
	  // determine the transition type on the element
	  var jsTransition = vm.$options.transitions[transData.id]
	  if (jsTransition) {
	    // js
	    applyJSTransition(
	      el,
	      direction,
	      op,
	      transData,
	      jsTransition,
	      vm,
	      cb
	    )
	  } else if (_.transitionEndEvent) {
	    // css
	    applyCSSTransition(
	      el,
	      direction,
	      op,
	      transData,
	      cb
	    )
	  } else {
	    // not applicable
	    op()
	    if (cb) cb()
	  }
	}

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var config = __webpack_require__(45)
	var textParser = __webpack_require__(56)
	var dirParser = __webpack_require__(57)
	var templateParser = __webpack_require__(89)

	/**
	 * Compile a template and return a reusable composite link
	 * function, which recursively contains more link functions
	 * inside. This top level compile function should only be
	 * called on instance root nodes.
	 *
	 * @param {Element|DocumentFragment} el
	 * @param {Object} options
	 * @param {Boolean} partial
	 * @return {Function}
	 */

	module.exports = function compile (el, options, partial) {
	  var params = !partial && options.paramAttributes
	  var paramsLinkFn = params
	    ? compileParamAttributes(el, params, options)
	    : null
	  var nodeLinkFn = el instanceof DocumentFragment
	    ? null
	    : compileNode(el, options)
	  var childLinkFn =
	    (!nodeLinkFn || !nodeLinkFn.terminal) &&
	    el.hasChildNodes()
	      ? compileNodeList(el.childNodes, options)
	      : null

	  /**
	   * A linker function to be called on a already compiled
	   * piece of DOM, which instantiates all directive
	   * instances.
	   *
	   * @param {Vue} vm
	   * @param {Element|DocumentFragment} el
	   * @return {Function|undefined}
	   */

	  return function link (vm, el) {
	    var originalDirCount = vm._directives.length
	    if (paramsLinkFn) paramsLinkFn(vm, el)
	    if (nodeLinkFn) nodeLinkFn(vm, el)
	    if (childLinkFn) childLinkFn(vm, el.childNodes)

	    /**
	     * If this is a partial compile, the linker function
	     * returns an unlink function that tearsdown all
	     * directives instances generated during the partial
	     * linking.
	     */

	    if (partial) {
	      var dirs = vm._directives.slice(originalDirCount)
	      return function unlink () {
	        var i = dirs.length
	        while (i--) {
	          dirs[i]._teardown()
	        }
	        i = vm._directives.indexOf(dirs[0])
	        vm._directives.splice(i, dirs.length)
	      }
	    }
	  }
	}

	/**
	 * Compile a node and return a nodeLinkFn based on the
	 * node type.
	 *
	 * @param {Node} node
	 * @param {Object} options
	 * @return {Function|undefined}
	 */

	function compileNode (node, options) {
	  var type = node.nodeType
	  if (type === 1 && node.tagName !== 'SCRIPT') {
	    return compileElement(node, options)
	  } else if (type === 3 && config.interpolate) {
	    return compileTextNode(node, options)
	  }
	}

	/**
	 * Compile an element and return a nodeLinkFn.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Function|null}
	 */

	function compileElement (el, options) {
	  var linkFn, tag, component
	  // check custom element component, but only on non-root
	  if (!el.__vue__) {
	    tag = el.tagName.toLowerCase()
	    component =
	      tag.indexOf('-') > 0 &&
	      options.components[tag]
	    if (component) {
	      el.setAttribute(config.prefix + 'component', tag)
	    }
	  }
	  if (component || el.hasAttributes()) {
	    // check terminal direcitves
	    linkFn = checkTerminalDirectives(el, options)
	    // if not terminal, build normal link function
	    if (!linkFn) {
	      var directives = collectDirectives(el, options)
	      linkFn = directives.length
	        ? makeDirectivesLinkFn(directives)
	        : null
	    }
	  }
	  // if the element is a textarea, we need to interpolate
	  // its content on initial render.
	  if (el.tagName === 'TEXTAREA') {
	    var realLinkFn = linkFn
	    linkFn = function (vm, el) {
	      el.value = vm.$interpolate(el.value)
	      if (realLinkFn) realLinkFn(vm, el)      
	    }
	    linkFn.terminal = true
	  }
	  return linkFn
	}

	/**
	 * Build a multi-directive link function.
	 *
	 * @param {Array} directives
	 * @return {Function} directivesLinkFn
	 */

	function makeDirectivesLinkFn (directives) {
	  return function directivesLinkFn (vm, el) {
	    // reverse apply because it's sorted low to high
	    var i = directives.length
	    var dir, j, k
	    while (i--) {
	      dir = directives[i]
	      if (dir._link) {
	        // custom link fn
	        dir._link(vm, el)
	      } else {
	        k = dir.descriptors.length
	        for (j = 0; j < k; j++) {
	          vm._bindDir(dir.name, el,
	                      dir.descriptors[j], dir.def)
	        }
	      }
	    }
	  }
	}

	/**
	 * Compile a textNode and return a nodeLinkFn.
	 *
	 * @param {TextNode} node
	 * @param {Object} options
	 * @return {Function|null} textNodeLinkFn
	 */

	function compileTextNode (node, options) {
	  var tokens = textParser.parse(node.nodeValue)
	  if (!tokens) {
	    return null
	  }
	  var frag = document.createDocumentFragment()
	  var dirs = options.directives
	  var el, token, value
	  for (var i = 0, l = tokens.length; i < l; i++) {
	    token = tokens[i]
	    value = token.value
	    if (token.tag) {
	      if (token.oneTime) {
	        el = document.createTextNode(value)
	      } else {
	        if (token.html) {
	          el = document.createComment('v-html')
	          token.type = 'html'
	          token.def = dirs.html
	          token.descriptor = dirParser.parse(value)[0]
	        } else if (token.partial) {
	          el = document.createComment('v-partial')
	          token.type = 'partial'
	          token.def = dirs.partial
	          token.descriptor = dirParser.parse(value)[0]
	        } else {
	          // IE will clean up empty textNodes during
	          // frag.cloneNode(true), so we have to give it
	          // something here...
	          el = document.createTextNode(' ')
	          token.type = 'text'
	          token.def = dirs.text
	          token.descriptor = dirParser.parse(value)[0]
	        }
	      }
	    } else {
	      el = document.createTextNode(value)
	    }
	    frag.appendChild(el)
	  }
	  return makeTextNodeLinkFn(tokens, frag, options)
	}

	/**
	 * Build a function that processes a textNode.
	 *
	 * @param {Array<Object>} tokens
	 * @param {DocumentFragment} frag
	 */

	function makeTextNodeLinkFn (tokens, frag) {
	  return function textNodeLinkFn (vm, el) {
	    var fragClone = frag.cloneNode(true)
	    var childNodes = _.toArray(fragClone.childNodes)
	    var token, value, node
	    for (var i = 0, l = tokens.length; i < l; i++) {
	      token = tokens[i]
	      value = token.value
	      if (token.tag) {
	        node = childNodes[i]
	        if (token.oneTime) {
	          value = vm.$eval(value)
	          if (token.html) {
	            _.replace(node, templateParser.parse(value, true))
	          } else {
	            node.nodeValue = value
	          }
	        } else {
	          vm._bindDir(token.type, node,
	                      token.descriptor, token.def)
	        }
	      }
	    }
	    _.replace(el, fragClone)
	  }
	}

	/**
	 * Compile a node list and return a childLinkFn.
	 *
	 * @param {NodeList} nodeList
	 * @param {Object} options
	 * @return {Function|undefined}
	 */

	function compileNodeList (nodeList, options) {
	  var linkFns = []
	  var nodeLinkFn, childLinkFn, node
	  for (var i = 0, l = nodeList.length; i < l; i++) {
	    node = nodeList[i]
	    nodeLinkFn = compileNode(node, options)
	    childLinkFn =
	      (!nodeLinkFn || !nodeLinkFn.terminal) &&
	      node.hasChildNodes()
	        ? compileNodeList(node.childNodes, options)
	        : null
	    linkFns.push(nodeLinkFn, childLinkFn)
	  }
	  return linkFns.length
	    ? makeChildLinkFn(linkFns)
	    : null
	}

	/**
	 * Make a child link function for a node's childNodes.
	 *
	 * @param {Array<Function>} linkFns
	 * @return {Function} childLinkFn
	 */

	function makeChildLinkFn (linkFns) {
	  return function childLinkFn (vm, nodes) {
	    // stablize nodes
	    nodes = _.toArray(nodes)
	    var node, nodeLinkFn, childrenLinkFn
	    for (var i = 0, n = 0, l = linkFns.length; i < l; n++) {
	      node = nodes[n]
	      nodeLinkFn = linkFns[i++]
	      childrenLinkFn = linkFns[i++]
	      if (nodeLinkFn) {
	        nodeLinkFn(vm, node)
	      }
	      if (childrenLinkFn) {
	        childrenLinkFn(vm, node.childNodes)
	      }
	    }
	  }
	}

	/**
	 * Compile param attributes on a root element and return
	 * a paramAttributes link function.
	 *
	 * @param {Element} el
	 * @param {Array} attrs
	 * @param {Object} options
	 * @return {Function} paramsLinkFn
	 */

	function compileParamAttributes (el, attrs, options) {
	  var params = []
	  var i = attrs.length
	  var name, value, param
	  while (i--) {
	    name = attrs[i]
	    value = el.getAttribute(name)
	    if (value !== null) {
	      param = {
	        name: name,
	        value: value
	      }
	      var tokens = textParser.parse(value)
	      if (tokens) {
	        el.removeAttribute(name)
	        if (tokens.length > 1) {
	          _.warn(
	            'Invalid param attribute binding: "' +
	            name + '="' + value + '"' +
	            '\nDon\'t mix binding tags with plain text ' +
	            'in param attribute bindings.'
	          )
	          continue
	        } else {
	          param.dynamic = true
	          param.value = tokens[0].value
	        }
	      }
	      params.push(param)
	    }
	  }
	  return makeParamsLinkFn(params, options)
	}

	/**
	 * Build a function that applies param attributes to a vm.
	 *
	 * @param {Array} params
	 * @param {Object} options
	 * @return {Function} paramsLinkFn
	 */

	var dataAttrRE = /^data-/

	function makeParamsLinkFn (params, options) {
	  var def = options.directives['with']
	  return function paramsLinkFn (vm, el) {
	    var i = params.length
	    var param, path
	    while (i--) {
	      param = params[i]
	      // params could contain dashes, which will be
	      // interpreted as minus calculations by the parser
	      // so we need to wrap the path here
	      path = _.camelize(param.name.replace(dataAttrRE, ''))
	      if (param.dynamic) {
	        // dynamic param attribtues are bound as v-with.
	        // we can directly duck the descriptor here beacuse
	        // param attributes cannot use expressions or
	        // filters.
	        vm._bindDir('with', el, {
	          arg: path,
	          expression: param.value
	        }, def)
	      } else {
	        // just set once
	        vm.$set(path, param.value)
	      }
	    }
	  }
	}

	/**
	 * Check an element for terminal directives in fixed order.
	 * If it finds one, return a terminal link function.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Function} terminalLinkFn
	 */

	var terminalDirectives = [
	  'repeat',
	  'if',
	  'component'
	]

	function skip () {}
	skip.terminal = true

	function checkTerminalDirectives (el, options) {
	  if (_.attr(el, 'pre') !== null) {
	    return skip
	  }
	  var value, dirName
	  /* jshint boss: true */
	  for (var i = 0; i < 3; i++) {
	    dirName = terminalDirectives[i]
	    if (value = _.attr(el, dirName)) {
	      return makeTeriminalLinkFn(el, dirName, value, options)
	    }
	  }
	}

	/**
	 * Build a link function for a terminal directive.
	 *
	 * @param {Element} el
	 * @param {String} dirName
	 * @param {String} value
	 * @param {Object} options
	 * @return {Function} terminalLinkFn
	 */

	function makeTeriminalLinkFn (el, dirName, value, options) {
	  var descriptor = dirParser.parse(value)[0]
	  var def = options.directives[dirName]
	  // special case: we need to collect directives found
	  // on a component root node, but defined in the parent
	  // template. These directives need to be compiled in
	  // the parent scope.
	  if (dirName === 'component') {
	    var dirs = collectDirectives(el, options, true)
	    el._parentLinker = dirs.length
	      ? makeDirectivesLinkFn(dirs)
	      : null
	  }
	  var terminalLinkFn = function (vm, el) {
	    vm._bindDir(dirName, el, descriptor, def)
	  }
	  terminalLinkFn.terminal = true
	  return terminalLinkFn
	}

	/**
	 * Collect the directives on an element.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @param {Boolean} asParent
	 * @return {Array}
	 */

	function collectDirectives (el, options, asParent) {
	  var attrs = _.toArray(el.attributes)
	  var i = attrs.length
	  var dirs = []
	  var attr, attrName, dir, dirName, dirDef
	  while (i--) {
	    attr = attrs[i]
	    attrName = attr.name
	    if (attrName.indexOf(config.prefix) === 0) {
	      dirName = attrName.slice(config.prefix.length)
	      if (
	        asParent &&
	        (dirName === 'with' || dirName === 'ref')
	      ) {
	        continue
	      }
	      dirDef = options.directives[dirName]
	      _.assertAsset(dirDef, 'directive', dirName)
	      if (dirDef) {
	        dirs.push({
	          name: dirName,
	          descriptors: dirParser.parse(attr.value),
	          def: dirDef
	        })
	      }
	    } else if (config.interpolate) {
	      dir = collectAttrDirective(el, attrName, attr.value,
	                                 options)
	      if (dir) {
	        dirs.push(dir)
	      }
	    }
	  }
	  // sort by priority, LOW to HIGH
	  dirs.sort(directiveComparator)
	  return dirs
	}

	/**
	 * Check an attribute for potential dynamic bindings,
	 * and return a directive object.
	 *
	 * @param {Element} el
	 * @param {String} name
	 * @param {String} value
	 * @param {Object} options
	 * @return {Object}
	 */

	function collectAttrDirective (el, name, value, options) {
	  var tokens = textParser.parse(value)
	  if (tokens) {
	    var def = options.directives.attr
	    var i = tokens.length
	    var allOneTime = true
	    while (i--) {
	      var token = tokens[i]
	      if (token.tag && !token.oneTime) {
	        allOneTime = false
	      }
	    }
	    return {
	      def: def,
	      _link: allOneTime
	        ? function (vm, el) {
	            el.setAttribute(name, vm.$interpolate(value))
	          }
	        : function (vm, el) {
	            var value = textParser.tokensToExp(tokens, vm)
	            var desc = dirParser.parse(name + ':' + value)[0]
	            vm._bindDir('attr', el, desc, def)
	          }
	    }
	  }
	}

	/**
	 * Directive priority sort comparator
	 *
	 * @param {Object} a
	 * @param {Object} b
	 */

	function directiveComparator (a, b) {
	  a = a.def.priority || 0
	  b = b.def.priority || 0
	  return a > b ? 1 : -1
	}

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var templateParser = __webpack_require__(89)

	/**
	 * Process an element or a DocumentFragment based on a
	 * instance option object. This allows us to transclude
	 * a template node/fragment before the instance is created,
	 * so the processed fragment can then be cloned and reused
	 * in v-repeat.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Element|DocumentFragment}
	 */

	module.exports = function transclude (el, options) {
	  // for template tags, what we want is its content as
	  // a documentFragment (for block instances)
	  if (el.tagName === 'TEMPLATE') {
	    el = templateParser.parse(el)
	  }
	  if (options && options.template) {
	    el = transcludeTemplate(el, options)
	  }
	  if (el instanceof DocumentFragment) {
	    _.prepend(document.createComment('v-start'), el)
	    el.appendChild(document.createComment('v-end'))
	  }
	  return el
	}

	/**
	 * Process the template option.
	 * If the replace option is true this will swap the $el.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Element|DocumentFragment}
	 */

	function transcludeTemplate (el, options) {
	  var template = options.template
	  var frag = templateParser.parse(template, true)
	  if (!frag) {
	    _.warn('Invalid template option: ' + template)
	  } else {
	    collectRawContent(el)
	    if (options.replace) {
	      if (frag.childNodes.length > 1) {
	        transcludeContent(frag)
	        return frag
	      } else {
	        var replacer = frag.firstChild
	        _.copyAttributes(el, replacer)
	        transcludeContent(replacer)
	        return replacer
	      }
	    } else {
	      el.appendChild(frag)
	      transcludeContent(el)
	      return el
	    }
	  }
	}

	/**
	 * Collect raw content inside $el before they are
	 * replaced by template content.
	 */

	var rawContent
	function collectRawContent (el) {
	  var child
	  rawContent = null
	  if (el.hasChildNodes()) {
	    rawContent = document.createElement('div')
	    /* jshint boss:true */
	    while (child = el.firstChild) {
	      rawContent.appendChild(child)
	    }
	  }
	}

	/**
	 * Resolve <content> insertion points mimicking the behavior
	 * of the Shadow DOM spec:
	 *
	 *   http://w3c.github.io/webcomponents/spec/shadow/#insertion-points
	 *
	 * @param {Element|DocumentFragment} el
	 */

	function transcludeContent (el) {
	  var outlets = getOutlets(el)
	  var i = outlets.length
	  if (!i) return
	  var outlet, select, selected, j, main
	  // first pass, collect corresponding content
	  // for each outlet.
	  while (i--) {
	    outlet = outlets[i]
	    if (rawContent) {
	      select = outlet.getAttribute('select')
	      if (select) {  // select content
	        selected = rawContent.querySelectorAll(select)
	        outlet.content = _.toArray(
	          selected.length
	            ? selected
	            : outlet.childNodes
	        )
	      } else { // default content
	        main = outlet
	      }
	    } else { // fallback content
	      outlet.content = _.toArray(outlet.childNodes)
	    }
	  }
	  // second pass, actually insert the contents
	  for (i = 0, j = outlets.length; i < j; i++) {
	    outlet = outlets[i]
	    if (outlet !== main) {
	      insertContentAt(outlet, outlet.content)
	    }
	  }
	  // finally insert the main content
	  if (main) {
	    insertContentAt(main, _.toArray(rawContent.childNodes))
	  }
	}

	/**
	 * Get <content> outlets from the element/list
	 *
	 * @param {Element|Array} el
	 * @return {Array}
	 */

	var concat = [].concat
	function getOutlets (el) {
	  return _.isArray(el)
	    ? concat.apply([], el.map(getOutlets))
	    : el.querySelectorAll
	      ? _.toArray(el.querySelectorAll('content'))
	      : []
	}

	/**
	 * Insert an array of nodes at outlet,
	 * then remove the outlet.
	 *
	 * @param {Element} outlet
	 * @param {Array} contents
	 */

	function insertContentAt (outlet, contents) {
	  // not using util DOM methods here because
	  // parentNode can be cached
	  var parent = outlet.parentNode
	  for (var i = 0, j = contents.length; i < j; i++) {
	    parent.insertBefore(contents[i], outlet)
	  }
	  parent.removeChild(outlet)
	}

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)

	module.exports = {

	  bind: function () {
	    this.attr = this.el.nodeType === 3
	      ? 'nodeValue'
	      : 'textContent'
	  },

	  update: function (value) {
	    this.el[this.attr] = _.toString(value)
	  }
	  
	}

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var templateParser = __webpack_require__(89)

	module.exports = {

	  bind: function () {
	    // a comment node means this is a binding for
	    // {{{ inline unescaped html }}}
	    if (this.el.nodeType === 8) {
	      // hold nodes
	      this.nodes = []
	    }
	  },

	  update: function (value) {
	    value = _.toString(value)
	    if (this.nodes) {
	      this.swap(value)
	    } else {
	      this.el.innerHTML = value
	    }
	  },

	  swap: function (value) {
	    // remove old nodes
	    var i = this.nodes.length
	    while (i--) {
	      _.remove(this.nodes[i])
	    }
	    // convert new value to a fragment
	    var frag = templateParser.parse(value, true)
	    // save a reference to these nodes so we can remove later
	    this.nodes = _.toArray(frag.childNodes)
	    _.before(frag, this.el)
	  }

	}

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	// xlink
	var xlinkNS = 'http://www.w3.org/1999/xlink'
	var xlinkRE = /^xlink:/

	module.exports = {

	  priority: 850,

	  bind: function () {
	    var name = this.arg
	    this.update = xlinkRE.test(name)
	      ? xlinkHandler
	      : defaultHandler
	  }

	}

	function defaultHandler (value) {
	  if (value || value === 0) {
	    this.el.setAttribute(this.arg, value)
	  } else {
	    this.el.removeAttribute(this.arg)
	  }
	}

	function xlinkHandler (value) {
	  if (value != null) {
	    this.el.setAttributeNS(xlinkNS, this.arg, value)
	  } else {
	    this.el.removeAttributeNS(xlinkNS, 'href')
	  }
	}

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var transition = __webpack_require__(59)

	module.exports = function (value) {
	  var el = this.el
	  transition.apply(el, value ? 1 : -1, function () {
	    el.style.display = value ? '' : 'none'
	  }, this.vm)
	}

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var addClass = _.addClass
	var removeClass = _.removeClass

	module.exports = function (value) {
	  if (this.arg) {
	    var method = value ? addClass : removeClass
	    method(this.el, this.arg)
	  } else {
	    if (this.lastVal) {
	      removeClass(this.el, this.lastVal)
	    }
	    if (value) {
	      addClass(this.el, value)
	      this.lastVal = value
	    }
	  }
	}

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {

	  isLiteral: true,

	  bind: function () {
	    this.vm.$$[this.expression] = this.el
	  },

	  unbind: function () {
	    delete this.vm.$$[this.expression]
	  }
	  
	}

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)

	module.exports = {

	  isLiteral: true,

	  bind: function () {
	    if (this.el !== this.vm.$el) {
	      _.warn(
	        'v-ref should only be used on instance root nodes.'
	      )
	      return
	    }
	    this.owner = this.vm.$parent
	    this.owner.$[this.expression] = this.vm
	  },

	  unbind: function () {
	    if (this.owner.$[this.expression] === this.vm) {
	      delete this.owner.$[this.expression]
	    }
	  }
	  
	}

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(45)

	module.exports = {

	  bind: function () {
	    var el = this.el
	    this.vm.$once('hook:compiled', function () {
	      el.removeAttribute(config.prefix + 'cloak')
	    })
	  }

	}

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var prefixes = ['-webkit-', '-moz-', '-ms-']
	var importantRE = /!important;?$/

	module.exports = {

	  bind: function () {
	    var prop = this.arg
	    if (!prop) return
	    if (prop.charAt(0) === '$') {
	      // properties that start with $ will be auto-prefixed
	      prop = prop.slice(1)
	      this.prefixed = true
	    }
	    this.prop = prop
	  },

	  update: function (value) {
	    var prop = this.prop
	    // cast possible numbers/booleans into strings
	    if (value != null) {
	      value += ''
	    }
	    if (prop) {
	      var isImportant = importantRE.test(value)
	        ? 'important'
	        : ''
	      if (isImportant) {
	        value = value.replace(importantRE, '').trim()
	      }
	      this.el.style.setProperty(prop, value, isImportant)
	      if (this.prefixed) {
	        var i = prefixes.length
	        while (i--) {
	          this.el.style.setProperty(
	            prefixes[i] + prop,
	            value,
	            isImportant
	          )
	        }
	      }
	    } else {
	      this.el.style.cssText = value
	    }
	  }

	}

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var templateParser = __webpack_require__(89)
	var transition = __webpack_require__(59)

	module.exports = {

	  isLiteral: true,

	  bind: function () {
	    var el = this.el
	    this.start = document.createComment('v-partial-start')
	    this.end = document.createComment('v-partial-end')
	    if (el.nodeType !== 8) {
	      el.innerHTML = ''
	    }
	    if (el.tagName === 'TEMPLATE' || el.nodeType === 8) {
	      _.replace(el, this.end)
	    } else {
	      el.appendChild(this.end)
	    }
	    _.before(this.start, this.end)
	    if (!this._isDynamicLiteral) {
	      this.compile(this.expression)
	    }
	  },

	  update: function (id) {
	    this.teardown()
	    this.compile(id)
	  },

	  compile: function (id) {
	    var partial = this.vm.$options.partials[id]
	    _.assertAsset(partial, 'partial', id)
	    if (!partial) {
	      return
	    }
	    var vm = this.vm
	    var frag = templateParser.parse(partial, true)
	    var decompile = vm.$compile(frag)
	    this.decompile = function () {
	      decompile()
	      transition.blockRemove(this.start, this.end, vm)
	    }
	    transition.blockAppend(frag, this.end, vm)
	  },

	  teardown: function () {
	    if (this.decompile) {
	      this.decompile()
	      this.decompile = null
	    }
	  }

	}

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {

	  priority: 1000,
	  isLiteral: true,

	  bind: function () {
	    this.el.__v_trans = {
	      id: this.expression
	    }
	  }

	}

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)

	module.exports = {

	  acceptStatement: true,
	  priority: 700,

	  bind: function () {
	    // deal with iframes
	    if (
	      this.el.tagName === 'IFRAME' &&
	      this.arg !== 'load'
	    ) {
	      var self = this
	      this.iframeBind = function () {
	        _.on(self.el.contentWindow, self.arg, self.handler)
	      }
	      _.on(this.el, 'load', this.iframeBind)
	    }
	  },

	  update: function (handler) {
	    if (typeof handler !== 'function') {
	      _.warn(
	        'Directive "v-on:' + this.expression + '" ' +
	        'expects a function value.'
	      )
	      return
	    }
	    this.reset()
	    var vm = this.vm
	    this.handler = function (e) {
	      e.targetVM = vm
	      vm.$event = e
	      var res = handler(e)
	      vm.$event = null
	      return res
	    }
	    if (this.iframeBind) {
	      this.iframeBind()
	    } else {
	      _.on(this.el, this.arg, this.handler)
	    }
	  },

	  reset: function () {
	    var el = this.iframeBind
	      ? this.el.contentWindow
	      : this.el
	    if (this.handler) {
	      _.off(el, this.arg, this.handler)
	    }
	  },

	  unbind: function () {
	    this.reset()
	    _.off(this.el, 'load', this.iframeBind)
	  }
	}

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var templateParser = __webpack_require__(89)

	module.exports = {

	  isLiteral: true,

	  /**
	   * Setup. Two possible usages:
	   *
	   * - static:
	   *   v-component="comp"
	   *
	   * - dynamic:
	   *   v-component="{{currentView}}"
	   */

	  bind: function () {
	    if (!this.el.__vue__) {
	      // create a ref anchor
	      this.ref = document.createComment('v-component')
	      _.replace(this.el, this.ref)
	      // check keep-alive options
	      this.checkKeepAlive()
	      // check parent directives
	      this.parentLinker = this.el._parentLinker
	      // if static, build right now.
	      if (!this._isDynamicLiteral) {
	        this.resolveCtor(this.expression)
	        this.build()
	      }
	    } else {
	      _.warn(
	        'v-component="' + this.expression + '" cannot be ' +
	        'used on an already mounted instance.'
	      )
	    }
	  },

	  /**
	   * Check if the "keep-alive" flag is present.
	   * If yes, instead of destroying the active vm when
	   * hiding (v-if) or switching (dynamic literal) it,
	   * we simply remove it from the DOM and save it in a
	   * cache object, with its constructor id as the key.
	   */

	  checkKeepAlive: function () {
	    // check keep-alive flag
	    this.keepAlive = this.el.hasAttribute('keep-alive')
	    if (this.keepAlive) {
	      this.el.removeAttribute('keep-alive')
	      this.cache = {}
	    }
	  },

	  /**
	   * Resolve the component constructor to use when creating
	   * the child vm.
	   */

	  resolveCtor: function (id) {
	    this.ctorId = id
	    this.Ctor = this.vm.$options.components[id]
	    _.assertAsset(this.Ctor, 'component', id)
	  },

	  /**
	   * Instantiate/insert a new child vm.
	   * If keep alive and has cached instance, insert that
	   * instance; otherwise build a new one and cache it.
	   */

	  build: function () {
	    if (this.keepAlive) {
	      var cached = this.cache[this.ctorId]
	      if (cached) {
	        this.childVM = cached
	        cached.$before(this.ref)
	        return
	      }
	    }
	    var vm = this.vm
	    if (this.Ctor && !this.childVM) {
	      this.childVM = vm.$addChild({
	        el: templateParser.clone(this.el)
	      }, this.Ctor)
	      if (this.parentLinker) {
	        var dirCount = vm._directives.length
	        var targetVM = this.childVM.$options.inherit
	          ? this.childVM
	          : vm
	        this.parentLinker(targetVM, this.childVM.$el)
	        this.parentDirs = vm._directives.slice(dirCount)
	      }
	      if (this.keepAlive) {
	        this.cache[this.ctorId] = this.childVM
	      }
	      this.childVM.$before(this.ref)
	    }
	  },

	  /**
	   * Teardown the active vm.
	   * If keep alive, simply remove it; otherwise destroy it.
	   *
	   * @param {Boolean} remove
	   */

	  unbuild: function (remove) {
	    var child = this.childVM
	    if (!child) {
	      return
	    }
	    if (this.keepAlive) {
	      if (remove) {
	        child.$remove()
	      }
	    } else {
	      child.$destroy(remove)
	      var parentDirs = this.parentDirs
	      if (parentDirs) {
	        var i = parentDirs.length
	        while (i--) {
	          parentDirs[i]._teardown()
	        }
	      }
	    }
	    this.childVM = null
	  },

	  /**
	   * Update callback for the dynamic literal scenario,
	   * e.g. v-component="{{view}}"
	   */

	  update: function (value) {
	    this.unbuild(true)
	    if (value) {
	      this.resolveCtor(value)
	      this.build()
	    }
	  },

	  /**
	   * Unbind.
	   * Make sure keepAlive is set to false so that the
	   * instance is always destroyed.
	   */

	  unbind: function () {
	    this.keepAlive = false
	    this.unbuild()
	  }

	}

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var isObject = _.isObject
	var textParser = __webpack_require__(56)
	var expParser = __webpack_require__(58)
	var templateParser = __webpack_require__(89)
	var compile = __webpack_require__(60)
	var transclude = __webpack_require__(61)
	var mergeOptions = __webpack_require__(44)
	var uid = 0

	module.exports = {

	  /**
	   * Setup.
	   */

	  bind: function () {
	    // uid as a cache identifier
	    this.id = '__v_repeat_' + (++uid)
	    // we need to insert the objToArray converter
	    // as the first read filter.
	    if (!this.filters) {
	      this.filters = {}
	    }
	    // add the object -> array convert filter
	    var objectConverter = _.bind(objToArray, this)
	    if (!this.filters.read) {
	      this.filters.read = [objectConverter]
	    } else {
	      this.filters.read.unshift(objectConverter)
	    }
	    // setup ref node
	    this.ref = document.createComment('v-repeat')
	    _.replace(this.el, this.ref)
	    // check if this is a block repeat
	    this.template = this.el.tagName === 'TEMPLATE'
	      ? templateParser.parse(this.el, true)
	      : this.el
	    // check other directives that need to be handled
	    // at v-repeat level
	    this.checkIf()
	    this.checkRef()
	    this.checkTrackById()
	    this.checkComponent()
	    // cache for primitive value instances
	    this.cache = Object.create(null)
	  },

	  /**
	   * Warn against v-if usage.
	   */

	  checkIf: function () {
	    if (_.attr(this.el, 'if') !== null) {
	      _.warn(
	        'Don\'t use v-if with v-repeat. ' +
	        'Use v-show or the "filterBy" filter instead.'
	      )
	    }
	  },

	  /**
	   * Check if v-ref/ v-el is also present.
	   */

	  checkRef: function () {
	    var childId = _.attr(this.el, 'ref')
	    this.childId = childId
	      ? this.vm.$interpolate(childId)
	      : null
	    var elId = _.attr(this.el, 'el')
	    this.elId = elId
	      ? this.vm.$interpolate(elId)
	      : null
	  },

	  /**
	   * Check for a track-by ID, which allows us to identify
	   * a piece of data and its associated instance by its
	   * unique id.
	   */

	  checkTrackById: function () {
	    this.idKey = this.el.getAttribute('trackby')
	    if (this.idKey !== null) {
	      this.el.removeAttribute('trackby')
	    }
	  },

	  /**
	   * Check the component constructor to use for repeated
	   * instances. If static we resolve it now, otherwise it
	   * needs to be resolved at build time with actual data.
	   */

	  checkComponent: function () {
	    var id = _.attr(this.el, 'component')
	    var options = this.vm.$options
	    if (!id) {
	      this.Ctor = _.Vue // default constructor
	      this.inherit = true // inline repeats should inherit
	      // important: transclude with no options, just
	      // to ensure block start and block end
	      this.template = transclude(this.template)
	      this._linker = compile(this.template, options)
	    } else {
	      var tokens = textParser.parse(id)
	      if (!tokens) { // static component
	        var Ctor = this.Ctor = options.components[id]
	        _.assertAsset(Ctor, 'component', id)
	        if (Ctor) {
	          // merge an empty object with owner vm as parent
	          // so child vms can access parent assets.
	          var merged = mergeOptions(
	            Ctor.options,
	            {},
	            { $parent: this.vm }
	          )
	          this.template = transclude(this.template, merged)
	          this._linker = compile(this.template, merged)
	        }
	      } else {
	        // to be resolved later
	        var ctorExp = textParser.tokensToExp(tokens)
	        this.ctorGetter = expParser.parse(ctorExp).get
	      }
	    }
	  },

	  /**
	   * Update.
	   * This is called whenever the Array mutates.
	   *
	   * @param {Array} data
	   */

	  update: function (data) {
	    if (typeof data === 'number') {
	      data = range(data)
	    }
	    this.vms = this.diff(data || [], this.vms)
	    // update v-ref
	    if (this.childId) {
	      this.vm.$[this.childId] = this.vms
	    }
	    if (this.elId) {
	      this.vm.$$[this.elId] = this.vms.map(function (vm) {
	        return vm.$el
	      })
	    }
	  },

	  /**
	   * Diff, based on new data and old data, determine the
	   * minimum amount of DOM manipulations needed to make the
	   * DOM reflect the new data Array.
	   *
	   * The algorithm diffs the new data Array by storing a
	   * hidden reference to an owner vm instance on previously
	   * seen data. This allows us to achieve O(n) which is
	   * better than a levenshtein distance based algorithm,
	   * which is O(m * n).
	   *
	   * @param {Array} data
	   * @param {Array} oldVms
	   * @return {Array}
	   */

	  diff: function (data, oldVms) {
	    var idKey = this.idKey
	    var converted = this.converted
	    var ref = this.ref
	    var alias = this.arg
	    var init = !oldVms
	    var vms = new Array(data.length)
	    var obj, raw, vm, i, l
	    // First pass, go through the new Array and fill up
	    // the new vms array. If a piece of data has a cached
	    // instance for it, we reuse it. Otherwise build a new
	    // instance.
	    for (i = 0, l = data.length; i < l; i++) {
	      obj = data[i]
	      raw = converted ? obj.value : obj
	      vm = !init && this.getVm(raw)
	      if (vm) { // reusable instance
	        vm._reused = true
	        vm.$index = i // update $index
	        if (converted) {
	          vm.$key = obj.key // update $key
	        }
	        if (idKey) { // swap track by id data
	          if (alias) {
	            vm[alias] = raw
	          } else {
	            vm._setData(raw)
	          }
	        }
	      } else { // new instance
	        vm = this.build(obj, i)
	        vm._new = true
	      }
	      vms[i] = vm
	      // insert if this is first run
	      if (init) {
	        vm.$before(ref)
	      }
	    }
	    // if this is the first run, we're done.
	    if (init) {
	      return vms
	    }
	    // Second pass, go through the old vm instances and
	    // destroy those who are not reused (and remove them
	    // from cache)
	    for (i = 0, l = oldVms.length; i < l; i++) {
	      vm = oldVms[i]
	      if (!vm._reused) {
	        this.uncacheVm(vm)
	        vm.$destroy(true)
	      }
	    }
	    // final pass, move/insert new instances into the
	    // right place. We're going in reverse here because
	    // insertBefore relies on the next sibling to be
	    // resolved.
	    var targetNext, currentNext
	    i = vms.length
	    while (i--) {
	      vm = vms[i]
	      // this is the vm that we should be in front of
	      targetNext = vms[i + 1]
	      if (!targetNext) {
	        // This is the last item. If it's reused then
	        // everything else will eventually be in the right
	        // place, so no need to touch it. Otherwise, insert
	        // it.
	        if (!vm._reused) {
	          vm.$before(ref)
	        }
	      } else {
	        if (vm._reused) {
	          // this is the vm we are actually in front of
	          currentNext = findNextVm(vm, ref)
	          // we only need to move if we are not in the right
	          // place already.
	          if (currentNext !== targetNext) {
	            vm.$before(targetNext.$el, null, false)
	          }
	        } else {
	          // new instance, insert to existing next
	          vm.$before(targetNext.$el)
	        }
	      }
	      vm._new = false
	      vm._reused = false
	    }
	    return vms
	  },

	  /**
	   * Build a new instance and cache it.
	   *
	   * @param {Object} data
	   * @param {Number} index
	   */

	  build: function (data, index) {
	    var original = data
	    var meta = { $index: index }
	    if (this.converted) {
	      meta.$key = original.key
	    }
	    var raw = this.converted ? data.value : data
	    var alias = this.arg
	    var hasAlias = !isObject(raw) || alias
	    // wrap the raw data with alias
	    data = hasAlias ? {} : raw
	    if (alias) {
	      data[alias] = raw
	    } else if (hasAlias) {
	      meta.$value = raw
	    }
	    // resolve constructor
	    var Ctor = this.Ctor || this.resolveCtor(data, meta)
	    var vm = this.vm.$addChild({
	      el: templateParser.clone(this.template),
	      _linker: this._linker,
	      _meta: meta,
	      data: data,
	      inherit: this.inherit
	    }, Ctor)
	    // cache instance
	    this.cacheVm(raw, vm)
	    return vm
	  },

	  /**
	   * Resolve a contructor to use for an instance.
	   * The tricky part here is that there could be dynamic
	   * components depending on instance data.
	   *
	   * @param {Object} data
	   * @param {Object} meta
	   * @return {Function}
	   */

	  resolveCtor: function (data, meta) {
	    // create a temporary context object and copy data
	    // and meta properties onto it.
	    // use _.define to avoid accidentally overwriting scope
	    // properties.
	    var context = Object.create(this.vm)
	    var key
	    for (key in data) {
	      _.define(context, key, data[key])
	    }
	    for (key in meta) {
	      _.define(context, key, meta[key])
	    }
	    var id = this.ctorGetter.call(context, context)
	    var Ctor = this.vm.$options.components[id]
	    _.assertAsset(Ctor, 'component', id)
	    return Ctor
	  },

	  /**
	   * Unbind, teardown everything
	   */

	  unbind: function () {
	    if (this.childId) {
	      delete this.vm.$[this.childId]
	    }
	    if (this.vms) {
	      var i = this.vms.length
	      var vm
	      while (i--) {
	        vm = this.vms[i]
	        this.uncacheVm(vm)
	        vm.$destroy()
	      }
	    }
	  },

	  /**
	   * Cache a vm instance based on its data.
	   *
	   * If the data is an object, we save the vm's reference on
	   * the data object as a hidden property. Otherwise we
	   * cache them in an object and for each primitive value
	   * there is an array in case there are duplicates.
	   *
	   * @param {Object} data
	   * @param {Vue} vm
	   */

	  cacheVm: function (data, vm) {
	    var idKey = this.idKey
	    var cache = this.cache
	    var id
	    if (idKey) {
	      id = data[idKey]
	      if (!cache[id]) {
	        cache[id] = vm
	      } else {
	        _.warn('Duplicate ID in v-repeat: ' + id)
	      }
	    } else if (isObject(data)) {
	      id = this.id
	      if (data.hasOwnProperty(id)) {
	        if (data[id] === null) {
	          data[id] = vm
	        } else {
	          _.warn(
	            'Duplicate objects are not supported in v-repeat.'
	          )
	        }
	      } else {
	        _.define(data, this.id, vm)
	      }
	    } else {
	      if (!cache[data]) {
	        cache[data] = [vm]
	      } else {
	        cache[data].push(vm)
	      }
	    }
	    vm._raw = data
	  },

	  /**
	   * Try to get a cached instance from a piece of data.
	   *
	   * @param {Object} data
	   * @return {Vue|undefined}
	   */

	  getVm: function (data) {
	    if (this.idKey) {
	      return this.cache[data[this.idKey]]
	    } else if (isObject(data)) {
	      return data[this.id]
	    } else {
	      var cached = this.cache[data]
	      if (cached) {
	        var i = 0
	        var vm = cached[i]
	        // since duplicated vm instances might be a reused
	        // one OR a newly created one, we need to return the
	        // first instance that is neither of these.
	        while (vm && (vm._reused || vm._new)) {
	          vm = cached[++i]
	        }
	        return vm
	      }
	    }
	  },

	  /**
	   * Delete a cached vm instance.
	   *
	   * @param {Vue} vm
	   */

	  uncacheVm: function (vm) {
	    var data = vm._raw
	    if (this.idKey) {
	      this.cache[data[this.idKey]] = null
	    } else if (isObject(data)) {
	      data[this.id] = null
	      vm._raw = null
	    } else {
	      this.cache[data].pop()
	    }
	  }

	}

	/**
	 * Helper to find the next element that is an instance
	 * root node. This is necessary because a destroyed vm's
	 * element could still be lingering in the DOM before its
	 * leaving transition finishes, but its __vue__ reference
	 * should have been removed so we can skip them.
	 *
	 * @param {Vue} vm
	 * @param {CommentNode} ref
	 * @return {Vue}
	 */

	function findNextVm (vm, ref) {
	  var el = (vm._blockEnd || vm.$el).nextSibling
	  while (!el.__vue__ && el !== ref) {
	    el = el.nextSibling
	  }
	  return el.__vue__
	}

	/**
	 * Attempt to convert non-Array objects to array.
	 * This is the default filter installed to every v-repeat
	 * directive.
	 *
	 * It will be called with **the directive** as `this`
	 * context so that we can mark the repeat array as converted
	 * from an object.
	 *
	 * @param {*} obj
	 * @return {Array}
	 * @private
	 */

	function objToArray (obj) {
	  if (!_.isPlainObject(obj)) {
	    return obj
	  }
	  var keys = Object.keys(obj)
	  var i = keys.length
	  var res = new Array(i)
	  var key
	  while (i--) {
	    key = keys[i]
	    res[i] = {
	      key: key,
	      value: obj[key]
	    }
	  }
	  // `this` points to the repeat directive instance
	  this.converted = true
	  return res
	}

	/**
	 * Create a range array from given number.
	 *
	 * @param {Number} n
	 * @return {Array}
	 */

	function range (n) {
	  var i = -1
	  var ret = new Array(n)
	  while (++i < n) {
	    ret[i] = i
	  }
	  return ret
	}

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var compile = __webpack_require__(60)
	var templateParser = __webpack_require__(89)
	var transition = __webpack_require__(59)

	module.exports = {

	  bind: function () {
	    var el = this.el
	    if (!el.__vue__) {
	      this.start = document.createComment('v-if-start')
	      this.end = document.createComment('v-if-end')
	      _.replace(el, this.end)
	      _.before(this.start, this.end)
	      if (el.tagName === 'TEMPLATE') {
	        this.template = templateParser.parse(el, true)
	      } else {
	        this.template = document.createDocumentFragment()
	        this.template.appendChild(el)
	      }
	      // compile the nested partial
	      this.linker = compile(
	        this.template,
	        this.vm.$options,
	        true
	      )
	    } else {
	      this.invalid = true
	      _.warn(
	        'v-if="' + this.expression + '" cannot be ' +
	        'used on an already mounted instance.'
	      )
	    }
	  },

	  update: function (value) {
	    if (this.invalid) return
	    if (value) {
	      this.insert()
	    } else {
	      this.teardown()
	    }
	  },

	  insert: function () {
	    // avoid duplicate inserts, since update() can be
	    // called with different truthy values
	    if (this.decompile) {
	      return
	    }
	    var vm = this.vm
	    var frag = templateParser.clone(this.template)
	    var decompile = this.linker(vm, frag)
	    this.decompile = function () {
	      decompile()
	      transition.blockRemove(this.start, this.end, vm)
	    }
	    transition.blockAppend(frag, this.end, vm)
	  },

	  teardown: function () {
	    if (this.decompile) {
	      this.decompile()
	      this.decompile = null
	    }
	  }

	}

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var Watcher = __webpack_require__(46)

	module.exports = {

	  priority: 900,

	  bind: function () {
	    var vm = this.vm
	    if (this.el !== vm.$el) {
	      _.warn(
	        'v-with can only be used on instance root elements.'
	      )
	    } else if (!vm.$parent) {
	      _.warn(
	        'v-with must be used on an instance with a parent.'
	      )
	    } else {
	      var key = this.arg
	      this.watcher = new Watcher(
	        vm.$parent,
	        this.expression,
	        key
	          ? function (val) {
	              vm.$set(key, val)
	            }
	          : function (val) {
	              vm.$data = val
	            }
	      )
	      // initial set
	      var initialVal = this.watcher.value
	      if (key) {
	        vm.$set(key, initialVal)
	      } else {
	        vm.$data = initialVal
	      }
	    }
	  },

	  unbind: function () {
	    if (this.watcher) {
	      this.watcher.teardown()
	    }
	  }

	}

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)

	var handlers = {
	  _default: __webpack_require__(90),
	  radio: __webpack_require__(91),
	  select: __webpack_require__(92),
	  checkbox: __webpack_require__(93)
	}

	module.exports = {

	  priority: 800,
	  twoWay: true,
	  handlers: handlers,

	  /**
	   * Possible elements:
	   *   <select>
	   *   <textarea>
	   *   <input type="*">
	   *     - text
	   *     - checkbox
	   *     - radio
	   *     - number
	   *     - TODO: more types may be supplied as a plugin
	   */

	  bind: function () {
	    // friendly warning...
	    var filters = this.filters
	    if (filters && filters.read && !filters.write) {
	      _.warn(
	        'It seems you are using a read-only filter with ' +
	        'v-model. You might want to use a two-way filter ' +
	        'to ensure correct behavior.'
	      )
	    }
	    var el = this.el
	    var tag = el.tagName
	    var handler
	    if (tag === 'INPUT') {
	      handler = handlers[el.type] || handlers._default
	    } else if (tag === 'SELECT') {
	      handler = handlers.select
	    } else if (tag === 'TEXTAREA') {
	      handler = handlers._default
	    } else {
	      _.warn("v-model doesn't support element type: " + tag)
	      return
	    }
	    handler.bind.call(this)
	    this.update = handler.update
	    this.unbind = handler.unbind
	  }

	}

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var config = __webpack_require__(45)
	var Binding = __webpack_require__(48)
	var arrayMethods = __webpack_require__(94)
	var arrayKeys = Object.getOwnPropertyNames(arrayMethods)
	__webpack_require__(95)

	var uid = 0

	/**
	 * Type enums
	 */

	var ARRAY  = 0
	var OBJECT = 1

	/**
	 * Augment an target Object or Array by intercepting
	 * the prototype chain using __proto__
	 *
	 * @param {Object|Array} target
	 * @param {Object} proto
	 */

	function protoAugment (target, src) {
	  target.__proto__ = src
	}

	/**
	 * Augment an target Object or Array by defining
	 * hidden properties.
	 *
	 * @param {Object|Array} target
	 * @param {Object} proto
	 */

	function copyAugment (target, src, keys) {
	  var i = keys.length
	  var key
	  while (i--) {
	    key = keys[i]
	    _.define(target, key, src[key])
	  }
	}

	/**
	 * Observer class that are attached to each observed
	 * object. Once attached, the observer converts target
	 * object's property keys into getter/setters that
	 * collect dependencies and dispatches updates.
	 *
	 * @param {Array|Object} value
	 * @param {Number} type
	 * @constructor
	 */

	function Observer (value, type) {
	  this.id = ++uid
	  this.value = value
	  this.active = true
	  this.bindings = []
	  _.define(value, '__ob__', this)
	  if (type === ARRAY) {
	    var augment = config.proto && _.hasProto
	      ? protoAugment
	      : copyAugment
	    augment(value, arrayMethods, arrayKeys)
	    this.observeArray(value)
	  } else if (type === OBJECT) {
	    this.walk(value)
	  }
	}

	Observer.target = null

	var p = Observer.prototype

	/**
	 * Attempt to create an observer instance for a value,
	 * returns the new observer if successfully observed,
	 * or the existing observer if the value already has one.
	 *
	 * @param {*} value
	 * @return {Observer|undefined}
	 * @static
	 */

	Observer.create = function (value) {
	  if (
	    value &&
	    value.hasOwnProperty('__ob__') &&
	    value.__ob__ instanceof Observer
	  ) {
	    return value.__ob__
	  } else if (_.isArray(value)) {
	    return new Observer(value, ARRAY)
	  } else if (
	    _.isPlainObject(value) &&
	    !value._isVue // avoid Vue instance
	  ) {
	    return new Observer(value, OBJECT)
	  }
	}

	/**
	 * Walk through each property and convert them into
	 * getter/setters. This method should only be called when
	 * value type is Object. Properties prefixed with `$` or `_`
	 * and accessor properties are ignored.
	 *
	 * @param {Object} obj
	 */

	p.walk = function (obj) {
	  var keys = Object.keys(obj)
	  var i = keys.length
	  var key, prefix
	  while (i--) {
	    key = keys[i]
	    prefix = key.charCodeAt(0)
	    if (prefix !== 0x24 && prefix !== 0x5F) { // skip $ or _
	      this.convert(key, obj[key])
	    }
	  }
	}

	/**
	 * Try to carete an observer for a child value,
	 * and if value is array, link binding to the array.
	 *
	 * @param {*} val
	 * @return {Binding|undefined}
	 */

	p.observe = function (val) {
	  return Observer.create(val)
	}

	/**
	 * Observe a list of Array items.
	 *
	 * @param {Array} items
	 */

	p.observeArray = function (items) {
	  var i = items.length
	  while (i--) {
	    this.observe(items[i])
	  }
	}

	/**
	 * Convert a property into getter/setter so we can emit
	 * the events when the property is accessed/changed.
	 *
	 * @param {String} key
	 * @param {*} val
	 */

	p.convert = function (key, val) {
	  var ob = this
	  var childOb = ob.observe(val)
	  var binding = new Binding()
	  if (childOb) {
	    childOb.bindings.push(binding)
	  }
	  Object.defineProperty(ob.value, key, {
	    enumerable: true,
	    configurable: true,
	    get: function () {
	      // Observer.target is a watcher whose getter is
	      // currently being evaluated.
	      if (ob.active && Observer.target) {
	        Observer.target.addDep(binding)
	      }
	      return val
	    },
	    set: function (newVal) {
	      if (newVal === val) return
	      // remove binding from old value
	      var oldChildOb = val && val.__ob__
	      if (oldChildOb) {
	        var oldBindings = oldChildOb.bindings
	        oldBindings.splice(oldBindings.indexOf(binding), 1)
	      }
	      val = newVal
	      // add binding to new value
	      var newChildOb = ob.observe(newVal)
	      if (newChildOb) {
	        newChildOb.bindings.push(binding)
	      }
	      binding.notify()
	    }
	  })
	}

	/**
	 * Notify change on all self bindings on an observer.
	 * This is called when a mutable value mutates. e.g.
	 * when an Array's mutating methods are called, or an
	 * Object's $add/$delete are called.
	 */

	p.notify = function () {
	  var bindings = this.bindings
	  for (var i = 0, l = bindings.length; i < l; i++) {
	    bindings[i].notify()
	  }
	}

	/**
	 * Add an owner vm, so that when $add/$delete mutations
	 * happen we can notify owner vms to proxy the keys and
	 * digest the watchers. This is only called when the object
	 * is observed as an instance's root $data.
	 *
	 * @param {Vue} vm
	 */

	p.addVm = function (vm) {
	  (this.vms = this.vms || []).push(vm)
	}

	/**
	 * Remove an owner vm. This is called when the object is
	 * swapped out as an instance's $data object.
	 *
	 * @param {Vue} vm
	 */

	p.removeVm = function (vm) {
	  this.vms.splice(this.vms.indexOf(vm), 1)
	}

	module.exports = Observer


/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Wraps a Reactor.react invocation in a console.group
	*/
	exports.dispatchStart = function(type, payload) {
	  console.groupCollapsed('Dispatch: %s', type)
	  console.group('payload')
	  console.log(payload)
	  console.groupEnd()
	}

	exports.coreReact = function(id, before, after) {
	  if (before !== after) {
	    console.log('Core changed: ' + id)
	  }
	}

	exports.dispatchEnd = function(state) {
	  console.log('Dispatch done, new state: ', state.toJS())

	  console.groupEnd()
	}


/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	var Getter = __webpack_require__(37)
	var evaluate = __webpack_require__(39)
	var hasChanged = __webpack_require__(84)
	var coerceArray = __webpack_require__(83).coerceArray
	var KeyPath = __webpack_require__(38)
	var clone = __webpack_require__(83).clone

	/**
	 * ChangeObserver is an object that contains a set of subscriptions
	 * to changes for keyPaths on a reactor
	 *
	 * Packaging the handlers together allows for easier cleanup
	 */

	  /**
	   * @param {Immutable.Map} initialState
	   * @param {EventEmitter} changeEmitter
	   */
	  function ChangeObserver(initialState, changeEmitter) {"use strict";
	    this.__changeHandlers = []
	    this.__prevState = initialState

	    // add the change listener and store the unlisten function
	    this.__unlistenFn = changeEmitter.addChangeListener(function(currState)  {
	      this.__changeHandlers.forEach(function(entry)  {
	        var prev = (entry.prefix) ? evaluate(this.__prevState, entry.prefix) : this.__prevState
	        var curr = (entry.prefix) ? evaluate(currState, entry.prefix) : currState

	        if (hasChanged(prev, curr, entry.getter.flatDeps)) {
	          var newValue = evaluate(curr, entry.getter)
	          entry.handler.call(null, newValue)
	        }
	      }.bind(this))
	      this.__prevState = currState
	    }.bind(this))
	  }

	  /**
	   * Specify an array of keyPaths as dependencies and
	   * a changeHandler fn
	   *
	   * options.getter
	   * options.handler
	   * options.prefix
	   * @param {object} options
	   * @return {function} unwatch function
	   */
	  ChangeObserver.prototype.onChange=function(options) {"use strict";
	    var entry = clone(options)
	    this.__changeHandlers.push(entry)
	    // return unwatch function
	    return function()  {
	      var ind  = this.__changeHandlers.indexOf(entry)
	      if (ind > -1) {
	        this.__changeHandlers.splice(ind, 1)
	      }
	    }.bind(this)
	  };

	  /**
	   * Clean up
	   */
	  ChangeObserver.prototype.destroy=function() {"use strict";
	    this.__unlistenFn()
	  };


	module.exports = ChangeObserver


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	var EventEmitter = __webpack_require__(98).EventEmitter

	var CHANGE_EVENT = 'change'

	for(var EventEmitter____Key in EventEmitter){if(EventEmitter.hasOwnProperty(EventEmitter____Key)){ChangeEmitter[EventEmitter____Key]=EventEmitter[EventEmitter____Key];}}var ____SuperProtoOfEventEmitter=EventEmitter===null?null:EventEmitter.prototype;ChangeEmitter.prototype=Object.create(____SuperProtoOfEventEmitter);ChangeEmitter.prototype.constructor=ChangeEmitter;ChangeEmitter.__superConstructor__=EventEmitter;
	  function ChangeEmitter() {"use strict";
	    EventEmitter.call(this)
	  }

	  ChangeEmitter.prototype.emitChange=function(state, messageType, payload) {"use strict";
	    this.emit(CHANGE_EVENT, state, messageType, payload)
	  };

	  /**
	   * Adds a change listener to the emitter listener registry
	   * Returns the unlisten function
	   */
	  ChangeEmitter.prototype.addChangeListener=function(fn) {"use strict";
	    var emitter = this
	    emitter.on(CHANGE_EVENT, fn)
	    return function unwatch() {
	      emitter.removeChangeListener(fn)
	    }
	  };

	  /**
	   * Removes a change listener by fn
	   */
	  ChangeEmitter.prototype.removeChangeListener=function(fn) {"use strict";
	    this.removeListener(CHANGE_EVENT, fn)
	  };


	module.exports = ChangeEmitter


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(96);

	exports.clone = _.clone

	exports.extend = _.extend

	exports.each = _.each

	exports.partial = _.partial

	exports.isArray = _.isArray

	exports.isFunction = _.isFunction

	exports.isString = _.isString

	exports.isNumber = _.isNumber

	/**
	 * Ensures that the inputted value is an array
	 * @param {*} val
	 * @return {array}
	 */
	exports.coerceArray = function(val) {
	  if (!exports.isArray(val)) {
	    return [val]
	  }
	  return val
	}


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	var Iterable = __webpack_require__(40).Iterable

	/**
	 * Takes a prevState and currState and returns true if any
	 * of the values at those paths changed
	 * @param {Immutable.Map} prevState
	 * @param {Immutable.Map} currState
	 * @param {Array<Array<String>>} keyPaths
	 *
	 * @return {boolean}
	 */
	module.exports = function(prevState, currState, keyPaths) {
	  if (!Iterable.isIterable(prevState) || !Iterable.isIterable(currState)) {
	    // prev or current state is some primitive
	    return prevState !== currState
	  }

	  return keyPaths.some(function(keyPath) {
	    return prevState.getIn(keyPath) !== currState.getIn(keyPath)
	  })
	}


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)

	/**
	 * The Batcher maintains a job queue to be run
	 * async on the next event loop.
	 */

	function Batcher () {
	  this.reset()
	}

	var p = Batcher.prototype

	/**
	 * Push a job into the job queue.
	 * Jobs with duplicate IDs will be skipped unless it's
	 * pushed when the queue is being flushed.
	 *
	 * @param {Object} job
	 *   properties:
	 *   - {String|Number} id
	 *   - {Function}      run
	 */

	p.push = function (job) {
	  if (!job.id || !this.has[job.id] || this.flushing) {
	    this.queue.push(job)
	    this.has[job.id] = job
	    if (!this.waiting) {
	      this.waiting = true
	      _.nextTick(this.flush, this)
	    }
	  }
	}

	/**
	 * Flush the queue and run the jobs.
	 * Will call a preFlush hook if has one.
	 */

	p.flush = function () {
	  this.flushing = true
	  // do not cache length because more jobs might be pushed
	  // as we run existing jobs
	  for (var i = 0; i < this.queue.length; i++) {
	    var job = this.queue[i]
	    if (!job.cancelled) {
	      job.run()
	    }
	  }
	  this.reset()
	}

	/**
	 * Reset the batcher's state.
	 */

	p.reset = function () {
	  this.has = {}
	  this.queue = []
	  this.waiting = false
	  this.flushing = false
	}

	module.exports = Batcher

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * A doubly linked list-based Least Recently Used (LRU)
	 * cache. Will keep most recently used items while
	 * discarding least recently used items when its limit is
	 * reached. This is a bare-bone version of
	 * Rasmus Andersson's js-lru:
	 *
	 *   https://github.com/rsms/js-lru
	 *
	 * @param {Number} limit
	 * @constructor
	 */

	function Cache (limit) {
	  this.size = 0
	  this.limit = limit
	  this.head = this.tail = undefined
	  this._keymap = {}
	}

	var p = Cache.prototype

	/**
	 * Put <value> into the cache associated with <key>.
	 * Returns the entry which was removed to make room for
	 * the new entry. Otherwise undefined is returned.
	 * (i.e. if there was enough room already).
	 *
	 * @param {String} key
	 * @param {*} value
	 * @return {Entry|undefined}
	 */

	p.put = function (key, value) {
	  var entry = {
	    key:key,
	    value:value
	  }
	  this._keymap[key] = entry
	  if (this.tail) {
	    this.tail.newer = entry
	    entry.older = this.tail
	  } else {
	    this.head = entry
	  }
	  this.tail = entry
	  if (this.size === this.limit) {
	    return this.shift()
	  } else {
	    this.size++
	  }
	}

	/**
	 * Purge the least recently used (oldest) entry from the
	 * cache. Returns the removed entry or undefined if the
	 * cache was empty.
	 */

	p.shift = function () {
	  var entry = this.head
	  if (entry) {
	    this.head = this.head.newer
	    this.head.older = undefined
	    entry.newer = entry.older = undefined
	    this._keymap[entry.key] = undefined
	  }
	  return entry
	}

	/**
	 * Get and register recent use of <key>. Returns the value
	 * associated with <key> or undefined if not in cache.
	 *
	 * @param {String} key
	 * @param {Boolean} returnEntry
	 * @return {Entry|*}
	 */

	p.get = function (key, returnEntry) {
	  var entry = this._keymap[key]
	  if (entry === undefined) return
	  if (entry === this.tail) {
	    return returnEntry
	      ? entry
	      : entry.value
	  }
	  // HEAD--------------TAIL
	  //   <.older   .newer>
	  //  <--- add direction --
	  //   A  B  C  <D>  E
	  if (entry.newer) {
	    if (entry === this.head) {
	      this.head = entry.newer
	    }
	    entry.newer.older = entry.older // C <-- E.
	  }
	  if (entry.older) {
	    entry.older.newer = entry.newer // C. --> E
	  }
	  entry.newer = undefined // D --x
	  entry.older = this.tail // D. --> E
	  if (this.tail) {
	    this.tail.newer = entry // E. <-- D
	  }
	  this.tail = entry
	  return returnEntry
	    ? entry
	    : entry.value
	}

	module.exports = Cache

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var addClass = _.addClass
	var removeClass = _.removeClass
	var transDurationProp = _.transitionProp + 'Duration'
	var animDurationProp = _.animationProp + 'Duration'

	var queue = []
	var queued = false

	/**
	 * Push a job into the transition queue, which is to be
	 * executed on next frame.
	 *
	 * @param {Element} el    - target element
	 * @param {Number} dir    - 1: enter, -1: leave
	 * @param {Function} op   - the actual dom operation
	 * @param {String} cls    - the className to remove when the
	 *                          transition is done.
	 * @param {Function} [cb] - user supplied callback.
	 */

	function push (el, dir, op, cls, cb) {
	  queue.push({
	    el  : el,
	    dir : dir,
	    cb  : cb,
	    cls : cls,
	    op  : op
	  })
	  if (!queued) {
	    queued = true
	    _.nextTick(flush)
	  }
	}

	/**
	 * Flush the queue, and do one forced reflow before
	 * triggering transitions.
	 */

	function flush () {
	  /* jshint unused: false */
	  var f = document.documentElement.offsetHeight
	  queue.forEach(run)
	  queue = []
	  queued = false
	}

	/**
	 * Run a transition job.
	 *
	 * @param {Object} job
	 */

	function run (job) {

	  var el = job.el
	  var data = el.__v_trans
	  var cls = job.cls
	  var cb = job.cb
	  var op = job.op
	  var transitionType = getTransitionType(el, data, cls)

	  if (job.dir > 0) { // ENTER
	    if (transitionType === 1) {
	      // trigger transition by removing enter class
	      removeClass(el, cls)
	      // only need to listen for transitionend if there's
	      // a user callback
	      if (cb) setupTransitionCb(_.transitionEndEvent)
	    } else if (transitionType === 2) {
	      // animations are triggered when class is added
	      // so we just listen for animationend to remove it.
	      setupTransitionCb(_.animationEndEvent, function () {
	        removeClass(el, cls)
	      })
	    } else {
	      // no transition applicable
	      removeClass(el, cls)
	      if (cb) cb()
	    }
	  } else { // LEAVE
	    if (transitionType) {
	      // leave transitions/animations are both triggered
	      // by adding the class, just remove it on end event.
	      var event = transitionType === 1
	        ? _.transitionEndEvent
	        : _.animationEndEvent
	      setupTransitionCb(event, function () {
	        op()
	        removeClass(el, cls)
	      })
	    } else {
	      op()
	      removeClass(el, cls)
	      if (cb) cb()
	    }
	  }

	  /**
	   * Set up a transition end callback, store the callback
	   * on the element's __v_trans data object, so we can
	   * clean it up if another transition is triggered before
	   * the callback is fired.
	   *
	   * @param {String} event
	   * @param {Function} [cleanupFn]
	   */

	  function setupTransitionCb (event, cleanupFn) {
	    data.event = event
	    var onEnd = data.callback = function transitionCb (e) {
	      if (e.target === el) {
	        _.off(el, event, onEnd)
	        data.event = data.callback = null
	        if (cleanupFn) cleanupFn()
	        if (cb) cb()
	      }
	    }
	    _.on(el, event, onEnd)
	  }
	}

	/**
	 * Get an element's transition type based on the
	 * calculated styles
	 *
	 * @param {Element} el
	 * @param {Object} data
	 * @param {String} className
	 * @return {Number}
	 *         1 - transition
	 *         2 - animation
	 */

	function getTransitionType (el, data, className) {
	  var type = data.cache && data.cache[className]
	  if (type) return type
	  var inlineStyles = el.style
	  var computedStyles = window.getComputedStyle(el)
	  var transDuration =
	    inlineStyles[transDurationProp] ||
	    computedStyles[transDurationProp]
	  if (transDuration && transDuration !== '0s') {
	    type = 1
	  } else {
	    var animDuration =
	      inlineStyles[animDurationProp] ||
	      computedStyles[animDurationProp]
	    if (animDuration && animDuration !== '0s') {
	      type = 2
	    }
	  }
	  if (type) {
	    if (!data.cache) data.cache = {}
	    data.cache[className] = type
	  }
	  return type
	}

	/**
	 * Apply CSS transition to an element.
	 *
	 * @param {Element} el
	 * @param {Number} direction - 1: enter, -1: leave
	 * @param {Function} op - the actual DOM operation
	 * @param {Object} data - target element's transition data
	 */

	module.exports = function (el, direction, op, data, cb) {
	  var prefix = data.id || 'v'
	  var enterClass = prefix + '-enter'
	  var leaveClass = prefix + '-leave'
	  // clean up potential previous unfinished transition
	  if (data.callback) {
	    _.off(el, data.event, data.callback)
	    removeClass(el, enterClass)
	    removeClass(el, leaveClass)
	    data.event = data.callback = null
	  }
	  if (direction > 0) { // enter
	    addClass(el, enterClass)
	    op()
	    push(el, direction, null, enterClass, cb)
	  } else { // leave
	    addClass(el, leaveClass)
	    push(el, direction, op, leaveClass, cb)
	  }
	}

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Apply JavaScript enter/leave functions.
	 *
	 * @param {Element} el
	 * @param {Number} direction - 1: enter, -1: leave
	 * @param {Function} op - the actual DOM operation
	 * @param {Object} data - target element's transition data
	 * @param {Object} def - transition definition object
	 * @param {Vue} vm - the owner vm of the element
	 * @param {Function} [cb]
	 */

	module.exports = function (el, direction, op, data, def, vm, cb) {
	  if (data.cancel) {
	    data.cancel()
	    data.cancel = null
	  }
	  if (direction > 0) { // enter
	    if (def.beforeEnter) {
	      def.beforeEnter.call(vm, el)
	    }
	    op()
	    if (def.enter) {
	      data.cancel = def.enter.call(vm, el, function () {
	        data.cancel = null
	        if (cb) cb()
	      })
	    } else if (cb) {
	      cb()
	    }
	  } else { // leave
	    if (def.leave) {
	      data.cancel = def.leave.call(vm, el, function () {
	        data.cancel = null
	        op()
	        if (cb) cb()
	      })
	    } else {
	      op()
	      if (cb) cb()
	    }
	  }
	}

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var Cache = __webpack_require__(86)
	var templateCache = new Cache(100)

	/**
	 * Test for the presence of the Safari template cloning bug
	 * https://bugs.webkit.org/show_bug.cgi?id=137755
	 */

	var hasBrokenTemplate = _.inBrowser
	  ? (function () {
	      var a = document.createElement('div')
	      a.innerHTML = '<template>1</template>'
	      return !a.cloneNode(true).firstChild.innerHTML
	    })()
	  : false

	var map = {
	  _default : [0, '', ''],
	  legend   : [1, '<fieldset>', '</fieldset>'],
	  tr       : [2, '<table><tbody>', '</tbody></table>'],
	  col      : [
	    2,
	    '<table><tbody></tbody><colgroup>',
	    '</colgroup></table>'
	  ]
	}

	map.td =
	map.th = [
	  3,
	  '<table><tbody><tr>',
	  '</tr></tbody></table>'
	]

	map.option =
	map.optgroup = [
	  1,
	  '<select multiple="multiple">',
	  '</select>'
	]

	map.thead =
	map.tbody =
	map.colgroup =
	map.caption =
	map.tfoot = [1, '<table>', '</table>']

	map.g =
	map.defs =
	map.symbol =
	map.use =
	map.image =
	map.text =
	map.circle =
	map.ellipse =
	map.line =
	map.path =
	map.polygon =
	map.polyline =
	map.rect = [
	  1,
	  '<svg ' +
	    'xmlns="http://www.w3.org/2000/svg" ' +
	    'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
	    'xmlns:ev="http://www.w3.org/2001/xml-events"' +
	    'version="1.1">',
	  '</svg>'
	]

	var TAG_RE = /<([\w:]+)/

	/**
	 * Convert a string template to a DocumentFragment.
	 * Determines correct wrapping by tag types. Wrapping
	 * strategy found in jQuery & component/domify.
	 *
	 * @param {String} templateString
	 * @return {DocumentFragment}
	 */

	function stringToFragment (templateString) {
	  // try a cache hit first
	  var hit = templateCache.get(templateString)
	  if (hit) {
	    return hit
	  }

	  var frag = document.createDocumentFragment()
	  var tagMatch = TAG_RE.exec(templateString)

	  if (!tagMatch) {
	    // text only, return a single text node.
	    frag.appendChild(
	      document.createTextNode(templateString)
	    )
	  } else {

	    var tag    = tagMatch[1]
	    var wrap   = map[tag] || map._default
	    var depth  = wrap[0]
	    var prefix = wrap[1]
	    var suffix = wrap[2]
	    var node   = document.createElement('div')

	    node.innerHTML = prefix + templateString.trim() + suffix
	    while (depth--) {
	      node = node.lastChild
	    }

	    var child
	    /* jshint boss:true */
	    while (child = node.firstChild) {
	      frag.appendChild(child)
	    }
	  }

	  templateCache.put(templateString, frag)
	  return frag
	}

	/**
	 * Convert a template node to a DocumentFragment.
	 *
	 * @param {Node} node
	 * @return {DocumentFragment}
	 */

	function nodeToFragment (node) {
	  var tag = node.tagName
	  // if its a template tag and the browser supports it,
	  // its content is already a document fragment.
	  if (
	    tag === 'TEMPLATE' &&
	    node.content instanceof DocumentFragment
	  ) {
	    return node.content
	  }
	  return tag === 'SCRIPT'
	    ? stringToFragment(node.textContent)
	    : stringToFragment(node.innerHTML)
	}

	/**
	 * Deal with Safari cloning nested <template> bug by
	 * manually cloning all template instances.
	 *
	 * @param {Element|DocumentFragment} node
	 * @return {Element|DocumentFragment}
	 */

	exports.clone = function (node) {
	  var res = node.cloneNode(true)
	  /* istanbul ignore if */
	  if (hasBrokenTemplate) {
	    var templates = node.querySelectorAll('template')
	    if (templates.length) {
	      var cloned = res.querySelectorAll('template')
	      var i = cloned.length
	      while (i--) {
	        cloned[i].parentNode.replaceChild(
	          templates[i].cloneNode(true),
	          cloned[i]
	        )
	      }
	    }
	  }
	  return res
	}

	/**
	 * Process the template option and normalizes it into a
	 * a DocumentFragment that can be used as a partial or a
	 * instance template.
	 *
	 * @param {*} template
	 *    Possible values include:
	 *    - DocumentFragment object
	 *    - Node object of type Template
	 *    - id selector: '#some-template-id'
	 *    - template string: '<div><span>{{msg}}</span></div>'
	 * @param {Boolean} clone
	 * @return {DocumentFragment|undefined}
	 */

	exports.parse = function (template, clone) {
	  var node, frag

	  // if the template is already a document fragment,
	  // do nothing
	  if (template instanceof DocumentFragment) {
	    return clone
	      ? template.cloneNode(true)
	      : template
	  }

	  if (typeof template === 'string') {
	    // id selector
	    if (template.charAt(0) === '#') {
	      // id selector can be cached too
	      frag = templateCache.get(template)
	      if (!frag) {
	        node = document.getElementById(template.slice(1))
	        if (node) {
	          frag = nodeToFragment(node)
	          // save selector to cache
	          templateCache.put(template, frag)
	        }
	      }
	    } else {
	      // normal string template
	      frag = stringToFragment(template)
	    }
	  } else if (template.nodeType) {
	    // a direct node
	    frag = nodeToFragment(template)
	  }

	  return frag && clone
	    ? exports.clone(frag)
	    : frag
	}

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)

	module.exports = {

	  bind: function () {
	    var self = this
	    var el = this.el

	    // check params
	    // - lazy: update model on "change" instead of "input"
	    var lazy = el.hasAttribute('lazy')
	    if (lazy) {
	      el.removeAttribute('lazy')
	    }
	    // - number: cast value into number when updating model.
	    var number =
	      el.hasAttribute('number') ||
	      el.type === 'number'
	    if (number) {
	      el.removeAttribute('number')
	    }

	    // handle composition events.
	    // http://blog.evanyou.me/2014/01/03/composition-event/
	    var cpLocked = false
	    this.cpLock = function () {
	      cpLocked = true
	    }
	    this.cpUnlock = function () {
	      cpLocked = false
	      // in IE11 the "compositionend" event fires AFTER
	      // the "input" event, so the input handler is blocked
	      // at the end... have to call it here.
	      set()
	    }
	    _.on(el,'compositionstart', this.cpLock)
	    _.on(el,'compositionend', this.cpUnlock)

	    // shared setter
	    function set () {
	      self.set(
	        number ? _.toNumber(el.value) : el.value,
	        true
	      )
	    }

	    // if the directive has filters, we need to
	    // record cursor position and restore it after updating
	    // the input with the filtered value.
	    this.listener = function textInputListener () {
	      if (cpLocked) return
	      var charsOffset
	      // some HTML5 input types throw error here
	      try {
	        // record how many chars from the end of input
	        // the cursor was at
	        charsOffset = el.value.length - el.selectionStart
	      } catch (e) {}
	      set()
	      // force a value update, because in
	      // certain cases the write filters output the same
	      // result for different input values, and the Observer
	      // set events won't be triggered.
	      _.nextTick(function () {
	        var newVal = self._watcher.value
	        self.update(newVal)
	        if (charsOffset != null) {
	          var cursorPos =
	            _.toString(newVal).length - charsOffset
	          el.setSelectionRange(cursorPos, cursorPos)
	        }
	      })
	    }
	    this.event = lazy ? 'change' : 'input'
	    _.on(el, this.event, this.listener)

	    // IE9 doesn't fire input event on backspace/del/cut
	    if (!lazy && _.isIE9) {
	      this.onCut = function () {
	        _.nextTick(self.listener)
	      }
	      this.onDel = function (e) {
	        if (e.keyCode === 46 || e.keyCode === 8) {
	          self.listener()
	        }
	      }
	      _.on(el, 'cut', this.onCut)
	      _.on(el, 'keyup', this.onDel)
	    }

	    // set initial value if present
	    if (
	      el.hasAttribute('value') ||
	      (el.tagName === 'TEXTAREA' && el.value.trim())
	    ) {
	      this._initValue = number
	        ? _.toNumber(el.value)
	        : el.value
	    }
	  },

	  update: function (value) {
	    this.el.value = _.toString(value)
	  },

	  unbind: function () {
	    var el = this.el
	    _.off(el, this.event, this.listener)
	    _.off(el,'compositionstart', this.cpLock)
	    _.off(el,'compositionend', this.cpUnlock)
	    if (this.onCut) {
	      _.off(el,'cut', this.onCut)
	      _.off(el,'keyup', this.onDel)
	    }
	  }

	}

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)

	module.exports = {

	  bind: function () {
	    var self = this
	    var el = this.el
	    this.listener = function () {
	      self.set(el.value, true)
	    }
	    _.on(el, 'change', this.listener)
	    if (el.checked) {
	      this._initValue = el.value
	    }
	  },

	  update: function (value) {
	    /* jshint eqeqeq: false */
	    this.el.checked = value == this.el.value
	  },

	  unbind: function () {
	    _.off(this.el, 'change', this.listener)
	  }

	}

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var Watcher = __webpack_require__(46)

	module.exports = {

	  bind: function () {
	    var self = this
	    var el = this.el
	    // check options param
	    var optionsParam = el.getAttribute('options')
	    if (optionsParam) {
	      el.removeAttribute('options')
	      initOptions.call(this, optionsParam)
	    }
	    this.multiple = el.hasAttribute('multiple')
	    this.listener = function () {
	      var value = self.multiple
	        ? getMultiValue(el)
	        : el.value
	      self.set(value, true)
	    }
	    _.on(el, 'change', this.listener)
	    checkInitialValue.call(this)
	  },

	  update: function (value) {
	    /* jshint eqeqeq: false */
	    var el = this.el
	    el.selectedIndex = -1
	    var multi = this.multiple && _.isArray(value)
	    var options = el.options
	    var i = options.length
	    var option
	    while (i--) {
	      option = options[i]
	      option.selected = multi
	        ? indexOf(value, option.value) > -1
	        : value == option.value
	    }
	  },

	  unbind: function () {
	    _.off(this.el, 'change', this.listener)
	    if (this.optionWatcher) {
	      this.optionWatcher.teardown()
	    }
	  }

	}

	/**
	 * Initialize the option list from the param.
	 *
	 * @param {String} expression
	 */

	function initOptions (expression) {
	  var self = this
	  function optionUpdateWatcher (value) {
	    if (_.isArray(value)) {
	      self.el.innerHTML = ''
	      buildOptions(self.el, value)
	      if (self._watcher) {
	        self.update(self._watcher.value)
	      }
	    } else {
	      _.warn('Invalid options value for v-model: ' + value)
	    }
	  }
	  this.optionWatcher = new Watcher(
	    this.vm,
	    expression,
	    optionUpdateWatcher
	  )
	  // update with initial value
	  optionUpdateWatcher(this.optionWatcher.value)
	}

	/**
	 * Build up option elements. IE9 doesn't create options
	 * when setting innerHTML on <select> elements, so we have
	 * to use DOM API here.
	 *
	 * @param {Element} parent - a <select> or an <optgroup>
	 * @param {Array} options
	 */

	function buildOptions (parent, options) {
	  var op, el
	  for (var i = 0, l = options.length; i < l; i++) {
	    op = options[i]
	    if (!op.options) {
	      el = document.createElement('option')
	      if (typeof op === 'string') {
	        el.text = el.value = op
	      } else {
	        el.text = op.text
	        el.value = op.value
	      }
	    } else {
	      el = document.createElement('optgroup')
	      el.label = op.label
	      buildOptions(el, op.options)
	    }
	    parent.appendChild(el)
	  }
	}

	/**
	 * Check the initial value for selected options.
	 */

	function checkInitialValue () {
	  var initValue
	  var options = this.el.options
	  for (var i = 0, l = options.length; i < l; i++) {
	    if (options[i].hasAttribute('selected')) {
	      if (this.multiple) {
	        (initValue || (initValue = []))
	          .push(options[i].value)
	      } else {
	        initValue = options[i].value
	      }
	    }
	  }
	  if (initValue) {
	    this._initValue = initValue
	  }
	}

	/**
	 * Helper to extract a value array for select[multiple]
	 *
	 * @param {SelectElement} el
	 * @return {Array}
	 */

	function getMultiValue (el) {
	  return Array.prototype.filter
	    .call(el.options, filterSelected)
	    .map(getOptionValue)
	}

	function filterSelected (op) {
	  return op.selected
	}

	function getOptionValue (op) {
	  return op.value || op.text
	}

	/**
	 * Native Array.indexOf uses strict equal, but in this
	 * case we need to match string/numbers with soft equal.
	 *
	 * @param {Array} arr
	 * @param {*} val
	 */

	function indexOf (arr, val) {
	  /* jshint eqeqeq: false */
	  var i = arr.length
	  while (i--) {
	    if (arr[i] == val) return i
	  }
	  return -1
	}

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)

	module.exports = {

	  bind: function () {
	    var self = this
	    var el = this.el
	    this.listener = function () {
	      self.set(el.checked, true)
	    }
	    _.on(el, 'change', this.listener)
	    if (el.checked) {
	      this._initValue = el.checked
	    }
	  },

	  update: function (value) {
	    this.el.checked = !!value
	  },

	  unbind: function () {
	    _.off(this.el, 'change', this.listener)
	  }

	}

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var arrayProto = Array.prototype
	var arrayMethods = Object.create(arrayProto)

	/**
	 * Intercept mutating methods and emit events
	 */

	;[
	  'push',
	  'pop',
	  'shift',
	  'unshift',
	  'splice',
	  'sort',
	  'reverse'
	]
	.forEach(function (method) {
	  // cache original method
	  var original = arrayProto[method]
	  _.define(arrayMethods, method, function mutator () {
	    // avoid leaking arguments:
	    // http://jsperf.com/closure-with-arguments
	    var i = arguments.length
	    var args = new Array(i)
	    while (i--) {
	      args[i] = arguments[i]
	    }
	    var result = original.apply(this, args)
	    var ob = this.__ob__
	    var inserted
	    switch (method) {
	      case 'push':
	        inserted = args
	        break
	      case 'unshift':
	        inserted = args
	        break
	      case 'splice':
	        inserted = args.slice(2)
	        break
	    }
	    if (inserted) ob.observeArray(inserted)
	    // notify change
	    ob.notify()
	    return result
	  })
	})

	/**
	 * Swap the element at the given index with a new value
	 * and emits corresponding event.
	 *
	 * @param {Number} index
	 * @param {*} val
	 * @return {*} - replaced element
	 */

	_.define(
	  arrayProto,
	  '$set',
	  function $set (index, val) {
	    if (index >= this.length) {
	      this.length = index + 1
	    }
	    return this.splice(index, 1, val)[0]
	  }
	)

	/**
	 * Convenience method to remove the element at given index.
	 *
	 * @param {Number} index
	 * @param {*} val
	 */

	_.define(
	  arrayProto,
	  '$remove',
	  function $remove (index) {
	    if (typeof index !== 'number') {
	      index = this.indexOf(index)
	    }
	    if (index > -1) {
	      return this.splice(index, 1)[0]
	    }
	  }
	)

	module.exports = arrayMethods

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19)
	var objProto = Object.prototype

	/**
	 * Add a new property to an observed object
	 * and emits corresponding event
	 *
	 * @param {String} key
	 * @param {*} val
	 * @public
	 */

	_.define(
	  objProto,
	  '$add',
	  function $add (key, val) {
	    var ob = this.__ob__
	    if (!ob) {
	      this[key] = val
	      return
	    }
	    if (_.isReserved(key)) {
	      _.warn('Refused to $add reserved key: ' + key)
	      return
	    }
	    if (this.hasOwnProperty(key)) return
	    ob.convert(key, val)
	    if (ob.vms) {
	      var i = ob.vms.length
	      while (i--) {
	        var vm = ob.vms[i]
	        vm._proxy(key)
	        vm._digest()
	      }
	    } else {
	      ob.notify()
	    }
	  }
	)

	/**
	 * Deletes a property from an observed object
	 * and emits corresponding event
	 *
	 * @param {String} key
	 * @public
	 */

	_.define(
	  objProto,
	  '$delete',
	  function $delete (key) {
	    var ob = this.__ob__
	    if (!ob) {
	      delete this[key]
	      return
	    }
	    if (_.isReserved(key)) {
	      _.warn('Refused to $add reserved key: ' + key)
	      return
	    }
	    if (!this.hasOwnProperty(key)) return
	    delete this[key]
	    if (ob.vms) {
	      var i = ob.vms.length
	      while (i--) {
	        var vm = ob.vms[i]
	        vm._unproxy(key)
	        vm._digest()
	      }
	    } else {
	      ob.notify()
	    }
	  }
	)

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/**
	 * @license
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash -o ./dist/lodash.compat.js`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	;(function() {

	  /** Used as a safe reference for `undefined` in pre ES5 environments */
	  var undefined;

	  /** Used to pool arrays and objects used internally */
	  var arrayPool = [],
	      objectPool = [];

	  /** Used to generate unique IDs */
	  var idCounter = 0;

	  /** Used internally to indicate various things */
	  var indicatorObject = {};

	  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
	  var keyPrefix = +new Date + '';

	  /** Used as the size when optimizations are enabled for large arrays */
	  var largeArraySize = 75;

	  /** Used as the max size of the `arrayPool` and `objectPool` */
	  var maxPoolSize = 40;

	  /** Used to detect and test whitespace */
	  var whitespace = (
	    // whitespace
	    ' \t\x0B\f\xA0\ufeff' +

	    // line terminators
	    '\n\r\u2028\u2029' +

	    // unicode category "Zs" space separators
	    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
	  );

	  /** Used to match empty string literals in compiled template source */
	  var reEmptyStringLeading = /\b__p \+= '';/g,
	      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
	      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

	  /**
	   * Used to match ES6 template delimiters
	   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
	   */
	  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

	  /** Used to match regexp flags from their coerced string values */
	  var reFlags = /\w*$/;

	  /** Used to detected named functions */
	  var reFuncName = /^\s*function[ \n\r\t]+\w/;

	  /** Used to match "interpolate" template delimiters */
	  var reInterpolate = /<%=([\s\S]+?)%>/g;

	  /** Used to match leading whitespace and zeros to be removed */
	  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

	  /** Used to ensure capturing order of template delimiters */
	  var reNoMatch = /($^)/;

	  /** Used to detect functions containing a `this` reference */
	  var reThis = /\bthis\b/;

	  /** Used to match unescaped characters in compiled string literals */
	  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

	  /** Used to assign default `context` object properties */
	  var contextProps = [
	    'Array', 'Boolean', 'Date', 'Error', 'Function', 'Math', 'Number', 'Object',
	    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
	    'parseInt', 'setTimeout'
	  ];

	  /** Used to fix the JScript [[DontEnum]] bug */
	  var shadowedProps = [
	    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
	    'toLocaleString', 'toString', 'valueOf'
	  ];

	  /** Used to make template sourceURLs easier to identify */
	  var templateCounter = 0;

	  /** `Object#toString` result shortcuts */
	  var argsClass = '[object Arguments]',
	      arrayClass = '[object Array]',
	      boolClass = '[object Boolean]',
	      dateClass = '[object Date]',
	      errorClass = '[object Error]',
	      funcClass = '[object Function]',
	      numberClass = '[object Number]',
	      objectClass = '[object Object]',
	      regexpClass = '[object RegExp]',
	      stringClass = '[object String]';

	  /** Used to identify object classifications that `_.clone` supports */
	  var cloneableClasses = {};
	  cloneableClasses[funcClass] = false;
	  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
	  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
	  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
	  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

	  /** Used as an internal `_.debounce` options object */
	  var debounceOptions = {
	    'leading': false,
	    'maxWait': 0,
	    'trailing': false
	  };

	  /** Used as the property descriptor for `__bindData__` */
	  var descriptor = {
	    'configurable': false,
	    'enumerable': false,
	    'value': null,
	    'writable': false
	  };

	  /** Used as the data object for `iteratorTemplate` */
	  var iteratorData = {
	    'args': '',
	    'array': null,
	    'bottom': '',
	    'firstArg': '',
	    'init': '',
	    'keys': null,
	    'loop': '',
	    'shadowedProps': null,
	    'support': null,
	    'top': '',
	    'useHas': false
	  };

	  /** Used to determine if values are of the language type Object */
	  var objectTypes = {
	    'boolean': false,
	    'function': true,
	    'object': true,
	    'number': false,
	    'string': false,
	    'undefined': false
	  };

	  /** Used to escape characters for inclusion in compiled string literals */
	  var stringEscapes = {
	    '\\': '\\',
	    "'": "'",
	    '\n': 'n',
	    '\r': 'r',
	    '\t': 't',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  /** Used as a reference to the global object */
	  var root = (objectTypes[typeof window] && window) || this;

	  /** Detect free variable `exports` */
	  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

	  /** Detect free variable `module` */
	  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

	  /** Detect the popular CommonJS extension `module.exports` */
	  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

	  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
	  var freeGlobal = objectTypes[typeof global] && global;
	  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
	    root = freeGlobal;
	  }

	  /*--------------------------------------------------------------------------*/

	  /**
	   * The base implementation of `_.indexOf` without support for binary searches
	   * or `fromIndex` constraints.
	   *
	   * @private
	   * @param {Array} array The array to search.
	   * @param {*} value The value to search for.
	   * @param {number} [fromIndex=0] The index to search from.
	   * @returns {number} Returns the index of the matched value or `-1`.
	   */
	  function baseIndexOf(array, value, fromIndex) {
	    var index = (fromIndex || 0) - 1,
	        length = array ? array.length : 0;

	    while (++index < length) {
	      if (array[index] === value) {
	        return index;
	      }
	    }
	    return -1;
	  }

	  /**
	   * An implementation of `_.contains` for cache objects that mimics the return
	   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
	   *
	   * @private
	   * @param {Object} cache The cache object to inspect.
	   * @param {*} value The value to search for.
	   * @returns {number} Returns `0` if `value` is found, else `-1`.
	   */
	  function cacheIndexOf(cache, value) {
	    var type = typeof value;
	    cache = cache.cache;

	    if (type == 'boolean' || value == null) {
	      return cache[value] ? 0 : -1;
	    }
	    if (type != 'number' && type != 'string') {
	      type = 'object';
	    }
	    var key = type == 'number' ? value : keyPrefix + value;
	    cache = (cache = cache[type]) && cache[key];

	    return type == 'object'
	      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
	      : (cache ? 0 : -1);
	  }

	  /**
	   * Adds a given value to the corresponding cache object.
	   *
	   * @private
	   * @param {*} value The value to add to the cache.
	   */
	  function cachePush(value) {
	    var cache = this.cache,
	        type = typeof value;

	    if (type == 'boolean' || value == null) {
	      cache[value] = true;
	    } else {
	      if (type != 'number' && type != 'string') {
	        type = 'object';
	      }
	      var key = type == 'number' ? value : keyPrefix + value,
	          typeCache = cache[type] || (cache[type] = {});

	      if (type == 'object') {
	        (typeCache[key] || (typeCache[key] = [])).push(value);
	      } else {
	        typeCache[key] = true;
	      }
	    }
	  }

	  /**
	   * Used by `_.max` and `_.min` as the default callback when a given
	   * collection is a string value.
	   *
	   * @private
	   * @param {string} value The character to inspect.
	   * @returns {number} Returns the code unit of given character.
	   */
	  function charAtCallback(value) {
	    return value.charCodeAt(0);
	  }

	  /**
	   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
	   * them in ascending order.
	   *
	   * @private
	   * @param {Object} a The object to compare to `b`.
	   * @param {Object} b The object to compare to `a`.
	   * @returns {number} Returns the sort order indicator of `1` or `-1`.
	   */
	  function compareAscending(a, b) {
	    var ac = a.criteria,
	        bc = b.criteria,
	        index = -1,
	        length = ac.length;

	    while (++index < length) {
	      var value = ac[index],
	          other = bc[index];

	      if (value !== other) {
	        if (value > other || typeof value == 'undefined') {
	          return 1;
	        }
	        if (value < other || typeof other == 'undefined') {
	          return -1;
	        }
	      }
	    }
	    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
	    // that causes it, under certain circumstances, to return the same value for
	    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
	    //
	    // This also ensures a stable sort in V8 and other engines.
	    // See http://code.google.com/p/v8/issues/detail?id=90
	    return a.index - b.index;
	  }

	  /**
	   * Creates a cache object to optimize linear searches of large arrays.
	   *
	   * @private
	   * @param {Array} [array=[]] The array to search.
	   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
	   */
	  function createCache(array) {
	    var index = -1,
	        length = array.length,
	        first = array[0],
	        mid = array[(length / 2) | 0],
	        last = array[length - 1];

	    if (first && typeof first == 'object' &&
	        mid && typeof mid == 'object' && last && typeof last == 'object') {
	      return false;
	    }
	    var cache = getObject();
	    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

	    var result = getObject();
	    result.array = array;
	    result.cache = cache;
	    result.push = cachePush;

	    while (++index < length) {
	      result.push(array[index]);
	    }
	    return result;
	  }

	  /**
	   * Used by `template` to escape characters for inclusion in compiled
	   * string literals.
	   *
	   * @private
	   * @param {string} match The matched character to escape.
	   * @returns {string} Returns the escaped character.
	   */
	  function escapeStringChar(match) {
	    return '\\' + stringEscapes[match];
	  }

	  /**
	   * Gets an array from the array pool or creates a new one if the pool is empty.
	   *
	   * @private
	   * @returns {Array} The array from the pool.
	   */
	  function getArray() {
	    return arrayPool.pop() || [];
	  }

	  /**
	   * Gets an object from the object pool or creates a new one if the pool is empty.
	   *
	   * @private
	   * @returns {Object} The object from the pool.
	   */
	  function getObject() {
	    return objectPool.pop() || {
	      'array': null,
	      'cache': null,
	      'criteria': null,
	      'false': false,
	      'index': 0,
	      'null': false,
	      'number': null,
	      'object': null,
	      'push': null,
	      'string': null,
	      'true': false,
	      'undefined': false,
	      'value': null
	    };
	  }

	  /**
	   * Checks if `value` is a DOM node in IE < 9.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is a DOM node, else `false`.
	   */
	  function isNode(value) {
	    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
	    // methods that are `typeof` "string" and still can coerce nodes to strings
	    return typeof value.toString != 'function' && typeof (value + '') == 'string';
	  }

	  /**
	   * Releases the given array back to the array pool.
	   *
	   * @private
	   * @param {Array} [array] The array to release.
	   */
	  function releaseArray(array) {
	    array.length = 0;
	    if (arrayPool.length < maxPoolSize) {
	      arrayPool.push(array);
	    }
	  }

	  /**
	   * Releases the given object back to the object pool.
	   *
	   * @private
	   * @param {Object} [object] The object to release.
	   */
	  function releaseObject(object) {
	    var cache = object.cache;
	    if (cache) {
	      releaseObject(cache);
	    }
	    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
	    if (objectPool.length < maxPoolSize) {
	      objectPool.push(object);
	    }
	  }

	  /**
	   * Slices the `collection` from the `start` index up to, but not including,
	   * the `end` index.
	   *
	   * Note: This function is used instead of `Array#slice` to support node lists
	   * in IE < 9 and to ensure dense arrays are returned.
	   *
	   * @private
	   * @param {Array|Object|string} collection The collection to slice.
	   * @param {number} start The start index.
	   * @param {number} end The end index.
	   * @returns {Array} Returns the new array.
	   */
	  function slice(array, start, end) {
	    start || (start = 0);
	    if (typeof end == 'undefined') {
	      end = array ? array.length : 0;
	    }
	    var index = -1,
	        length = end - start || 0,
	        result = Array(length < 0 ? 0 : length);

	    while (++index < length) {
	      result[index] = array[start + index];
	    }
	    return result;
	  }

	  /*--------------------------------------------------------------------------*/

	  /**
	   * Create a new `lodash` function using the given context object.
	   *
	   * @static
	   * @memberOf _
	   * @category Utilities
	   * @param {Object} [context=root] The context object.
	   * @returns {Function} Returns the `lodash` function.
	   */
	  function runInContext(context) {
	    // Avoid issues with some ES3 environments that attempt to use values, named
	    // after built-in constructors like `Object`, for the creation of literals.
	    // ES5 clears this up by stating that literals must use built-in constructors.
	    // See http://es5.github.io/#x11.1.5.
	    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

	    /** Native constructor references */
	    var Array = context.Array,
	        Boolean = context.Boolean,
	        Date = context.Date,
	        Error = context.Error,
	        Function = context.Function,
	        Math = context.Math,
	        Number = context.Number,
	        Object = context.Object,
	        RegExp = context.RegExp,
	        String = context.String,
	        TypeError = context.TypeError;

	    /**
	     * Used for `Array` method references.
	     *
	     * Normally `Array.prototype` would suffice, however, using an array literal
	     * avoids issues in Narwhal.
	     */
	    var arrayRef = [];

	    /** Used for native method references */
	    var errorProto = Error.prototype,
	        objectProto = Object.prototype,
	        stringProto = String.prototype;

	    /** Used to restore the original `_` reference in `noConflict` */
	    var oldDash = context._;

	    /** Used to resolve the internal [[Class]] of values */
	    var toString = objectProto.toString;

	    /** Used to detect if a method is native */
	    var reNative = RegExp('^' +
	      String(toString)
	        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	        .replace(/toString| for [^\]]+/g, '.*?') + '$'
	    );

	    /** Native method shortcuts */
	    var ceil = Math.ceil,
	        clearTimeout = context.clearTimeout,
	        floor = Math.floor,
	        fnToString = Function.prototype.toString,
	        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
	        hasOwnProperty = objectProto.hasOwnProperty,
	        push = arrayRef.push,
	        propertyIsEnumerable = objectProto.propertyIsEnumerable,
	        setTimeout = context.setTimeout,
	        splice = arrayRef.splice,
	        unshift = arrayRef.unshift;

	    /** Used to set meta data on functions */
	    var defineProperty = (function() {
	      // IE 8 only accepts DOM elements
	      try {
	        var o = {},
	            func = isNative(func = Object.defineProperty) && func,
	            result = func(o, o, o) && func;
	      } catch(e) { }
	      return result;
	    }());

	    /* Native method shortcuts for methods with the same name as other `lodash` methods */
	    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
	        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
	        nativeIsFinite = context.isFinite,
	        nativeIsNaN = context.isNaN,
	        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
	        nativeMax = Math.max,
	        nativeMin = Math.min,
	        nativeParseInt = context.parseInt,
	        nativeRandom = Math.random;

	    /** Used to lookup a built-in constructor by [[Class]] */
	    var ctorByClass = {};
	    ctorByClass[arrayClass] = Array;
	    ctorByClass[boolClass] = Boolean;
	    ctorByClass[dateClass] = Date;
	    ctorByClass[funcClass] = Function;
	    ctorByClass[objectClass] = Object;
	    ctorByClass[numberClass] = Number;
	    ctorByClass[regexpClass] = RegExp;
	    ctorByClass[stringClass] = String;

	    /** Used to avoid iterating non-enumerable properties in IE < 9 */
	    var nonEnumProps = {};
	    nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
	    nonEnumProps[boolClass] = nonEnumProps[stringClass] = { 'constructor': true, 'toString': true, 'valueOf': true };
	    nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { 'constructor': true, 'toString': true };
	    nonEnumProps[objectClass] = { 'constructor': true };

	    (function() {
	      var length = shadowedProps.length;
	      while (length--) {
	        var key = shadowedProps[length];
	        for (var className in nonEnumProps) {
	          if (hasOwnProperty.call(nonEnumProps, className) && !hasOwnProperty.call(nonEnumProps[className], key)) {
	            nonEnumProps[className][key] = false;
	          }
	        }
	      }
	    }());

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Creates a `lodash` object which wraps the given value to enable intuitive
	     * method chaining.
	     *
	     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
	     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
	     * and `unshift`
	     *
	     * Chaining is supported in custom builds as long as the `value` method is
	     * implicitly or explicitly included in the build.
	     *
	     * The chainable wrapper functions are:
	     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
	     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
	     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
	     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
	     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
	     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
	     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
	     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
	     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
	     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
	     * and `zip`
	     *
	     * The non-chainable wrapper functions are:
	     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
	     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
	     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
	     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
	     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
	     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
	     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
	     * `template`, `unescape`, `uniqueId`, and `value`
	     *
	     * The wrapper functions `first` and `last` return wrapped values when `n` is
	     * provided, otherwise they return unwrapped values.
	     *
	     * Explicit chaining can be enabled by using the `_.chain` method.
	     *
	     * @name _
	     * @constructor
	     * @category Chaining
	     * @param {*} value The value to wrap in a `lodash` instance.
	     * @returns {Object} Returns a `lodash` instance.
	     * @example
	     *
	     * var wrapped = _([1, 2, 3]);
	     *
	     * // returns an unwrapped value
	     * wrapped.reduce(function(sum, num) {
	     *   return sum + num;
	     * });
	     * // => 6
	     *
	     * // returns a wrapped value
	     * var squares = wrapped.map(function(num) {
	     *   return num * num;
	     * });
	     *
	     * _.isArray(squares);
	     * // => false
	     *
	     * _.isArray(squares.value());
	     * // => true
	     */
	    function lodash(value) {
	      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
	      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
	       ? value
	       : new lodashWrapper(value);
	    }

	    /**
	     * A fast path for creating `lodash` wrapper objects.
	     *
	     * @private
	     * @param {*} value The value to wrap in a `lodash` instance.
	     * @param {boolean} chainAll A flag to enable chaining for all methods
	     * @returns {Object} Returns a `lodash` instance.
	     */
	    function lodashWrapper(value, chainAll) {
	      this.__chain__ = !!chainAll;
	      this.__wrapped__ = value;
	    }
	    // ensure `new lodashWrapper` is an instance of `lodash`
	    lodashWrapper.prototype = lodash.prototype;

	    /**
	     * An object used to flag environments features.
	     *
	     * @static
	     * @memberOf _
	     * @type Object
	     */
	    var support = lodash.support = {};

	    (function() {
	      var ctor = function() { this.x = 1; },
	          object = { '0': 1, 'length': 1 },
	          props = [];

	      ctor.prototype = { 'valueOf': 1, 'y': 1 };
	      for (var key in new ctor) { props.push(key); }
	      for (key in arguments) { }

	      /**
	       * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.argsClass = toString.call(arguments) == argsClass;

	      /**
	       * Detect if `arguments` objects are `Object` objects (all but Narwhal and Opera < 10.5).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.argsObject = arguments.constructor == Object && !(arguments instanceof Array);

	      /**
	       * Detect if `name` or `message` properties of `Error.prototype` are
	       * enumerable by default. (IE < 9, Safari < 5.1)
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');

	      /**
	       * Detect if `prototype` properties are enumerable by default.
	       *
	       * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
	       * (if the prototype or a property on the prototype has been set)
	       * incorrectly sets a function's `prototype` property [[Enumerable]]
	       * value to `true`.
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');

	      /**
	       * Detect if functions can be decompiled by `Function#toString`
	       * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

	      /**
	       * Detect if `Function#name` is supported (all but IE).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.funcNames = typeof Function.name == 'string';

	      /**
	       * Detect if `arguments` object indexes are non-enumerable
	       * (Firefox < 4, IE < 9, PhantomJS, Safari < 5.1).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.nonEnumArgs = key != 0;

	      /**
	       * Detect if properties shadowing those on `Object.prototype` are non-enumerable.
	       *
	       * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
	       * made non-enumerable as well (a.k.a the JScript [[DontEnum]] bug).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.nonEnumShadows = !/valueOf/.test(props);

	      /**
	       * Detect if own properties are iterated after inherited properties (all but IE < 9).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.ownLast = props[0] != 'x';

	      /**
	       * Detect if `Array#shift` and `Array#splice` augment array-like objects correctly.
	       *
	       * Firefox < 10, IE compatibility mode, and IE < 9 have buggy Array `shift()`
	       * and `splice()` functions that fail to remove the last element, `value[0]`,
	       * of array-like objects even though the `length` property is set to `0`.
	       * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`
	       * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.spliceObjects = (arrayRef.splice.call(object, 0, 1), !object[0]);

	      /**
	       * Detect lack of support for accessing string characters by index.
	       *
	       * IE < 8 can't access characters by index and IE 8 can only access
	       * characters by index on string literals.
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.unindexedChars = ('x'[0] + Object('x')[0]) != 'xx';

	      /**
	       * Detect if a DOM node's [[Class]] is resolvable (all but IE < 9)
	       * and that the JS engine errors when attempting to coerce an object to
	       * a string without a `toString` function.
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      try {
	        support.nodeClass = !(toString.call(document) == objectClass && !({ 'toString': 0 } + ''));
	      } catch(e) {
	        support.nodeClass = true;
	      }
	    }(1));

	    /**
	     * By default, the template delimiters used by Lo-Dash are similar to those in
	     * embedded Ruby (ERB). Change the following template settings to use alternative
	     * delimiters.
	     *
	     * @static
	     * @memberOf _
	     * @type Object
	     */
	    lodash.templateSettings = {

	      /**
	       * Used to detect `data` property values to be HTML-escaped.
	       *
	       * @memberOf _.templateSettings
	       * @type RegExp
	       */
	      'escape': /<%-([\s\S]+?)%>/g,

	      /**
	       * Used to detect code to be evaluated.
	       *
	       * @memberOf _.templateSettings
	       * @type RegExp
	       */
	      'evaluate': /<%([\s\S]+?)%>/g,

	      /**
	       * Used to detect `data` property values to inject.
	       *
	       * @memberOf _.templateSettings
	       * @type RegExp
	       */
	      'interpolate': reInterpolate,

	      /**
	       * Used to reference the data object in the template text.
	       *
	       * @memberOf _.templateSettings
	       * @type string
	       */
	      'variable': '',

	      /**
	       * Used to import variables into the compiled template.
	       *
	       * @memberOf _.templateSettings
	       * @type Object
	       */
	      'imports': {

	        /**
	         * A reference to the `lodash` function.
	         *
	         * @memberOf _.templateSettings.imports
	         * @type Function
	         */
	        '_': lodash
	      }
	    };

	    /*--------------------------------------------------------------------------*/

	    /**
	     * The template used to create iterator functions.
	     *
	     * @private
	     * @param {Object} data The data object used to populate the text.
	     * @returns {string} Returns the interpolated text.
	     */
	    var iteratorTemplate = function(obj) {

	      var __p = 'var index, iterable = ' +
	      (obj.firstArg) +
	      ', result = ' +
	      (obj.init) +
	      ';\nif (!iterable) return result;\n' +
	      (obj.top) +
	      ';';
	       if (obj.array) {
	      __p += '\nvar length = iterable.length; index = -1;\nif (' +
	      (obj.array) +
	      ') {  ';
	       if (support.unindexedChars) {
	      __p += '\n  if (isString(iterable)) {\n    iterable = iterable.split(\'\')\n  }  ';
	       }
	      __p += '\n  while (++index < length) {\n    ' +
	      (obj.loop) +
	      ';\n  }\n}\nelse {  ';
	       } else if (support.nonEnumArgs) {
	      __p += '\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += \'\';\n      ' +
	      (obj.loop) +
	      ';\n    }\n  } else {  ';
	       }

	       if (support.enumPrototypes) {
	      __p += '\n  var skipProto = typeof iterable == \'function\';\n  ';
	       }

	       if (support.enumErrorProps) {
	      __p += '\n  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\n  ';
	       }

	          var conditions = [];    if (support.enumPrototypes) { conditions.push('!(skipProto && index == "prototype")'); }    if (support.enumErrorProps)  { conditions.push('!(skipErrorProps && (index == "message" || index == "name"))'); }

	       if (obj.useHas && obj.keys) {
	      __p += '\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] && keys(iterable),\n      length = ownProps ? ownProps.length : 0;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n';
	          if (conditions.length) {
	      __p += '    if (' +
	      (conditions.join(' && ')) +
	      ') {\n  ';
	       }
	      __p +=
	      (obj.loop) +
	      ';    ';
	       if (conditions.length) {
	      __p += '\n    }';
	       }
	      __p += '\n  }  ';
	       } else {
	      __p += '\n  for (index in iterable) {\n';
	          if (obj.useHas) { conditions.push("hasOwnProperty.call(iterable, index)"); }    if (conditions.length) {
	      __p += '    if (' +
	      (conditions.join(' && ')) +
	      ') {\n  ';
	       }
	      __p +=
	      (obj.loop) +
	      ';    ';
	       if (conditions.length) {
	      __p += '\n    }';
	       }
	      __p += '\n  }    ';
	       if (support.nonEnumShadows) {
	      __p += '\n\n  if (iterable !== objectProto) {\n    var ctor = iterable.constructor,\n        isProto = iterable === (ctor && ctor.prototype),\n        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\n        nonEnum = nonEnumProps[className];\n      ';
	       for (k = 0; k < 7; k++) {
	      __p += '\n    index = \'' +
	      (obj.shadowedProps[k]) +
	      '\';\n    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))';
	              if (!obj.useHas) {
	      __p += ' || (!nonEnum[index] && iterable[index] !== objectProto[index])';
	       }
	      __p += ') {\n      ' +
	      (obj.loop) +
	      ';\n    }      ';
	       }
	      __p += '\n  }    ';
	       }

	       }

	       if (obj.array || support.nonEnumArgs) {
	      __p += '\n}';
	       }
	      __p +=
	      (obj.bottom) +
	      ';\nreturn result';

	      return __p
	    };

	    /*--------------------------------------------------------------------------*/

	    /**
	     * The base implementation of `_.bind` that creates the bound function and
	     * sets its meta data.
	     *
	     * @private
	     * @param {Array} bindData The bind data array.
	     * @returns {Function} Returns the new bound function.
	     */
	    function baseBind(bindData) {
	      var func = bindData[0],
	          partialArgs = bindData[2],
	          thisArg = bindData[4];

	      function bound() {
	        // `Function#bind` spec
	        // http://es5.github.io/#x15.3.4.5
	        if (partialArgs) {
	          // avoid `arguments` object deoptimizations by using `slice` instead
	          // of `Array.prototype.slice.call` and not assigning `arguments` to a
	          // variable as a ternary expression
	          var args = slice(partialArgs);
	          push.apply(args, arguments);
	        }
	        // mimic the constructor's `return` behavior
	        // http://es5.github.io/#x13.2.2
	        if (this instanceof bound) {
	          // ensure `new bound` is an instance of `func`
	          var thisBinding = baseCreate(func.prototype),
	              result = func.apply(thisBinding, args || arguments);
	          return isObject(result) ? result : thisBinding;
	        }
	        return func.apply(thisArg, args || arguments);
	      }
	      setBindData(bound, bindData);
	      return bound;
	    }

	    /**
	     * The base implementation of `_.clone` without argument juggling or support
	     * for `thisArg` binding.
	     *
	     * @private
	     * @param {*} value The value to clone.
	     * @param {boolean} [isDeep=false] Specify a deep clone.
	     * @param {Function} [callback] The function to customize cloning values.
	     * @param {Array} [stackA=[]] Tracks traversed source objects.
	     * @param {Array} [stackB=[]] Associates clones with source counterparts.
	     * @returns {*} Returns the cloned value.
	     */
	    function baseClone(value, isDeep, callback, stackA, stackB) {
	      if (callback) {
	        var result = callback(value);
	        if (typeof result != 'undefined') {
	          return result;
	        }
	      }
	      // inspect [[Class]]
	      var isObj = isObject(value);
	      if (isObj) {
	        var className = toString.call(value);
	        if (!cloneableClasses[className] || (!support.nodeClass && isNode(value))) {
	          return value;
	        }
	        var ctor = ctorByClass[className];
	        switch (className) {
	          case boolClass:
	          case dateClass:
	            return new ctor(+value);

	          case numberClass:
	          case stringClass:
	            return new ctor(value);

	          case regexpClass:
	            result = ctor(value.source, reFlags.exec(value));
	            result.lastIndex = value.lastIndex;
	            return result;
	        }
	      } else {
	        return value;
	      }
	      var isArr = isArray(value);
	      if (isDeep) {
	        // check for circular references and return corresponding clone
	        var initedStack = !stackA;
	        stackA || (stackA = getArray());
	        stackB || (stackB = getArray());

	        var length = stackA.length;
	        while (length--) {
	          if (stackA[length] == value) {
	            return stackB[length];
	          }
	        }
	        result = isArr ? ctor(value.length) : {};
	      }
	      else {
	        result = isArr ? slice(value) : assign({}, value);
	      }
	      // add array properties assigned by `RegExp#exec`
	      if (isArr) {
	        if (hasOwnProperty.call(value, 'index')) {
	          result.index = value.index;
	        }
	        if (hasOwnProperty.call(value, 'input')) {
	          result.input = value.input;
	        }
	      }
	      // exit for shallow clone
	      if (!isDeep) {
	        return result;
	      }
	      // add the source value to the stack of traversed objects
	      // and associate it with its clone
	      stackA.push(value);
	      stackB.push(result);

	      // recursively populate clone (susceptible to call stack limits)
	      (isArr ? baseEach : forOwn)(value, function(objValue, key) {
	        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
	      });

	      if (initedStack) {
	        releaseArray(stackA);
	        releaseArray(stackB);
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.create` without support for assigning
	     * properties to the created object.
	     *
	     * @private
	     * @param {Object} prototype The object to inherit from.
	     * @returns {Object} Returns the new object.
	     */
	    function baseCreate(prototype, properties) {
	      return isObject(prototype) ? nativeCreate(prototype) : {};
	    }
	    // fallback for browsers without `Object.create`
	    if (!nativeCreate) {
	      baseCreate = (function() {
	        function Object() {}
	        return function(prototype) {
	          if (isObject(prototype)) {
	            Object.prototype = prototype;
	            var result = new Object;
	            Object.prototype = null;
	          }
	          return result || context.Object();
	        };
	      }());
	    }

	    /**
	     * The base implementation of `_.createCallback` without support for creating
	     * "_.pluck" or "_.where" style callbacks.
	     *
	     * @private
	     * @param {*} [func=identity] The value to convert to a callback.
	     * @param {*} [thisArg] The `this` binding of the created callback.
	     * @param {number} [argCount] The number of arguments the callback accepts.
	     * @returns {Function} Returns a callback function.
	     */
	    function baseCreateCallback(func, thisArg, argCount) {
	      if (typeof func != 'function') {
	        return identity;
	      }
	      // exit early for no `thisArg` or already bound by `Function#bind`
	      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
	        return func;
	      }
	      var bindData = func.__bindData__;
	      if (typeof bindData == 'undefined') {
	        if (support.funcNames) {
	          bindData = !func.name;
	        }
	        bindData = bindData || !support.funcDecomp;
	        if (!bindData) {
	          var source = fnToString.call(func);
	          if (!support.funcNames) {
	            bindData = !reFuncName.test(source);
	          }
	          if (!bindData) {
	            // checks if `func` references the `this` keyword and stores the result
	            bindData = reThis.test(source);
	            setBindData(func, bindData);
	          }
	        }
	      }
	      // exit early if there are no `this` references or `func` is bound
	      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
	        return func;
	      }
	      switch (argCount) {
	        case 1: return function(value) {
	          return func.call(thisArg, value);
	        };
	        case 2: return function(a, b) {
	          return func.call(thisArg, a, b);
	        };
	        case 3: return function(value, index, collection) {
	          return func.call(thisArg, value, index, collection);
	        };
	        case 4: return function(accumulator, value, index, collection) {
	          return func.call(thisArg, accumulator, value, index, collection);
	        };
	      }
	      return bind(func, thisArg);
	    }

	    /**
	     * The base implementation of `createWrapper` that creates the wrapper and
	     * sets its meta data.
	     *
	     * @private
	     * @param {Array} bindData The bind data array.
	     * @returns {Function} Returns the new function.
	     */
	    function baseCreateWrapper(bindData) {
	      var func = bindData[0],
	          bitmask = bindData[1],
	          partialArgs = bindData[2],
	          partialRightArgs = bindData[3],
	          thisArg = bindData[4],
	          arity = bindData[5];

	      var isBind = bitmask & 1,
	          isBindKey = bitmask & 2,
	          isCurry = bitmask & 4,
	          isCurryBound = bitmask & 8,
	          key = func;

	      function bound() {
	        var thisBinding = isBind ? thisArg : this;
	        if (partialArgs) {
	          var args = slice(partialArgs);
	          push.apply(args, arguments);
	        }
	        if (partialRightArgs || isCurry) {
	          args || (args = slice(arguments));
	          if (partialRightArgs) {
	            push.apply(args, partialRightArgs);
	          }
	          if (isCurry && args.length < arity) {
	            bitmask |= 16 & ~32;
	            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
	          }
	        }
	        args || (args = arguments);
	        if (isBindKey) {
	          func = thisBinding[key];
	        }
	        if (this instanceof bound) {
	          thisBinding = baseCreate(func.prototype);
	          var result = func.apply(thisBinding, args);
	          return isObject(result) ? result : thisBinding;
	        }
	        return func.apply(thisBinding, args);
	      }
	      setBindData(bound, bindData);
	      return bound;
	    }

	    /**
	     * The base implementation of `_.difference` that accepts a single array
	     * of values to exclude.
	     *
	     * @private
	     * @param {Array} array The array to process.
	     * @param {Array} [values] The array of values to exclude.
	     * @returns {Array} Returns a new array of filtered values.
	     */
	    function baseDifference(array, values) {
	      var index = -1,
	          indexOf = getIndexOf(),
	          length = array ? array.length : 0,
	          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
	          result = [];

	      if (isLarge) {
	        var cache = createCache(values);
	        if (cache) {
	          indexOf = cacheIndexOf;
	          values = cache;
	        } else {
	          isLarge = false;
	        }
	      }
	      while (++index < length) {
	        var value = array[index];
	        if (indexOf(values, value) < 0) {
	          result.push(value);
	        }
	      }
	      if (isLarge) {
	        releaseObject(values);
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.flatten` without support for callback
	     * shorthands or `thisArg` binding.
	     *
	     * @private
	     * @param {Array} array The array to flatten.
	     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
	     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
	     * @param {number} [fromIndex=0] The index to start from.
	     * @returns {Array} Returns a new flattened array.
	     */
	    function baseFlatten(array, isShallow, isStrict, fromIndex) {
	      var index = (fromIndex || 0) - 1,
	          length = array ? array.length : 0,
	          result = [];

	      while (++index < length) {
	        var value = array[index];

	        if (value && typeof value == 'object' && typeof value.length == 'number'
	            && (isArray(value) || isArguments(value))) {
	          // recursively flatten arrays (susceptible to call stack limits)
	          if (!isShallow) {
	            value = baseFlatten(value, isShallow, isStrict);
	          }
	          var valIndex = -1,
	              valLength = value.length,
	              resIndex = result.length;

	          result.length += valLength;
	          while (++valIndex < valLength) {
	            result[resIndex++] = value[valIndex];
	          }
	        } else if (!isStrict) {
	          result.push(value);
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
	     * that allows partial "_.where" style comparisons.
	     *
	     * @private
	     * @param {*} a The value to compare.
	     * @param {*} b The other value to compare.
	     * @param {Function} [callback] The function to customize comparing values.
	     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
	     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
	     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
	     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	     */
	    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
	      // used to indicate that when comparing objects, `a` has at least the properties of `b`
	      if (callback) {
	        var result = callback(a, b);
	        if (typeof result != 'undefined') {
	          return !!result;
	        }
	      }
	      // exit early for identical values
	      if (a === b) {
	        // treat `+0` vs. `-0` as not equal
	        return a !== 0 || (1 / a == 1 / b);
	      }
	      var type = typeof a,
	          otherType = typeof b;

	      // exit early for unlike primitive values
	      if (a === a &&
	          !(a && objectTypes[type]) &&
	          !(b && objectTypes[otherType])) {
	        return false;
	      }
	      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
	      // http://es5.github.io/#x15.3.4.4
	      if (a == null || b == null) {
	        return a === b;
	      }
	      // compare [[Class]] names
	      var className = toString.call(a),
	          otherClass = toString.call(b);

	      if (className == argsClass) {
	        className = objectClass;
	      }
	      if (otherClass == argsClass) {
	        otherClass = objectClass;
	      }
	      if (className != otherClass) {
	        return false;
	      }
	      switch (className) {
	        case boolClass:
	        case dateClass:
	          // coerce dates and booleans to numbers, dates to milliseconds and booleans
	          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
	          return +a == +b;

	        case numberClass:
	          // treat `NaN` vs. `NaN` as equal
	          return (a != +a)
	            ? b != +b
	            // but treat `+0` vs. `-0` as not equal
	            : (a == 0 ? (1 / a == 1 / b) : a == +b);

	        case regexpClass:
	        case stringClass:
	          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
	          // treat string primitives and their corresponding object instances as equal
	          return a == String(b);
	      }
	      var isArr = className == arrayClass;
	      if (!isArr) {
	        // unwrap any `lodash` wrapped values
	        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
	            bWrapped = hasOwnProperty.call(b, '__wrapped__');

	        if (aWrapped || bWrapped) {
	          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
	        }
	        // exit for functions and DOM nodes
	        if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
	          return false;
	        }
	        // in older versions of Opera, `arguments` objects have `Array` constructors
	        var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
	            ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;

	        // non `Object` object instances with different constructors are not equal
	        if (ctorA != ctorB &&
	              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
	              ('constructor' in a && 'constructor' in b)
	            ) {
	          return false;
	        }
	      }
	      // assume cyclic structures are equal
	      // the algorithm for detecting cyclic structures is adapted from ES 5.1
	      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
	      var initedStack = !stackA;
	      stackA || (stackA = getArray());
	      stackB || (stackB = getArray());

	      var length = stackA.length;
	      while (length--) {
	        if (stackA[length] == a) {
	          return stackB[length] == b;
	        }
	      }
	      var size = 0;
	      result = true;

	      // add `a` and `b` to the stack of traversed objects
	      stackA.push(a);
	      stackB.push(b);

	      // recursively compare objects and arrays (susceptible to call stack limits)
	      if (isArr) {
	        // compare lengths to determine if a deep comparison is necessary
	        length = a.length;
	        size = b.length;
	        result = size == length;

	        if (result || isWhere) {
	          // deep compare the contents, ignoring non-numeric properties
	          while (size--) {
	            var index = length,
	                value = b[size];

	            if (isWhere) {
	              while (index--) {
	                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
	                  break;
	                }
	              }
	            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
	              break;
	            }
	          }
	        }
	      }
	      else {
	        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
	        // which, in this case, is more costly
	        forIn(b, function(value, key, b) {
	          if (hasOwnProperty.call(b, key)) {
	            // count the number of properties.
	            size++;
	            // deep compare each property value.
	            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
	          }
	        });

	        if (result && !isWhere) {
	          // ensure both objects have the same number of properties
	          forIn(a, function(value, key, a) {
	            if (hasOwnProperty.call(a, key)) {
	              // `size` will be `-1` if `a` has more properties than `b`
	              return (result = --size > -1);
	            }
	          });
	        }
	      }
	      stackA.pop();
	      stackB.pop();

	      if (initedStack) {
	        releaseArray(stackA);
	        releaseArray(stackB);
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.merge` without argument juggling or support
	     * for `thisArg` binding.
	     *
	     * @private
	     * @param {Object} object The destination object.
	     * @param {Object} source The source object.
	     * @param {Function} [callback] The function to customize merging properties.
	     * @param {Array} [stackA=[]] Tracks traversed source objects.
	     * @param {Array} [stackB=[]] Associates values with source counterparts.
	     */
	    function baseMerge(object, source, callback, stackA, stackB) {
	      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
	        var found,
	            isArr,
	            result = source,
	            value = object[key];

	        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
	          // avoid merging previously merged cyclic sources
	          var stackLength = stackA.length;
	          while (stackLength--) {
	            if ((found = stackA[stackLength] == source)) {
	              value = stackB[stackLength];
	              break;
	            }
	          }
	          if (!found) {
	            var isShallow;
	            if (callback) {
	              result = callback(value, source);
	              if ((isShallow = typeof result != 'undefined')) {
	                value = result;
	              }
	            }
	            if (!isShallow) {
	              value = isArr
	                ? (isArray(value) ? value : [])
	                : (isPlainObject(value) ? value : {});
	            }
	            // add `source` and associated `value` to the stack of traversed objects
	            stackA.push(source);
	            stackB.push(value);

	            // recursively merge objects and arrays (susceptible to call stack limits)
	            if (!isShallow) {
	              baseMerge(value, source, callback, stackA, stackB);
	            }
	          }
	        }
	        else {
	          if (callback) {
	            result = callback(value, source);
	            if (typeof result == 'undefined') {
	              result = source;
	            }
	          }
	          if (typeof result != 'undefined') {
	            value = result;
	          }
	        }
	        object[key] = value;
	      });
	    }

	    /**
	     * The base implementation of `_.random` without argument juggling or support
	     * for returning floating-point numbers.
	     *
	     * @private
	     * @param {number} min The minimum possible value.
	     * @param {number} max The maximum possible value.
	     * @returns {number} Returns a random number.
	     */
	    function baseRandom(min, max) {
	      return min + floor(nativeRandom() * (max - min + 1));
	    }

	    /**
	     * The base implementation of `_.uniq` without support for callback shorthands
	     * or `thisArg` binding.
	     *
	     * @private
	     * @param {Array} array The array to process.
	     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
	     * @param {Function} [callback] The function called per iteration.
	     * @returns {Array} Returns a duplicate-value-free array.
	     */
	    function baseUniq(array, isSorted, callback) {
	      var index = -1,
	          indexOf = getIndexOf(),
	          length = array ? array.length : 0,
	          result = [];

	      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
	          seen = (callback || isLarge) ? getArray() : result;

	      if (isLarge) {
	        var cache = createCache(seen);
	        indexOf = cacheIndexOf;
	        seen = cache;
	      }
	      while (++index < length) {
	        var value = array[index],
	            computed = callback ? callback(value, index, array) : value;

	        if (isSorted
	              ? !index || seen[seen.length - 1] !== computed
	              : indexOf(seen, computed) < 0
	            ) {
	          if (callback || isLarge) {
	            seen.push(computed);
	          }
	          result.push(value);
	        }
	      }
	      if (isLarge) {
	        releaseArray(seen.array);
	        releaseObject(seen);
	      } else if (callback) {
	        releaseArray(seen);
	      }
	      return result;
	    }

	    /**
	     * Creates a function that aggregates a collection, creating an object composed
	     * of keys generated from the results of running each element of the collection
	     * through a callback. The given `setter` function sets the keys and values
	     * of the composed object.
	     *
	     * @private
	     * @param {Function} setter The setter function.
	     * @returns {Function} Returns the new aggregator function.
	     */
	    function createAggregator(setter) {
	      return function(collection, callback, thisArg) {
	        var result = {};
	        callback = lodash.createCallback(callback, thisArg, 3);

	        if (isArray(collection)) {
	          var index = -1,
	              length = collection.length;

	          while (++index < length) {
	            var value = collection[index];
	            setter(result, value, callback(value, index, collection), collection);
	          }
	        } else {
	          baseEach(collection, function(value, key, collection) {
	            setter(result, value, callback(value, key, collection), collection);
	          });
	        }
	        return result;
	      };
	    }

	    /**
	     * Creates a function that, when called, either curries or invokes `func`
	     * with an optional `this` binding and partially applied arguments.
	     *
	     * @private
	     * @param {Function|string} func The function or method name to reference.
	     * @param {number} bitmask The bitmask of method flags to compose.
	     *  The bitmask may be composed of the following flags:
	     *  1 - `_.bind`
	     *  2 - `_.bindKey`
	     *  4 - `_.curry`
	     *  8 - `_.curry` (bound)
	     *  16 - `_.partial`
	     *  32 - `_.partialRight`
	     * @param {Array} [partialArgs] An array of arguments to prepend to those
	     *  provided to the new function.
	     * @param {Array} [partialRightArgs] An array of arguments to append to those
	     *  provided to the new function.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param {number} [arity] The arity of `func`.
	     * @returns {Function} Returns the new function.
	     */
	    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
	      var isBind = bitmask & 1,
	          isBindKey = bitmask & 2,
	          isCurry = bitmask & 4,
	          isCurryBound = bitmask & 8,
	          isPartial = bitmask & 16,
	          isPartialRight = bitmask & 32;

	      if (!isBindKey && !isFunction(func)) {
	        throw new TypeError;
	      }
	      if (isPartial && !partialArgs.length) {
	        bitmask &= ~16;
	        isPartial = partialArgs = false;
	      }
	      if (isPartialRight && !partialRightArgs.length) {
	        bitmask &= ~32;
	        isPartialRight = partialRightArgs = false;
	      }
	      var bindData = func && func.__bindData__;
	      if (bindData && bindData !== true) {
	        // clone `bindData`
	        bindData = slice(bindData);
	        if (bindData[2]) {
	          bindData[2] = slice(bindData[2]);
	        }
	        if (bindData[3]) {
	          bindData[3] = slice(bindData[3]);
	        }
	        // set `thisBinding` is not previously bound
	        if (isBind && !(bindData[1] & 1)) {
	          bindData[4] = thisArg;
	        }
	        // set if previously bound but not currently (subsequent curried functions)
	        if (!isBind && bindData[1] & 1) {
	          bitmask |= 8;
	        }
	        // set curried arity if not yet set
	        if (isCurry && !(bindData[1] & 4)) {
	          bindData[5] = arity;
	        }
	        // append partial left arguments
	        if (isPartial) {
	          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
	        }
	        // append partial right arguments
	        if (isPartialRight) {
	          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
	        }
	        // merge flags
	        bindData[1] |= bitmask;
	        return createWrapper.apply(null, bindData);
	      }
	      // fast path for `_.bind`
	      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
	      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
	    }

	    /**
	     * Creates compiled iteration functions.
	     *
	     * @private
	     * @param {...Object} [options] The compile options object(s).
	     * @param {string} [options.array] Code to determine if the iterable is an array or array-like.
	     * @param {boolean} [options.useHas] Specify using `hasOwnProperty` checks in the object loop.
	     * @param {Function} [options.keys] A reference to `_.keys` for use in own property iteration.
	     * @param {string} [options.args] A comma separated string of iteration function arguments.
	     * @param {string} [options.top] Code to execute before the iteration branches.
	     * @param {string} [options.loop] Code to execute in the object loop.
	     * @param {string} [options.bottom] Code to execute after the iteration branches.
	     * @returns {Function} Returns the compiled function.
	     */
	    function createIterator() {
	      // data properties
	      iteratorData.shadowedProps = shadowedProps;

	      // iterator options
	      iteratorData.array = iteratorData.bottom = iteratorData.loop = iteratorData.top = '';
	      iteratorData.init = 'iterable';
	      iteratorData.useHas = true;

	      // merge options into a template data object
	      for (var object, index = 0; object = arguments[index]; index++) {
	        for (var key in object) {
	          iteratorData[key] = object[key];
	        }
	      }
	      var args = iteratorData.args;
	      iteratorData.firstArg = /^[^,]+/.exec(args)[0];

	      // create the function factory
	      var factory = Function(
	          'baseCreateCallback, errorClass, errorProto, hasOwnProperty, ' +
	          'indicatorObject, isArguments, isArray, isString, keys, objectProto, ' +
	          'objectTypes, nonEnumProps, stringClass, stringProto, toString',
	        'return function(' + args + ') {\n' + iteratorTemplate(iteratorData) + '\n}'
	      );

	      // return the compiled function
	      return factory(
	        baseCreateCallback, errorClass, errorProto, hasOwnProperty,
	        indicatorObject, isArguments, isArray, isString, iteratorData.keys, objectProto,
	        objectTypes, nonEnumProps, stringClass, stringProto, toString
	      );
	    }

	    /**
	     * Used by `escape` to convert characters to HTML entities.
	     *
	     * @private
	     * @param {string} match The matched character to escape.
	     * @returns {string} Returns the escaped character.
	     */
	    function escapeHtmlChar(match) {
	      return htmlEscapes[match];
	    }

	    /**
	     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
	     * customized, this method returns the custom method, otherwise it returns
	     * the `baseIndexOf` function.
	     *
	     * @private
	     * @returns {Function} Returns the "indexOf" function.
	     */
	    function getIndexOf() {
	      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
	      return result;
	    }

	    /**
	     * Checks if `value` is a native function.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
	     */
	    function isNative(value) {
	      return typeof value == 'function' && reNative.test(value);
	    }

	    /**
	     * Sets `this` binding data on a given function.
	     *
	     * @private
	     * @param {Function} func The function to set data on.
	     * @param {Array} value The data array to set.
	     */
	    var setBindData = !defineProperty ? noop : function(func, value) {
	      descriptor.value = value;
	      defineProperty(func, '__bindData__', descriptor);
	    };

	    /**
	     * A fallback implementation of `isPlainObject` which checks if a given value
	     * is an object created by the `Object` constructor, assuming objects created
	     * by the `Object` constructor have no inherited enumerable properties and that
	     * there are no `Object.prototype` extensions.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	     */
	    function shimIsPlainObject(value) {
	      var ctor,
	          result;

	      // avoid non Object objects, `arguments` objects, and DOM elements
	      if (!(value && toString.call(value) == objectClass) ||
	          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor)) ||
	          (!support.argsClass && isArguments(value)) ||
	          (!support.nodeClass && isNode(value))) {
	        return false;
	      }
	      // IE < 9 iterates inherited properties before own properties. If the first
	      // iterated property is an object's own property then there are no inherited
	      // enumerable properties.
	      if (support.ownLast) {
	        forIn(value, function(value, key, object) {
	          result = hasOwnProperty.call(object, key);
	          return false;
	        });
	        return result !== false;
	      }
	      // In most environments an object's own properties are iterated before
	      // its inherited properties. If the last iterated property is an object's
	      // own property then there are no inherited enumerable properties.
	      forIn(value, function(value, key) {
	        result = key;
	      });
	      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
	    }

	    /**
	     * Used by `unescape` to convert HTML entities to characters.
	     *
	     * @private
	     * @param {string} match The matched character to unescape.
	     * @returns {string} Returns the unescaped character.
	     */
	    function unescapeHtmlChar(match) {
	      return htmlUnescapes[match];
	    }

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Checks if `value` is an `arguments` object.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
	     * @example
	     *
	     * (function() { return _.isArguments(arguments); })(1, 2, 3);
	     * // => true
	     *
	     * _.isArguments([1, 2, 3]);
	     * // => false
	     */
	    function isArguments(value) {
	      return value && typeof value == 'object' && typeof value.length == 'number' &&
	        toString.call(value) == argsClass || false;
	    }
	    // fallback for browsers that can't detect `arguments` objects by [[Class]]
	    if (!support.argsClass) {
	      isArguments = function(value) {
	        return value && typeof value == 'object' && typeof value.length == 'number' &&
	          hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee') || false;
	      };
	    }

	    /**
	     * Checks if `value` is an array.
	     *
	     * @static
	     * @memberOf _
	     * @type Function
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
	     * @example
	     *
	     * (function() { return _.isArray(arguments); })();
	     * // => false
	     *
	     * _.isArray([1, 2, 3]);
	     * // => true
	     */
	    var isArray = nativeIsArray || function(value) {
	      return value && typeof value == 'object' && typeof value.length == 'number' &&
	        toString.call(value) == arrayClass || false;
	    };

	    /**
	     * A fallback implementation of `Object.keys` which produces an array of the
	     * given object's own enumerable property names.
	     *
	     * @private
	     * @type Function
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns an array of property names.
	     */
	    var shimKeys = createIterator({
	      'args': 'object',
	      'init': '[]',
	      'top': 'if (!(objectTypes[typeof object])) return result',
	      'loop': 'result.push(index)'
	    });

	    /**
	     * Creates an array composed of the own enumerable property names of an object.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns an array of property names.
	     * @example
	     *
	     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
	     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
	     */
	    var keys = !nativeKeys ? shimKeys : function(object) {
	      if (!isObject(object)) {
	        return [];
	      }
	      if ((support.enumPrototypes && typeof object == 'function') ||
	          (support.nonEnumArgs && object.length && isArguments(object))) {
	        return shimKeys(object);
	      }
	      return nativeKeys(object);
	    };

	    /** Reusable iterator options shared by `each`, `forIn`, and `forOwn` */
	    var eachIteratorOptions = {
	      'args': 'collection, callback, thisArg',
	      'top': "callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3)",
	      'array': "typeof length == 'number'",
	      'keys': keys,
	      'loop': 'if (callback(iterable[index], index, collection) === false) return result'
	    };

	    /** Reusable iterator options for `assign` and `defaults` */
	    var defaultsIteratorOptions = {
	      'args': 'object, source, guard',
	      'top':
	        'var args = arguments,\n' +
	        '    argsIndex = 0,\n' +
	        "    argsLength = typeof guard == 'number' ? 2 : args.length;\n" +
	        'while (++argsIndex < argsLength) {\n' +
	        '  iterable = args[argsIndex];\n' +
	        '  if (iterable && objectTypes[typeof iterable]) {',
	      'keys': keys,
	      'loop': "if (typeof result[index] == 'undefined') result[index] = iterable[index]",
	      'bottom': '  }\n}'
	    };

	    /** Reusable iterator options for `forIn` and `forOwn` */
	    var forOwnIteratorOptions = {
	      'top': 'if (!objectTypes[typeof iterable]) return result;\n' + eachIteratorOptions.top,
	      'array': false
	    };

	    /**
	     * Used to convert characters to HTML entities:
	     *
	     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
	     * don't require escaping in HTML and have no special meaning unless they're part
	     * of a tag or an unquoted attribute value.
	     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
	     */
	    var htmlEscapes = {
	      '&': '&amp;',
	      '<': '&lt;',
	      '>': '&gt;',
	      '"': '&quot;',
	      "'": '&#39;'
	    };

	    /** Used to convert HTML entities to characters */
	    var htmlUnescapes = invert(htmlEscapes);

	    /** Used to match HTML entities and HTML characters */
	    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
	        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

	    /**
	     * A function compiled to iterate `arguments` objects, arrays, objects, and
	     * strings consistenly across environments, executing the callback for each
	     * element in the collection. The callback is bound to `thisArg` and invoked
	     * with three arguments; (value, index|key, collection). Callbacks may exit
	     * iteration early by explicitly returning `false`.
	     *
	     * @private
	     * @type Function
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array|Object|string} Returns `collection`.
	     */
	    var baseEach = createIterator(eachIteratorOptions);

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Assigns own enumerable properties of source object(s) to the destination
	     * object. Subsequent sources will overwrite property assignments of previous
	     * sources. If a callback is provided it will be executed to produce the
	     * assigned values. The callback is bound to `thisArg` and invoked with two
	     * arguments; (objectValue, sourceValue).
	     *
	     * @static
	     * @memberOf _
	     * @type Function
	     * @alias extend
	     * @category Objects
	     * @param {Object} object The destination object.
	     * @param {...Object} [source] The source objects.
	     * @param {Function} [callback] The function to customize assigning values.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns the destination object.
	     * @example
	     *
	     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
	     * // => { 'name': 'fred', 'employer': 'slate' }
	     *
	     * var defaults = _.partialRight(_.assign, function(a, b) {
	     *   return typeof a == 'undefined' ? b : a;
	     * });
	     *
	     * var object = { 'name': 'barney' };
	     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
	     * // => { 'name': 'barney', 'employer': 'slate' }
	     */
	    var assign = createIterator(defaultsIteratorOptions, {
	      'top':
	        defaultsIteratorOptions.top.replace(';',
	          ';\n' +
	          "if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\n" +
	          '  var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);\n' +
	          "} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\n" +
	          '  callback = args[--argsLength];\n' +
	          '}'
	        ),
	      'loop': 'result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]'
	    });

	    /**
	     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
	     * be cloned, otherwise they will be assigned by reference. If a callback
	     * is provided it will be executed to produce the cloned values. If the
	     * callback returns `undefined` cloning will be handled by the method instead.
	     * The callback is bound to `thisArg` and invoked with one argument; (value).
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to clone.
	     * @param {boolean} [isDeep=false] Specify a deep clone.
	     * @param {Function} [callback] The function to customize cloning values.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the cloned value.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * var shallow = _.clone(characters);
	     * shallow[0] === characters[0];
	     * // => true
	     *
	     * var deep = _.clone(characters, true);
	     * deep[0] === characters[0];
	     * // => false
	     *
	     * _.mixin({
	     *   'clone': _.partialRight(_.clone, function(value) {
	     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
	     *   })
	     * });
	     *
	     * var clone = _.clone(document.body);
	     * clone.childNodes.length;
	     * // => 0
	     */
	    function clone(value, isDeep, callback, thisArg) {
	      // allows working with "Collections" methods without using their `index`
	      // and `collection` arguments for `isDeep` and `callback`
	      if (typeof isDeep != 'boolean' && isDeep != null) {
	        thisArg = callback;
	        callback = isDeep;
	        isDeep = false;
	      }
	      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
	    }

	    /**
	     * Creates a deep clone of `value`. If a callback is provided it will be
	     * executed to produce the cloned values. If the callback returns `undefined`
	     * cloning will be handled by the method instead. The callback is bound to
	     * `thisArg` and invoked with one argument; (value).
	     *
	     * Note: This method is loosely based on the structured clone algorithm. Functions
	     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
	     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
	     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to deep clone.
	     * @param {Function} [callback] The function to customize cloning values.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the deep cloned value.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * var deep = _.cloneDeep(characters);
	     * deep[0] === characters[0];
	     * // => false
	     *
	     * var view = {
	     *   'label': 'docs',
	     *   'node': element
	     * };
	     *
	     * var clone = _.cloneDeep(view, function(value) {
	     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
	     * });
	     *
	     * clone.node == view.node;
	     * // => false
	     */
	    function cloneDeep(value, callback, thisArg) {
	      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
	    }

	    /**
	     * Creates an object that inherits from the given `prototype` object. If a
	     * `properties` object is provided its own enumerable properties are assigned
	     * to the created object.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} prototype The object to inherit from.
	     * @param {Object} [properties] The properties to assign to the object.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * function Shape() {
	     *   this.x = 0;
	     *   this.y = 0;
	     * }
	     *
	     * function Circle() {
	     *   Shape.call(this);
	     * }
	     *
	     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
	     *
	     * var circle = new Circle;
	     * circle instanceof Circle;
	     * // => true
	     *
	     * circle instanceof Shape;
	     * // => true
	     */
	    function create(prototype, properties) {
	      var result = baseCreate(prototype);
	      return properties ? assign(result, properties) : result;
	    }

	    /**
	     * Assigns own enumerable properties of source object(s) to the destination
	     * object for all destination properties that resolve to `undefined`. Once a
	     * property is set, additional defaults of the same property will be ignored.
	     *
	     * @static
	     * @memberOf _
	     * @type Function
	     * @category Objects
	     * @param {Object} object The destination object.
	     * @param {...Object} [source] The source objects.
	     * @param- {Object} [guard] Allows working with `_.reduce` without using its
	     *  `key` and `object` arguments as sources.
	     * @returns {Object} Returns the destination object.
	     * @example
	     *
	     * var object = { 'name': 'barney' };
	     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
	     * // => { 'name': 'barney', 'employer': 'slate' }
	     */
	    var defaults = createIterator(defaultsIteratorOptions);

	    /**
	     * This method is like `_.findIndex` except that it returns the key of the
	     * first element that passes the callback check, instead of the element itself.
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to search.
	     * @param {Function|Object|string} [callback=identity] The function called per
	     *  iteration. If a property name or object is provided it will be used to
	     *  create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
	     * @example
	     *
	     * var characters = {
	     *   'barney': {  'age': 36, 'blocked': false },
	     *   'fred': {    'age': 40, 'blocked': true },
	     *   'pebbles': { 'age': 1,  'blocked': false }
	     * };
	     *
	     * _.findKey(characters, function(chr) {
	     *   return chr.age < 40;
	     * });
	     * // => 'barney' (property order is not guaranteed across environments)
	     *
	     * // using "_.where" callback shorthand
	     * _.findKey(characters, { 'age': 1 });
	     * // => 'pebbles'
	     *
	     * // using "_.pluck" callback shorthand
	     * _.findKey(characters, 'blocked');
	     * // => 'fred'
	     */
	    function findKey(object, callback, thisArg) {
	      var result;
	      callback = lodash.createCallback(callback, thisArg, 3);
	      forOwn(object, function(value, key, object) {
	        if (callback(value, key, object)) {
	          result = key;
	          return false;
	        }
	      });
	      return result;
	    }

	    /**
	     * This method is like `_.findKey` except that it iterates over elements
	     * of a `collection` in the opposite order.
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to search.
	     * @param {Function|Object|string} [callback=identity] The function called per
	     *  iteration. If a property name or object is provided it will be used to
	     *  create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
	     * @example
	     *
	     * var characters = {
	     *   'barney': {  'age': 36, 'blocked': true },
	     *   'fred': {    'age': 40, 'blocked': false },
	     *   'pebbles': { 'age': 1,  'blocked': true }
	     * };
	     *
	     * _.findLastKey(characters, function(chr) {
	     *   return chr.age < 40;
	     * });
	     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
	     *
	     * // using "_.where" callback shorthand
	     * _.findLastKey(characters, { 'age': 40 });
	     * // => 'fred'
	     *
	     * // using "_.pluck" callback shorthand
	     * _.findLastKey(characters, 'blocked');
	     * // => 'pebbles'
	     */
	    function findLastKey(object, callback, thisArg) {
	      var result;
	      callback = lodash.createCallback(callback, thisArg, 3);
	      forOwnRight(object, function(value, key, object) {
	        if (callback(value, key, object)) {
	          result = key;
	          return false;
	        }
	      });
	      return result;
	    }

	    /**
	     * Iterates over own and inherited enumerable properties of an object,
	     * executing the callback for each property. The callback is bound to `thisArg`
	     * and invoked with three arguments; (value, key, object). Callbacks may exit
	     * iteration early by explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @type Function
	     * @category Objects
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * function Shape() {
	     *   this.x = 0;
	     *   this.y = 0;
	     * }
	     *
	     * Shape.prototype.move = function(x, y) {
	     *   this.x += x;
	     *   this.y += y;
	     * };
	     *
	     * _.forIn(new Shape, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
	     */
	    var forIn = createIterator(eachIteratorOptions, forOwnIteratorOptions, {
	      'useHas': false
	    });

	    /**
	     * This method is like `_.forIn` except that it iterates over elements
	     * of a `collection` in the opposite order.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * function Shape() {
	     *   this.x = 0;
	     *   this.y = 0;
	     * }
	     *
	     * Shape.prototype.move = function(x, y) {
	     *   this.x += x;
	     *   this.y += y;
	     * };
	     *
	     * _.forInRight(new Shape, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
	     */
	    function forInRight(object, callback, thisArg) {
	      var pairs = [];

	      forIn(object, function(value, key) {
	        pairs.push(key, value);
	      });

	      var length = pairs.length;
	      callback = baseCreateCallback(callback, thisArg, 3);
	      while (length--) {
	        if (callback(pairs[length--], pairs[length], object) === false) {
	          break;
	        }
	      }
	      return object;
	    }

	    /**
	     * Iterates over own enumerable properties of an object, executing the callback
	     * for each property. The callback is bound to `thisArg` and invoked with three
	     * arguments; (value, key, object). Callbacks may exit iteration early by
	     * explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @type Function
	     * @category Objects
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
	     *   console.log(key);
	     * });
	     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
	     */
	    var forOwn = createIterator(eachIteratorOptions, forOwnIteratorOptions);

	    /**
	     * This method is like `_.forOwn` except that it iterates over elements
	     * of a `collection` in the opposite order.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
	     *   console.log(key);
	     * });
	     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
	     */
	    function forOwnRight(object, callback, thisArg) {
	      var props = keys(object),
	          length = props.length;

	      callback = baseCreateCallback(callback, thisArg, 3);
	      while (length--) {
	        var key = props[length];
	        if (callback(object[key], key, object) === false) {
	          break;
	        }
	      }
	      return object;
	    }

	    /**
	     * Creates a sorted array of property names of all enumerable properties,
	     * own and inherited, of `object` that have function values.
	     *
	     * @static
	     * @memberOf _
	     * @alias methods
	     * @category Objects
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns an array of property names that have function values.
	     * @example
	     *
	     * _.functions(_);
	     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
	     */
	    function functions(object) {
	      var result = [];
	      forIn(object, function(value, key) {
	        if (isFunction(value)) {
	          result.push(key);
	        }
	      });
	      return result.sort();
	    }

	    /**
	     * Checks if the specified property name exists as a direct property of `object`,
	     * instead of an inherited property.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to inspect.
	     * @param {string} key The name of the property to check.
	     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
	     * @example
	     *
	     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
	     * // => true
	     */
	    function has(object, key) {
	      return object ? hasOwnProperty.call(object, key) : false;
	    }

	    /**
	     * Creates an object composed of the inverted keys and values of the given object.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to invert.
	     * @returns {Object} Returns the created inverted object.
	     * @example
	     *
	     * _.invert({ 'first': 'fred', 'second': 'barney' });
	     * // => { 'fred': 'first', 'barney': 'second' }
	     */
	    function invert(object) {
	      var index = -1,
	          props = keys(object),
	          length = props.length,
	          result = {};

	      while (++index < length) {
	        var key = props[index];
	        result[object[key]] = key;
	      }
	      return result;
	    }

	    /**
	     * Checks if `value` is a boolean value.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
	     * @example
	     *
	     * _.isBoolean(null);
	     * // => false
	     */
	    function isBoolean(value) {
	      return value === true || value === false ||
	        value && typeof value == 'object' && toString.call(value) == boolClass || false;
	    }

	    /**
	     * Checks if `value` is a date.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
	     * @example
	     *
	     * _.isDate(new Date);
	     * // => true
	     */
	    function isDate(value) {
	      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
	    }

	    /**
	     * Checks if `value` is a DOM element.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
	     * @example
	     *
	     * _.isElement(document.body);
	     * // => true
	     */
	    function isElement(value) {
	      return value && value.nodeType === 1 || false;
	    }

	    /**
	     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
	     * length of `0` and objects with no own enumerable properties are considered
	     * "empty".
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Array|Object|string} value The value to inspect.
	     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
	     * @example
	     *
	     * _.isEmpty([1, 2, 3]);
	     * // => false
	     *
	     * _.isEmpty({});
	     * // => true
	     *
	     * _.isEmpty('');
	     * // => true
	     */
	    function isEmpty(value) {
	      var result = true;
	      if (!value) {
	        return result;
	      }
	      var className = toString.call(value),
	          length = value.length;

	      if ((className == arrayClass || className == stringClass ||
	          (support.argsClass ? className == argsClass : isArguments(value))) ||
	          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
	        return !length;
	      }
	      forOwn(value, function() {
	        return (result = false);
	      });
	      return result;
	    }

	    /**
	     * Performs a deep comparison between two values to determine if they are
	     * equivalent to each other. If a callback is provided it will be executed
	     * to compare values. If the callback returns `undefined` comparisons will
	     * be handled by the method instead. The callback is bound to `thisArg` and
	     * invoked with two arguments; (a, b).
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} a The value to compare.
	     * @param {*} b The other value to compare.
	     * @param {Function} [callback] The function to customize comparing values.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	     * @example
	     *
	     * var object = { 'name': 'fred' };
	     * var copy = { 'name': 'fred' };
	     *
	     * object == copy;
	     * // => false
	     *
	     * _.isEqual(object, copy);
	     * // => true
	     *
	     * var words = ['hello', 'goodbye'];
	     * var otherWords = ['hi', 'goodbye'];
	     *
	     * _.isEqual(words, otherWords, function(a, b) {
	     *   var reGreet = /^(?:hello|hi)$/i,
	     *       aGreet = _.isString(a) && reGreet.test(a),
	     *       bGreet = _.isString(b) && reGreet.test(b);
	     *
	     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
	     * });
	     * // => true
	     */
	    function isEqual(a, b, callback, thisArg) {
	      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
	    }

	    /**
	     * Checks if `value` is, or can be coerced to, a finite number.
	     *
	     * Note: This is not the same as native `isFinite` which will return true for
	     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
	     * @example
	     *
	     * _.isFinite(-101);
	     * // => true
	     *
	     * _.isFinite('10');
	     * // => true
	     *
	     * _.isFinite(true);
	     * // => false
	     *
	     * _.isFinite('');
	     * // => false
	     *
	     * _.isFinite(Infinity);
	     * // => false
	     */
	    function isFinite(value) {
	      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
	    }

	    /**
	     * Checks if `value` is a function.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
	     * @example
	     *
	     * _.isFunction(_);
	     * // => true
	     */
	    function isFunction(value) {
	      return typeof value == 'function';
	    }
	    // fallback for older versions of Chrome and Safari
	    if (isFunction(/x/)) {
	      isFunction = function(value) {
	        return typeof value == 'function' && toString.call(value) == funcClass;
	      };
	    }

	    /**
	     * Checks if `value` is the language type of Object.
	     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
	     * @example
	     *
	     * _.isObject({});
	     * // => true
	     *
	     * _.isObject([1, 2, 3]);
	     * // => true
	     *
	     * _.isObject(1);
	     * // => false
	     */
	    function isObject(value) {
	      // check if the value is the ECMAScript language type of Object
	      // http://es5.github.io/#x8
	      // and avoid a V8 bug
	      // http://code.google.com/p/v8/issues/detail?id=2291
	      return !!(value && objectTypes[typeof value]);
	    }

	    /**
	     * Checks if `value` is `NaN`.
	     *
	     * Note: This is not the same as native `isNaN` which will return `true` for
	     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
	     * @example
	     *
	     * _.isNaN(NaN);
	     * // => true
	     *
	     * _.isNaN(new Number(NaN));
	     * // => true
	     *
	     * isNaN(undefined);
	     * // => true
	     *
	     * _.isNaN(undefined);
	     * // => false
	     */
	    function isNaN(value) {
	      // `NaN` as a primitive is the only value that is not equal to itself
	      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
	      return isNumber(value) && value != +value;
	    }

	    /**
	     * Checks if `value` is `null`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
	     * @example
	     *
	     * _.isNull(null);
	     * // => true
	     *
	     * _.isNull(undefined);
	     * // => false
	     */
	    function isNull(value) {
	      return value === null;
	    }

	    /**
	     * Checks if `value` is a number.
	     *
	     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
	     * @example
	     *
	     * _.isNumber(8.4 * 5);
	     * // => true
	     */
	    function isNumber(value) {
	      return typeof value == 'number' ||
	        value && typeof value == 'object' && toString.call(value) == numberClass || false;
	    }

	    /**
	     * Checks if `value` is an object created by the `Object` constructor.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	     * @example
	     *
	     * function Shape() {
	     *   this.x = 0;
	     *   this.y = 0;
	     * }
	     *
	     * _.isPlainObject(new Shape);
	     * // => false
	     *
	     * _.isPlainObject([1, 2, 3]);
	     * // => false
	     *
	     * _.isPlainObject({ 'x': 0, 'y': 0 });
	     * // => true
	     */
	    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
	      if (!(value && toString.call(value) == objectClass) || (!support.argsClass && isArguments(value))) {
	        return false;
	      }
	      var valueOf = value.valueOf,
	          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

	      return objProto
	        ? (value == objProto || getPrototypeOf(value) == objProto)
	        : shimIsPlainObject(value);
	    };

	    /**
	     * Checks if `value` is a regular expression.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
	     * @example
	     *
	     * _.isRegExp(/fred/);
	     * // => true
	     */
	    function isRegExp(value) {
	      return value && objectTypes[typeof value] && toString.call(value) == regexpClass || false;
	    }

	    /**
	     * Checks if `value` is a string.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
	     * @example
	     *
	     * _.isString('fred');
	     * // => true
	     */
	    function isString(value) {
	      return typeof value == 'string' ||
	        value && typeof value == 'object' && toString.call(value) == stringClass || false;
	    }

	    /**
	     * Checks if `value` is `undefined`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
	     * @example
	     *
	     * _.isUndefined(void 0);
	     * // => true
	     */
	    function isUndefined(value) {
	      return typeof value == 'undefined';
	    }

	    /**
	     * Creates an object with the same keys as `object` and values generated by
	     * running each own enumerable property of `object` through the callback.
	     * The callback is bound to `thisArg` and invoked with three arguments;
	     * (value, key, object).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
	     * @example
	     *
	     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
	     * // => { 'a': 3, 'b': 6, 'c': 9 }
	     *
	     * var characters = {
	     *   'fred': { 'name': 'fred', 'age': 40 },
	     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
	     * };
	     *
	     * // using "_.pluck" callback shorthand
	     * _.mapValues(characters, 'age');
	     * // => { 'fred': 40, 'pebbles': 1 }
	     */
	    function mapValues(object, callback, thisArg) {
	      var result = {};
	      callback = lodash.createCallback(callback, thisArg, 3);

	      forOwn(object, function(value, key, object) {
	        result[key] = callback(value, key, object);
	      });
	      return result;
	    }

	    /**
	     * Recursively merges own enumerable properties of the source object(s), that
	     * don't resolve to `undefined` into the destination object. Subsequent sources
	     * will overwrite property assignments of previous sources. If a callback is
	     * provided it will be executed to produce the merged values of the destination
	     * and source properties. If the callback returns `undefined` merging will
	     * be handled by the method instead. The callback is bound to `thisArg` and
	     * invoked with two arguments; (objectValue, sourceValue).
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The destination object.
	     * @param {...Object} [source] The source objects.
	     * @param {Function} [callback] The function to customize merging properties.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns the destination object.
	     * @example
	     *
	     * var names = {
	     *   'characters': [
	     *     { 'name': 'barney' },
	     *     { 'name': 'fred' }
	     *   ]
	     * };
	     *
	     * var ages = {
	     *   'characters': [
	     *     { 'age': 36 },
	     *     { 'age': 40 }
	     *   ]
	     * };
	     *
	     * _.merge(names, ages);
	     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
	     *
	     * var food = {
	     *   'fruits': ['apple'],
	     *   'vegetables': ['beet']
	     * };
	     *
	     * var otherFood = {
	     *   'fruits': ['banana'],
	     *   'vegetables': ['carrot']
	     * };
	     *
	     * _.merge(food, otherFood, function(a, b) {
	     *   return _.isArray(a) ? a.concat(b) : undefined;
	     * });
	     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
	     */
	    function merge(object) {
	      var args = arguments,
	          length = 2;

	      if (!isObject(object)) {
	        return object;
	      }
	      // allows working with `_.reduce` and `_.reduceRight` without using
	      // their `index` and `collection` arguments
	      if (typeof args[2] != 'number') {
	        length = args.length;
	      }
	      if (length > 3 && typeof args[length - 2] == 'function') {
	        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
	      } else if (length > 2 && typeof args[length - 1] == 'function') {
	        callback = args[--length];
	      }
	      var sources = slice(arguments, 1, length),
	          index = -1,
	          stackA = getArray(),
	          stackB = getArray();

	      while (++index < length) {
	        baseMerge(object, sources[index], callback, stackA, stackB);
	      }
	      releaseArray(stackA);
	      releaseArray(stackB);
	      return object;
	    }

	    /**
	     * Creates a shallow clone of `object` excluding the specified properties.
	     * Property names may be specified as individual arguments or as arrays of
	     * property names. If a callback is provided it will be executed for each
	     * property of `object` omitting the properties the callback returns truey
	     * for. The callback is bound to `thisArg` and invoked with three arguments;
	     * (value, key, object).
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The source object.
	     * @param {Function|...string|string[]} [callback] The properties to omit or the
	     *  function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns an object without the omitted properties.
	     * @example
	     *
	     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
	     * // => { 'name': 'fred' }
	     *
	     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
	     *   return typeof value == 'number';
	     * });
	     * // => { 'name': 'fred' }
	     */
	    function omit(object, callback, thisArg) {
	      var result = {};
	      if (typeof callback != 'function') {
	        var props = [];
	        forIn(object, function(value, key) {
	          props.push(key);
	        });
	        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

	        var index = -1,
	            length = props.length;

	        while (++index < length) {
	          var key = props[index];
	          result[key] = object[key];
	        }
	      } else {
	        callback = lodash.createCallback(callback, thisArg, 3);
	        forIn(object, function(value, key, object) {
	          if (!callback(value, key, object)) {
	            result[key] = value;
	          }
	        });
	      }
	      return result;
	    }

	    /**
	     * Creates a two dimensional array of an object's key-value pairs,
	     * i.e. `[[key1, value1], [key2, value2]]`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns new array of key-value pairs.
	     * @example
	     *
	     * _.pairs({ 'barney': 36, 'fred': 40 });
	     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
	     */
	    function pairs(object) {
	      var index = -1,
	          props = keys(object),
	          length = props.length,
	          result = Array(length);

	      while (++index < length) {
	        var key = props[index];
	        result[index] = [key, object[key]];
	      }
	      return result;
	    }

	    /**
	     * Creates a shallow clone of `object` composed of the specified properties.
	     * Property names may be specified as individual arguments or as arrays of
	     * property names. If a callback is provided it will be executed for each
	     * property of `object` picking the properties the callback returns truey
	     * for. The callback is bound to `thisArg` and invoked with three arguments;
	     * (value, key, object).
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The source object.
	     * @param {Function|...string|string[]} [callback] The function called per
	     *  iteration or property names to pick, specified as individual property
	     *  names or arrays of property names.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns an object composed of the picked properties.
	     * @example
	     *
	     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
	     * // => { 'name': 'fred' }
	     *
	     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
	     *   return key.charAt(0) != '_';
	     * });
	     * // => { 'name': 'fred' }
	     */
	    function pick(object, callback, thisArg) {
	      var result = {};
	      if (typeof callback != 'function') {
	        var index = -1,
	            props = baseFlatten(arguments, true, false, 1),
	            length = isObject(object) ? props.length : 0;

	        while (++index < length) {
	          var key = props[index];
	          if (key in object) {
	            result[key] = object[key];
	          }
	        }
	      } else {
	        callback = lodash.createCallback(callback, thisArg, 3);
	        forIn(object, function(value, key, object) {
	          if (callback(value, key, object)) {
	            result[key] = value;
	          }
	        });
	      }
	      return result;
	    }

	    /**
	     * An alternative to `_.reduce` this method transforms `object` to a new
	     * `accumulator` object which is the result of running each of its own
	     * enumerable properties through a callback, with each callback execution
	     * potentially mutating the `accumulator` object. The callback is bound to
	     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
	     * Callbacks may exit iteration early by explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Array|Object} object The object to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [accumulator] The custom accumulator value.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the accumulated value.
	     * @example
	     *
	     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
	     *   num *= num;
	     *   if (num % 2) {
	     *     return result.push(num) < 3;
	     *   }
	     * });
	     * // => [1, 9, 25]
	     *
	     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
	     *   result[key] = num * 3;
	     * });
	     * // => { 'a': 3, 'b': 6, 'c': 9 }
	     */
	    function transform(object, callback, accumulator, thisArg) {
	      var isArr = isArray(object);
	      if (accumulator == null) {
	        if (isArr) {
	          accumulator = [];
	        } else {
	          var ctor = object && object.constructor,
	              proto = ctor && ctor.prototype;

	          accumulator = baseCreate(proto);
	        }
	      }
	      if (callback) {
	        callback = lodash.createCallback(callback, thisArg, 4);
	        (isArr ? baseEach : forOwn)(object, function(value, index, object) {
	          return callback(accumulator, value, index, object);
	        });
	      }
	      return accumulator;
	    }

	    /**
	     * Creates an array composed of the own enumerable property values of `object`.
	     *
	     * @static
	     * @memberOf _
	     * @category Objects
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns an array of property values.
	     * @example
	     *
	     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
	     * // => [1, 2, 3] (property order is not guaranteed across environments)
	     */
	    function values(object) {
	      var index = -1,
	          props = keys(object),
	          length = props.length,
	          result = Array(length);

	      while (++index < length) {
	        result[index] = object[props[index]];
	      }
	      return result;
	    }

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Creates an array of elements from the specified indexes, or keys, of the
	     * `collection`. Indexes may be specified as individual arguments or as arrays
	     * of indexes.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
	     *   to retrieve, specified as individual indexes or arrays of indexes.
	     * @returns {Array} Returns a new array of elements corresponding to the
	     *  provided indexes.
	     * @example
	     *
	     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
	     * // => ['a', 'c', 'e']
	     *
	     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
	     * // => ['fred', 'pebbles']
	     */
	    function at(collection) {
	      var args = arguments,
	          index = -1,
	          props = baseFlatten(args, true, false, 1),
	          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
	          result = Array(length);

	      if (support.unindexedChars && isString(collection)) {
	        collection = collection.split('');
	      }
	      while(++index < length) {
	        result[index] = collection[props[index]];
	      }
	      return result;
	    }

	    /**
	     * Checks if a given value is present in a collection using strict equality
	     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
	     * offset from the end of the collection.
	     *
	     * @static
	     * @memberOf _
	     * @alias include
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {*} target The value to check for.
	     * @param {number} [fromIndex=0] The index to search from.
	     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
	     * @example
	     *
	     * _.contains([1, 2, 3], 1);
	     * // => true
	     *
	     * _.contains([1, 2, 3], 1, 2);
	     * // => false
	     *
	     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
	     * // => true
	     *
	     * _.contains('pebbles', 'eb');
	     * // => true
	     */
	    function contains(collection, target, fromIndex) {
	      var index = -1,
	          indexOf = getIndexOf(),
	          length = collection ? collection.length : 0,
	          result = false;

	      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
	      if (isArray(collection)) {
	        result = indexOf(collection, target, fromIndex) > -1;
	      } else if (typeof length == 'number') {
	        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
	      } else {
	        baseEach(collection, function(value) {
	          if (++index >= fromIndex) {
	            return !(result = value === target);
	          }
	        });
	      }
	      return result;
	    }

	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of `collection` through the callback. The corresponding value
	     * of each key is the number of times the key was returned by the callback.
	     * The callback is bound to `thisArg` and invoked with three arguments;
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
	     * // => { '4': 1, '6': 2 }
	     *
	     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
	     * // => { '4': 1, '6': 2 }
	     *
	     * _.countBy(['one', 'two', 'three'], 'length');
	     * // => { '3': 2, '5': 1 }
	     */
	    var countBy = createAggregator(function(result, value, key) {
	      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
	    });

	    /**
	     * Checks if the given callback returns truey value for **all** elements of
	     * a collection. The callback is bound to `thisArg` and invoked with three
	     * arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias all
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {boolean} Returns `true` if all elements passed the callback check,
	     *  else `false`.
	     * @example
	     *
	     * _.every([true, 1, null, 'yes']);
	     * // => false
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.every(characters, 'age');
	     * // => true
	     *
	     * // using "_.where" callback shorthand
	     * _.every(characters, { 'age': 36 });
	     * // => false
	     */
	    function every(collection, callback, thisArg) {
	      var result = true;
	      callback = lodash.createCallback(callback, thisArg, 3);

	      if (isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        while (++index < length) {
	          if (!(result = !!callback(collection[index], index, collection))) {
	            break;
	          }
	        }
	      } else {
	        baseEach(collection, function(value, index, collection) {
	          return (result = !!callback(value, index, collection));
	        });
	      }
	      return result;
	    }

	    /**
	     * Iterates over elements of a collection, returning an array of all elements
	     * the callback returns truey for. The callback is bound to `thisArg` and
	     * invoked with three arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias select
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a new array of elements that passed the callback check.
	     * @example
	     *
	     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
	     * // => [2, 4, 6]
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36, 'blocked': false },
	     *   { 'name': 'fred',   'age': 40, 'blocked': true }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.filter(characters, 'blocked');
	     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
	     *
	     * // using "_.where" callback shorthand
	     * _.filter(characters, { 'age': 36 });
	     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
	     */
	    function filter(collection, callback, thisArg) {
	      var result = [];
	      callback = lodash.createCallback(callback, thisArg, 3);

	      if (isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        while (++index < length) {
	          var value = collection[index];
	          if (callback(value, index, collection)) {
	            result.push(value);
	          }
	        }
	      } else {
	        baseEach(collection, function(value, index, collection) {
	          if (callback(value, index, collection)) {
	            result.push(value);
	          }
	        });
	      }
	      return result;
	    }

	    /**
	     * Iterates over elements of a collection, returning the first element that
	     * the callback returns truey for. The callback is bound to `thisArg` and
	     * invoked with three arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias detect, findWhere
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the found element, else `undefined`.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'age': 36, 'blocked': false },
	     *   { 'name': 'fred',    'age': 40, 'blocked': true },
	     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
	     * ];
	     *
	     * _.find(characters, function(chr) {
	     *   return chr.age < 40;
	     * });
	     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
	     *
	     * // using "_.where" callback shorthand
	     * _.find(characters, { 'age': 1 });
	     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
	     *
	     * // using "_.pluck" callback shorthand
	     * _.find(characters, 'blocked');
	     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
	     */
	    function find(collection, callback, thisArg) {
	      callback = lodash.createCallback(callback, thisArg, 3);

	      if (isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        while (++index < length) {
	          var value = collection[index];
	          if (callback(value, index, collection)) {
	            return value;
	          }
	        }
	      } else {
	        var result;
	        baseEach(collection, function(value, index, collection) {
	          if (callback(value, index, collection)) {
	            result = value;
	            return false;
	          }
	        });
	        return result;
	      }
	    }

	    /**
	     * This method is like `_.find` except that it iterates over elements
	     * of a `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the found element, else `undefined`.
	     * @example
	     *
	     * _.findLast([1, 2, 3, 4], function(num) {
	     *   return num % 2 == 1;
	     * });
	     * // => 3
	     */
	    function findLast(collection, callback, thisArg) {
	      var result;
	      callback = lodash.createCallback(callback, thisArg, 3);
	      forEachRight(collection, function(value, index, collection) {
	        if (callback(value, index, collection)) {
	          result = value;
	          return false;
	        }
	      });
	      return result;
	    }

	    /**
	     * Iterates over elements of a collection, executing the callback for each
	     * element. The callback is bound to `thisArg` and invoked with three arguments;
	     * (value, index|key, collection). Callbacks may exit iteration early by
	     * explicitly returning `false`.
	     *
	     * Note: As with other "Collections" methods, objects with a `length` property
	     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
	     * may be used for object iteration.
	     *
	     * @static
	     * @memberOf _
	     * @alias each
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array|Object|string} Returns `collection`.
	     * @example
	     *
	     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
	     * // => logs each number and returns '1,2,3'
	     *
	     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
	     * // => logs each number and returns the object (property order is not guaranteed across environments)
	     */
	    function forEach(collection, callback, thisArg) {
	      if (callback && typeof thisArg == 'undefined' && isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        while (++index < length) {
	          if (callback(collection[index], index, collection) === false) {
	            break;
	          }
	        }
	      } else {
	        baseEach(collection, callback, thisArg);
	      }
	      return collection;
	    }

	    /**
	     * This method is like `_.forEach` except that it iterates over elements
	     * of a `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @alias eachRight
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array|Object|string} Returns `collection`.
	     * @example
	     *
	     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
	     * // => logs each number from right to left and returns '3,2,1'
	     */
	    function forEachRight(collection, callback, thisArg) {
	      var iterable = collection,
	          length = collection ? collection.length : 0;

	      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
	      if (isArray(collection)) {
	        while (length--) {
	          if (callback(collection[length], length, collection) === false) {
	            break;
	          }
	        }
	      } else {
	        if (typeof length != 'number') {
	          var props = keys(collection);
	          length = props.length;
	        } else if (support.unindexedChars && isString(collection)) {
	          iterable = collection.split('');
	        }
	        baseEach(collection, function(value, key, collection) {
	          key = props ? props[--length] : --length;
	          return callback(iterable[key], key, collection);
	        });
	      }
	      return collection;
	    }

	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of a collection through the callback. The corresponding value
	     * of each key is an array of the elements responsible for generating the key.
	     * The callback is bound to `thisArg` and invoked with three arguments;
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
	     * // => { '4': [4.2], '6': [6.1, 6.4] }
	     *
	     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
	     * // => { '4': [4.2], '6': [6.1, 6.4] }
	     *
	     * // using "_.pluck" callback shorthand
	     * _.groupBy(['one', 'two', 'three'], 'length');
	     * // => { '3': ['one', 'two'], '5': ['three'] }
	     */
	    var groupBy = createAggregator(function(result, value, key) {
	      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
	    });

	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of the collection through the given callback. The corresponding
	     * value of each key is the last element responsible for generating the key.
	     * The callback is bound to `thisArg` and invoked with three arguments;
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * var keys = [
	     *   { 'dir': 'left', 'code': 97 },
	     *   { 'dir': 'right', 'code': 100 }
	     * ];
	     *
	     * _.indexBy(keys, 'dir');
	     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
	     *
	     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
	     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
	     *
	     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
	     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
	     */
	    var indexBy = createAggregator(function(result, value, key) {
	      result[key] = value;
	    });

	    /**
	     * Invokes the method named by `methodName` on each element in the `collection`
	     * returning an array of the results of each invoked method. Additional arguments
	     * will be provided to each invoked method. If `methodName` is a function it
	     * will be invoked for, and `this` bound to, each element in the `collection`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|string} methodName The name of the method to invoke or
	     *  the function invoked per iteration.
	     * @param {...*} [arg] Arguments to invoke the method with.
	     * @returns {Array} Returns a new array of the results of each invoked method.
	     * @example
	     *
	     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
	     * // => [[1, 5, 7], [1, 2, 3]]
	     *
	     * _.invoke([123, 456], String.prototype.split, '');
	     * // => [['1', '2', '3'], ['4', '5', '6']]
	     */
	    function invoke(collection, methodName) {
	      var args = slice(arguments, 2),
	          index = -1,
	          isFunc = typeof methodName == 'function',
	          length = collection ? collection.length : 0,
	          result = Array(typeof length == 'number' ? length : 0);

	      forEach(collection, function(value) {
	        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
	      });
	      return result;
	    }

	    /**
	     * Creates an array of values by running each element in the collection
	     * through the callback. The callback is bound to `thisArg` and invoked with
	     * three arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias collect
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a new array of the results of each `callback` execution.
	     * @example
	     *
	     * _.map([1, 2, 3], function(num) { return num * 3; });
	     * // => [3, 6, 9]
	     *
	     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
	     * // => [3, 6, 9] (property order is not guaranteed across environments)
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.map(characters, 'name');
	     * // => ['barney', 'fred']
	     */
	    function map(collection, callback, thisArg) {
	      var index = -1,
	          length = collection ? collection.length : 0,
	          result = Array(typeof length == 'number' ? length : 0);

	      callback = lodash.createCallback(callback, thisArg, 3);
	      if (isArray(collection)) {
	        while (++index < length) {
	          result[index] = callback(collection[index], index, collection);
	        }
	      } else {
	        baseEach(collection, function(value, key, collection) {
	          result[++index] = callback(value, key, collection);
	        });
	      }
	      return result;
	    }

	    /**
	     * Retrieves the maximum value of a collection. If the collection is empty or
	     * falsey `-Infinity` is returned. If a callback is provided it will be executed
	     * for each value in the collection to generate the criterion by which the value
	     * is ranked. The callback is bound to `thisArg` and invoked with three
	     * arguments; (value, index, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the maximum value.
	     * @example
	     *
	     * _.max([4, 2, 8, 6]);
	     * // => 8
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * _.max(characters, function(chr) { return chr.age; });
	     * // => { 'name': 'fred', 'age': 40 };
	     *
	     * // using "_.pluck" callback shorthand
	     * _.max(characters, 'age');
	     * // => { 'name': 'fred', 'age': 40 };
	     */
	    function max(collection, callback, thisArg) {
	      var computed = -Infinity,
	          result = computed;

	      // allows working with functions like `_.map` without using
	      // their `index` argument as a callback
	      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
	        callback = null;
	      }
	      if (callback == null && isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        while (++index < length) {
	          var value = collection[index];
	          if (value > result) {
	            result = value;
	          }
	        }
	      } else {
	        callback = (callback == null && isString(collection))
	          ? charAtCallback
	          : lodash.createCallback(callback, thisArg, 3);

	        baseEach(collection, function(value, index, collection) {
	          var current = callback(value, index, collection);
	          if (current > computed) {
	            computed = current;
	            result = value;
	          }
	        });
	      }
	      return result;
	    }

	    /**
	     * Retrieves the minimum value of a collection. If the collection is empty or
	     * falsey `Infinity` is returned. If a callback is provided it will be executed
	     * for each value in the collection to generate the criterion by which the value
	     * is ranked. The callback is bound to `thisArg` and invoked with three
	     * arguments; (value, index, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the minimum value.
	     * @example
	     *
	     * _.min([4, 2, 8, 6]);
	     * // => 2
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * _.min(characters, function(chr) { return chr.age; });
	     * // => { 'name': 'barney', 'age': 36 };
	     *
	     * // using "_.pluck" callback shorthand
	     * _.min(characters, 'age');
	     * // => { 'name': 'barney', 'age': 36 };
	     */
	    function min(collection, callback, thisArg) {
	      var computed = Infinity,
	          result = computed;

	      // allows working with functions like `_.map` without using
	      // their `index` argument as a callback
	      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
	        callback = null;
	      }
	      if (callback == null && isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        while (++index < length) {
	          var value = collection[index];
	          if (value < result) {
	            result = value;
	          }
	        }
	      } else {
	        callback = (callback == null && isString(collection))
	          ? charAtCallback
	          : lodash.createCallback(callback, thisArg, 3);

	        baseEach(collection, function(value, index, collection) {
	          var current = callback(value, index, collection);
	          if (current < computed) {
	            computed = current;
	            result = value;
	          }
	        });
	      }
	      return result;
	    }

	    /**
	     * Retrieves the value of a specified property from all elements in the collection.
	     *
	     * @static
	     * @memberOf _
	     * @type Function
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {string} property The name of the property to pluck.
	     * @returns {Array} Returns a new array of property values.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * _.pluck(characters, 'name');
	     * // => ['barney', 'fred']
	     */
	    var pluck = map;

	    /**
	     * Reduces a collection to a value which is the accumulated result of running
	     * each element in the collection through the callback, where each successive
	     * callback execution consumes the return value of the previous execution. If
	     * `accumulator` is not provided the first element of the collection will be
	     * used as the initial `accumulator` value. The callback is bound to `thisArg`
	     * and invoked with four arguments; (accumulator, value, index|key, collection).
	     *
	     * @static
	     * @memberOf _
	     * @alias foldl, inject
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [accumulator] Initial value of the accumulator.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the accumulated value.
	     * @example
	     *
	     * var sum = _.reduce([1, 2, 3], function(sum, num) {
	     *   return sum + num;
	     * });
	     * // => 6
	     *
	     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
	     *   result[key] = num * 3;
	     *   return result;
	     * }, {});
	     * // => { 'a': 3, 'b': 6, 'c': 9 }
	     */
	    function reduce(collection, callback, accumulator, thisArg) {
	      var noaccum = arguments.length < 3;
	      callback = lodash.createCallback(callback, thisArg, 4);

	      if (isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        if (noaccum) {
	          accumulator = collection[++index];
	        }
	        while (++index < length) {
	          accumulator = callback(accumulator, collection[index], index, collection);
	        }
	      } else {
	        baseEach(collection, function(value, index, collection) {
	          accumulator = noaccum
	            ? (noaccum = false, value)
	            : callback(accumulator, value, index, collection)
	        });
	      }
	      return accumulator;
	    }

	    /**
	     * This method is like `_.reduce` except that it iterates over elements
	     * of a `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @alias foldr
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [callback=identity] The function called per iteration.
	     * @param {*} [accumulator] Initial value of the accumulator.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the accumulated value.
	     * @example
	     *
	     * var list = [[0, 1], [2, 3], [4, 5]];
	     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
	     * // => [4, 5, 2, 3, 0, 1]
	     */
	    function reduceRight(collection, callback, accumulator, thisArg) {
	      var noaccum = arguments.length < 3;
	      callback = lodash.createCallback(callback, thisArg, 4);
	      forEachRight(collection, function(value, index, collection) {
	        accumulator = noaccum
	          ? (noaccum = false, value)
	          : callback(accumulator, value, index, collection);
	      });
	      return accumulator;
	    }

	    /**
	     * The opposite of `_.filter` this method returns the elements of a
	     * collection that the callback does **not** return truey for.
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a new array of elements that failed the callback check.
	     * @example
	     *
	     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
	     * // => [1, 3, 5]
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36, 'blocked': false },
	     *   { 'name': 'fred',   'age': 40, 'blocked': true }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.reject(characters, 'blocked');
	     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
	     *
	     * // using "_.where" callback shorthand
	     * _.reject(characters, { 'age': 36 });
	     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
	     */
	    function reject(collection, callback, thisArg) {
	      callback = lodash.createCallback(callback, thisArg, 3);
	      return filter(collection, function(value, index, collection) {
	        return !callback(value, index, collection);
	      });
	    }

	    /**
	     * Retrieves a random element or `n` random elements from a collection.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to sample.
	     * @param {number} [n] The number of elements to sample.
	     * @param- {Object} [guard] Allows working with functions like `_.map`
	     *  without using their `index` arguments as `n`.
	     * @returns {Array} Returns the random sample(s) of `collection`.
	     * @example
	     *
	     * _.sample([1, 2, 3, 4]);
	     * // => 2
	     *
	     * _.sample([1, 2, 3, 4], 2);
	     * // => [3, 1]
	     */
	    function sample(collection, n, guard) {
	      if (collection && typeof collection.length != 'number') {
	        collection = values(collection);
	      } else if (support.unindexedChars && isString(collection)) {
	        collection = collection.split('');
	      }
	      if (n == null || guard) {
	        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
	      }
	      var result = shuffle(collection);
	      result.length = nativeMin(nativeMax(0, n), result.length);
	      return result;
	    }

	    /**
	     * Creates an array of shuffled values, using a version of the Fisher-Yates
	     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to shuffle.
	     * @returns {Array} Returns a new shuffled collection.
	     * @example
	     *
	     * _.shuffle([1, 2, 3, 4, 5, 6]);
	     * // => [4, 1, 6, 3, 5, 2]
	     */
	    function shuffle(collection) {
	      var index = -1,
	          length = collection ? collection.length : 0,
	          result = Array(typeof length == 'number' ? length : 0);

	      forEach(collection, function(value) {
	        var rand = baseRandom(0, ++index);
	        result[index] = result[rand];
	        result[rand] = value;
	      });
	      return result;
	    }

	    /**
	     * Gets the size of the `collection` by returning `collection.length` for arrays
	     * and array-like objects or the number of own enumerable properties for objects.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to inspect.
	     * @returns {number} Returns `collection.length` or number of own enumerable properties.
	     * @example
	     *
	     * _.size([1, 2]);
	     * // => 2
	     *
	     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
	     * // => 3
	     *
	     * _.size('pebbles');
	     * // => 7
	     */
	    function size(collection) {
	      var length = collection ? collection.length : 0;
	      return typeof length == 'number' ? length : keys(collection).length;
	    }

	    /**
	     * Checks if the callback returns a truey value for **any** element of a
	     * collection. The function returns as soon as it finds a passing value and
	     * does not iterate over the entire collection. The callback is bound to
	     * `thisArg` and invoked with three arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias any
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {boolean} Returns `true` if any element passed the callback check,
	     *  else `false`.
	     * @example
	     *
	     * _.some([null, 0, 'yes', false], Boolean);
	     * // => true
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36, 'blocked': false },
	     *   { 'name': 'fred',   'age': 40, 'blocked': true }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.some(characters, 'blocked');
	     * // => true
	     *
	     * // using "_.where" callback shorthand
	     * _.some(characters, { 'age': 1 });
	     * // => false
	     */
	    function some(collection, callback, thisArg) {
	      var result;
	      callback = lodash.createCallback(callback, thisArg, 3);

	      if (isArray(collection)) {
	        var index = -1,
	            length = collection.length;

	        while (++index < length) {
	          if ((result = callback(collection[index], index, collection))) {
	            break;
	          }
	        }
	      } else {
	        baseEach(collection, function(value, index, collection) {
	          return !(result = callback(value, index, collection));
	        });
	      }
	      return !!result;
	    }

	    /**
	     * Creates an array of elements, sorted in ascending order by the results of
	     * running each element in a collection through the callback. This method
	     * performs a stable sort, that is, it will preserve the original sort order
	     * of equal elements. The callback is bound to `thisArg` and invoked with
	     * three arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an array of property names is provided for `callback` the collection
	     * will be sorted by each property value.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Array|Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a new array of sorted elements.
	     * @example
	     *
	     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
	     * // => [3, 1, 2]
	     *
	     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
	     * // => [3, 1, 2]
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'age': 36 },
	     *   { 'name': 'fred',    'age': 40 },
	     *   { 'name': 'barney',  'age': 26 },
	     *   { 'name': 'fred',    'age': 30 }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.map(_.sortBy(characters, 'age'), _.values);
	     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
	     *
	     * // sorting by multiple properties
	     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
	     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
	     */
	    function sortBy(collection, callback, thisArg) {
	      var index = -1,
	          isArr = isArray(callback),
	          length = collection ? collection.length : 0,
	          result = Array(typeof length == 'number' ? length : 0);

	      if (!isArr) {
	        callback = lodash.createCallback(callback, thisArg, 3);
	      }
	      forEach(collection, function(value, key, collection) {
	        var object = result[++index] = getObject();
	        if (isArr) {
	          object.criteria = map(callback, function(key) { return value[key]; });
	        } else {
	          (object.criteria = getArray())[0] = callback(value, key, collection);
	        }
	        object.index = index;
	        object.value = value;
	      });

	      length = result.length;
	      result.sort(compareAscending);
	      while (length--) {
	        var object = result[length];
	        result[length] = object.value;
	        if (!isArr) {
	          releaseArray(object.criteria);
	        }
	        releaseObject(object);
	      }
	      return result;
	    }

	    /**
	     * Converts the `collection` to an array.
	     *
	     * @static
	     * @memberOf _
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to convert.
	     * @returns {Array} Returns the new converted array.
	     * @example
	     *
	     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
	     * // => [2, 3, 4]
	     */
	    function toArray(collection) {
	      if (collection && typeof collection.length == 'number') {
	        return (support.unindexedChars && isString(collection))
	          ? collection.split('')
	          : slice(collection);
	      }
	      return values(collection);
	    }

	    /**
	     * Performs a deep comparison of each element in a `collection` to the given
	     * `properties` object, returning an array of all elements that have equivalent
	     * property values.
	     *
	     * @static
	     * @memberOf _
	     * @type Function
	     * @category Collections
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Object} props The object of property values to filter by.
	     * @returns {Array} Returns a new array of elements that have the given properties.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
	     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
	     * ];
	     *
	     * _.where(characters, { 'age': 36 });
	     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
	     *
	     * _.where(characters, { 'pets': ['dino'] });
	     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
	     */
	    var where = filter;

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Creates an array with all falsey values removed. The values `false`, `null`,
	     * `0`, `""`, `undefined`, and `NaN` are all falsey.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to compact.
	     * @returns {Array} Returns a new array of filtered values.
	     * @example
	     *
	     * _.compact([0, 1, false, 2, '', 3]);
	     * // => [1, 2, 3]
	     */
	    function compact(array) {
	      var index = -1,
	          length = array ? array.length : 0,
	          result = [];

	      while (++index < length) {
	        var value = array[index];
	        if (value) {
	          result.push(value);
	        }
	      }
	      return result;
	    }

	    /**
	     * Creates an array excluding all values of the provided arrays using strict
	     * equality for comparisons, i.e. `===`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to process.
	     * @param {...Array} [values] The arrays of values to exclude.
	     * @returns {Array} Returns a new array of filtered values.
	     * @example
	     *
	     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
	     * // => [1, 3, 4]
	     */
	    function difference(array) {
	      return baseDifference(array, baseFlatten(arguments, true, true, 1));
	    }

	    /**
	     * This method is like `_.find` except that it returns the index of the first
	     * element that passes the callback check, instead of the element itself.
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to search.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {number} Returns the index of the found element, else `-1`.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'age': 36, 'blocked': false },
	     *   { 'name': 'fred',    'age': 40, 'blocked': true },
	     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
	     * ];
	     *
	     * _.findIndex(characters, function(chr) {
	     *   return chr.age < 20;
	     * });
	     * // => 2
	     *
	     * // using "_.where" callback shorthand
	     * _.findIndex(characters, { 'age': 36 });
	     * // => 0
	     *
	     * // using "_.pluck" callback shorthand
	     * _.findIndex(characters, 'blocked');
	     * // => 1
	     */
	    function findIndex(array, callback, thisArg) {
	      var index = -1,
	          length = array ? array.length : 0;

	      callback = lodash.createCallback(callback, thisArg, 3);
	      while (++index < length) {
	        if (callback(array[index], index, array)) {
	          return index;
	        }
	      }
	      return -1;
	    }

	    /**
	     * This method is like `_.findIndex` except that it iterates over elements
	     * of a `collection` from right to left.
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to search.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {number} Returns the index of the found element, else `-1`.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'age': 36, 'blocked': true },
	     *   { 'name': 'fred',    'age': 40, 'blocked': false },
	     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
	     * ];
	     *
	     * _.findLastIndex(characters, function(chr) {
	     *   return chr.age > 30;
	     * });
	     * // => 1
	     *
	     * // using "_.where" callback shorthand
	     * _.findLastIndex(characters, { 'age': 36 });
	     * // => 0
	     *
	     * // using "_.pluck" callback shorthand
	     * _.findLastIndex(characters, 'blocked');
	     * // => 2
	     */
	    function findLastIndex(array, callback, thisArg) {
	      var length = array ? array.length : 0;
	      callback = lodash.createCallback(callback, thisArg, 3);
	      while (length--) {
	        if (callback(array[length], length, array)) {
	          return length;
	        }
	      }
	      return -1;
	    }

	    /**
	     * Gets the first element or first `n` elements of an array. If a callback
	     * is provided elements at the beginning of the array are returned as long
	     * as the callback returns truey. The callback is bound to `thisArg` and
	     * invoked with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias head, take
	     * @category Arrays
	     * @param {Array} array The array to query.
	     * @param {Function|Object|number|string} [callback] The function called
	     *  per element or the number of elements to return. If a property name or
	     *  object is provided it will be used to create a "_.pluck" or "_.where"
	     *  style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the first element(s) of `array`.
	     * @example
	     *
	     * _.first([1, 2, 3]);
	     * // => 1
	     *
	     * _.first([1, 2, 3], 2);
	     * // => [1, 2]
	     *
	     * _.first([1, 2, 3], function(num) {
	     *   return num < 3;
	     * });
	     * // => [1, 2]
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
	     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
	     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.first(characters, 'blocked');
	     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
	     *
	     * // using "_.where" callback shorthand
	     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
	     * // => ['barney', 'fred']
	     */
	    function first(array, callback, thisArg) {
	      var n = 0,
	          length = array ? array.length : 0;

	      if (typeof callback != 'number' && callback != null) {
	        var index = -1;
	        callback = lodash.createCallback(callback, thisArg, 3);
	        while (++index < length && callback(array[index], index, array)) {
	          n++;
	        }
	      } else {
	        n = callback;
	        if (n == null || thisArg) {
	          return array ? array[0] : undefined;
	        }
	      }
	      return slice(array, 0, nativeMin(nativeMax(0, n), length));
	    }

	    /**
	     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
	     * is truey, the array will only be flattened a single level. If a callback
	     * is provided each element of the array is passed through the callback before
	     * flattening. The callback is bound to `thisArg` and invoked with three
	     * arguments; (value, index, array).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to flatten.
	     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a new flattened array.
	     * @example
	     *
	     * _.flatten([1, [2], [3, [[4]]]]);
	     * // => [1, 2, 3, 4];
	     *
	     * _.flatten([1, [2], [3, [[4]]]], true);
	     * // => [1, 2, 3, [[4]]];
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
	     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.flatten(characters, 'pets');
	     * // => ['hoppy', 'baby puss', 'dino']
	     */
	    function flatten(array, isShallow, callback, thisArg) {
	      // juggle arguments
	      if (typeof isShallow != 'boolean' && isShallow != null) {
	        thisArg = callback;
	        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
	        isShallow = false;
	      }
	      if (callback != null) {
	        array = map(array, callback, thisArg);
	      }
	      return baseFlatten(array, isShallow);
	    }

	    /**
	     * Gets the index at which the first occurrence of `value` is found using
	     * strict equality for comparisons, i.e. `===`. If the array is already sorted
	     * providing `true` for `fromIndex` will run a faster binary search.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to search.
	     * @param {*} value The value to search for.
	     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
	     *  to perform a binary search on a sorted array.
	     * @returns {number} Returns the index of the matched value or `-1`.
	     * @example
	     *
	     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
	     * // => 1
	     *
	     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
	     * // => 4
	     *
	     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
	     * // => 2
	     */
	    function indexOf(array, value, fromIndex) {
	      if (typeof fromIndex == 'number') {
	        var length = array ? array.length : 0;
	        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
	      } else if (fromIndex) {
	        var index = sortedIndex(array, value);
	        return array[index] === value ? index : -1;
	      }
	      return baseIndexOf(array, value, fromIndex);
	    }

	    /**
	     * Gets all but the last element or last `n` elements of an array. If a
	     * callback is provided elements at the end of the array are excluded from
	     * the result as long as the callback returns truey. The callback is bound
	     * to `thisArg` and invoked with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to query.
	     * @param {Function|Object|number|string} [callback=1] The function called
	     *  per element or the number of elements to exclude. If a property name or
	     *  object is provided it will be used to create a "_.pluck" or "_.where"
	     *  style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a slice of `array`.
	     * @example
	     *
	     * _.initial([1, 2, 3]);
	     * // => [1, 2]
	     *
	     * _.initial([1, 2, 3], 2);
	     * // => [1]
	     *
	     * _.initial([1, 2, 3], function(num) {
	     *   return num > 1;
	     * });
	     * // => [1]
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
	     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
	     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.initial(characters, 'blocked');
	     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
	     *
	     * // using "_.where" callback shorthand
	     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
	     * // => ['barney', 'fred']
	     */
	    function initial(array, callback, thisArg) {
	      var n = 0,
	          length = array ? array.length : 0;

	      if (typeof callback != 'number' && callback != null) {
	        var index = length;
	        callback = lodash.createCallback(callback, thisArg, 3);
	        while (index-- && callback(array[index], index, array)) {
	          n++;
	        }
	      } else {
	        n = (callback == null || thisArg) ? 1 : callback || n;
	      }
	      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
	    }

	    /**
	     * Creates an array of unique values present in all provided arrays using
	     * strict equality for comparisons, i.e. `===`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {...Array} [array] The arrays to inspect.
	     * @returns {Array} Returns an array of shared values.
	     * @example
	     *
	     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
	     * // => [1, 2]
	     */
	    function intersection() {
	      var args = [],
	          argsIndex = -1,
	          argsLength = arguments.length,
	          caches = getArray(),
	          indexOf = getIndexOf(),
	          trustIndexOf = indexOf === baseIndexOf,
	          seen = getArray();

	      while (++argsIndex < argsLength) {
	        var value = arguments[argsIndex];
	        if (isArray(value) || isArguments(value)) {
	          args.push(value);
	          caches.push(trustIndexOf && value.length >= largeArraySize &&
	            createCache(argsIndex ? args[argsIndex] : seen));
	        }
	      }
	      var array = args[0],
	          index = -1,
	          length = array ? array.length : 0,
	          result = [];

	      outer:
	      while (++index < length) {
	        var cache = caches[0];
	        value = array[index];

	        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
	          argsIndex = argsLength;
	          (cache || seen).push(value);
	          while (--argsIndex) {
	            cache = caches[argsIndex];
	            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
	              continue outer;
	            }
	          }
	          result.push(value);
	        }
	      }
	      while (argsLength--) {
	        cache = caches[argsLength];
	        if (cache) {
	          releaseObject(cache);
	        }
	      }
	      releaseArray(caches);
	      releaseArray(seen);
	      return result;
	    }

	    /**
	     * Gets the last element or last `n` elements of an array. If a callback is
	     * provided elements at the end of the array are returned as long as the
	     * callback returns truey. The callback is bound to `thisArg` and invoked
	     * with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to query.
	     * @param {Function|Object|number|string} [callback] The function called
	     *  per element or the number of elements to return. If a property name or
	     *  object is provided it will be used to create a "_.pluck" or "_.where"
	     *  style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {*} Returns the last element(s) of `array`.
	     * @example
	     *
	     * _.last([1, 2, 3]);
	     * // => 3
	     *
	     * _.last([1, 2, 3], 2);
	     * // => [2, 3]
	     *
	     * _.last([1, 2, 3], function(num) {
	     *   return num > 1;
	     * });
	     * // => [2, 3]
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
	     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
	     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.pluck(_.last(characters, 'blocked'), 'name');
	     * // => ['fred', 'pebbles']
	     *
	     * // using "_.where" callback shorthand
	     * _.last(characters, { 'employer': 'na' });
	     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
	     */
	    function last(array, callback, thisArg) {
	      var n = 0,
	          length = array ? array.length : 0;

	      if (typeof callback != 'number' && callback != null) {
	        var index = length;
	        callback = lodash.createCallback(callback, thisArg, 3);
	        while (index-- && callback(array[index], index, array)) {
	          n++;
	        }
	      } else {
	        n = callback;
	        if (n == null || thisArg) {
	          return array ? array[length - 1] : undefined;
	        }
	      }
	      return slice(array, nativeMax(0, length - n));
	    }

	    /**
	     * Gets the index at which the last occurrence of `value` is found using strict
	     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
	     * as the offset from the end of the collection.
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to search.
	     * @param {*} value The value to search for.
	     * @param {number} [fromIndex=array.length-1] The index to search from.
	     * @returns {number} Returns the index of the matched value or `-1`.
	     * @example
	     *
	     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
	     * // => 4
	     *
	     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
	     * // => 1
	     */
	    function lastIndexOf(array, value, fromIndex) {
	      var index = array ? array.length : 0;
	      if (typeof fromIndex == 'number') {
	        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
	      }
	      while (index--) {
	        if (array[index] === value) {
	          return index;
	        }
	      }
	      return -1;
	    }

	    /**
	     * Removes all provided values from the given array using strict equality for
	     * comparisons, i.e. `===`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to modify.
	     * @param {...*} [value] The values to remove.
	     * @returns {Array} Returns `array`.
	     * @example
	     *
	     * var array = [1, 2, 3, 1, 2, 3];
	     * _.pull(array, 2, 3);
	     * console.log(array);
	     * // => [1, 1]
	     */
	    function pull(array) {
	      var args = arguments,
	          argsIndex = 0,
	          argsLength = args.length,
	          length = array ? array.length : 0;

	      while (++argsIndex < argsLength) {
	        var index = -1,
	            value = args[argsIndex];
	        while (++index < length) {
	          if (array[index] === value) {
	            splice.call(array, index--, 1);
	            length--;
	          }
	        }
	      }
	      return array;
	    }

	    /**
	     * Creates an array of numbers (positive and/or negative) progressing from
	     * `start` up to but not including `end`. If `start` is less than `stop` a
	     * zero-length range is created unless a negative `step` is specified.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {number} [start=0] The start of the range.
	     * @param {number} end The end of the range.
	     * @param {number} [step=1] The value to increment or decrement by.
	     * @returns {Array} Returns a new range array.
	     * @example
	     *
	     * _.range(4);
	     * // => [0, 1, 2, 3]
	     *
	     * _.range(1, 5);
	     * // => [1, 2, 3, 4]
	     *
	     * _.range(0, 20, 5);
	     * // => [0, 5, 10, 15]
	     *
	     * _.range(0, -4, -1);
	     * // => [0, -1, -2, -3]
	     *
	     * _.range(1, 4, 0);
	     * // => [1, 1, 1]
	     *
	     * _.range(0);
	     * // => []
	     */
	    function range(start, end, step) {
	      start = +start || 0;
	      step = typeof step == 'number' ? step : (+step || 1);

	      if (end == null) {
	        end = start;
	        start = 0;
	      }
	      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
	      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
	      var index = -1,
	          length = nativeMax(0, ceil((end - start) / (step || 1))),
	          result = Array(length);

	      while (++index < length) {
	        result[index] = start;
	        start += step;
	      }
	      return result;
	    }

	    /**
	     * Removes all elements from an array that the callback returns truey for
	     * and returns an array of removed elements. The callback is bound to `thisArg`
	     * and invoked with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to modify.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a new array of removed elements.
	     * @example
	     *
	     * var array = [1, 2, 3, 4, 5, 6];
	     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
	     *
	     * console.log(array);
	     * // => [1, 3, 5]
	     *
	     * console.log(evens);
	     * // => [2, 4, 6]
	     */
	    function remove(array, callback, thisArg) {
	      var index = -1,
	          length = array ? array.length : 0,
	          result = [];

	      callback = lodash.createCallback(callback, thisArg, 3);
	      while (++index < length) {
	        var value = array[index];
	        if (callback(value, index, array)) {
	          result.push(value);
	          splice.call(array, index--, 1);
	          length--;
	        }
	      }
	      return result;
	    }

	    /**
	     * The opposite of `_.initial` this method gets all but the first element or
	     * first `n` elements of an array. If a callback function is provided elements
	     * at the beginning of the array are excluded from the result as long as the
	     * callback returns truey. The callback is bound to `thisArg` and invoked
	     * with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias drop, tail
	     * @category Arrays
	     * @param {Array} array The array to query.
	     * @param {Function|Object|number|string} [callback=1] The function called
	     *  per element or the number of elements to exclude. If a property name or
	     *  object is provided it will be used to create a "_.pluck" or "_.where"
	     *  style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a slice of `array`.
	     * @example
	     *
	     * _.rest([1, 2, 3]);
	     * // => [2, 3]
	     *
	     * _.rest([1, 2, 3], 2);
	     * // => [3]
	     *
	     * _.rest([1, 2, 3], function(num) {
	     *   return num < 3;
	     * });
	     * // => [3]
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
	     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
	     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
	     * ];
	     *
	     * // using "_.pluck" callback shorthand
	     * _.pluck(_.rest(characters, 'blocked'), 'name');
	     * // => ['fred', 'pebbles']
	     *
	     * // using "_.where" callback shorthand
	     * _.rest(characters, { 'employer': 'slate' });
	     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
	     */
	    function rest(array, callback, thisArg) {
	      if (typeof callback != 'number' && callback != null) {
	        var n = 0,
	            index = -1,
	            length = array ? array.length : 0;

	        callback = lodash.createCallback(callback, thisArg, 3);
	        while (++index < length && callback(array[index], index, array)) {
	          n++;
	        }
	      } else {
	        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
	      }
	      return slice(array, n);
	    }

	    /**
	     * Uses a binary search to determine the smallest index at which a value
	     * should be inserted into a given sorted array in order to maintain the sort
	     * order of the array. If a callback is provided it will be executed for
	     * `value` and each element of `array` to compute their sort ranking. The
	     * callback is bound to `thisArg` and invoked with one argument; (value).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to inspect.
	     * @param {*} value The value to evaluate.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     * @example
	     *
	     * _.sortedIndex([20, 30, 50], 40);
	     * // => 2
	     *
	     * // using "_.pluck" callback shorthand
	     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
	     * // => 2
	     *
	     * var dict = {
	     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
	     * };
	     *
	     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
	     *   return dict.wordToNumber[word];
	     * });
	     * // => 2
	     *
	     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
	     *   return this.wordToNumber[word];
	     * }, dict);
	     * // => 2
	     */
	    function sortedIndex(array, value, callback, thisArg) {
	      var low = 0,
	          high = array ? array.length : low;

	      // explicitly reference `identity` for better inlining in Firefox
	      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
	      value = callback(value);

	      while (low < high) {
	        var mid = (low + high) >>> 1;
	        (callback(array[mid]) < value)
	          ? low = mid + 1
	          : high = mid;
	      }
	      return low;
	    }

	    /**
	     * Creates an array of unique values, in order, of the provided arrays using
	     * strict equality for comparisons, i.e. `===`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {...Array} [array] The arrays to inspect.
	     * @returns {Array} Returns an array of combined values.
	     * @example
	     *
	     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
	     * // => [1, 2, 3, 5, 4]
	     */
	    function union() {
	      return baseUniq(baseFlatten(arguments, true, true));
	    }

	    /**
	     * Creates a duplicate-value-free version of an array using strict equality
	     * for comparisons, i.e. `===`. If the array is sorted, providing
	     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
	     * each element of `array` is passed through the callback before uniqueness
	     * is computed. The callback is bound to `thisArg` and invoked with three
	     * arguments; (value, index, array).
	     *
	     * If a property name is provided for `callback` the created "_.pluck" style
	     * callback will return the property value of the given element.
	     *
	     * If an object is provided for `callback` the created "_.where" style callback
	     * will return `true` for elements that have the properties of the given object,
	     * else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias unique
	     * @category Arrays
	     * @param {Array} array The array to process.
	     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
	     * @param {Function|Object|string} [callback=identity] The function called
	     *  per iteration. If a property name or object is provided it will be used
	     *  to create a "_.pluck" or "_.where" style callback, respectively.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns a duplicate-value-free array.
	     * @example
	     *
	     * _.uniq([1, 2, 1, 3, 1]);
	     * // => [1, 2, 3]
	     *
	     * _.uniq([1, 1, 2, 2, 3], true);
	     * // => [1, 2, 3]
	     *
	     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
	     * // => ['A', 'b', 'C']
	     *
	     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
	     * // => [1, 2.5, 3]
	     *
	     * // using "_.pluck" callback shorthand
	     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
	     * // => [{ 'x': 1 }, { 'x': 2 }]
	     */
	    function uniq(array, isSorted, callback, thisArg) {
	      // juggle arguments
	      if (typeof isSorted != 'boolean' && isSorted != null) {
	        thisArg = callback;
	        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
	        isSorted = false;
	      }
	      if (callback != null) {
	        callback = lodash.createCallback(callback, thisArg, 3);
	      }
	      return baseUniq(array, isSorted, callback);
	    }

	    /**
	     * Creates an array excluding all provided values using strict equality for
	     * comparisons, i.e. `===`.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {Array} array The array to filter.
	     * @param {...*} [value] The values to exclude.
	     * @returns {Array} Returns a new array of filtered values.
	     * @example
	     *
	     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
	     * // => [2, 3, 4]
	     */
	    function without(array) {
	      return baseDifference(array, slice(arguments, 1));
	    }

	    /**
	     * Creates an array that is the symmetric difference of the provided arrays.
	     * See http://en.wikipedia.org/wiki/Symmetric_difference.
	     *
	     * @static
	     * @memberOf _
	     * @category Arrays
	     * @param {...Array} [array] The arrays to inspect.
	     * @returns {Array} Returns an array of values.
	     * @example
	     *
	     * _.xor([1, 2, 3], [5, 2, 1, 4]);
	     * // => [3, 5, 4]
	     *
	     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
	     * // => [1, 4, 5]
	     */
	    function xor() {
	      var index = -1,
	          length = arguments.length;

	      while (++index < length) {
	        var array = arguments[index];
	        if (isArray(array) || isArguments(array)) {
	          var result = result
	            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
	            : array;
	        }
	      }
	      return result || [];
	    }

	    /**
	     * Creates an array of grouped elements, the first of which contains the first
	     * elements of the given arrays, the second of which contains the second
	     * elements of the given arrays, and so on.
	     *
	     * @static
	     * @memberOf _
	     * @alias unzip
	     * @category Arrays
	     * @param {...Array} [array] Arrays to process.
	     * @returns {Array} Returns a new array of grouped elements.
	     * @example
	     *
	     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
	     * // => [['fred', 30, true], ['barney', 40, false]]
	     */
	    function zip() {
	      var array = arguments.length > 1 ? arguments : arguments[0],
	          index = -1,
	          length = array ? max(pluck(array, 'length')) : 0,
	          result = Array(length < 0 ? 0 : length);

	      while (++index < length) {
	        result[index] = pluck(array, index);
	      }
	      return result;
	    }

	    /**
	     * Creates an object composed from arrays of `keys` and `values`. Provide
	     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
	     * or two arrays, one of `keys` and one of corresponding `values`.
	     *
	     * @static
	     * @memberOf _
	     * @alias object
	     * @category Arrays
	     * @param {Array} keys The array of keys.
	     * @param {Array} [values=[]] The array of values.
	     * @returns {Object} Returns an object composed of the given keys and
	     *  corresponding values.
	     * @example
	     *
	     * _.zipObject(['fred', 'barney'], [30, 40]);
	     * // => { 'fred': 30, 'barney': 40 }
	     */
	    function zipObject(keys, values) {
	      var index = -1,
	          length = keys ? keys.length : 0,
	          result = {};

	      if (!values && length && !isArray(keys[0])) {
	        values = [];
	      }
	      while (++index < length) {
	        var key = keys[index];
	        if (values) {
	          result[key] = values[index];
	        } else if (key) {
	          result[key[0]] = key[1];
	        }
	      }
	      return result;
	    }

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Creates a function that executes `func`, with  the `this` binding and
	     * arguments of the created function, only after being called `n` times.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {number} n The number of times the function must be called before
	     *  `func` is executed.
	     * @param {Function} func The function to restrict.
	     * @returns {Function} Returns the new restricted function.
	     * @example
	     *
	     * var saves = ['profile', 'settings'];
	     *
	     * var done = _.after(saves.length, function() {
	     *   console.log('Done saving!');
	     * });
	     *
	     * _.forEach(saves, function(type) {
	     *   asyncSave({ 'type': type, 'complete': done });
	     * });
	     * // => logs 'Done saving!', after all saves have completed
	     */
	    function after(n, func) {
	      if (!isFunction(func)) {
	        throw new TypeError;
	      }
	      return function() {
	        if (--n < 1) {
	          return func.apply(this, arguments);
	        }
	      };
	    }

	    /**
	     * Creates a function that, when called, invokes `func` with the `this`
	     * binding of `thisArg` and prepends any additional `bind` arguments to those
	     * provided to the bound function.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to bind.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param {...*} [arg] Arguments to be partially applied.
	     * @returns {Function} Returns the new bound function.
	     * @example
	     *
	     * var func = function(greeting) {
	     *   return greeting + ' ' + this.name;
	     * };
	     *
	     * func = _.bind(func, { 'name': 'fred' }, 'hi');
	     * func();
	     * // => 'hi fred'
	     */
	    function bind(func, thisArg) {
	      return arguments.length > 2
	        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
	        : createWrapper(func, 1, null, null, thisArg);
	    }

	    /**
	     * Binds methods of an object to the object itself, overwriting the existing
	     * method. Method names may be specified as individual arguments or as arrays
	     * of method names. If no method names are provided all the function properties
	     * of `object` will be bound.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Object} object The object to bind and assign the bound methods to.
	     * @param {...string} [methodName] The object method names to
	     *  bind, specified as individual method names or arrays of method names.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * var view = {
	     *   'label': 'docs',
	     *   'onClick': function() { console.log('clicked ' + this.label); }
	     * };
	     *
	     * _.bindAll(view);
	     * jQuery('#docs').on('click', view.onClick);
	     * // => logs 'clicked docs', when the button is clicked
	     */
	    function bindAll(object) {
	      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
	          index = -1,
	          length = funcs.length;

	      while (++index < length) {
	        var key = funcs[index];
	        object[key] = createWrapper(object[key], 1, null, null, object);
	      }
	      return object;
	    }

	    /**
	     * Creates a function that, when called, invokes the method at `object[key]`
	     * and prepends any additional `bindKey` arguments to those provided to the bound
	     * function. This method differs from `_.bind` by allowing bound functions to
	     * reference methods that will be redefined or don't yet exist.
	     * See http://michaux.ca/articles/lazy-function-definition-pattern.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Object} object The object the method belongs to.
	     * @param {string} key The key of the method.
	     * @param {...*} [arg] Arguments to be partially applied.
	     * @returns {Function} Returns the new bound function.
	     * @example
	     *
	     * var object = {
	     *   'name': 'fred',
	     *   'greet': function(greeting) {
	     *     return greeting + ' ' + this.name;
	     *   }
	     * };
	     *
	     * var func = _.bindKey(object, 'greet', 'hi');
	     * func();
	     * // => 'hi fred'
	     *
	     * object.greet = function(greeting) {
	     *   return greeting + 'ya ' + this.name + '!';
	     * };
	     *
	     * func();
	     * // => 'hiya fred!'
	     */
	    function bindKey(object, key) {
	      return arguments.length > 2
	        ? createWrapper(key, 19, slice(arguments, 2), null, object)
	        : createWrapper(key, 3, null, null, object);
	    }

	    /**
	     * Creates a function that is the composition of the provided functions,
	     * where each function consumes the return value of the function that follows.
	     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
	     * Each function is executed with the `this` binding of the composed function.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {...Function} [func] Functions to compose.
	     * @returns {Function} Returns the new composed function.
	     * @example
	     *
	     * var realNameMap = {
	     *   'pebbles': 'penelope'
	     * };
	     *
	     * var format = function(name) {
	     *   name = realNameMap[name.toLowerCase()] || name;
	     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
	     * };
	     *
	     * var greet = function(formatted) {
	     *   return 'Hiya ' + formatted + '!';
	     * };
	     *
	     * var welcome = _.compose(greet, format);
	     * welcome('pebbles');
	     * // => 'Hiya Penelope!'
	     */
	    function compose() {
	      var funcs = arguments,
	          length = funcs.length;

	      while (length--) {
	        if (!isFunction(funcs[length])) {
	          throw new TypeError;
	        }
	      }
	      return function() {
	        var args = arguments,
	            length = funcs.length;

	        while (length--) {
	          args = [funcs[length].apply(this, args)];
	        }
	        return args[0];
	      };
	    }

	    /**
	     * Creates a function which accepts one or more arguments of `func` that when
	     * invoked either executes `func` returning its result, if all `func` arguments
	     * have been provided, or returns a function that accepts one or more of the
	     * remaining `func` arguments, and so on. The arity of `func` can be specified
	     * if `func.length` is not sufficient.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to curry.
	     * @param {number} [arity=func.length] The arity of `func`.
	     * @returns {Function} Returns the new curried function.
	     * @example
	     *
	     * var curried = _.curry(function(a, b, c) {
	     *   console.log(a + b + c);
	     * });
	     *
	     * curried(1)(2)(3);
	     * // => 6
	     *
	     * curried(1, 2)(3);
	     * // => 6
	     *
	     * curried(1, 2, 3);
	     * // => 6
	     */
	    function curry(func, arity) {
	      arity = typeof arity == 'number' ? arity : (+arity || func.length);
	      return createWrapper(func, 4, null, null, null, arity);
	    }

	    /**
	     * Creates a function that will delay the execution of `func` until after
	     * `wait` milliseconds have elapsed since the last time it was invoked.
	     * Provide an options object to indicate that `func` should be invoked on
	     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
	     * to the debounced function will return the result of the last `func` call.
	     *
	     * Note: If `leading` and `trailing` options are `true` `func` will be called
	     * on the trailing edge of the timeout only if the the debounced function is
	     * invoked more than once during the `wait` timeout.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to debounce.
	     * @param {number} wait The number of milliseconds to delay.
	     * @param {Object} [options] The options object.
	     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
	     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
	     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
	     * @returns {Function} Returns the new debounced function.
	     * @example
	     *
	     * // avoid costly calculations while the window size is in flux
	     * var lazyLayout = _.debounce(calculateLayout, 150);
	     * jQuery(window).on('resize', lazyLayout);
	     *
	     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
	     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
	     *   'leading': true,
	     *   'trailing': false
	     * });
	     *
	     * // ensure `batchLog` is executed once after 1 second of debounced calls
	     * var source = new EventSource('/stream');
	     * source.addEventListener('message', _.debounce(batchLog, 250, {
	     *   'maxWait': 1000
	     * }, false);
	     */
	    function debounce(func, wait, options) {
	      var args,
	          maxTimeoutId,
	          result,
	          stamp,
	          thisArg,
	          timeoutId,
	          trailingCall,
	          lastCalled = 0,
	          maxWait = false,
	          trailing = true;

	      if (!isFunction(func)) {
	        throw new TypeError;
	      }
	      wait = nativeMax(0, wait) || 0;
	      if (options === true) {
	        var leading = true;
	        trailing = false;
	      } else if (isObject(options)) {
	        leading = options.leading;
	        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
	        trailing = 'trailing' in options ? options.trailing : trailing;
	      }
	      var delayed = function() {
	        var remaining = wait - (now() - stamp);
	        if (remaining <= 0) {
	          if (maxTimeoutId) {
	            clearTimeout(maxTimeoutId);
	          }
	          var isCalled = trailingCall;
	          maxTimeoutId = timeoutId = trailingCall = undefined;
	          if (isCalled) {
	            lastCalled = now();
	            result = func.apply(thisArg, args);
	            if (!timeoutId && !maxTimeoutId) {
	              args = thisArg = null;
	            }
	          }
	        } else {
	          timeoutId = setTimeout(delayed, remaining);
	        }
	      };

	      var maxDelayed = function() {
	        if (timeoutId) {
	          clearTimeout(timeoutId);
	        }
	        maxTimeoutId = timeoutId = trailingCall = undefined;
	        if (trailing || (maxWait !== wait)) {
	          lastCalled = now();
	          result = func.apply(thisArg, args);
	          if (!timeoutId && !maxTimeoutId) {
	            args = thisArg = null;
	          }
	        }
	      };

	      return function() {
	        args = arguments;
	        stamp = now();
	        thisArg = this;
	        trailingCall = trailing && (timeoutId || !leading);

	        if (maxWait === false) {
	          var leadingCall = leading && !timeoutId;
	        } else {
	          if (!maxTimeoutId && !leading) {
	            lastCalled = stamp;
	          }
	          var remaining = maxWait - (stamp - lastCalled),
	              isCalled = remaining <= 0;

	          if (isCalled) {
	            if (maxTimeoutId) {
	              maxTimeoutId = clearTimeout(maxTimeoutId);
	            }
	            lastCalled = stamp;
	            result = func.apply(thisArg, args);
	          }
	          else if (!maxTimeoutId) {
	            maxTimeoutId = setTimeout(maxDelayed, remaining);
	          }
	        }
	        if (isCalled && timeoutId) {
	          timeoutId = clearTimeout(timeoutId);
	        }
	        else if (!timeoutId && wait !== maxWait) {
	          timeoutId = setTimeout(delayed, wait);
	        }
	        if (leadingCall) {
	          isCalled = true;
	          result = func.apply(thisArg, args);
	        }
	        if (isCalled && !timeoutId && !maxTimeoutId) {
	          args = thisArg = null;
	        }
	        return result;
	      };
	    }

	    /**
	     * Defers executing the `func` function until the current call stack has cleared.
	     * Additional arguments will be provided to `func` when it is invoked.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to defer.
	     * @param {...*} [arg] Arguments to invoke the function with.
	     * @returns {number} Returns the timer id.
	     * @example
	     *
	     * _.defer(function(text) { console.log(text); }, 'deferred');
	     * // logs 'deferred' after one or more milliseconds
	     */
	    function defer(func) {
	      if (!isFunction(func)) {
	        throw new TypeError;
	      }
	      var args = slice(arguments, 1);
	      return setTimeout(function() { func.apply(undefined, args); }, 1);
	    }

	    /**
	     * Executes the `func` function after `wait` milliseconds. Additional arguments
	     * will be provided to `func` when it is invoked.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to delay.
	     * @param {number} wait The number of milliseconds to delay execution.
	     * @param {...*} [arg] Arguments to invoke the function with.
	     * @returns {number} Returns the timer id.
	     * @example
	     *
	     * _.delay(function(text) { console.log(text); }, 1000, 'later');
	     * // => logs 'later' after one second
	     */
	    function delay(func, wait) {
	      if (!isFunction(func)) {
	        throw new TypeError;
	      }
	      var args = slice(arguments, 2);
	      return setTimeout(function() { func.apply(undefined, args); }, wait);
	    }

	    /**
	     * Creates a function that memoizes the result of `func`. If `resolver` is
	     * provided it will be used to determine the cache key for storing the result
	     * based on the arguments provided to the memoized function. By default, the
	     * first argument provided to the memoized function is used as the cache key.
	     * The `func` is executed with the `this` binding of the memoized function.
	     * The result cache is exposed as the `cache` property on the memoized function.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to have its output memoized.
	     * @param {Function} [resolver] A function used to resolve the cache key.
	     * @returns {Function} Returns the new memoizing function.
	     * @example
	     *
	     * var fibonacci = _.memoize(function(n) {
	     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
	     * });
	     *
	     * fibonacci(9)
	     * // => 34
	     *
	     * var data = {
	     *   'fred': { 'name': 'fred', 'age': 40 },
	     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
	     * };
	     *
	     * // modifying the result cache
	     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
	     * get('pebbles');
	     * // => { 'name': 'pebbles', 'age': 1 }
	     *
	     * get.cache.pebbles.name = 'penelope';
	     * get('pebbles');
	     * // => { 'name': 'penelope', 'age': 1 }
	     */
	    function memoize(func, resolver) {
	      if (!isFunction(func)) {
	        throw new TypeError;
	      }
	      var memoized = function() {
	        var cache = memoized.cache,
	            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

	        return hasOwnProperty.call(cache, key)
	          ? cache[key]
	          : (cache[key] = func.apply(this, arguments));
	      }
	      memoized.cache = {};
	      return memoized;
	    }

	    /**
	     * Creates a function that is restricted to execute `func` once. Repeat calls to
	     * the function will return the value of the first call. The `func` is executed
	     * with the `this` binding of the created function.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to restrict.
	     * @returns {Function} Returns the new restricted function.
	     * @example
	     *
	     * var initialize = _.once(createApplication);
	     * initialize();
	     * initialize();
	     * // `initialize` executes `createApplication` once
	     */
	    function once(func) {
	      var ran,
	          result;

	      if (!isFunction(func)) {
	        throw new TypeError;
	      }
	      return function() {
	        if (ran) {
	          return result;
	        }
	        ran = true;
	        result = func.apply(this, arguments);

	        // clear the `func` variable so the function may be garbage collected
	        func = null;
	        return result;
	      };
	    }

	    /**
	     * Creates a function that, when called, invokes `func` with any additional
	     * `partial` arguments prepended to those provided to the new function. This
	     * method is similar to `_.bind` except it does **not** alter the `this` binding.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to partially apply arguments to.
	     * @param {...*} [arg] Arguments to be partially applied.
	     * @returns {Function} Returns the new partially applied function.
	     * @example
	     *
	     * var greet = function(greeting, name) { return greeting + ' ' + name; };
	     * var hi = _.partial(greet, 'hi');
	     * hi('fred');
	     * // => 'hi fred'
	     */
	    function partial(func) {
	      return createWrapper(func, 16, slice(arguments, 1));
	    }

	    /**
	     * This method is like `_.partial` except that `partial` arguments are
	     * appended to those provided to the new function.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to partially apply arguments to.
	     * @param {...*} [arg] Arguments to be partially applied.
	     * @returns {Function} Returns the new partially applied function.
	     * @example
	     *
	     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
	     *
	     * var options = {
	     *   'variable': 'data',
	     *   'imports': { 'jq': $ }
	     * };
	     *
	     * defaultsDeep(options, _.templateSettings);
	     *
	     * options.variable
	     * // => 'data'
	     *
	     * options.imports
	     * // => { '_': _, 'jq': $ }
	     */
	    function partialRight(func) {
	      return createWrapper(func, 32, null, slice(arguments, 1));
	    }

	    /**
	     * Creates a function that, when executed, will only call the `func` function
	     * at most once per every `wait` milliseconds. Provide an options object to
	     * indicate that `func` should be invoked on the leading and/or trailing edge
	     * of the `wait` timeout. Subsequent calls to the throttled function will
	     * return the result of the last `func` call.
	     *
	     * Note: If `leading` and `trailing` options are `true` `func` will be called
	     * on the trailing edge of the timeout only if the the throttled function is
	     * invoked more than once during the `wait` timeout.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {Function} func The function to throttle.
	     * @param {number} wait The number of milliseconds to throttle executions to.
	     * @param {Object} [options] The options object.
	     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
	     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
	     * @returns {Function} Returns the new throttled function.
	     * @example
	     *
	     * // avoid excessively updating the position while scrolling
	     * var throttled = _.throttle(updatePosition, 100);
	     * jQuery(window).on('scroll', throttled);
	     *
	     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
	     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
	     *   'trailing': false
	     * }));
	     */
	    function throttle(func, wait, options) {
	      var leading = true,
	          trailing = true;

	      if (!isFunction(func)) {
	        throw new TypeError;
	      }
	      if (options === false) {
	        leading = false;
	      } else if (isObject(options)) {
	        leading = 'leading' in options ? options.leading : leading;
	        trailing = 'trailing' in options ? options.trailing : trailing;
	      }
	      debounceOptions.leading = leading;
	      debounceOptions.maxWait = wait;
	      debounceOptions.trailing = trailing;

	      return debounce(func, wait, debounceOptions);
	    }

	    /**
	     * Creates a function that provides `value` to the wrapper function as its
	     * first argument. Additional arguments provided to the function are appended
	     * to those provided to the wrapper function. The wrapper is executed with
	     * the `this` binding of the created function.
	     *
	     * @static
	     * @memberOf _
	     * @category Functions
	     * @param {*} value The value to wrap.
	     * @param {Function} wrapper The wrapper function.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var p = _.wrap(_.escape, function(func, text) {
	     *   return '<p>' + func(text) + '</p>';
	     * });
	     *
	     * p('Fred, Wilma, & Pebbles');
	     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
	     */
	    function wrap(value, wrapper) {
	      return createWrapper(wrapper, 16, [value]);
	    }

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Creates a function that returns `value`.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {*} value The value to return from the new function.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var object = { 'name': 'fred' };
	     * var getter = _.constant(object);
	     * getter() === object;
	     * // => true
	     */
	    function constant(value) {
	      return function() {
	        return value;
	      };
	    }

	    /**
	     * Produces a callback bound to an optional `thisArg`. If `func` is a property
	     * name the created callback will return the property value for a given element.
	     * If `func` is an object the created callback will return `true` for elements
	     * that contain the equivalent object properties, otherwise it will return `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {*} [func=identity] The value to convert to a callback.
	     * @param {*} [thisArg] The `this` binding of the created callback.
	     * @param {number} [argCount] The number of arguments the callback accepts.
	     * @returns {Function} Returns a callback function.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * // wrap to create custom callback shorthands
	     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
	     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
	     *   return !match ? func(callback, thisArg) : function(object) {
	     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
	     *   };
	     * });
	     *
	     * _.filter(characters, 'age__gt38');
	     * // => [{ 'name': 'fred', 'age': 40 }]
	     */
	    function createCallback(func, thisArg, argCount) {
	      var type = typeof func;
	      if (func == null || type == 'function') {
	        return baseCreateCallback(func, thisArg, argCount);
	      }
	      // handle "_.pluck" style callback shorthands
	      if (type != 'object') {
	        return property(func);
	      }
	      var props = keys(func),
	          key = props[0],
	          a = func[key];

	      // handle "_.where" style callback shorthands
	      if (props.length == 1 && a === a && !isObject(a)) {
	        // fast path the common case of providing an object with a single
	        // property containing a primitive value
	        return function(object) {
	          var b = object[key];
	          return a === b && (a !== 0 || (1 / a == 1 / b));
	        };
	      }
	      return function(object) {
	        var length = props.length,
	            result = false;

	        while (length--) {
	          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
	            break;
	          }
	        }
	        return result;
	      };
	    }

	    /**
	     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
	     * corresponding HTML entities.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {string} string The string to escape.
	     * @returns {string} Returns the escaped string.
	     * @example
	     *
	     * _.escape('Fred, Wilma, & Pebbles');
	     * // => 'Fred, Wilma, &amp; Pebbles'
	     */
	    function escape(string) {
	      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
	    }

	    /**
	     * This method returns the first argument provided to it.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {*} value Any value.
	     * @returns {*} Returns `value`.
	     * @example
	     *
	     * var object = { 'name': 'fred' };
	     * _.identity(object) === object;
	     * // => true
	     */
	    function identity(value) {
	      return value;
	    }

	    /**
	     * Adds function properties of a source object to the destination object.
	     * If `object` is a function methods will be added to its prototype as well.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {Function|Object} [object=lodash] object The destination object.
	     * @param {Object} source The object of functions to add.
	     * @param {Object} [options] The options object.
	     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
	     * @example
	     *
	     * function capitalize(string) {
	     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
	     * }
	     *
	     * _.mixin({ 'capitalize': capitalize });
	     * _.capitalize('fred');
	     * // => 'Fred'
	     *
	     * _('fred').capitalize().value();
	     * // => 'Fred'
	     *
	     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
	     * _('fred').capitalize();
	     * // => 'Fred'
	     */
	    function mixin(object, source, options) {
	      var chain = true,
	          methodNames = source && functions(source);

	      if (!source || (!options && !methodNames.length)) {
	        if (options == null) {
	          options = source;
	        }
	        ctor = lodashWrapper;
	        source = object;
	        object = lodash;
	        methodNames = functions(source);
	      }
	      if (options === false) {
	        chain = false;
	      } else if (isObject(options) && 'chain' in options) {
	        chain = options.chain;
	      }
	      var ctor = object,
	          isFunc = isFunction(ctor);

	      forEach(methodNames, function(methodName) {
	        var func = object[methodName] = source[methodName];
	        if (isFunc) {
	          ctor.prototype[methodName] = function() {
	            var chainAll = this.__chain__,
	                value = this.__wrapped__,
	                args = [value];

	            push.apply(args, arguments);
	            var result = func.apply(object, args);
	            if (chain || chainAll) {
	              if (value === result && isObject(result)) {
	                return this;
	              }
	              result = new ctor(result);
	              result.__chain__ = chainAll;
	            }
	            return result;
	          };
	        }
	      });
	    }

	    /**
	     * Reverts the '_' variable to its previous value and returns a reference to
	     * the `lodash` function.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @returns {Function} Returns the `lodash` function.
	     * @example
	     *
	     * var lodash = _.noConflict();
	     */
	    function noConflict() {
	      context._ = oldDash;
	      return this;
	    }

	    /**
	     * A no-operation function.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @example
	     *
	     * var object = { 'name': 'fred' };
	     * _.noop(object) === undefined;
	     * // => true
	     */
	    function noop() {
	      // no operation performed
	    }

	    /**
	     * Gets the number of milliseconds that have elapsed since the Unix epoch
	     * (1 January 1970 00:00:00 UTC).
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @example
	     *
	     * var stamp = _.now();
	     * _.defer(function() { console.log(_.now() - stamp); });
	     * // => logs the number of milliseconds it took for the deferred function to be called
	     */
	    var now = isNative(now = Date.now) && now || function() {
	      return new Date().getTime();
	    };

	    /**
	     * Converts the given value into an integer of the specified radix.
	     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
	     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
	     *
	     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
	     * implementations. See http://es5.github.io/#E.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {string} value The value to parse.
	     * @param {number} [radix] The radix used to interpret the value to parse.
	     * @returns {number} Returns the new integer value.
	     * @example
	     *
	     * _.parseInt('08');
	     * // => 8
	     */
	    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
	      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
	      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
	    };

	    /**
	     * Creates a "_.pluck" style function, which returns the `key` value of a
	     * given object.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {string} key The name of the property to retrieve.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'fred',   'age': 40 },
	     *   { 'name': 'barney', 'age': 36 }
	     * ];
	     *
	     * var getName = _.property('name');
	     *
	     * _.map(characters, getName);
	     * // => ['barney', 'fred']
	     *
	     * _.sortBy(characters, getName);
	     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
	     */
	    function property(key) {
	      return function(object) {
	        return object[key];
	      };
	    }

	    /**
	     * Produces a random number between `min` and `max` (inclusive). If only one
	     * argument is provided a number between `0` and the given number will be
	     * returned. If `floating` is truey or either `min` or `max` are floats a
	     * floating-point number will be returned instead of an integer.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {number} [min=0] The minimum possible value.
	     * @param {number} [max=1] The maximum possible value.
	     * @param {boolean} [floating=false] Specify returning a floating-point number.
	     * @returns {number} Returns a random number.
	     * @example
	     *
	     * _.random(0, 5);
	     * // => an integer between 0 and 5
	     *
	     * _.random(5);
	     * // => also an integer between 0 and 5
	     *
	     * _.random(5, true);
	     * // => a floating-point number between 0 and 5
	     *
	     * _.random(1.2, 5.2);
	     * // => a floating-point number between 1.2 and 5.2
	     */
	    function random(min, max, floating) {
	      var noMin = min == null,
	          noMax = max == null;

	      if (floating == null) {
	        if (typeof min == 'boolean' && noMax) {
	          floating = min;
	          min = 1;
	        }
	        else if (!noMax && typeof max == 'boolean') {
	          floating = max;
	          noMax = true;
	        }
	      }
	      if (noMin && noMax) {
	        max = 1;
	      }
	      min = +min || 0;
	      if (noMax) {
	        max = min;
	        min = 0;
	      } else {
	        max = +max || 0;
	      }
	      if (floating || min % 1 || max % 1) {
	        var rand = nativeRandom();
	        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
	      }
	      return baseRandom(min, max);
	    }

	    /**
	     * Resolves the value of property `key` on `object`. If `key` is a function
	     * it will be invoked with the `this` binding of `object` and its result returned,
	     * else the property value is returned. If `object` is falsey then `undefined`
	     * is returned.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {Object} object The object to inspect.
	     * @param {string} key The name of the property to resolve.
	     * @returns {*} Returns the resolved value.
	     * @example
	     *
	     * var object = {
	     *   'cheese': 'crumpets',
	     *   'stuff': function() {
	     *     return 'nonsense';
	     *   }
	     * };
	     *
	     * _.result(object, 'cheese');
	     * // => 'crumpets'
	     *
	     * _.result(object, 'stuff');
	     * // => 'nonsense'
	     */
	    function result(object, key) {
	      if (object) {
	        var value = object[key];
	        return isFunction(value) ? object[key]() : value;
	      }
	    }

	    /**
	     * A micro-templating method that handles arbitrary delimiters, preserves
	     * whitespace, and correctly escapes quotes within interpolated code.
	     *
	     * Note: In the development build, `_.template` utilizes sourceURLs for easier
	     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
	     *
	     * For more information on precompiling templates see:
	     * http://lodash.com/custom-builds
	     *
	     * For more information on Chrome extension sandboxes see:
	     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {string} text The template text.
	     * @param {Object} data The data object used to populate the text.
	     * @param {Object} [options] The options object.
	     * @param {RegExp} [options.escape] The "escape" delimiter.
	     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
	     * @param {Object} [options.imports] An object to import into the template as local variables.
	     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
	     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
	     * @param {string} [variable] The data object variable name.
	     * @returns {Function|string} Returns a compiled function when no `data` object
	     *  is given, else it returns the interpolated text.
	     * @example
	     *
	     * // using the "interpolate" delimiter to create a compiled template
	     * var compiled = _.template('hello <%= name %>');
	     * compiled({ 'name': 'fred' });
	     * // => 'hello fred'
	     *
	     * // using the "escape" delimiter to escape HTML in data property values
	     * _.template('<b><%- value %></b>', { 'value': '<script>' });
	     * // => '<b>&lt;script&gt;</b>'
	     *
	     * // using the "evaluate" delimiter to generate HTML
	     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
	     * _.template(list, { 'people': ['fred', 'barney'] });
	     * // => '<li>fred</li><li>barney</li>'
	     *
	     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
	     * _.template('hello ${ name }', { 'name': 'pebbles' });
	     * // => 'hello pebbles'
	     *
	     * // using the internal `print` function in "evaluate" delimiters
	     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
	     * // => 'hello barney!'
	     *
	     * // using a custom template delimiters
	     * _.templateSettings = {
	     *   'interpolate': /{{([\s\S]+?)}}/g
	     * };
	     *
	     * _.template('hello {{ name }}!', { 'name': 'mustache' });
	     * // => 'hello mustache!'
	     *
	     * // using the `imports` option to import jQuery
	     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
	     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
	     * // => '<li>fred</li><li>barney</li>'
	     *
	     * // using the `sourceURL` option to specify a custom sourceURL for the template
	     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
	     * compiled(data);
	     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
	     *
	     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
	     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
	     * compiled.source;
	     * // => function(data) {
	     *   var __t, __p = '', __e = _.escape;
	     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
	     *   return __p;
	     * }
	     *
	     * // using the `source` property to inline compiled templates for meaningful
	     * // line numbers in error messages and a stack trace
	     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
	     *   var JST = {\
	     *     "main": ' + _.template(mainText).source + '\
	     *   };\
	     * ');
	     */
	    function template(text, data, options) {
	      // based on John Resig's `tmpl` implementation
	      // http://ejohn.org/blog/javascript-micro-templating/
	      // and Laura Doktorova's doT.js
	      // https://github.com/olado/doT
	      var settings = lodash.templateSettings;
	      text = String(text || '');

	      // avoid missing dependencies when `iteratorTemplate` is not defined
	      options = defaults({}, options, settings);

	      var imports = defaults({}, options.imports, settings.imports),
	          importsKeys = keys(imports),
	          importsValues = values(imports);

	      var isEvaluating,
	          index = 0,
	          interpolate = options.interpolate || reNoMatch,
	          source = "__p += '";

	      // compile the regexp to match each delimiter
	      var reDelimiters = RegExp(
	        (options.escape || reNoMatch).source + '|' +
	        interpolate.source + '|' +
	        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
	        (options.evaluate || reNoMatch).source + '|$'
	      , 'g');

	      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
	        interpolateValue || (interpolateValue = esTemplateValue);

	        // escape characters that cannot be included in string literals
	        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

	        // replace delimiters with snippets
	        if (escapeValue) {
	          source += "' +\n__e(" + escapeValue + ") +\n'";
	        }
	        if (evaluateValue) {
	          isEvaluating = true;
	          source += "';\n" + evaluateValue + ";\n__p += '";
	        }
	        if (interpolateValue) {
	          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
	        }
	        index = offset + match.length;

	        // the JS engine embedded in Adobe products requires returning the `match`
	        // string in order to produce the correct `offset` value
	        return match;
	      });

	      source += "';\n";

	      // if `variable` is not specified, wrap a with-statement around the generated
	      // code to add the data object to the top of the scope chain
	      var variable = options.variable,
	          hasVariable = variable;

	      if (!hasVariable) {
	        variable = 'obj';
	        source = 'with (' + variable + ') {\n' + source + '\n}\n';
	      }
	      // cleanup code by stripping empty strings
	      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
	        .replace(reEmptyStringMiddle, '$1')
	        .replace(reEmptyStringTrailing, '$1;');

	      // frame code as the function body
	      source = 'function(' + variable + ') {\n' +
	        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
	        "var __t, __p = '', __e = _.escape" +
	        (isEvaluating
	          ? ', __j = Array.prototype.join;\n' +
	            "function print() { __p += __j.call(arguments, '') }\n"
	          : ';\n'
	        ) +
	        source +
	        'return __p\n}';

	      // Use a sourceURL for easier debugging.
	      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
	      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

	      try {
	        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
	      } catch(e) {
	        e.source = source;
	        throw e;
	      }
	      if (data) {
	        return result(data);
	      }
	      // provide the compiled function's source by its `toString` method, in
	      // supported environments, or the `source` property as a convenience for
	      // inlining compiled templates during the build process
	      result.source = source;
	      return result;
	    }

	    /**
	     * Executes the callback `n` times, returning an array of the results
	     * of each callback execution. The callback is bound to `thisArg` and invoked
	     * with one argument; (index).
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {number} n The number of times to execute the callback.
	     * @param {Function} callback The function called per iteration.
	     * @param {*} [thisArg] The `this` binding of `callback`.
	     * @returns {Array} Returns an array of the results of each `callback` execution.
	     * @example
	     *
	     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
	     * // => [3, 6, 4]
	     *
	     * _.times(3, function(n) { mage.castSpell(n); });
	     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
	     *
	     * _.times(3, function(n) { this.cast(n); }, mage);
	     * // => also calls `mage.castSpell(n)` three times
	     */
	    function times(n, callback, thisArg) {
	      n = (n = +n) > -1 ? n : 0;
	      var index = -1,
	          result = Array(n);

	      callback = baseCreateCallback(callback, thisArg, 1);
	      while (++index < n) {
	        result[index] = callback(index);
	      }
	      return result;
	    }

	    /**
	     * The inverse of `_.escape` this method converts the HTML entities
	     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
	     * corresponding characters.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {string} string The string to unescape.
	     * @returns {string} Returns the unescaped string.
	     * @example
	     *
	     * _.unescape('Fred, Barney &amp; Pebbles');
	     * // => 'Fred, Barney & Pebbles'
	     */
	    function unescape(string) {
	      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
	    }

	    /**
	     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
	     *
	     * @static
	     * @memberOf _
	     * @category Utilities
	     * @param {string} [prefix] The value to prefix the ID with.
	     * @returns {string} Returns the unique ID.
	     * @example
	     *
	     * _.uniqueId('contact_');
	     * // => 'contact_104'
	     *
	     * _.uniqueId();
	     * // => '105'
	     */
	    function uniqueId(prefix) {
	      var id = ++idCounter;
	      return String(prefix == null ? '' : prefix) + id;
	    }

	    /*--------------------------------------------------------------------------*/

	    /**
	     * Creates a `lodash` object that wraps the given value with explicit
	     * method chaining enabled.
	     *
	     * @static
	     * @memberOf _
	     * @category Chaining
	     * @param {*} value The value to wrap.
	     * @returns {Object} Returns the wrapper object.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney',  'age': 36 },
	     *   { 'name': 'fred',    'age': 40 },
	     *   { 'name': 'pebbles', 'age': 1 }
	     * ];
	     *
	     * var youngest = _.chain(characters)
	     *     .sortBy('age')
	     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
	     *     .first()
	     *     .value();
	     * // => 'pebbles is 1'
	     */
	    function chain(value) {
	      value = new lodashWrapper(value);
	      value.__chain__ = true;
	      return value;
	    }

	    /**
	     * Invokes `interceptor` with the `value` as the first argument and then
	     * returns `value`. The purpose of this method is to "tap into" a method
	     * chain in order to perform operations on intermediate results within
	     * the chain.
	     *
	     * @static
	     * @memberOf _
	     * @category Chaining
	     * @param {*} value The value to provide to `interceptor`.
	     * @param {Function} interceptor The function to invoke.
	     * @returns {*} Returns `value`.
	     * @example
	     *
	     * _([1, 2, 3, 4])
	     *  .tap(function(array) { array.pop(); })
	     *  .reverse()
	     *  .value();
	     * // => [3, 2, 1]
	     */
	    function tap(value, interceptor) {
	      interceptor(value);
	      return value;
	    }

	    /**
	     * Enables explicit method chaining on the wrapper object.
	     *
	     * @name chain
	     * @memberOf _
	     * @category Chaining
	     * @returns {*} Returns the wrapper object.
	     * @example
	     *
	     * var characters = [
	     *   { 'name': 'barney', 'age': 36 },
	     *   { 'name': 'fred',   'age': 40 }
	     * ];
	     *
	     * // without explicit chaining
	     * _(characters).first();
	     * // => { 'name': 'barney', 'age': 36 }
	     *
	     * // with explicit chaining
	     * _(characters).chain()
	     *   .first()
	     *   .pick('age')
	     *   .value();
	     * // => { 'age': 36 }
	     */
	    function wrapperChain() {
	      this.__chain__ = true;
	      return this;
	    }

	    /**
	     * Produces the `toString` result of the wrapped value.
	     *
	     * @name toString
	     * @memberOf _
	     * @category Chaining
	     * @returns {string} Returns the string result.
	     * @example
	     *
	     * _([1, 2, 3]).toString();
	     * // => '1,2,3'
	     */
	    function wrapperToString() {
	      return String(this.__wrapped__);
	    }

	    /**
	     * Extracts the wrapped value.
	     *
	     * @name valueOf
	     * @memberOf _
	     * @alias value
	     * @category Chaining
	     * @returns {*} Returns the wrapped value.
	     * @example
	     *
	     * _([1, 2, 3]).valueOf();
	     * // => [1, 2, 3]
	     */
	    function wrapperValueOf() {
	      return this.__wrapped__;
	    }

	    /*--------------------------------------------------------------------------*/

	    // add functions that return wrapped values when chaining
	    lodash.after = after;
	    lodash.assign = assign;
	    lodash.at = at;
	    lodash.bind = bind;
	    lodash.bindAll = bindAll;
	    lodash.bindKey = bindKey;
	    lodash.chain = chain;
	    lodash.compact = compact;
	    lodash.compose = compose;
	    lodash.constant = constant;
	    lodash.countBy = countBy;
	    lodash.create = create;
	    lodash.createCallback = createCallback;
	    lodash.curry = curry;
	    lodash.debounce = debounce;
	    lodash.defaults = defaults;
	    lodash.defer = defer;
	    lodash.delay = delay;
	    lodash.difference = difference;
	    lodash.filter = filter;
	    lodash.flatten = flatten;
	    lodash.forEach = forEach;
	    lodash.forEachRight = forEachRight;
	    lodash.forIn = forIn;
	    lodash.forInRight = forInRight;
	    lodash.forOwn = forOwn;
	    lodash.forOwnRight = forOwnRight;
	    lodash.functions = functions;
	    lodash.groupBy = groupBy;
	    lodash.indexBy = indexBy;
	    lodash.initial = initial;
	    lodash.intersection = intersection;
	    lodash.invert = invert;
	    lodash.invoke = invoke;
	    lodash.keys = keys;
	    lodash.map = map;
	    lodash.mapValues = mapValues;
	    lodash.max = max;
	    lodash.memoize = memoize;
	    lodash.merge = merge;
	    lodash.min = min;
	    lodash.omit = omit;
	    lodash.once = once;
	    lodash.pairs = pairs;
	    lodash.partial = partial;
	    lodash.partialRight = partialRight;
	    lodash.pick = pick;
	    lodash.pluck = pluck;
	    lodash.property = property;
	    lodash.pull = pull;
	    lodash.range = range;
	    lodash.reject = reject;
	    lodash.remove = remove;
	    lodash.rest = rest;
	    lodash.shuffle = shuffle;
	    lodash.sortBy = sortBy;
	    lodash.tap = tap;
	    lodash.throttle = throttle;
	    lodash.times = times;
	    lodash.toArray = toArray;
	    lodash.transform = transform;
	    lodash.union = union;
	    lodash.uniq = uniq;
	    lodash.values = values;
	    lodash.where = where;
	    lodash.without = without;
	    lodash.wrap = wrap;
	    lodash.xor = xor;
	    lodash.zip = zip;
	    lodash.zipObject = zipObject;

	    // add aliases
	    lodash.collect = map;
	    lodash.drop = rest;
	    lodash.each = forEach;
	    lodash.eachRight = forEachRight;
	    lodash.extend = assign;
	    lodash.methods = functions;
	    lodash.object = zipObject;
	    lodash.select = filter;
	    lodash.tail = rest;
	    lodash.unique = uniq;
	    lodash.unzip = zip;

	    // add functions to `lodash.prototype`
	    mixin(lodash);

	    /*--------------------------------------------------------------------------*/

	    // add functions that return unwrapped values when chaining
	    lodash.clone = clone;
	    lodash.cloneDeep = cloneDeep;
	    lodash.contains = contains;
	    lodash.escape = escape;
	    lodash.every = every;
	    lodash.find = find;
	    lodash.findIndex = findIndex;
	    lodash.findKey = findKey;
	    lodash.findLast = findLast;
	    lodash.findLastIndex = findLastIndex;
	    lodash.findLastKey = findLastKey;
	    lodash.has = has;
	    lodash.identity = identity;
	    lodash.indexOf = indexOf;
	    lodash.isArguments = isArguments;
	    lodash.isArray = isArray;
	    lodash.isBoolean = isBoolean;
	    lodash.isDate = isDate;
	    lodash.isElement = isElement;
	    lodash.isEmpty = isEmpty;
	    lodash.isEqual = isEqual;
	    lodash.isFinite = isFinite;
	    lodash.isFunction = isFunction;
	    lodash.isNaN = isNaN;
	    lodash.isNull = isNull;
	    lodash.isNumber = isNumber;
	    lodash.isObject = isObject;
	    lodash.isPlainObject = isPlainObject;
	    lodash.isRegExp = isRegExp;
	    lodash.isString = isString;
	    lodash.isUndefined = isUndefined;
	    lodash.lastIndexOf = lastIndexOf;
	    lodash.mixin = mixin;
	    lodash.noConflict = noConflict;
	    lodash.noop = noop;
	    lodash.now = now;
	    lodash.parseInt = parseInt;
	    lodash.random = random;
	    lodash.reduce = reduce;
	    lodash.reduceRight = reduceRight;
	    lodash.result = result;
	    lodash.runInContext = runInContext;
	    lodash.size = size;
	    lodash.some = some;
	    lodash.sortedIndex = sortedIndex;
	    lodash.template = template;
	    lodash.unescape = unescape;
	    lodash.uniqueId = uniqueId;

	    // add aliases
	    lodash.all = every;
	    lodash.any = some;
	    lodash.detect = find;
	    lodash.findWhere = find;
	    lodash.foldl = reduce;
	    lodash.foldr = reduceRight;
	    lodash.include = contains;
	    lodash.inject = reduce;

	    mixin(function() {
	      var source = {}
	      forOwn(lodash, function(func, methodName) {
	        if (!lodash.prototype[methodName]) {
	          source[methodName] = func;
	        }
	      });
	      return source;
	    }(), false);

	    /*--------------------------------------------------------------------------*/

	    // add functions capable of returning wrapped and unwrapped values when chaining
	    lodash.first = first;
	    lodash.last = last;
	    lodash.sample = sample;

	    // add aliases
	    lodash.take = first;
	    lodash.head = first;

	    forOwn(lodash, function(func, methodName) {
	      var callbackable = methodName !== 'sample';
	      if (!lodash.prototype[methodName]) {
	        lodash.prototype[methodName]= function(n, guard) {
	          var chainAll = this.__chain__,
	              result = func(this.__wrapped__, n, guard);

	          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
	            ? result
	            : new lodashWrapper(result, chainAll);
	        };
	      }
	    });

	    /*--------------------------------------------------------------------------*/

	    /**
	     * The semantic version number.
	     *
	     * @static
	     * @memberOf _
	     * @type string
	     */
	    lodash.VERSION = '2.4.1';

	    // add "Chaining" functions to the wrapper
	    lodash.prototype.chain = wrapperChain;
	    lodash.prototype.toString = wrapperToString;
	    lodash.prototype.value = wrapperValueOf;
	    lodash.prototype.valueOf = wrapperValueOf;

	    // add `Array` functions that return unwrapped values
	    baseEach(['join', 'pop', 'shift'], function(methodName) {
	      var func = arrayRef[methodName];
	      lodash.prototype[methodName] = function() {
	        var chainAll = this.__chain__,
	            result = func.apply(this.__wrapped__, arguments);

	        return chainAll
	          ? new lodashWrapper(result, chainAll)
	          : result;
	      };
	    });

	    // add `Array` functions that return the existing wrapped value
	    baseEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
	      var func = arrayRef[methodName];
	      lodash.prototype[methodName] = function() {
	        func.apply(this.__wrapped__, arguments);
	        return this;
	      };
	    });

	    // add `Array` functions that return new wrapped values
	    baseEach(['concat', 'slice', 'splice'], function(methodName) {
	      var func = arrayRef[methodName];
	      lodash.prototype[methodName] = function() {
	        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
	      };
	    });

	    // avoid array-like object bugs with `Array#shift` and `Array#splice`
	    // in IE < 9, Firefox < 10, Narwhal, and RingoJS
	    if (!support.spliceObjects) {
	      baseEach(['pop', 'shift', 'splice'], function(methodName) {
	        var func = arrayRef[methodName],
	            isSplice = methodName == 'splice';

	        lodash.prototype[methodName] = function() {
	          var chainAll = this.__chain__,
	              value = this.__wrapped__,
	              result = func.apply(value, arguments);

	          if (value.length === 0) {
	            delete value[0];
	          }
	          return (chainAll || isSplice)
	            ? new lodashWrapper(result, chainAll)
	            : result;
	        };
	      });
	    }

	    return lodash;
	  }

	  /*--------------------------------------------------------------------------*/

	  // expose Lo-Dash
	  var _ = runInContext();

	  // some AMD build optimizers like r.js check for condition patterns like the following:
	  if (true) {
	    // Expose Lo-Dash to the global object even when an AMD loader is present in
	    // case Lo-Dash is loaded with a RequireJS shim config.
	    // See http://requirejs.org/docs/api.html#config-shim
	    root._ = _;

	    // define as an anonymous module so, through path mapping, it can be
	    // referenced as the "underscore" module
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	  // check for `exports` after `define` in case a build optimizer adds an `exports` object
	  else if (freeExports && freeModule) {
	    // in Node.js or RingoJS
	    if (moduleExports) {
	      (freeModule.exports = _)._ = _;
	    }
	    // in Narwhal or Rhino -require
	    else {
	      freeExports._ = _;
	    }
	  }
	  else {
	    // in a browser or Rhino
	    root._ = _;
	  }
	}.call(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(42)(module), (function() { return this; }())))

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Expose `pathtoRegexp`.
	 */
	module.exports = pathtoRegexp;

	/**
	 * The main path matching regexp utility.
	 *
	 * @type {RegExp}
	 */
	var PATH_REGEXP = new RegExp([
	  // Match already escaped characters that would otherwise incorrectly appear
	  // in future matches. This allows the user to escape special characters that
	  // shouldn't be transformed.
	  '(\\\\.)',
	  // Match Express-style parameters and un-named parameters with a prefix
	  // and optional suffixes. Matches appear as:
	  //
	  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
	  // "/route(\\d+)" => [undefined, undefined, undefined, "\d+", undefined]
	  '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
	  // Match regexp special characters that should always be escaped.
	  '([.+*?=^!:${}()[\\]|\\/])'
	].join('|'), 'g');

	/**
	 * Escape the capturing group by escaping special characters and meaning.
	 *
	 * @param  {String} group
	 * @return {String}
	 */
	function escapeGroup (group) {
	  return group.replace(/([=!:$\/()])/g, '\\$1');
	}

	/**
	 * Attach the keys as a property of the regexp.
	 *
	 * @param  {RegExp} re
	 * @param  {Array}  keys
	 * @return {RegExp}
	 */
	var attachKeys = function (re, keys) {
	  re.keys = keys;

	  return re;
	};

	/**
	 * Normalize the given path string, returning a regular expression.
	 *
	 * An empty array should be passed in, which will contain the placeholder key
	 * names. For example `/user/:id` will then contain `["id"]`.
	 *
	 * @param  {(String|RegExp|Array)} path
	 * @param  {Array}                 keys
	 * @param  {Object}                options
	 * @return {RegExp}
	 */
	function pathtoRegexp (path, keys, options) {
	  if (keys && !Array.isArray(keys)) {
	    options = keys;
	    keys = null;
	  }

	  keys = keys || [];
	  options = options || {};

	  var strict = options.strict;
	  var end = options.end !== false;
	  var flags = options.sensitive ? '' : 'i';
	  var index = 0;

	  if (path instanceof RegExp) {
	    // Match all capturing groups of a regexp.
	    var groups = path.source.match(/\((?!\?)/g) || [];

	    // Map all the matches to their numeric keys and push into the keys.
	    keys.push.apply(keys, groups.map(function (match, index) {
	      return {
	        name:      index,
	        delimiter: null,
	        optional:  false,
	        repeat:    false
	      };
	    }));

	    // Return the source back to the user.
	    return attachKeys(path, keys);
	  }

	  if (Array.isArray(path)) {
	    // Map array parts into regexps and return their source. We also pass
	    // the same keys and options instance into every generation to get
	    // consistent matching groups before we join the sources together.
	    path = path.map(function (value) {
	      return pathtoRegexp(value, keys, options).source;
	    });

	    // Generate a new regexp instance by joining all the parts together.
	    return attachKeys(new RegExp('(?:' + path.join('|') + ')', flags), keys);
	  }

	  // Alter the path string into a usable regexp.
	  path = path.replace(PATH_REGEXP, function (match, escaped, prefix, key, capture, group, suffix, escape) {
	    // Avoiding re-escaping escaped characters.
	    if (escaped) {
	      return escaped;
	    }

	    // Escape regexp special characters.
	    if (escape) {
	      return '\\' + escape;
	    }

	    var repeat   = suffix === '+' || suffix === '*';
	    var optional = suffix === '?' || suffix === '*';

	    keys.push({
	      name:      key || index++,
	      delimiter: prefix || '/',
	      optional:  optional,
	      repeat:    repeat
	    });

	    // Escape the prefix character.
	    prefix = prefix ? '\\' + prefix : '';

	    // Match using the custom capturing group, or fallback to capturing
	    // everything up to the next slash (or next period if the param was
	    // prefixed with a period).
	    capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

	    // Allow parameters to be repeated more than once.
	    if (repeat) {
	      capture = capture + '(?:' + prefix + capture + ')*';
	    }

	    // Allow a parameter to be optional.
	    if (optional) {
	      return '(?:' + prefix + '(' + capture + '))?';
	    }

	    // Basic parameter support.
	    return prefix + '(' + capture + ')';
	  });

	  // Check whether the path ends in a slash as it alters some match behaviour.
	  var endsWithSlash = path[path.length - 1] === '/';

	  // In non-strict mode we allow an optional trailing slash in the match. If
	  // the path to match already ended with a slash, we need to remove it for
	  // consistency. The slash is only valid at the very end of a path match, not
	  // anywhere in the middle. This is important for non-ending mode, otherwise
	  // "/test/" will match "/test//route".
	  if (!strict) {
	    path = (endsWithSlash ? path.slice(0, -2) : path) + '(?:\\/(?=$))?';
	  }

	  // In non-ending mode, we need prompt the capturing groups to match as much
	  // as possible by using a positive lookahead for the end or next path segment.
	  if (!end) {
	    path += strict && endsWithSlash ? '' : '(?=\\/|$)';
	  }

	  return attachKeys(new RegExp('^' + path + (end ? '$' : ''), flags), keys);
	};


/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        len = arguments.length;
	        args = new Array(len - 1);
	        for (i = 1; i < len; i++)
	          args[i - 1] = arguments[i];
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    len = arguments.length;
	    args = new Array(len - 1);
	    for (i = 1; i < len; i++)
	      args[i - 1] = arguments[i];

	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    var m;
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  var ret;
	  if (!emitter._events || !emitter._events[type])
	    ret = 0;
	  else if (isFunction(emitter._events[type]))
	    ret = 1;
	  else
	    ret = emitter._events[type].length;
	  return ret;
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ }
/******/ ])
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

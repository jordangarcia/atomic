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

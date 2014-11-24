module.exports = {
  getDataBindings() {
    return {
      regions: 'ui/regions'
    }
  },

  created() {
    this.$regions = {}
  },

  ready() {
    _.each(this.$regions, (el, id) => {

    })
  }
}

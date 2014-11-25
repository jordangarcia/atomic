module.exports = {
  template: require('./region.html'),

  data() {
    return {
      region: {
        componentId: null,
        isVisible: false,
      }
    }
  },

  ready() {
    this.$sync('region', ['ui/regions', this.$el.id])
  }
}

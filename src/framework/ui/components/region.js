module.exports = {
  template: require('html!./region.html'),

  replace: true,

  data() {
    return {
      region: {
        componentId: null,
        isVisible: false,
      }
    }
  },

  ready() {
    this.$sync('region', ['ui/regions', this.el.id])
  }
}

var Atomic = require('framework')

describe("App", () => {
  var app

  beforeEach(() => {
    app = Atomic()
  })

  afterEach(() => {
    app.reset()
  })


  it('should expose a nuclear reactor', () => {
    expect(app.reactor).toBeDefined()
  })
})

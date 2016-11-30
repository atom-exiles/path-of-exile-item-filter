completion = require './completion'

class Main
  readyToActivate: =>

  activate: =>

  deactivate: =>

  provideCompletion: -> completion

module.exports = new Main

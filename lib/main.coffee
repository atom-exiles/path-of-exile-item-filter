{ Emitter, CompositeDisposable } = require('atom')

config = require('../data/config.json')
packageName = require('../package.json').name

class Main
  config: config

  readyToActivate: =>

  activate: =>
    require('atom-package-deps').install(packageName).then(@readyToActivate)

  deactivate: =>

  provideCompletion: -> require('./completion')

  consumeLinter: (registry) =>
    @linterRegister = registry.register({ name: packageName })
    return

module.exports = new Main

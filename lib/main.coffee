{ Emitter, CompositeDisposable } = require('atom')

{ SettingsManager } = require('./settings')
{ DataManager } = require('./data')

# completion = require './completion'

class Main
  config: require('../data/config.json')
  packageName: require('../package.json').name

  readyToActivate: =>
    console.log "PoE Status: Activating plugin."
    @emitter = new Emitter
    @subscriptions = new CompositeDisposable
    @settings = new SettingsManager(@packageName)
    @data = new DataManager(@emitter, @settings)

    @data.get().then((data) ->
      console.log(data))

    # @provideCompletion = new CompletionProvider(@emitter, @settings, @data)
    # @linter = new Linter(@emitter, @settings, @data, @linterRegister)

  activate: =>
    require('atom-package-deps').install(@packageName).then(@readyToActivate)

  deactivate: =>
    # @linter.destroy()
    @data.destroy()
    @subscriptions.dispose()
    @emitter.dispose()

  # provideCompletion: -> completion

  consumeLinter: (registry) =>
    console.log "PoE Status: Registering Linter for '#{ @packageName }'."
    @linterRegister = registry.register({ name: @packageName })
    return

module.exports = new Main

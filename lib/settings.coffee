getConfig = (packageName, key) ->
  atom.config.get(packageName + '.' + key)

setConfig = (packageName, key, value) ->
  atom.config.set(packageName + '.' + key, value)
  return

unsetConfig = (packageName, key) ->
  atom.config.unset(packageName + "." + key)
  return

observeConfig = (packageName, key, callback) ->
  atom.config.observe(packageName + "." + key, callback)

onConfigChange = (packageName, key, callback) ->
  atom.config.onDidChange(packageName + "." + key, callback)

class SettingValue
  constructor: (@packageName, @key) ->

  get: =>
    getConfig(@packageName, @key)

  set: (value) =>
    setConfig(@packageName, @key, value)
    return

  unset: =>
    unsetConfig(@packageName, @key)
    return

  observe: (callback) =>
    observeConfig(@packageName, @key, callback)

  onDidChange: (callback) =>
    onConfigChange(@packageName, @key, callback)

class @SettingsManager
  constructor: (packageName) ->
    console.log "PoE Status: SettingsManager initialization."
    @packageName = packageName
    @general =
      enableLinter: new SettingValue(packageName, 'generalSettings.enableLinter'),
      enableCompletion: new SettingValue(packageName, 'generalSettings.enableCompletion')

    @data =
      enableLeague: new SettingValue(packageName, 'dataSettings.enableLeague'),
      enableLegacy: new SettingValue(packageName, 'dataSettings.enableLegacy'),
      enableRecipe: new SettingValue(packageName, 'dataSettings.enableRecipe'),
      classWhitelist: new SettingValue(packageName, 'dataSettings.classWhitelist'),
      baseWhitelist: new SettingValue(packageName, 'dataSettings.baseWhitelist')

    @linter =
      enableWarnings: new SettingValue(packageName, 'linterSettings.enableWarnings'),
      enableDebugging: new SettingValue(packageName, 'linterSettings.enableDebugging')

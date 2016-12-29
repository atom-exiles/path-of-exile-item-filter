packageName = require('../package.json').name

# A simple class containing all operations you can perform on a configuration
# variable in Atom.
class SettingValue
  constructor: (@key) ->

  get: =>
    atom.config.get(packageName + '.' + @key)

  set: (value) =>
    atom.config.set(packageName + '.' + @key, value)
    return

  unset: =>
    atom.config.unset(packageName + '.' + @key)
    return

  observe: (callback) =>
    atom.config.observe(packageName + '.' + @key, callback)

  onDidChange: (callback) =>
    atom.config.onDidChange(packageName + '.' + @key, callback)

# The data structure that we access our configuration variables off of.
class Settings
  general:
    enableLinter: new SettingValue('generalSettings.enableLinter'),
    enableCompletion: new SettingValue('generalSettings.enableCompletion')
  data:
    enableLeague: new SettingValue('dataSettings.enableLeague'),
    enableLegacy: new SettingValue('dataSettings.enableLegacy'),
    enableRecipe: new SettingValue('dataSettings.enableRecipe'),
    classWhitelist: new SettingValue('dataSettings.classWhitelist'),
    baseWhitelist: new SettingValue('dataSettings.baseWhitelist')
  linter:
    enableWarnings: new SettingValue('linterSettings.enableWarnings'),
    enableDebugging: new SettingValue('linterSettings.enableDebugging')

  constructor: () ->

module.exports = new Settings()

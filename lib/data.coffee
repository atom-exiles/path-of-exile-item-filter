{ Emitter, CompositeDisposable } = require('atom')
{ assert } = require('chai')

coreData = require("../data/items/core.json")
leagueData = require("../data/items/league.json")
legacyData = require("../data/items/legacy.json")
recipeData = require("../data/items/recipes.json")

mergeJSONData = (container, values) ->
  for key of values
    bases = values[key]
    if not container.classes.includes(key)
      container.classes.push(key)
    container.bases = container.bases.concat(bases)
  container

# Manages the item data for the plugin. Supports reloading when the user
# changes configuration settings, but not when the JSON data itself is modified.
class @DataManager
  constructor: (@emitter, @settings) ->
    console.log "PoE Status: DataManager initialization."
    @subscriptions = new CompositeDisposable
    @updateRequired = true
    @setupSubscriptions()

  setupSubscriptions: =>
    @subscriptions.add @settings.data.enableLeague.observe((value) =>
      @updateRequired = true
      @get())
    @subscriptions.add @settings.data.enableLegacy.observe((value) =>
      @updateRequired = true
      @get())
    @subscriptions.add @settings.data.enableRecipe.observe((value) =>
      @updateRequired = true
      @get())
    @subscriptions.add @settings.data.classWhitelist.observe((value) =>
      @updateRequired = true
      @get())
    @subscriptions.add @settings.data.baseWhitelist.observe((value) =>
      @updateRequired = true
      @get())

  # Merges item data from multiple sources into a single data structure.
  update: =>
    console.log "PoE Status: Updating the item data."
    assert(@updateRequired is true, 'data update when no update is necessary')
    result = classes: [], bases: []

    result = mergeJSONData(result, coreData)

    if @settings.data.enableLeague.get()
      result = mergeJSONData(result, leagueData)
    if @settings.data.enableLegacy.get()
      result = mergeJSONData(result, legacyData)
    if @settings.data.enableRecipe.get()
      result = mergeJSONData(result, recipeData)

    classWhitelist = @settings.data.classWhitelist.get()
    if classWhitelist.length > 0
      result.classes = result.classes.concat(classWhitelist)

    baseWhitelist = @settings.data.baseWhitelist.get()
    if baseWhitelist.length > 0
      result.bases = result.bases.concat(baseWhitelist)

    @updateRequired = false;
    @emitter.emit 'did-update-data', result
    result

  # Fetches a promise to the item data. If an update is necessary, then the
  # data will be reprocessed prior to the resolution of the promise.
  get: =>
    if @updateRequired
      @data = new Promise((resolve, reject) =>
        resolve(@update()))
    @data

  destroy: () =>
    @subscriptions.dispose()

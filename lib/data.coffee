{ Emitter, CompositeDisposable } = require('atom')
{ assert } = require('chai')

settings = require('./settings')

coreData = require("../data/items/core.json")
leagueData = require("../data/items/league.json")
legacyData = require("../data/items/legacy.json")
recipeData = require("../data/items/recipes.json")

mergeJSONData = (container, values) ->
  for key of values
    b = values[key]
    if not container.classes.includes(key)
      container.classes.push(key)
    container.bases = container.bases.concat(b)

processClassWhitelist = (list) ->
  result = {}
  for value in list
    result[value] = []
  result

processBaseWhitelist = (list) ->
  # This is kind of hacky, but we need a class to attach the whitelisted
  # bases onto. This has no impact right now, but in the future it may
  # result in whitelisted bases being culled due to a preceding class rule.
  result = { "Microtransactions": list }
  return result

# Manages the item data for the plugin. Supports reloading when the user
# changes configuration settings, but not when the JSON data itself is modified.
class Data
  constructor: () ->
    @emitter = new Emitter
    @subscriptions = new CompositeDisposable

    @previousSettings = {}
    @bases = []
    @classes = []

    @partialDataUpdate coreData, true
    @setupSubscriptions()

  setupSubscriptions: =>
    @subscriptions.add(settings.data.enableLeague.observe(=>
      newValue = settings.data.enableLeague.get()

      if @previousSettings.enableLeague?
        if @previousSettings.enableLeague
          @partialDataUpdate(leagueData, newValue)
        else
          if @newValue
            @partialDataUpdate(leagueData, newValue)
      else
        if newValue? and newValue
          @previousSettings.enableLeague = newValue
          @partialDataUpdate(leagueData, newValue)
      return
    ))

    @subscriptions.add(settings.data.enableLegacy.observe(=>
      newValue = settings.data.enableLegacy.get()

      if @previousSettings.enableLegacy?
        if @previousSettings.enableLegacy
          @partialDataUpdate(legacyData, newValue)
        else
          if @newValue
            @partialDataUpdate(legacyData, newValue)
      else
        if newValue? and newValue
          @previousSettings.enableLegacy = newValue
          @partialDataUpdate(legacyData, newValue)
      return
    ))

    @subscriptions.add(settings.data.enableRecipe.observe(=>
      newValue = settings.data.enableRecipe.get()

      if @previousSettings.enableRecipe?
        if @previousSettings.enableRecipe
          @partialDataUpdate(recipeData, newValue)
        else
          if @newValue
            @partialDataUpdate(recipeData, newValue)
      else
        if newValue? and newValue
          @previousSettings.enableRecipe = newValue
          @partialDataUpdate(recipeData, newValue)
      return
    ))

    @subscriptions.add(settings.data.classWhitelist.observe(=>
      newValue = settings.data.classWhitelist.get()

      # This is a boolean value and does not store the actual value of
      # classWhitelist.
      if @previousSettings.classWhitelist?
        if @previousSettings.classWhitelist
          @updateData()
        else
          if newValue?
            @previousSettings.classWhitelist = true
            @partialDataUpdate(processClassWhitelist(newValue), true)
      else
        if newValue?
          @previousSettings.classWhitelist = true
          @partialDataUpdate(processClassWhitelist(newValue), true)
      return
    ))

    @subscriptions.add(settings.data.baseWhitelist.observe(=>
      newValue = settings.data.baseWhitelist.get()

      # This is a boolean value and does not store the actual value of
      # baseWhitelist.
      if @previousSettings.baseWhitelist?
        if @previousSettings.baseWhitelist
          @updateData()
        else
          if newValue?
            @previousSettings.baseWhitelist = true
            @partialDataUpdate(processBaseWhitelist(newValue), true)
      else
        if newValue?
          @previousSettings.baseWhitelist = true
          @partialDataUpdate(processBaseWhitelist(newValue), true)
      return
    ))

    return

  # This function is a bit dumb right now and will refresh all item data
  # whenever any entries needs to be removed.
  partialDataUpdate: (data, configValue, emit = true) =>
    if configValue
      container = { classes: @classes, bases: @bases }
      mergeJSONData(container, data)
      @classes = container.classes
      @bases = container.bases
      if emit then @emitter.emit('poe-did-update-data', container)
    else
      @updateData()
    return

  # Performs a full refresh on our item data.
  updateData: =>
    @classes = []
    @bases = []

    @partialDataUpdate coreData, true, false
    if settings.data.enableLeague.get()
      @partialDataUpdate leagueData, true, false
    if settings.data.enableLegacy.get()
      @partialDataUpdate legacyData, true, false
    if settings.data.enableRecipe.get()
      @partialDataUpdate recipeData, true, false

    classWhitelist = settings.data.classWhitelist.get()
    if classWhitelist? and classWhitelist.length > 0
      @partialDataUpdate processClassWhitelist(classWhitelist), true, false

    baseWhitelist = settings.data.baseWhitelist.get()
    if baseWhitelist? and baseWhitelist.length > 0
      @partialDataUpdate processBaseWhitelist(baseWhitelist), true, false

    @emitter.emit 'poe-did-update-data', { classes: @classes, bases: @bases }
    return

  destroy: () =>
    if @subscriptions? then @subscriptions.dispose()
    @subscriptions = undefined

module.exports = new Data

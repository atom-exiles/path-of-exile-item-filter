{ CompositeDisposable } = require('atom')

settings = require('./settings')
data = require('./data')

class ItemData
  constructor: () ->
    @subscriptions = new CompositeDisposable
    @classes = @processData(data.classes)
    @bases = @processData(data.bases)

    @subscriptions.add(data.emitter.on('poe-did-update-data', (update) =>
      @classes = @processData(update.classes)
      @bases = @processData(update.bases)
    ))

  destroy: () =>
    @subscriptions.dispose()

  processData: (input) ->
    result = []
    for value in input
      if value.indexOf(' ') is -1
        result.push({ snippet: value })
      else
        result.push({ snippet: "\"#{ value }\"" })
    result

module.exports =
  selector: '.source.poe'
  disableForSelector: '.source.poe .comment'
  inclusionPriority: 1
  excludeLowerPriority: true

  itemData: new ItemData

  blocks:  [
    {
      snippet: '##############################\n##  ${1:        Heading       }  ##\n##############################\n$2'
      displayText: '## Heading ##'
    },
    { snippet: 'Show\n  ${1:Filter}\n  ${2:Action}' },
    { snippet: 'Hide\n  ${1:Filter}' }
  ]

  filters: [
    { snippet: 'BaseType ${1:type}' },
    { snippet: 'Class ${1:class}' },
    { snippet: 'Rarity ${1:[operator]} ${2:rarity}' },
    { snippet: 'Identified ${1:True}' },
    { snippet: 'Corrupted ${1:True}' },
    { snippet: 'ItemLevel ${1:[operator]} ${2:level}' },
    { snippet: 'DropLevel ${1:[operator]} ${2:level}' },
    { snippet: 'Quality ${1:[operator]} ${2:quality}' },
    { snippet: 'Sockets ${1:[operator]} ${2:sockets}' },
    { snippet: 'LinkedSockets ${1:[operator]} ${2:links}' },
    { snippet: 'Height ${1:[operator]} ${2:height}' },
    { snippet: 'Width ${1:[operator]} ${2:width}' },
    { snippet: 'SocketGroup ${1:group}' }
  ]

  actions: [
    { snippet: 'SetBackgroundColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
    { snippet: 'SetBorderColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
    { snippet: 'SetTextColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
    { snippet: 'PlayAlertSound ${1:id} ${2:[volume]}' },
    { snippet: 'SetFontSize ${1:size}' }
  ]

  rarity: [
    { snippet: 'Normal' },
    { snippet: 'Magic' },
    { snippet: 'Rare' },
    { snippet: 'Unique' }
  ]

  operators: [
    { snippet: '>'},
    { snippet: '>='},
    { snippet: '='},
    { snippet: '<='},
    { snippet: '<'}
  ]

  boolean: [
    { snippet: 'True'},
    { snippet: 'False'}
  ]

  excludedPrefixes: [
    #filters
    'Class',   'BaseType',      'ItemLevel',   'DropLevel', 'Quality', 'Rarity',
    'Sockets', 'LinkedSockets', 'SocketGroup', 'Height',    'Width',   'Identified',
    #actions
    'PlayAlertSound', 'SetBackgroundColor', 'SetBorderColor', 'SetFontSize', 'SetTextColor',
    #misc
    '[operator]'
  ]

  blocksWithOperators: [
    'filter.item-level.poe'
    'filter.drop-level.poe'
    'filter.quality.poe'
    'filter.sockets.poe'
    'filter.linked-sockets.poe'
    'filter.height.poe'
    'filter.width.poe'
    # 'filter.rarity.poe'
  ]

  defaults: [
    'Filter', 'Action',
    #filters
    'type', 'class', 'rarity', 'True', 'level', 'quality', 'sockets', 'links',
    'height', 'width', 'group',
    #actions
    'red', 'green', 'blue', '[alpha]', 'id', '[volume]', 'size'
    #operators
    '[operator]'
  ]

  # Required: Return a promise, an array of suggestions, or null.
  getSuggestions: ({editor, bufferPosition, scopeDescriptor, prefix}) ->
    suggestions = []

    if not settings.general.enableCompletion.get()
      return suggestions

    # The default prefix doesn't include the # symbol which is desired for headers.
    prefix = @getPrefix(editor, bufferPosition)

    if 'source.poe' == scopeDescriptor.scopes[scopeDescriptor.scopes.length - 1]
      suggestions = @blocks

    if 'show.block.poe' == scopeDescriptor.scopes[scopeDescriptor.scopes.length - 1]
      if prefix == 'Action'
        suggestions = @actions
      else if prefix == 'Filter'
        suggestions = @filters
      else
        suggestions = @filters.concat @actions

    if 'hide.block.poe' == scopeDescriptor.scopes[scopeDescriptor.scopes.length - 1]
      suggestions = @filters

    if 'filter.rarity.poe' in scopeDescriptor.scopes # and prefix not in @excludedPrefixes
      if @isFirstToken(editor, bufferPosition) or prefix is '[operator]'
        suggestions = @operators
      else
        suggestions = @rarity

    if 'filter.identified.poe' in scopeDescriptor.scopes and prefix not in @excludedPrefixes
      suggestions = @boolean

    if 'filter.class.poe' in scopeDescriptor.scopes and prefix not in @excludedPrefixes
      suggestions = @itemData.classes

    if 'filter.base-type.poe' in scopeDescriptor.scopes and prefix not in @excludedPrefixes
      suggestions = @itemData.bases

    if scopeDescriptor.scopes[scopeDescriptor.scopes.length - 1] in @blocksWithOperators
      if @isFirstToken(editor, bufferPosition) or prefix is '[operator]'
        suggestions = @operators

    @setReplacementPrefix(prefix, suggestions)
    if prefix not in @defaults
      suggestions = @pruneSuggestions(prefix, suggestions)
      @orderSuggestions(prefix, suggestions)

    return suggestions

  isFirstToken: (editor, bufferPosition) ->
    line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition])
    regex = new RegExp('^\\s*\\S+\\s*(\\S*)')
    result = regex.exec(line)

    trailingText = result[1]
    if trailingText?
      if trailingText.length > 0
        return false
      else
        return true
    true

  getPrefix: (editor, bufferPosition) ->
    line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition])
    prefixRegex = /([\s]*([^\s]*))*$/
    prefixRegex.exec(line)?[2] or ''

  # Prune the list of suggestions to improve speed
  pruneSuggestions: (prefix, suggestions) ->
    if prefix.length > 0
      upperPrefix = prefix.toUpperCase()
      prunedSuggestions = (suggestion for suggestion in suggestions when suggestion.snippet.toUpperCase().indexOf(upperPrefix) > -1)
      return prunedSuggestions
    else
      return suggestions

  # Order the suggestions based on the prefix
  orderSuggestions: (prefix, suggestions) ->
    if prefix.length > 0
      upperPrefix = prefix.toUpperCase()
      suggestions.sort (a, b) ->
        return a.snippet.toUpperCase().indexOf(upperPrefix) - b.snippet.toUpperCase().indexOf(upperPrefix)

  # Fixes the suggestedPrefix.
  # There is an issue with the default function of using the prefix passed into getSuggestions,
  # so you have to define the replacementPrefix for each suggestion.
  setReplacementPrefix: (prefix, suggestions) ->
    for suggestion in suggestions
      suggestion.replacementPrefix = prefix

    return suggestions

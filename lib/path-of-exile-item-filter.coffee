PathOfExileItemFilterView = require './path-of-exile-item-filter-view'
{CompositeDisposable} = require 'atom'

module.exports = PathOfExileItemFilter =
  pathOfExileItemFilterView: null
  modalPanel: null
  subscriptions: null

  activate: (state) ->
    @pathOfExileItemFilterView = new PathOfExileItemFilterView(state.pathOfExileItemFilterViewState)
    @modalPanel = atom.workspace.addModalPanel(item: @pathOfExileItemFilterView.getElement(), visible: false)

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'path-of-exile-item-filter:toggle': => @toggle()

  deactivate: ->
    @modalPanel.destroy()
    @subscriptions.dispose()
    @pathOfExileItemFilterView.destroy()

  serialize: ->
    pathOfExileItemFilterViewState: @pathOfExileItemFilterView.serialize()

  toggle: ->
    console.log 'PathOfExileItemFilter was toggled!'

    if @modalPanel.isVisible()
      @modalPanel.hide()
    else
      @modalPanel.show()

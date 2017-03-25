import { CompositeDisposable } from "atom";
import * as assert from "assert";

import * as settings from "./settings";
import * as filterData  from "./filter-manager";

var delegate: Linter.IndieDelegate;
var subscriptions: CompositeDisposable;
const filterMessages = new Map<string, Linter.Message[]>();
const unsavedFilterMessages = new Map<string, Linter.Message[]>();

function setMessages() {
  const enableLinter = settings.config.generalSettings.enableLinter.get();
  if(!enableLinter) return;

  var messages: Linter.Message[] = [];
  filterMessages.forEach((array) => {
    messages = messages.concat(array);
  });
  delegate.setAllMessages(messages);
}

export function activate(indieDelegate: Linter.IndieDelegate) {
  assert(filterMessages.size == 0 || unsavedFilterMessages.size == 0,
      "activation called unexpectedly.");
  if(subscriptions) subscriptions.dispose();

  delegate = indieDelegate;
  subscriptions = new CompositeDisposable;
  var activePaneID: string|undefined;

  subscriptions.add(filterData.emitter.on("poe-did-unregister-filter", (id) => {
    filterMessages.delete(id);
    unsavedFilterMessages.delete(id);
    setMessages();
  }));

  subscriptions.add(settings.config.generalSettings.enableLinter.onDidChange(setMessages));

  subscriptions.add(filterData.emitter.on("poe-did-process-filter", (args:
      Filter.Params.DataUpdate) => {
    var messages: Linter.Message[] = [];
    for(var line of args.lines) {
      if(line.messages) messages = messages.concat(line.messages);
    }
    if(args.editor.buffer.getPath()) {
      filterMessages.set(args.editor.buffer.id, messages);
    } else {
      unsavedFilterMessages.set(args.editor.buffer.id, messages);
    }
    setMessages();
  }));

  subscriptions.add(filterData.emitter.on("poe-did-rename-filter", (args:
      Filter.Params.FilterRename) => {
    assert(args.editor.buffer.getPath(), "expected file to always exist on file rename");

    // The linter doesn't currently allow messages for buffers with no
    // associated file. We store messages for these fileless buffers within
    // another map, but we need to migrate them over whenever the file is saved.
    var messages = filterMessages.get(args.editor.buffer.id);
    if(!messages) {
      messages = unsavedFilterMessages.get(args.editor.buffer.id);
      unsavedFilterMessages.delete(args.editor.buffer.id);
    }
    if(!messages) messages = []; // Filter may still be being processed.

    filterMessages.set(args.editor.buffer.id, messages);
    for(var message of messages) {
      const previousPath = message.location.file;
      message.location.file = args.path
      if(message.reference && message.reference.file == previousPath) {
        message.reference.file = args.path;
      }
    }
    setMessages();
  }));
}

export function deactivate() {
  filterMessages.clear();
  unsavedFilterMessages.clear();
  subscriptions.dispose();
}

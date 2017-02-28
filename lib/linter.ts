import { CompositeDisposable } from "atom";
import * as assert from "assert";

import * as settings from "./settings";
import * as filterData  from "./filter-data";

var registry: Linter.Register;
var subscriptions: CompositeDisposable;
const filterMessages = new Map<string, Linter.Messages>();

function setMessages() {
  const enableLinter = settings.config.generalSettings.enableLinter.get();

  if(enableLinter) {
    var messages: Linter.Messages = [];
    filterMessages.forEach((m) => {
      messages = messages.concat(m);
    });
    registry.setMessages(messages);
  } else {
    registry.deleteMessages();
  }
}

export function activate(r: Linter.Register) {
  assert(filterMessages.size == 0, "activation called unexpectedly.");
  if(subscriptions) subscriptions.dispose();

  registry = r;
  subscriptions = new CompositeDisposable;
  var activePaneID: string|undefined;

  subscriptions.add(filterData.emitter.on("poe-did-destroy-buffer", (id) => {
    filterMessages.delete(id);
    setMessages();
  }));

  subscriptions.add(settings.config.generalSettings.enableLinter.onDidChange(setMessages));

  subscriptions.add(filterData.emitter.on("poe-did-process-filter", (args:
      Filter.Params.DataUpdate) => {
    var messages: Linter.Messages = [];
    for(var line of args.lines) {
      if(line.messages) messages = messages.concat(line.messages);
    }
    filterMessages.set(args.editorID, messages);
    setMessages();
  }));
}

export function deactivate() {
  filterMessages.clear();
  subscriptions.dispose();
}

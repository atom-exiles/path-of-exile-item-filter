import { CompositeDisposable } from "atom";
import * as assert from "assert";

import * as settings from "./settings";
import * as filterData  from "./filter-manager";

var registry: Linter.Register;
var subscriptions: CompositeDisposable;
const filterMessages = new Map<string, Linter.Messages>();
const unsavedFilterMessages = new Map<string, Linter.Messages>();

function setMessages() {
  const enableLinter = settings.config.generalSettings.enableLinter.get();

  if(enableLinter) {
    registry.deleteMessages();
    var messages: Linter.Messages = [];
    filterMessages.forEach((array) => {
      // The linter modifies each message and will use that information to
      // determine what needs to be refreshed and what doesn't. In order to
      // allow modification of a single property, like a path, we have to
      // always give the linter the unmutated messages and force a full refresh.
      array.forEach((message) => {
        var result: Linter.TextMessage|Linter.HTMLMessage;

        if((<Linter.TextMessage>message).text) {
          result = {
            text: (<Linter.TextMessage>message).text,
            type: message.type,
            filePath: message.filePath,
            range: message.range,
            fix: message.fix,
            severity: message.severity
          }
        } else if((<Linter.HTMLMessage>message).html) {
          result = {
            text: (<Linter.HTMLMessage>message).html,
            type: message.type,
            filePath: message.filePath,
            range: message.range,
            fix: message.fix,
            severity: message.severity
          }
        } else {
          throw new Error("invalid message passed to the linter");
        }
        messages.push(result);
      });
    });
    registry.setMessages(messages);
  } else {
    registry.deleteMessages();
  }
}

export function activate(r: Linter.Register) {
  assert(filterMessages.size == 0 || unsavedFilterMessages.size == 0,
      "activation called unexpectedly.");
  if(subscriptions) subscriptions.dispose();

  registry = r;
  subscriptions = new CompositeDisposable;
  var activePaneID: string|undefined;

  subscriptions.add(filterData.emitter.on("poe-did-destroy-buffer", (id) => {
    filterMessages.delete(id);
    unsavedFilterMessages.delete(id);
    setMessages();
  }));

  subscriptions.add(settings.config.generalSettings.enableLinter.onDidChange(setMessages));

  subscriptions.add(filterData.emitter.on("poe-did-process-filter", (args:
      Filter.Params.DataUpdate) => {
    var messages: Linter.Messages = [];
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
    var messages = filterMessages.get(args.editor.buffer.id);

    // The linter doesn't currently allow messages for buffers with no
    // associated file. We store messages for these fileless buffers within
    // another map, but we need to migrate them over whenever the file is saved.
    if(!messages) {
      messages = unsavedFilterMessages.get(args.editor.buffer.id);
      unsavedFilterMessages.delete(args.editor.buffer.id);
      assert(args.editor.buffer.getPath(), "expected file to always exist on file rename");
      if(messages) {
        filterMessages.set(args.editor.buffer.id, messages);
      } else {
        throw new Error("buffer with path '" + args.editor.buffer.getPath() +
            "' had no stored messages");
      }
    }
    for(var message of messages) {
      message.filePath = args.path;
    }
    setMessages();
  }));
}

export function deactivate() {
  filterMessages.clear();
  unsavedFilterMessages.clear();
  subscriptions.dispose();
}

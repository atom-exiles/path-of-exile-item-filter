"use strict";
const atom_1 = require("atom");
const assert = require("assert");
const settings = require("./settings");
const filterData = require("./filter-data");
var registry;
var subscriptions;
const filterMessages = new Map();
function setMessages() {
    const enableLinter = settings.config.generalSettings.enableLinter.get();
    if (enableLinter) {
        var messages = [];
        filterMessages.forEach((m) => {
            messages = messages.concat(m);
        });
        registry.setMessages(messages);
    }
    else {
        registry.deleteMessages();
    }
}
function activate(r) {
    assert(filterMessages.size == 0, "activation called unexpectedly.");
    if (subscriptions)
        subscriptions.dispose();
    registry = r;
    subscriptions = new atom_1.CompositeDisposable;
    var activePaneID;
    subscriptions.add(filterData.emitter.on("poe-did-destroy-buffer", (id) => {
        filterMessages.delete(id);
        setMessages();
    }));
    subscriptions.add(settings.config.generalSettings.enableLinter.onDidChange(setMessages));
    subscriptions.add(filterData.emitter.on("poe-did-process-filter", (args) => {
        var messages = [];
        for (var line of args.lines) {
            if (line.messages)
                messages = messages.concat(line.messages);
        }
        filterMessages.set(args.editorID, messages);
        setMessages();
    }));
}
exports.activate = activate;
function deactivate() {
    filterMessages.clear();
    subscriptions.dispose();
}
exports.deactivate = deactivate;

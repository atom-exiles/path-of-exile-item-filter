"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = require("../data/config.json");
const packageName = require("../package.json").name;
var linterDelegate;
const deactivators = [];
function readyToActivate() {
    const jsonData = require("./json-data");
    jsonData.activate();
    deactivators.push(jsonData.deactivate);
    const filterData = require("./filter-manager");
    filterData.activate();
    deactivators.push(filterData.deactivate);
    const sound = require("./sound");
    sound.activate();
    deactivators.push(sound.deactivate);
    const completion = require("./completion");
    completion.activate();
    deactivators.push(completion.deactivate);
    completionProvider.getSuggestions = completion.getSuggestions;
    completionProvider.onDidInsertSuggestion = completion.insertedSuggestion;
    const linter = require("./linter");
    linter.activate(linterDelegate);
    deactivators.push(linter.deactivate);
    const decorations = require("./gutter-decorations");
    decorations.activate();
    deactivators.push(linter.deactivate);
}
function activate() {
    require("atom-package-deps")
        .install(packageName)
        .then(readyToActivate);
}
exports.activate = activate;
function deactivate() {
    for (var i = deactivators.length - 1; i >= 0; i--) {
        deactivators[i]();
    }
}
exports.deactivate = deactivate;
const completionProvider = {
    selector: ".source.poe",
    disableForSelector: ".source.poe .comment",
    inclusionPriority: 1,
    excludeLowerPriority: true,
    getSuggestions: () => { return []; },
    onDidInsertSuggestion: () => { return; }
};
function provideCompletion() {
    return [completionProvider];
}
exports.provideCompletion = provideCompletion;
function consumeLinter(register) {
    linterDelegate = register({ name: packageName });
}
exports.consumeLinter = consumeLinter;

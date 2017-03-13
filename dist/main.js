"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonData = require("./json-data");
const filterData = require("./filter-manager");
const sound = require("./sound");
const completion = require("./completion");
const linter = require("./linter");
const decorations = require("./gutter-decorations");
exports.config = require("../data/config.json");
const packageName = require("../package.json").name;
var linterRegister;
function readyToActivate() {
    jsonData.activate();
    filterData.activate();
    sound.activate();
    completion.activate();
    linter.activate(linterRegister);
    decorations.activate();
}
function activate() {
    require("atom-package-deps")
        .install(packageName)
        .then(readyToActivate);
}
exports.activate = activate;
function deactivate() {
    decorations.deactivate();
    linter.deactivate();
    completion.deactivate();
    sound.deactivate();
    filterData.deactivate();
    jsonData.deactivate();
}
exports.deactivate = deactivate;
function provideCompletion() {
    return [completion.provider];
}
exports.provideCompletion = provideCompletion;
function consumeLinter(registry) {
    const register = registry.register({ name: packageName });
    linterRegister = register;
}
exports.consumeLinter = consumeLinter;

"use strict";
const data = require("./data");
const completion = require("./completion");
const linter = require("./linter");
exports.config = require("../data/config.json");
const packageName = require("../package.json").name;
var linterRegister;
function readyToActivate() {
    data.activate();
    completion.activate();
    linter.activate(linterRegister);
}
function activate() {
    require("atom-package-deps")
        .install(packageName)
        .then(readyToActivate);
}
exports.activate = activate;
function deactivate() {
    linter.deactivate();
    completion.deactivate();
    data.deactivate();
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

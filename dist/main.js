"use strict";
var data = require("./data");
var completion = require("./completion");
var linter = require("./linter");
exports.config = require("../data/config.json");
var packageName = require("../package.json").name;
var linterRegister;
function readyToActivate() {
    data.setupSubscriptions();
    completion.setupSubscriptions();
    linter.setupSubscriptions(linterRegister);
}
function activate() {
    require("atom-package-deps")
        .install(packageName)
        .then(readyToActivate);
}
exports.activate = activate;
function deactivate() {
    linter.removeSubscriptions();
    completion.removeSubscriptions();
    data.removeSubscriptions();
}
exports.deactivate = deactivate;
function provideCompletion() {
    return [completion.provider];
}
exports.provideCompletion = provideCompletion;
function consumeLinter(registry) {
    var register = registry.register({ name: packageName });
    linterRegister = register;
}
exports.consumeLinter = consumeLinter;

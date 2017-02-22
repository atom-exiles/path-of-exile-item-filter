"use strict";
var data = require("./data");
var completion = require("./completion");
var linter = require("./linter");
exports.config = require('../data/config.json');
var packageName = require('../package.json').name;
function readyToActivate() {
    data.setupSubscriptions();
    completion.setupSubscriptions();
    linter.setupSubscriptions();
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
function provideLinter() {
    return linter.provider;
}
exports.provideLinter = provideLinter;

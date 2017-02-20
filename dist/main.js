"use strict";
var data = require("./data");
var completion = require("./completion");
exports.config = require('../data/config.json');
var packageName = require('../package.json').name;
function readyToActivate() {
    data.setupSubscriptions();
    completion.setupSubscriptions();
}
function activate() {
    require("atom-package-deps")
        .install(packageName)
        .then(readyToActivate);
}
exports.activate = activate;
function deactivate() {
    completion.removeSubscriptions();
    data.removeSubscriptions();
}
exports.deactivate = deactivate;
function provideCompletion() {
    return [completion.provider];
}
exports.provideCompletion = provideCompletion;

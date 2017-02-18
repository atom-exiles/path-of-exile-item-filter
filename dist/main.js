"use strict";
var atom_1 = require("atom");
var data = require("./data");
var config = require('../data/config.json');
var packageName = require('../package.json').name;
var Main = (function () {
    function Main() {
        var _this = this;
        this.config = config;
        this.readyToActivate = function () {
            data.setupSubscriptions();
            _this.emitter = new atom_1.Emitter();
            _this.subscriptions = new atom_1.CompositeDisposable();
            _this.packageName = packageName;
        };
    }
    Main.prototype.activate = function () {
        require("atom-package-deps")
            .install(packageName)
            .then(this.readyToActivate);
    };
    Main.prototype.deactivate = function () {
        this.subscriptions.dispose();
        this.emitter.dispose();
        data.removeSubscriptions();
    };
    return Main;
}());
var main = new Main();
module.exports = main;

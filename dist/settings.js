"use strict";
exports.packageName = require("../package.json").name;
exports.schema = require("../data/config.json");
var SettingValue = (function () {
    function SettingValue(key) {
        this.key = key;
    }
    SettingValue.prototype.get = function () {
        return atom.config.get(exports.packageName + "." + this.key);
    };
    SettingValue.prototype.set = function (value) {
        atom.config.set(exports.packageName + "." + this.key, value);
    };
    SettingValue.prototype.unset = function () {
        atom.config.unset(exports.packageName + "." + this.key);
    };
    SettingValue.prototype.observe = function (callback) {
        return atom.config.observe(exports.packageName + "." + this.key, callback);
    };
    SettingValue.prototype.onDidChange = function (callback) {
        return atom.config.onDidChange(exports.packageName + "." + this.key, callback);
    };
    return SettingValue;
}());
exports.config = {
    generalSettings: {
        enableCompletion: new SettingValue("generalSettings.enableCompletion")
    },
    dataSettings: {
        enableLeague: new SettingValue("dataSettings.enableLeague"),
        enableLegacy: new SettingValue("dataSettings.enableLegacy"),
        enableRecipe: new SettingValue("dataSettings.enableRecipe"),
        classWhitelist: new SettingValue("dataSettings.classWhitelist"),
        baseWhitelist: new SettingValue("dataSettings.baseWhitelist")
    },
    completionSettings: {
        enableRightLabel: new SettingValue("completionSettings.enableRightLabel"),
        enableIcon: new SettingValue("completionSettings.enableIcon")
    }
};

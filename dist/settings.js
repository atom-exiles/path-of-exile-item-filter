"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageName = require("../package.json").name;
exports.schema = require("../data/config.json");
class SettingValue {
    constructor(key) {
        this.key = key;
    }
    get() {
        return atom.config.get(exports.packageName + "." + this.key);
    }
    set(value) {
        atom.config.set(exports.packageName + "." + this.key, value);
    }
    unset() {
        atom.config.unset(exports.packageName + "." + this.key);
    }
    observe(callback) {
        return atom.config.observe(exports.packageName + "." + this.key, callback);
    }
    onDidChange(callback) {
        return atom.config.onDidChange(exports.packageName + "." + this.key, callback);
    }
}
exports.config = {
    generalSettings: {
        enableCompletion: new SettingValue("generalSettings.enableCompletion"),
        enableLinter: new SettingValue("generalSettings.enableLinter"),
        enableAlertDecorations: new SettingValue("generalSettings.enableAlertDecorations"),
        enableSetColorDecorations: new SettingValue("generalSettings.enableSetColorDecorations")
    },
    dataSettings: {
        enableLeague: new SettingValue("dataSettings.enableLeague"),
        enableLegacy: new SettingValue("dataSettings.enableLegacy"),
        enableRecipe: new SettingValue("dataSettings.enableRecipe"),
        classWhitelist: new SettingValue("dataSettings.classWhitelist"),
        baseWhitelist: new SettingValue("dataSettings.baseWhitelist")
    },
    completionSettings: {
        enableExtraSuggestions: new SettingValue("completionSettings.enableExtraSuggestions"),
        enableRightLabel: new SettingValue("completionSettings.enableRightLabel"),
        enableIcon: new SettingValue("completionSettings.enableIcon")
    },
    linterSettings: {
        enableWarnings: new SettingValue("linterSettings.enableWarnings")
    }
};

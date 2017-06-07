"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConfigValue {
    constructor(packageName, key) {
        this.packageName = packageName;
        this.key = key;
        this.promise = new Promise((resolve, reject) => {
            let observed = false;
            this.subscription = this.observe((value) => {
                if (value != null && observed) {
                    this.promise = Promise.resolve(value);
                }
                else if (value != null) {
                    observed = true;
                    resolve(value);
                }
            });
        });
    }
    dispose() {
        this.subscription.dispose();
    }
    get value() {
        return atom.config.get(this.packageName + "." + this.key);
    }
    set value(value) {
        atom.config.set(this.packageName + "." + this.key, value);
    }
    unset() {
        atom.config.unset(this.packageName + "." + this.key);
    }
    observe(callback) {
        return atom.config.observe(this.packageName + "." + this.key, callback);
    }
    onDidChange(callback) {
        return atom.config.onDidChange(this.packageName + "." + this.key, callback);
    }
}
class ConfigManager {
    constructor(packageName) {
        this.general = {
            enableCompletion: new ConfigValue(packageName, "general.enableCompletion"),
            enableLinter: new ConfigValue(packageName, "general.enableLinter"),
            enableGutter: new ConfigValue(packageName, "general.enableGutter"),
            chunkSize: new ConfigValue(packageName, "general.chunkSize")
        };
        this.data = {
            dataset: new ConfigValue(packageName, "data.dataset"),
            classWhitelist: new ConfigValue(packageName, "data.classWhitelist"),
            baseWhitelist: new ConfigValue(packageName, "data.baseWhitelist")
        };
        this.completion = {
            enableExtraSuggestions: new ConfigValue(packageName, "completion.enableExtraSuggestions"),
            enableRightLabel: new ConfigValue(packageName, "completion.enableRightLabel")
        };
        this.linter = {
            enableWarnings: new ConfigValue(packageName, "linter.enableWarnings"),
            enableInfo: new ConfigValue(packageName, "linter.enableInfo")
        };
    }
    groupDisposal(group) {
        for (var key in group) {
            group[key].dispose();
        }
        return;
    }
    dispose() {
        this.groupDisposal(this.general);
        this.groupDisposal(this.data);
        this.groupDisposal(this.completion);
        this.groupDisposal(this.linter);
        return;
    }
}
exports.default = ConfigManager;

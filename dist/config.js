"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
class ConfigValue {
    constructor(key) {
        this.accessKey = `path-of-exile-item-filter.${key}`;
    }
    get value() {
        const value = atom.config.get(this.accessKey);
        assert(value !== undefined, "expected all configuration values to be defined");
        return value;
    }
    set value(value) {
        atom.config.set(this.accessKey, value);
    }
    unset() {
        atom.config.unset(this.accessKey);
    }
    observe(callback) {
        return atom.config.observe(this.accessKey, callback);
    }
    onDidChange(callback) {
        return atom.config.onDidChange(this.accessKey, callback);
    }
}
exports.enableGutter = new ConfigValue("enableGutter");
exports.classWhitelist = new ConfigValue("classWhitelist");
exports.baseWhitelist = new ConfigValue("baseWhitelist");

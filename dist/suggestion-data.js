"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
class SuggestionData {
    constructor(config, jsonData) {
        this.config = config;
        this.jsonData = jsonData;
        this.emitter = new atom_1.Emitter;
        this.subscriptions = new atom_1.CompositeDisposable;
        this.data = jsonData.data
            .then((jd) => { return this.setupSubscriptions(jd); })
            .then((jd) => { return this.processData(jd); })
            .then((data) => { return this.updateBothWhitelists(data); })
            .then((data) => { return this.emitDataUpdate(data); });
    }
    dispose() {
        this.subscriptions.dispose();
        this.emitter.dispose();
    }
    onDidUpdateData(callback) {
        return this.emitter.on("did-update-data", callback);
    }
    emitDataUpdate(data) {
        this.emitter.emit("did-update-data", data);
        return Promise.resolve(data);
    }
    setupSubscriptions(jd) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.config.data.classWhitelist.promise;
            yield this.config.data.baseWhitelist.promise;
            yield this.config.completion.enableRightLabel.promise;
            this.subscriptions.add(this.config.completion.enableRightLabel.onDidChange((event) => {
                this.handleRightLabelToggle(event.newValue);
            }));
            this.subscriptions.add(this.config.data.classWhitelist.onDidChange(() => __awaiter(this, void 0, void 0, function* () {
                const data = yield this.data;
                this.data = this.updateClassWhitelist(data)
                    .then((data) => { return this.emitDataUpdate(data); });
            })));
            this.subscriptions.add(this.config.data.baseWhitelist.onDidChange(() => __awaiter(this, void 0, void 0, function* () {
                const data = yield this.data;
                this.data = this.updateBaseWhitelist(data)
                    .then((data) => { return this.emitDataUpdate(data); });
            })));
            return jd;
        });
    }
    appendExtraLabel(suggestions, enableRightLabel) {
        const labelText = "Extras";
        for (var suggestion of suggestions) {
            suggestion.custom = {
                backupRightLabel: labelText
            };
            if (enableRightLabel)
                suggestion.rightLabel = labelText;
        }
        return;
    }
    handleRightLabelToggle(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const suggestions = yield this.data;
            for (var subcategory in suggestions) {
                const array = suggestions[subcategory];
                for (var suggestion of array) {
                    if (value) {
                        if (suggestion.custom && suggestion.custom.backupRightLabel) {
                            suggestion.rightLabel = suggestion.custom.backupRightLabel;
                        }
                    }
                    else {
                        if (suggestion.rightLabel) {
                            suggestion.custom = {
                                backupRightLabel: suggestion.rightLabel
                            };
                            suggestion.rightLabel = undefined;
                        }
                    }
                }
            }
            return suggestions;
        });
    }
    processWhitelist(values) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            const enableRightLabel = yield this.config.completion.enableRightLabel.promise;
            const labelText = "Whitelisted";
            for (var value of values) {
                if (value.indexOf(" ") != -1) {
                    var valueText = '"' + value + '"';
                }
                else {
                    var valueText = value;
                }
                let rightLabel;
                if (enableRightLabel) {
                    rightLabel = labelText;
                }
                result.push({
                    text: valueText,
                    displayText: value,
                    rightLabel: rightLabel,
                    custom: {
                        backupRightLabel: labelText
                    }
                });
            }
            return result;
        });
    }
    updateClassWhitelist(suggestions) {
        return __awaiter(this, void 0, void 0, function* () {
            const values = yield this.config.data.classWhitelist.promise;
            suggestions.classWhitelist = yield this.processWhitelist(values);
            return suggestions;
        });
    }
    updateBaseWhitelist(suggestions) {
        return __awaiter(this, void 0, void 0, function* () {
            const values = yield this.config.data.baseWhitelist.promise;
            suggestions.baseWhitelist = yield this.processWhitelist(values);
            return suggestions;
        });
    }
    updateBothWhitelists(suggestions) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.updateClassWhitelist(suggestions)
                .then((s) => { return this.updateBaseWhitelist(s); });
        });
    }
    processData(jd) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {
                actions: jd.suggestions.actions,
                blocks: jd.suggestions.blocks,
                booleans: jd.suggestions.booleans,
                filters: jd.suggestions.filters,
                operators: jd.suggestions.operators,
                rarities: jd.suggestions.rarities,
                sockets: jd.suggestions.sockets,
                bases: [],
                classes: [],
                extraBases: jd.suggestions.extras.bases,
                extraBlocks: jd.suggestions.extras.blocks,
                extraClasses: jd.suggestions.extras.classes,
                classWhitelist: [],
                baseWhitelist: []
            };
            const enableRightLabel = yield this.config.completion.enableRightLabel.promise;
            for (var itemClass in jd.items) {
                if (itemClass.indexOf(" ") != -1) {
                    var classText = '"' + itemClass + '"';
                }
                else {
                    var classText = itemClass;
                }
                result.classes.push({
                    text: classText,
                    displayText: itemClass
                });
                for (var itemBase of jd.items[itemClass]) {
                    if (itemBase.indexOf(" ") != -1) {
                        var baseText = '"' + itemBase + '"';
                    }
                    else {
                        var baseText = itemBase;
                    }
                    let rightLabel;
                    if (enableRightLabel)
                        rightLabel = itemClass;
                    result.bases.push({
                        text: baseText,
                        displayText: itemBase,
                        rightLabel: rightLabel,
                        custom: {
                            backupRightLabel: itemClass
                        }
                    });
                }
            }
            this.appendExtraLabel(result.extraBases, enableRightLabel);
            this.appendExtraLabel(result.extraBlocks, enableRightLabel);
            this.appendExtraLabel(result.extraClasses, enableRightLabel);
            return result;
        });
    }
}
exports.default = SuggestionData;

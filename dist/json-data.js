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
const settings = require("./settings");
exports.files = {
    items: {
        core: require("../data/items/core.json"),
        league: require("../data/items/league.json"),
        legacy: require("../data/items/legacy.json"),
        recipe: require("../data/items/recipes.json")
    },
    suggestions: require("../data/suggestions.json")
};
var subscriptions;
function mergeItemData(container, itemList) {
    const enableRightLabel = settings.config.completionSettings.enableRightLabel.get();
    for (var itemClass in itemList) {
        const itemBases = itemList[itemClass];
        var knownClass = false;
        for (var c of container.completion.classes) {
            if (c.displayText && c.displayText == itemClass)
                knownClass = true;
        }
        if (!knownClass) {
            var classText = itemClass;
            if (classText.indexOf(" ") != -1)
                classText = '"' + itemClass + '"';
            container.completion.classes.push({
                text: classText,
                displayText: itemClass
            });
            container.linter.classes.push(classText);
        }
        for (var base of itemBases) {
            var baseText = base;
            if (baseText.indexOf(" ") != -1)
                baseText = '"' + base + '"';
            var rightLabel = undefined;
            if (enableRightLabel)
                rightLabel = itemClass;
            container.completion.bases.push({
                text: baseText,
                displayText: base,
                rightLabel: rightLabel,
                custom: {
                    backupRightLabel: itemClass
                }
            });
            container.linter.bases.push(baseText);
        }
    }
    return container;
}
function processItemData() {
    return __awaiter(this, void 0, void 0, function* () {
        var result = {
            completion: {
                classes: [],
                bases: [],
                whitelistClasses: [],
                whitelistBases: []
            },
            linter: {
                classes: [],
                bases: [],
                whitelistClasses: [],
                whitelistBases: []
            }
        };
        result = yield mergeItemData(result, exports.files.items.core);
        if (settings.config.dataSettings.enableLeague.get()) {
            result = yield mergeItemData(result, exports.files.items.league);
        }
        if (settings.config.dataSettings.enableLegacy.get()) {
            result = yield mergeItemData(result, exports.files.items.legacy);
        }
        if (settings.config.dataSettings.enableRecipe.get()) {
            result = yield mergeItemData(result, exports.files.items.recipe);
        }
        return result;
    });
}
function updateWhitelists(itemData) {
    const bases = settings.config.dataSettings.baseWhitelist.get();
    const classes = settings.config.dataSettings.classWhitelist.get();
    const enableRightLabel = settings.config.completionSettings.enableRightLabel.get();
    const labelText = "Whitelisted";
    itemData.completion.whitelistClasses = [];
    itemData.completion.whitelistBases = [];
    itemData.linter.whitelistClasses = [];
    itemData.linter.whitelistBases = [];
    const action = (data, c, l) => {
        for (var v of data) {
            var text = v;
            if (v.indexOf(" ") != -1) {
                text = '"' + text + '"';
            }
            var rightLabel = undefined;
            if (enableRightLabel)
                rightLabel = labelText;
            c.push({ text: text, displayText: v, rightLabel: labelText,
                custom: { backupRightLabel: labelText } });
            l.push(text);
        }
    };
    action(classes, itemData.completion.whitelistClasses, itemData.linter.whitelistClasses);
    action(bases, itemData.completion.whitelistBases, itemData.linter.whitelistBases);
}
function updateDecorations(cd) {
    const enableRightLabel = settings.config.completionSettings.enableRightLabel.get();
    const enableIcon = settings.config.completionSettings.enableIcon.get();
    const action = (s) => {
        if (enableRightLabel && s.custom && s.custom.backupRightLabel) {
            s.rightLabel = s.custom.backupRightLabel;
        }
        else {
            s.rightLabel = undefined;
        }
        if (enableIcon) { }
    };
    cd.classes.forEach(action);
    cd.bases.forEach(action);
    cd.whitelistClasses.forEach(action);
    cd.whitelistBases.forEach(action);
    for (var key in exports.files.suggestions) {
        const sb = exports.files.suggestions[key];
        sb.forEach(action);
    }
}
function activate() {
    if (subscriptions)
        subscriptions.dispose();
    if (exports.emitter)
        exports.emitter.dispose();
    subscriptions = new atom_1.CompositeDisposable;
    exports.emitter = new atom_1.Emitter;
    var itemData = processItemData();
    exports.promise = itemData.then((id) => {
        updateWhitelists(id);
        updateDecorations(id.completion);
        return id;
    });
    const action = (itemList, event) => __awaiter(this, void 0, void 0, function* () {
        if (event.newValue) {
            const id = yield itemData;
            mergeItemData(id, itemList);
        }
        else {
            itemData = processItemData();
            exports.promise = itemData;
        }
        exports.emitter.emit("poe-did-update-item-data");
    });
    subscriptions.add(settings.config.dataSettings.enableLeague.onDidChange((event) => {
        action(exports.files.items.league, event);
    }));
    subscriptions.add(settings.config.dataSettings.enableLegacy.onDidChange((event) => {
        action(exports.files.items.legacy, event);
    }));
    subscriptions.add(settings.config.dataSettings.enableRecipe.onDidChange((event) => {
        action(exports.files.items.recipe, event);
    }));
    subscriptions.add(settings.config.completionSettings.enableRightLabel.onDidChange((event) => __awaiter(this, void 0, void 0, function* () {
        const newData = yield exports.promise;
        updateDecorations(newData.completion);
    })));
    subscriptions.add(settings.config.completionSettings.enableIcon.onDidChange((event) => __awaiter(this, void 0, void 0, function* () {
        const newData = yield exports.promise;
        updateDecorations(newData.completion);
    })));
    subscriptions.add(settings.config.dataSettings.classWhitelist.onDidChange((event) => __awaiter(this, void 0, void 0, function* () {
        const id = yield itemData;
        updateWhitelists(id);
        exports.emitter.emit("poe-did-update-injected-data");
    })));
    subscriptions.add(settings.config.dataSettings.baseWhitelist.onDidChange((event) => __awaiter(this, void 0, void 0, function* () {
        const id = yield itemData;
        updateWhitelists(id);
        exports.emitter.emit("poe-did-update-injected-data");
    })));
}
exports.activate = activate;
function deactivate() {
    subscriptions.dispose();
    exports.emitter.dispose();
}
exports.deactivate = deactivate;

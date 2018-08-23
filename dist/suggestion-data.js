"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const itemsFileData = require("../data/items.json");
const soundsFileData = require("../data/sounds.json");
const suggestionFileData = require("../data/suggestions.json");
const Config = require("./config");
class SuggestionData {
    constructor() {
        this.emitter = new atom_1.Emitter();
        this.subscriptions = new atom_1.CompositeDisposable();
        this.setupSubscriptions();
        this.data = this.updateBaseData();
        this.updateBaseWhitelist();
        this.updateClassWhitelist();
        this.emitDataUpdate();
    }
    dispose() {
        this.subscriptions.dispose();
        this.emitter.dispose();
    }
    onDidUpdateData(callback) {
        return this.emitter.on("did-update-data", callback);
    }
    emitDataUpdate() {
        this.emitter.emit("did-update-data", this.data);
    }
    setupSubscriptions() {
        this.subscriptions.add(Config.baseWhitelist.onDidChange(_ => {
            this.updateBaseWhitelist();
            this.emitDataUpdate();
        }), Config.classWhitelist.onDidChange(_ => {
            this.updateClassWhitelist();
            this.emitDataUpdate();
        }));
    }
    processWhitelist(values) {
        const result = [];
        const rightLabel = "Whitelisted";
        for (const value of values) {
            const valueText = value.indexOf(" ") !== -1 ? `"${value}"` : value;
            result.push({
                text: valueText,
                displayText: value,
                rightLabel,
            });
        }
        return result;
    }
    updateBaseWhitelist() {
        this.data.baseWhitelist = this.processWhitelist(Config.baseWhitelist.value);
    }
    updateClassWhitelist() {
        this.data.classWhitelist = this.processWhitelist(Config.classWhitelist.value);
    }
    updateBaseData() {
        const result = {
            actions: suggestionFileData.actions,
            blocks: suggestionFileData.blocks,
            booleans: suggestionFileData.booleans,
            filters: suggestionFileData.filters,
            operators: suggestionFileData.operators,
            rarities: suggestionFileData.rarities,
            sockets: suggestionFileData.sockets,
            bases: [],
            classes: [],
            sounds: [],
            extraBases: suggestionFileData.extras.bases,
            extraBlocks: suggestionFileData.extras.blocks,
            extraClasses: suggestionFileData.extras.classes,
            classWhitelist: [],
            baseWhitelist: [],
        };
        for (const itemClass in itemsFileData) {
            const classText = itemClass.indexOf(" ") !== -1 ? `"${itemClass}"` : itemClass;
            result.classes.push({
                text: classText,
                displayText: itemClass,
            });
            for (const itemBase of itemsFileData[itemClass]) {
                const baseText = itemBase.indexOf(" ") !== -1 ? `"${itemBase}"` : itemBase;
                result.bases.push({
                    text: baseText,
                    displayText: itemBase,
                    rightLabel: itemClass,
                });
            }
        }
        for (const id in soundsFileData) {
            const sound = soundsFileData[id];
            if (!sound)
                continue;
            const displayText = sound.label ? sound.label : id;
            result.sounds.push({ text: id, displayText });
        }
        const appendExtrasLabel = (suggestions) => {
            const labelText = "Extras";
            for (const suggestion of suggestions) {
                suggestion.rightLabel = labelText;
            }
        };
        appendExtrasLabel(result.extraBases);
        appendExtrasLabel(result.extraBlocks);
        appendExtrasLabel(result.extraClasses);
        return result;
    }
}
exports.SuggestionData = SuggestionData;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const itemsFileData = require("../data/items.json");
const soundsFileData = require("../data/sounds.json");
const Config = require("./config");
class ValidationData {
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
    updateBaseData() {
        const validBases = [];
        const validClasses = [];
        for (const c in itemsFileData) {
            validClasses.push(c);
            for (const b of itemsFileData[c]) {
                validBases.push(b);
            }
        }
        const validSounds = [];
        for (const s in soundsFileData) {
            validSounds.push(s);
        }
        return {
            validBases, validClasses, validSounds, classWhitelist: [], baseWhitelist: []
        };
    }
    updateClassWhitelist() {
        this.data.classWhitelist = Config.classWhitelist.value ? Config.classWhitelist.value : [];
    }
    updateBaseWhitelist() {
        this.data.baseWhitelist = Config.baseWhitelist.value ? Config.baseWhitelist.value : [];
    }
}
exports.ValidationData = ValidationData;

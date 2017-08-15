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
class ValidationData {
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
            this.subscriptions.add(this.config.data.classWhitelist.onDidChange((event) => __awaiter(this, void 0, void 0, function* () {
                const data = yield this.data;
                this.data = this.updateClassWhitelist(data)
                    .then((data) => { return this.emitDataUpdate(data); });
            })));
            this.subscriptions.add(this.config.data.baseWhitelist.onDidChange((event) => __awaiter(this, void 0, void 0, function* () {
                const data = yield this.data;
                this.data = this.updateBaseWhitelist(data)
                    .then((data) => { return this.emitDataUpdate(data); });
            })));
            return jd;
        });
    }
    processJSONData(jsonData) {
        const validBases = [];
        const validClasses = [];
        for (var c in jsonData.items) {
            validClasses.push(c);
            for (var b of jsonData.items[c]) {
                validBases.push(b);
            }
        }
        const validSounds = [];
        for (var s in jsonData.sounds) {
            validSounds.push(s);
        }
        const result = { validBases, validClasses, validSounds };
        return result;
    }
    updateClassWhitelist(data) {
        return __awaiter(this, void 0, void 0, function* () {
            data.classWhitelist = yield this.config.data.classWhitelist.promise;
            return data;
        });
    }
    updateBaseWhitelist(data) {
        return __awaiter(this, void 0, void 0, function* () {
            data.baseWhitelist = yield this.config.data.baseWhitelist.promise;
            return data;
        });
    }
    updateBothWhitelists(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.updateClassWhitelist(data)
                .then((d) => { return this.updateBaseWhitelist(d); });
        });
    }
    processData(jd) {
        return __awaiter(this, void 0, void 0, function* () {
            const classWhitelist = yield this.config.data.classWhitelist.promise;
            const baseWhitelist = yield this.config.data.baseWhitelist.promise;
            const processedData = this.processJSONData(jd);
            let result = {
                validClasses: processedData.validClasses,
                validBases: processedData.validBases,
                validSounds: processedData.validSounds,
                classWhitelist,
                baseWhitelist
            };
            return result;
        });
    }
}
exports.ValidationData = ValidationData;

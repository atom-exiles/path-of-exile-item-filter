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
const path = require("path");
class JSONData {
    constructor(config) {
        this.config = config;
        this.dataPath = path.join(__dirname, "../data");
        this.emitter = new atom_1.Emitter;
        this.data = this.setupSubscription().then(() => {
            return this.updateData();
        });
    }
    dispose() {
        this.subscription.dispose();
        this.emitter.dispose();
        return;
    }
    onDidUpdateData(callback) {
        return this.emitter.on("did-update-data", (data) => {
            callback(data);
        });
    }
    setupSubscription() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.config.data.dataset.promise;
            this.subscription = this.config.data.dataset.onDidChange(() => {
                this.data = this.updateData();
            });
            return;
        });
    }
    generateFileList(dataset) {
        const datasetPath = path.join(this.dataPath, dataset);
        const result = {
            items: new atom_1.File(path.join(datasetPath, "items.json")),
            suggestions: new atom_1.File(path.join(datasetPath, "suggestions.json"))
        };
        return result;
    }
    processJSONFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield file.read();
            let result;
            try {
                result = JSON.parse(content);
            }
            catch (e) {
                const message = e.message + ' within "' + file.getBaseName() + '"';
                atom.notifications.addFatalError(message, {
                    dismissable: true,
                    stack: e.stack
                });
                throw new Error(message);
            }
            return result;
        });
    }
    updateData() {
        return __awaiter(this, void 0, void 0, function* () {
            const dataset = yield this.config.data.dataset.promise;
            const list = this.generateFileList(dataset);
            const result = {
                items: yield this.processJSONFile(list.items),
                suggestions: yield this.processJSONFile(list.suggestions)
            };
            this.emitter.emit("did-update-data", result);
            return result;
        });
    }
}
exports.default = JSONData;

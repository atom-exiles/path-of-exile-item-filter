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
const _ = require("lodash");
const item_filter_1 = require("./item-filter");
function transformChanges(c) {
    let result = [];
    let changes = [];
    for (var change of c) {
        changes.push({
            newExtent: change.newExtent.copy(),
            oldExtent: change.oldExtent.copy(),
            start: change.start.copy()
        });
    }
    changes.sort((a, b) => {
        if (a.start.row == b.start.row) {
            return 0;
        }
        else if (a.start.row < b.start.row) {
            return -1;
        }
        else {
            return 1;
        }
    });
    for (var i = 0; i < changes.length; i++) {
        const currentChange = changes[i];
        const lastResult = _.last(result);
        if (i == 0 || (lastResult && lastResult.start != currentChange.start.row)) {
            result.push({
                newExtent: currentChange.newExtent.row,
                oldExtent: currentChange.oldExtent.row,
                start: currentChange.start.row
            });
        }
    }
    return result;
}
class FilterManager {
    constructor(config, validationData, registry) {
        this.config = config;
        this.validationData = validationData;
        this.registry = registry;
        this.emitter = new atom_1.Emitter;
        this.subscriptions = new atom_1.CompositeDisposable;
        this.filters = new Map;
        this.observedFilters = new Array;
        this.setupSubscriptions();
    }
    dispose() {
        this.filters.forEach((filterData) => {
            filterData.subscription.dispose();
            filterData.filter.dispose();
        });
        this.emitter.dispose();
        this.subscriptions.dispose();
    }
    setupSubscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validationData.data;
            this.subscriptions.add(this.registry.observeFilters((editor) => {
                this.handleNewFilter(editor);
            }));
            this.subscriptions.add(this.validationData.onDidUpdateData((data) => {
                this.filters.forEach((filterData, editorID) => {
                    filterData.filter.dispose();
                    this.emitter.emit("did-destroy-filter", filterData.editor.id);
                    filterData.filter = new item_filter_1.default(this.config, this.validationData, filterData.editor);
                    this.emitter.emit("did-add-filter", filterData);
                });
            }));
            this.subscriptions.add(this.registry.onDidDestroyFilter((editorID) => {
                this.handleDestroyedFilter(editorID);
            }));
            return;
        });
    }
    onDidAddFilter(callback) {
        return this.emitter.on("did-add-filter", (filterData) => {
            callback(filterData);
        });
    }
    onDidDestroyFilter(callback) {
        return this.emitter.on("did-destroy-filter", (editorID) => {
            callback(editorID);
        });
    }
    observeFilters(callback) {
        this.filters.forEach((filterData) => {
            callback(filterData);
        });
        return this.onDidAddFilter(callback);
    }
    onDidProcessFilter(callback) {
        return this.emitter.on("did-process-filter", (processedData) => {
            callback(processedData);
        });
    }
    onDidReprocessFilter(callback) {
        return this.emitter.on("did-reprocess-filter", (processedData) => {
            callback(processedData);
        });
    }
    observeProcessedFilters(callback) {
        this.observedFilters.forEach((editorID) => {
            const filterData = this.filters.get(editorID);
            if (filterData) {
                filterData.filter.lines.then((ld) => {
                    callback({
                        editor: filterData.editor,
                        filter: filterData.filter,
                        lines: ld
                    });
                });
            }
            else {
                throw new Error("observed filter with no associated filter data");
            }
        });
        return this.emitter.on("did-process-filter", (filterData) => {
            if (!this.observedFilters.includes(filterData.editor.id)) {
                this.observedFilters.push(filterData.editor.id);
                callback(filterData);
            }
            else {
                throw new Error("observed the same editor twice");
            }
        });
    }
    handleNewFilter(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscription = editor.onDidStopChanging((event) => {
                if (event.changes.length == 0)
                    return;
                const filterData = this.filters.get(editor.id);
                if (filterData) {
                    const changes = transformChanges(event.changes);
                    filterData.filter.update(changes).then((filter) => {
                        this.emitter.emit("did-reprocess-filter", {
                            editor: filterData.editor,
                            filter: filterData.filter,
                            lines: filter,
                            changes
                        });
                    });
                }
                else {
                    throw new Error("filter data missing within a change event");
                }
            });
            const filter = new item_filter_1.default(this.config, this.validationData, editor);
            const filterData = { editor, filter, subscription };
            this.filters.set(editor.id, filterData);
            this.emitter.emit("did-add-filter", filterData);
            const lines = yield filter.lines;
            this.emitter.emit("did-process-filter", {
                editor,
                filter,
                lines
            });
            return;
        });
    }
    handleDestroyedFilter(editorID) {
        const filterData = this.filters.get(editorID);
        if (filterData) {
            filterData.subscription.dispose();
            filterData.filter.dispose();
            this.filters.delete(editorID);
            _.pull(this.observedFilters, editorID);
        }
        else {
            throw new Error("attempted to destroy an unknown item filter");
        }
        return;
    }
}
exports.default = FilterManager;

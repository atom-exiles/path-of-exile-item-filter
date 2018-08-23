"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const item_filter_1 = require("./item-filter");
class FilterManager {
    constructor(validationData, registry) {
        this.validationData = validationData;
        this.registry = registry;
        this.emitter = new atom_1.Emitter();
        this.subscriptions = new atom_1.CompositeDisposable();
        this.filters = new Map();
        this.setupSubscriptions();
    }
    dispose() {
        this.filters.forEach(filterData => {
            filterData.subscription.dispose();
            filterData.filter.dispose();
        });
        this.emitter.dispose();
        this.subscriptions.dispose();
    }
    setupSubscriptions() {
        this.subscriptions.add(this.registry.observeFilters(editor => {
            this.handleNewFilter(editor);
        }));
        this.subscriptions.add(this.validationData.onDidUpdateData(_ => {
            this.filters.forEach((filterData, _) => {
                filterData.filter.fullUpdate();
                this.emitter.emit("did-reprocess-filter", {
                    editor: filterData.editor,
                    lines: filterData.filter.lines,
                });
            });
        }));
        this.subscriptions.add(this.registry.onDidDestroyFilter(editorID => {
            this.handleDestroyedFilter(editorID);
        }));
        return;
    }
    onDidAddFilter(callback) {
        return this.emitter.on("did-add-filter", filterData => {
            callback(filterData);
        });
    }
    onDidDestroyFilter(callback) {
        return this.emitter.on("did-destroy-filter", editorID => {
            callback(editorID);
        });
    }
    observeFilters(callback) {
        this.filters.forEach(filterData => {
            callback(filterData);
        });
        return this.onDidAddFilter(callback);
    }
    onDidProcessFilter(callback) {
        return this.emitter.on("did-process-filter", processedData => {
            callback(processedData);
        });
    }
    onDidReprocessFilter(callback) {
        return this.emitter.on("did-reprocess-filter", processedData => {
            callback(processedData);
        });
    }
    observeProcessedFilters(callback) {
        this.filters.forEach(filterData => {
            callback({ editor: filterData.editor, lines: filterData.filter.lines });
        });
        return this.onDidProcessFilter(callback);
    }
    handleNewFilter(editor) {
        const subscription = editor.getBuffer().onDidStopChanging(event => {
            if (event.changes.length === 0)
                return;
            const filterData = this.filters.get(editor.id);
            if (filterData) {
                filterData.filter.update(event.changes);
                this.emitter.emit("did-reprocess-filter", {
                    editor: filterData.editor,
                    lines: filterData.filter.lines,
                });
            }
            else {
                throw new Error("filter data missing within a change event");
            }
        });
        const filter = new item_filter_1.ItemFilter(this.validationData, editor);
        const filterData = { editor, filter, subscription };
        this.filters.set(editor.id, filterData);
        this.emitter.emit("did-add-filter", filterData);
        this.emitter.emit("did-process-filter", {
            editor,
            lines: filter.lines,
        });
    }
    handleDestroyedFilter(editorID) {
        const filterData = this.filters.get(editorID);
        if (filterData) {
            filterData.subscription.dispose();
            filterData.filter.dispose();
            this.filters.delete(editorID);
            this.emitter.emit("did-destroy-filter", editorID);
        }
        else {
            throw new Error("attempted to destroy an unknown item filter");
        }
    }
}
exports.FilterManager = FilterManager;

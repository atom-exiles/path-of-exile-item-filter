"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const atom_1 = require("atom");
const path = require("path");
const assert = require("assert");
const data = require("./data");
class FilterManager {
    constructor(editor) {
        this.editor = editor;
        this.subscriptions = new atom_1.CompositeDisposable;
        this.subscriptions.add(editor.buffer.onDidChangePath((newPath) => {
            if (this.isFilter()) {
                this.registerFilter();
            }
            else {
                this.filter = undefined;
                if (this.filterSubs)
                    this.filterSubs.dispose();
            }
        }));
        this.subscriptions.add(editor.buffer.onDidDestroy(() => {
            this.destructor();
        }));
        this.subscriptions.add(data.emitter.on("poe-did-update-item-data", () => {
            this.processIfFilter();
        }));
        this.subscriptions.add(data.emitter.on("poe-did-update-injected-data", () => {
            this.processIfFilter();
        }));
        if (this.isFilter()) {
            this.registerFilter();
            this.processFilter();
        }
        else if (this.filterSubs)
            this.filterSubs.dispose();
    }
    destructor() {
        this.filter = undefined;
        if (this.filterSubs)
            this.filterSubs.dispose();
        this.subscriptions.dispose();
        exports.buffers.delete(this.editor.buffer.id);
        exports.emitter.emit('poe-did-destroy-buffer', this.editor.buffer.id);
    }
    isFilter() {
        if (path.extname(this.editor.buffer.getPath()) == ".filter")
            return true;
        else
            return false;
    }
    registerFilter() {
        if (!this.filterSubs)
            this.filterSubs = new atom_1.CompositeDisposable();
        this.filterSubs.add(this.editor.buffer.onDidChange((event) => {
            if (this.changes) {
                this.changes.oldRange = event.oldRange.union(this.changes.oldRange);
                this.changes.newRange = event.newRange.union(this.changes.newRange);
            }
            else {
                this.changes = { oldRange: event.oldRange.copy(), newRange: event.newRange.copy() };
            }
        }));
        this.filterSubs.add(this.editor.buffer.onDidStopChanging(() => {
            this.processFilterChanges();
        }));
    }
    processIfFilter() {
        if (this.isFilter())
            this.processFilter;
    }
    processFilter() {
        return __awaiter(this, void 0, void 0, function* () {
            const oldRange = new atom_1.Range([0, 0], [0, 0]);
            const lastRow = this.editor.getLastBufferRow();
            const lastRowText = this.editor.lineTextForBufferRow(lastRow);
            const lastColumn = lastRowText.length - 1;
            const newRange = new atom_1.Range([0, 0], [lastRow, lastColumn]);
            this.filter = this.getLineInfo({ oldRange: oldRange, newRange: newRange });
            const lines = yield this.filter;
            exports.emitter.emit("poe-did-process-filter", { editorID: this.editor.buffer.id, lines: lines });
        });
    }
    processFilterChanges() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.changes || !this.filter)
                return;
            this.filter = this.getLineInfo(this.changes);
            const lines = yield this.filter;
            exports.emitter.emit("poe-did-process-filter", { editorID: this.editor.buffer.id, lines: lines });
        });
    }
    getLineInfo(change) {
        return __awaiter(this, void 0, void 0, function* () {
            const linterData = yield data.linterData;
            return [];
        });
    }
}
var subscriptions;
exports.buffers = new Map();
function activate() {
    assert(exports.buffers.size == 0, "activation called unexpectedly.");
    if (subscriptions)
        subscriptions.dispose();
    if (exports.emitter)
        exports.emitter.dispose();
    exports.emitter = new atom_1.Emitter;
    subscriptions = new atom_1.CompositeDisposable;
    const editor = atom.workspace.getActiveTextEditor();
    if (editor) {
        exports.buffers.set(editor.buffer.id, new FilterManager(editor));
    }
    subscriptions.add(atom.workspace.observeTextEditors((editor) => {
        if (exports.buffers.has(editor.buffer.id))
            return;
        exports.buffers.set(editor.buffer.id, new FilterManager(editor));
    }));
}
exports.activate = activate;
function deactivate() {
    exports.emitter.clear();
    exports.buffers.forEach((buffer) => buffer.destructor());
    exports.buffers.clear();
}
exports.deactivate = deactivate;

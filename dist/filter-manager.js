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
const assert = require("assert");
const data = require("./json-data");
const settings = require("./settings");
const fp = require("./filter-processor");
class FilterManager {
    constructor(editor) {
        this.editor = editor;
        this.subscriptions = new atom_1.CompositeDisposable;
        this.subscriptions.add(editor.onDidChangeGrammar((grammar) => {
            if (this.isFilter()) {
                this.registerFilter();
                this.processFilter();
            }
            else {
                this.filter = undefined;
                if (this.filterSubs)
                    this.filterSubs.dispose();
                exports.emitter.emit("poe-did-unregister-filter", this.editor.buffer.id);
            }
        }));
        this.subscriptions.add(editor.buffer.onDidChangePath((newPath) => {
            if (this.isFilter()) {
                exports.emitter.emit("poe-did-rename-filter", { editor: this.editor,
                    path: newPath });
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
        if (this.isFilter())
            exports.emitter.emit("poe-did-unregister-filter", this.editor.buffer.id);
        exports.emitter.emit("poe-did-destroy-buffer", this.editor.buffer.id);
    }
    isFilter() {
        const grammar = this.editor.getGrammar();
        if (grammar.scopeName === "source.poe")
            return true;
        else
            return false;
    }
    registerFilter() {
        if (!this.filterSubs)
            this.filterSubs = new atom_1.CompositeDisposable;
        this.filterSubs.add(this.editor.buffer.onDidChange((event) => {
            if (this.changes) {
                this.changes.oldRange = event.oldRange.union(this.changes.oldRange);
                this.changes.newRange = event.newRange.union(this.changes.newRange);
            }
            else {
                this.changes = { oldRange: event.oldRange.copy(), newRange: event.newRange.copy() };
            }
        }));
        this.filterSubs.add(this.editor.buffer.onDidStopChanging(() => __awaiter(this, void 0, void 0, function* () {
            this.processFilterChanges();
        })));
        this.filterSubs.add(settings.config.linterSettings.enableWarnings.onDidChange(() => {
            this.processFilter();
        }));
        exports.emitter.emit("poe-did-register-filter", this.editor.buffer.id);
    }
    processIfFilter() {
        if (this.isFilter())
            this.processFilter();
        else if (this.filter) {
            this.filter = undefined;
            exports.emitter.emit("poe-did-unregister-filter", this.editor.buffer.id);
        }
    }
    processFilter() {
        return __awaiter(this, void 0, void 0, function* () {
            const oldRange = new atom_1.Range([0, 0], [0, 0]);
            const lastRow = this.editor.getLastBufferRow();
            const lastRowText = this.editor.lineTextForBufferRow(lastRow);
            const lastColumn = lastRowText.length - 1;
            const newRange = new atom_1.Range([0, 0], [lastRow, lastColumn]);
            const itemData = yield data.filterItemData;
            const result = new Promise((resolve, reject) => {
                const lineInfo = fp.parseLineInfo({
                    changes: { oldRange, newRange },
                    editor: this.editor,
                    filter: undefined,
                    itemData,
                    reset: true
                });
                resolve(lineInfo);
            });
            const lineInfo = yield result;
            exports.emitter.emit("poe-did-process-filter", { editor: this.editor, lines: lineInfo });
            this.filter = result;
        });
    }
    processFilterChanges() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.changes || !this.filter)
                return;
            const itemData = yield data.filterItemData;
            const previousData = yield this.filter;
            const result = new Promise((resolve, reject) => {
                const lineInfo = fp.parseLineInfo({
                    changes: this.changes,
                    editor: this.editor,
                    filter: previousData,
                    itemData,
                    reset: false
                });
                resolve(lineInfo);
            });
            this.changes = undefined;
            const lineInfo = yield result;
            exports.emitter.emit("poe-did-process-filter", { editor: this.editor, lines: lineInfo });
            this.filter = result;
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

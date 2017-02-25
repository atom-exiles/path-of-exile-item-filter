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
const settings = require("./settings");
const data = require("./data");
class ItemFilter {
    constructor(editor) {
        this.editor = editor;
        this.lineInfo = this.parseBuffer();
    }
    destructor() { }
    parseBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            const linterData = yield data.linterData;
            return [];
        });
    }
    reparseBufferRanges(modifiedRanges) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
class BufferManager {
    constructor(editor) {
        this.editor = editor;
        this.subscriptions = new atom_1.CompositeDisposable;
        this.subscriptions.add(editor.buffer.onDidChangePath((newPath) => {
            if (this.isFilter())
                this.registerFilter();
            else if (this.filterSubs)
                this.filterSubs.dispose();
        }));
        if (this.isFilter()) {
            this.registerFilter();
            this.processFilter();
        }
        else if (this.filterSubs)
            this.filterSubs.dispose();
    }
    destructor() {
        if (this.filter)
            this.filter.destructor();
        if (this.filterSubs)
            this.filterSubs.dispose();
        this.subscriptions.dispose();
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
            if (!this.changes)
                this.changes = [];
            this.changes.push(event);
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
            if (this.filter)
                this.filter.destructor();
            this.filter = new ItemFilter(this.editor);
            yield this.filter.lineInfo;
            exports.emitter.emit("poe-did-process-filter", this.filter);
        });
    }
    processFilterChanges() {
        if (!this.changes || this.changes.length == 0)
            return;
        this.filter.reparseBufferRanges([]);
    }
}
var registry;
var subscriptions;
function activate(r) {
    if (subscriptions)
        subscriptions.dispose();
    if (exports.emitter)
        exports.emitter.dispose();
    registry = r;
    exports.emitter = new atom_1.Emitter;
    subscriptions = new atom_1.CompositeDisposable;
    const startupAction = (item) => {
        if (!settings.config.generalSettings.enableLinter.get())
            return;
        if (item instanceof require("atom").TextEditor) {
            if (exports.currentBuffer)
                exports.currentBuffer.destructor();
            exports.currentBuffer = new BufferManager(item);
        }
        else {
            if (exports.currentBuffer) {
                exports.currentBuffer.destructor();
                exports.currentBuffer = undefined;
            }
        }
    };
    subscriptions.add(atom.workspace.observeActivePaneItem(startupAction));
    subscriptions.add(settings.config.generalSettings.enableLinter.onDidChange((newValue) => {
        const item = atom.workspace.getActivePaneItem();
        if (item)
            startupAction(item);
    }));
    subscriptions.add(data.emitter.on("poe-did-update-item-data", () => {
        if (exports.currentBuffer)
            exports.currentBuffer.processIfFilter();
    }));
    subscriptions.add(data.emitter.on("poe-did-update-injected-data", () => {
        if (exports.currentBuffer)
            exports.currentBuffer.processIfFilter();
    }));
}
exports.activate = activate;
function deactivate() {
    exports.currentBuffer = undefined;
    subscriptions.dispose();
    exports.emitter.dispose();
}
exports.deactivate = deactivate;

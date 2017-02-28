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
const settings = require("./settings");
const parser = require("./parser");
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
        this.filterSubs.add(settings.config.linterSettings.enableWarnings.onDidChange(() => {
            this.processFilter();
        }));
    }
    processIfFilter() {
        if (this.isFilter())
            this.processFilter();
    }
    processFilter() {
        const oldRange = new atom_1.Range([0, 0], [0, 0]);
        const lastRow = this.editor.getLastBufferRow();
        const lastRowText = this.editor.lineTextForBufferRow(lastRow);
        const lastColumn = lastRowText.length - 1;
        const newRange = new atom_1.Range([0, 0], [lastRow, lastColumn]);
        this.filter = this.parseLineInfo(this.filter, { oldRange: oldRange,
            newRange: newRange }, true);
    }
    processFilterChanges() {
        if (!this.changes || !this.filter)
            return;
        this.filter = this.parseLineInfo(this.filter, this.changes);
        this.changes = undefined;
    }
    translateLineRanges(line, delta) {
        switch (line.type) {
            case "Block":
                {
                    const fb = line.data;
                    fb.scope = fb.scope.translate(delta);
                    fb.type.range = fb.type.range.translate(delta);
                    if (fb.trailingComment) {
                        fb.trailingComment.range = fb.trailingComment.range.translate(delta);
                    }
                    line.data = fb;
                }
                break;
            case "Comment":
                {
                    const fb = line.data;
                    fb.range = fb.range.translate(delta);
                }
                break;
            case "Rule":
                {
                    const fb = line.data;
                    fb.range = fb.range.translate(delta);
                    fb.type.range = fb.type.range.translate(delta);
                    if (fb.operator)
                        fb.operator.range = fb.operator.range.translate(delta);
                    fb.values.forEach((value) => {
                        value.range = value.range.translate(delta);
                    });
                    if (fb.trailingComment) {
                        fb.trailingComment.range = fb.trailingComment.range.translate(delta);
                    }
                }
                break;
            case "Unknown":
                {
                    const fb = line.data;
                    fb.range = fb.range.translate(delta);
                }
                break;
            default:
                break;
        }
    }
    parseLineInfo(filter, changes, reset = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = this.editor.buffer.getLines();
            const itemData = yield data.filterItemData;
            var previousLines;
            if (reset)
                previousLines = [];
            else if (filter)
                previousLines = yield filter;
            else
                throw new Error("unexpected state for getLineInfo.");
            var output = [];
            var lowerAdjustment;
            if (reset)
                lowerAdjustment = 0;
            else
                lowerAdjustment = lines.length - previousLines.length;
            var upperPartition = [];
            if (changes.oldRange.start.row > 0) {
                upperPartition = previousLines.slice(0, changes.oldRange.start.row);
            }
            output = output.concat(upperPartition);
            var newExtent = changes.newRange.end.row - changes.newRange.start.row;
            for (var i = 0; i <= newExtent; i++) {
                const row = changes.newRange.start.row + i;
                const currentLine = lines[row];
                const result = parser.parseLine({ editor: this.editor, itemData: itemData,
                    lineText: currentLine, row: row, filePath: this.editor.buffer.getPath() });
                assert(result, "parseLine should always return a Filter.Line");
                output.push(result);
            }
            var lowerPartition;
            if (reset) {
                lowerPartition = [];
            }
            else {
                const remaining = lines.length - output.length;
                lowerPartition = previousLines.splice(previousLines.length - remaining, previousLines.length);
            }
            const delta = new atom_1.Point(lowerAdjustment, 0);
            lowerPartition.forEach((line) => {
                this.translateLineRanges(line, delta);
                output.push(line);
            });
            exports.emitter.emit("poe-did-process-filter", { editorID: this.editor.buffer.id, lines: output });
            return output;
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

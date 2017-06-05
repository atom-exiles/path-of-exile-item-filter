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
const _ = require("lodash");
const assert = require("assert");
const filter_processor_1 = require("./filter-processor");
function recursivelyShiftRanges(obj, shift) {
    for (var property of Object.keys(obj)) {
        const value = obj[property];
        if (_.has(value, "start.row") && _.has(value, "end.row")) {
            value.start.row += shift;
            value.end.row += shift;
        }
        else if (typeof value == "object") {
            recursivelyShiftRanges(value, shift);
        }
    }
}
function shiftLineRanges(lines, shift) {
    for (var line of lines) {
        recursivelyShiftRanges(line, shift);
    }
}
class ItemFilter {
    constructor(config, validationData, editor) {
        this.config = config;
        this.validationData = validationData;
        this.editor = editor;
        const p1 = this.validationData.data;
        const p2 = this.config.general.chunkSize.promise;
        this.lines = Promise.all([p1, p2])
            .then((params) => { return this.processFilter(params[0], params[1]); });
    }
    dispose() { }
    update(changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = this.editor.buffer.getLines();
            const filter = yield this.lines;
            return this.lines = this.validationData.data.then((data) => {
                return new Promise((resolve, reject) => {
                    let result = [];
                    let shift = 0;
                    let currentIndex = 0;
                    for (var change of changes) {
                        if (change.start != currentIndex) {
                            const upperPartition = filter.slice(currentIndex, change.start);
                            if (shift != 0)
                                shiftLineRanges(upperPartition, shift);
                            result = result.concat(upperPartition);
                            currentIndex += upperPartition.length;
                        }
                        const changedLines = lines.slice(currentIndex, currentIndex + change.newExtent + 1);
                        let processedLines = filter_processor_1.processLines({
                            lines: changedLines,
                            data: data,
                            row: change.start,
                            file: this.editor.buffer.getPath()
                        });
                        result = result.concat(processedLines);
                        currentIndex += processedLines.length;
                        shift += change.newExtent - change.oldExtent;
                    }
                    const lastChange = _.last(changes);
                    if (lastChange == null) {
                        throw new Error("update called with no changes");
                    }
                    const sliceIndex = lastChange.start + lastChange.oldExtent + 1;
                    const slice = filter.splice(sliceIndex);
                    if (shift != 0)
                        shiftLineRanges(slice, shift);
                    result = result.concat(slice);
                    assert(result.length == lines.length, 'output size mismatch (' +
                        result.length + ' vs ' + lines.length + ')');
                    resolve(result);
                });
            });
        });
    }
    processFilter(data, chunkSize) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = this.editor.buffer.getLines();
            return new Promise((resolve, reject) => {
                var container = [];
                try {
                    const taskPath = path.join(__dirname, "tasks", "processFilterFile.js");
                    const task = atom_1.Task.once(taskPath, {
                        lines,
                        data,
                        row: 0,
                        file: this.editor.buffer.getPath(),
                        chunkSize
                    }, () => {
                        resolve(container);
                    });
                    task.on("did-process-chunk", (chunk) => {
                        container.push.apply(container, chunk);
                    });
                }
                catch (e) {
                    atom.notifications.addInfo('Task Creation Failed', {
                        description: 'Failed to offload processing of this filter to another process.',
                        detail: 'The filter will still be processed, but a separate process will not be used.' +
                            '\nAtom may hang for several seconds when opening large item filters.'
                    });
                    const chunkSize = this.config.general.chunkSize.value;
                    if (chunkSize) {
                        const filter = filter_processor_1.processLines({
                            lines,
                            data,
                            row: 0,
                            file: this.editor.buffer.getPath()
                        });
                        resolve(filter);
                    }
                    else {
                        throw new Error("expected chunkSize to be defined");
                    }
                }
            });
        });
    }
}
exports.default = ItemFilter;

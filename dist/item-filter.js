"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const filter_processor_1 = require("./filter-processor");
function recursivelyShiftRanges(obj, shift) {
    for (const property of Object.keys(obj)) {
        const value = obj[property];
        if (_.has(value, "start.row") && _.has(value, "end.row")) {
            value.start.row += shift;
            value.end.row += shift;
        }
        else if (typeof value === "object") {
            recursivelyShiftRanges(value, shift);
        }
    }
}
function shiftLineRanges(lines, shift) {
    for (const line of lines) {
        recursivelyShiftRanges(line, shift);
    }
}
class ItemFilter {
    constructor(validationData, editor) {
        this.validationData = validationData;
        this.editor = editor;
        this.lines = [];
        this.processFilter();
    }
    dispose() { }
    update(changes) {
        if (changes.length === 0)
            return;
        const editorLines = this.editor.getBuffer().getLines();
        const filterLines = this.lines;
        let startIndex;
        let upperPartition;
        let lowerPartition;
        let change;
        if (changes.length === 1) {
            const atomChange = changes[0];
            change = {
                oldRange: atomChange.oldRange.copy(),
                newRange: atomChange.newRange.copy(),
            };
            startIndex = atomChange.start.row;
        }
        else {
            const first = _.first(changes);
            const last = _.last(changes);
            change = {
                oldRange: first.oldRange.union(last.oldRange),
                newRange: first.newRange.union(last.newRange),
            };
            startIndex = first.start.row;
        }
        const reprocessCount = change.newRange.end.row - change.newRange.start.row + 1;
        if (change.oldRange.start.row !== 0) {
            upperPartition = filterLines.slice(0, change.oldRange.start.row);
        }
        if (change.oldRange.end.row < filterLines.length) {
            const partition = filterLines.slice(change.oldRange.end.row + 1, filterLines.length);
            shiftLineRanges(partition, change.newRange.end.row - change.oldRange.end.row);
            lowerPartition = partition;
        }
        const processedLines = filter_processor_1.processLines({
            lines: editorLines.slice(startIndex, startIndex + reprocessCount),
            data: this.validationData.data,
            row: startIndex,
            file: this.editor.getBuffer().getPath(),
        });
        let result = [];
        result = upperPartition ? result.concat(upperPartition, processedLines) : processedLines;
        if (lowerPartition)
            result = result.concat(lowerPartition);
        if (result.length !== editorLines.length) {
            throw new Error(`Update output has ${result.length} lines, yet the editor contains` +
                ` ${editorLines.length} lines.`);
        }
        this.lines = result;
    }
    fullUpdate() {
        const editorLines = this.editor.getBuffer().getLines();
        const newLines = filter_processor_1.processLines({
            lines: editorLines,
            data: this.validationData.data,
            row: 0,
            file: this.editor.getBuffer().getPath(),
        });
        if (newLines.length !== editorLines.length) {
            throw new Error(`Full update output has ${newLines.length} lines, yet the editor` +
                ` contains ${editorLines.length} lines`);
        }
        this.lines = newLines;
    }
    processFilter() {
        const lines = this.editor.getBuffer().getLines();
        this.lines = filter_processor_1.processLines({
            lines, data: this.validationData.data, row: 0, file: this.editor.getBuffer().getPath(),
        });
    }
}
exports.ItemFilter = ItemFilter;

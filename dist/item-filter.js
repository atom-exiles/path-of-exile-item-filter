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
        this.lines = this.validationData.data.then((vd) => {
            return this.processFilter(vd);
        });
    }
    dispose() { }
    update(changes) {
        const lines = this.editor.getBuffer().getLines();
        const promises = [
            this.validationData.data,
            this.lines
        ];
        return this.lines = Promise.all(promises).then((args) => __awaiter(this, void 0, void 0, function* () {
            let data = args[0];
            let filter = args[1];
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
                    file: this.editor.getBuffer().getPath()
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
            return result;
        }));
    }
    processFilter(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = this.editor.getBuffer().getLines();
            return filter_processor_1.processLines({
                lines, data, row: 0, file: this.editor.getBuffer().getPath()
            });
        });
    }
}
exports.ItemFilter = ItemFilter;

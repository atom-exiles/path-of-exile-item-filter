"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const assert = require("assert");
const parser = require("./parser");
function translateLineRanges(line, delta) {
    if (line.messages) {
        line.messages.forEach((message) => {
            message.location.position = atom_1.Range.fromObject(message.location.position)
                .translate(delta);
            if (message.reference && message.reference.position) {
                message.reference.position = atom_1.Point.fromObject(message.reference.position)
                    .translate(delta);
            }
        });
    }
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
function parseLineInfo(args) {
    assert(args.changes.oldRange.start.row >= 0, "changes has a negative oldRange start row");
    const newLines = args.editor.buffer.getLines();
    var upperPartition = [];
    var lowerPartition = [];
    var lowerAdjustment;
    if (args.reset) {
        lowerAdjustment = 0;
    }
    else {
        if (args.filter == undefined)
            throw new Error("update pass with an undefined filter");
        lowerAdjustment = newLines.length - args.filter.length;
        if (args.changes.oldRange.start.row > 0) {
            upperPartition = args.filter.slice(0, args.changes.oldRange.start.row);
        }
        if (args.filter.length > args.changes.oldRange.end.row + 1) {
            lowerPartition = args.filter.slice(args.changes.oldRange.end.row + 1 - lowerAdjustment);
        }
    }
    const linesChanged = newLines.length - (upperPartition.length + lowerPartition.length);
    assert(upperPartition.length + lowerPartition.length + linesChanged == newLines.length, "partition size mismatch");
    assert(linesChanged > 0, "expected there to always be at least one modified line");
    const reprocessStart = upperPartition.length;
    const reprocessEnd = upperPartition.length + linesChanged;
    var middlePartition = [];
    for (var i = reprocessStart; i < reprocessEnd; i++) {
        const currentLine = newLines[i];
        const result = parser.parseLine({ editor: args.editor, itemData: args.itemData,
            lineText: currentLine, row: i });
        assert(result, "parseLine should always return a Filter.Line");
        middlePartition.push(result);
    }
    const totalLength = upperPartition.length + middlePartition.length + lowerPartition.length;
    assert(totalLength == newLines.length, "processed partition size mismatch");
    const output = upperPartition.concat(middlePartition);
    if (lowerAdjustment != 0) {
        const delta = new atom_1.Point(lowerAdjustment, 0);
        for (var line of lowerPartition) {
            translateLineRanges(line, delta);
            output.push(line);
        }
    }
    else {
        lowerPartition.forEach((line) => { output.push(line); });
    }
    assert(output.length == newLines.length, "size mismatch for output");
    return output;
}
exports.parseLineInfo = parseLineInfo;

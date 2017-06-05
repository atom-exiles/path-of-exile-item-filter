"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filter_processor_1 = require("../filter-processor");
function runTask({ lines, data, row, file, chunkSize }) {
    for (var i = 0; i < lines.length; i += chunkSize) {
        let endIndex;
        if (i + chunkSize <= lines.length) {
            endIndex = i + chunkSize;
        }
        const chunk = filter_processor_1.processLines({
            lines: lines.slice(i, endIndex),
            row: row + i,
            data,
            file
        });
        emit("did-process-chunk", chunk);
    }
}
module.exports = runTask;

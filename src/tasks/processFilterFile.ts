// The entry point for the Task that does the first pass on a filter file. The
// first pass means we're always processing every single line of the file, which
// would block the main process for a noticeable amount of time if we were to do
// this work there.
//
// This task returns processed data in chunks via the "did-process-chunk" event.
// The function's return indicates that it has finished processing data.

import { processLines } from "../filter-processor";

declare var emit: (event: string, args: Array<Filter.Line>) => void;

// Transferring all data back to the main process at once would result in the
// editor being unresponsive when dealing with item filters containing thousands
// of lines. Cutting that data into chunks and transferring each chunk as soon
// as it is available mitigates this and allows the V8 engine to schedule other
// things in that main process as processing continues here.
function runTask({ lines, data, row, file, chunkSize}: Filter.Params.ProcessLinesTask) {
  for(var i = 0; i < lines.length; i += chunkSize) {
    let endIndex: number|undefined;
    if(i + chunkSize <= lines.length) {
      endIndex = i + chunkSize;
    }

    const chunk = processLines({
      lines: lines.slice(i, endIndex),
      row: row + i,
      data,
      file
    });

    emit("did-process-chunk", chunk);
  }
}

module.exports = runTask;

import { Task } from "atom";
import * as path from "path";
import * as _ from "lodash";
import * as assert from "assert";

import ConfigManager from "./config-manager";
import ValidationData from "./validation-data";
import { processLines } from "./filter-processor";

/** Shifts all ranges within each item filter line by given number of rows. */
function recursivelyShiftRanges(obj: any, shift: number) {
  for(var property of Object.keys(obj)) {
    const value = obj[property];
    if(_.has(value, "start.row") && _.has(value, "end.row")) {
      value.start.row += shift;
      value.end.row += shift;
    } else if(typeof value == "object") {
      recursivelyShiftRanges(value, shift);
    }
  }
}

function shiftLineRanges(lines: Filter.Line[], shift: number) {
  for(var line of lines) {
    recursivelyShiftRanges(line, shift);
  }
}

export default class ItemFilter {
  private readonly config: ConfigManager;
  private readonly validationData: ValidationData;
  private readonly editor: AtomCore.TextEditor;
  lines: Promise<Filter.Line[]>;

  constructor(config: ConfigManager, validationData: ValidationData, editor: AtomCore.TextEditor) {
    this.config = config;
    this.validationData = validationData;
    this.editor = editor;

    const p1: Promise<DataFormat.ValidationData> = this.validationData.data;
    const p2: Promise<number> = this.config.general.chunkSize.promise;
    this.lines = Promise.all([p1, p2])
      .then((params) => { return this.processFilter(params[0], params[1]); });
  }

  dispose() {}

  async update(changes: Filter.Params.BufferChange[]) {
    const lines = this.editor.buffer.getLines();
    const filter = await this.lines;

    return this.lines = this.validationData.data.then((data) => {
      return new Promise<Filter.Line[]>((resolve, reject) => {
        let result: Filter.Line[] = [];
        let shift = 0;
        let currentIndex = 0;

        for(var change of changes) {
          if(change.start != currentIndex) {
            const upperPartition = filter.slice(currentIndex, change.start);
            if(shift != 0) shiftLineRanges(upperPartition, shift);
            result = result.concat(upperPartition);
            currentIndex += upperPartition.length;
          }

          const changedLines = lines.slice(currentIndex, currentIndex + change.newExtent + 1);
          let processedLines = processLines({
            lines: changedLines,
            data: data,
            row: change.start,
            file: this.editor.buffer.getPath()
          });
          // processedLines = postProcessLines(processedLines);

          result = result.concat(processedLines);
          currentIndex += processedLines.length;

          shift += change.newExtent - change.oldExtent;
        }

        const lastChange = _.last(changes);
        if(lastChange == null) {
          throw new Error("update called with no changes");
        }
        const sliceIndex = lastChange.start + lastChange.oldExtent + 1;
        const slice = filter.splice(sliceIndex);
        if(shift != 0) shiftLineRanges(slice, shift);
        result = result.concat(slice);

        // We should have line data for every line within the editor.
        assert(result.length == lines.length, 'output size mismatch (' +
            result.length + ' vs ' + lines.length + ')');
        resolve(result);
      });
    });
  }

  async processFilter(data: DataFormat.ValidationData, chunkSize: number) {
    const lines = this.editor.buffer.getLines();

    return new Promise<Filter.Line[]>((resolve, reject) => {
      var container: Array<Filter.Line> = [];
      // If Task creation fails, then just process the filter on the main process.
      try {
        const taskPath = path.join(__dirname, "tasks", "processFilterFile.js");
        const task = Task.once<Filter.Params.ProcessLinesTask>(taskPath, {
          lines,
          data,
          row: 0,
          file: this.editor.buffer.getPath(),
          chunkSize
        }, () => {
          resolve(container);
          // resolve(postProcessLines(filter));
        });
        task.on("did-process-chunk", (chunk: Array<number>) => {
          container.push.apply(container, chunk);
        });
      }
      catch(e) {
        atom.notifications.addInfo('Task Creation Failed', {
          description: 'Failed to offload processing of this filter to another process.',
          detail: 'The filter will still be processed, but a separate process will not be used.' +
            '\nAtom may hang for several seconds when opening large item filters.'
        });

        const chunkSize = this.config.general.chunkSize.value;
        if(chunkSize) {
          const filter = processLines({
            lines,
            data,
            row: 0,
            file: this.editor.buffer.getPath()
          });
          resolve(filter);
          // resolve(postProcessLines(filter));
        } else {
          throw new Error("expected chunkSize to be defined");
        }
      }
    });
  }
}

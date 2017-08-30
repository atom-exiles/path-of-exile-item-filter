import * as _ from "lodash";
import * as assert from "assert";

import { ConfigManager } from "./config-manager";
import { ValidationData } from "./validation-data";
import { processLines } from "./filter-processor";

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

/** Shifts all ranges within each item filter line by given number of rows. */
function shiftLineRanges(lines: Filter.Line[], shift: number) {
  for(var line of lines) {
    recursivelyShiftRanges(line, shift);
  }
}

export class ItemFilter {
  private readonly config: ConfigManager;
  private readonly validationData: ValidationData;
  private readonly editor: AtomCore.TextEditor;
  lines: Promise<Filter.Line[]>;

  constructor(config: ConfigManager, validationData: ValidationData, editor: AtomCore.TextEditor) {
    this.config = config;
    this.validationData = validationData;
    this.editor = editor;

    this.lines = this.validationData.data.then((vd) => {
      return this.processFilter(vd);
    });
  }

  dispose() {}

  async update(changes: Filter.Params.BufferChange[]) {
    const lines = this.editor.getBuffer().getLines();

    const promises: [Promise<DataFormat.ValidationData>, Promise<Filter.Line[]>] = [
      this.validationData.data,
      this.lines
    ];

    return this.lines = Promise.all(promises).then(async (args) => {
      let data = args[0];
      let filter = args[1];

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
          file: this.editor.getBuffer().getPath()
        });

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

      return result;
    });
  }

  async processFilter(data: DataFormat.ValidationData) {
    const lines = this.editor.getBuffer().getLines();

    return processLines({
      lines, data, row: 0, file: this.editor.getBuffer().getPath()
    });
  }
}

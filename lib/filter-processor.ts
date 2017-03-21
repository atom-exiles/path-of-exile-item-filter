import { Point, Range } from "atom";
import * as assert from "assert";

import * as parser from "./parser";

function translateLineRanges(line: Filter.Line, delta: Point) {
  if(line.messages) {
    line.messages.forEach((message) => {
      if(message.range) {
        message.range = Range.fromObject(message.range).translate(delta);
      }
    });
  }

  switch(line.type) {
    case "Block": {
      const fb: Filter.Block = (<Filter.Block>line.data);
      fb.scope = fb.scope.translate(delta);
      fb.type.range = fb.type.range.translate(delta);
      if(fb.trailingComment) {
        fb.trailingComment.range = fb.trailingComment.range.translate(delta);
      }
      line.data = fb;
    } break;
    case "Comment": {
      const fb: Filter.Comment = (<Filter.Comment>line.data);
      fb.range = fb.range.translate(delta);
    } break;
    case "Rule": {
      const fb: Filter.Rule = (<Filter.Rule>line.data);
      fb.range = fb.range.translate(delta);
      fb.type.range = fb.type.range.translate(delta);
      if(fb.operator) fb.operator.range = fb.operator.range.translate(delta);
      fb.values.forEach((value) => {
        value.range = value.range.translate(delta);
      })
      if(fb.trailingComment) {
        fb.trailingComment.range = fb.trailingComment.range.translate(delta);
      }
    } break;
    case "Unknown": {
      const fb: Filter.Unknown = (<Filter.Unknown>line.data);
      fb.range = fb.range.translate(delta);
    } break;
    default:
      break;
  }
}

interface ParseLine {
  itemData: Data.Parser
  editor: AtomCore.TextEditor
  filter?: Filter.Line[]
  changes: Filter.Params.BufferChanges
  reset: boolean
}

export function parseLineInfo(args: ParseLine): Filter.Line[] {
  assert(args.changes.oldRange.start.row >= 0, "changes has a negative oldRange start row");

  const newLines = args.editor.buffer.getLines();

  // Changes are essentially a partition of the file that have now been invalidated
  // and must be reprocessed. We can reuse the surrounding two partitions,
  // which will usually be the vast majority.
  var upperPartition: Filter.Line[] = [];
  var lowerPartition: Filter.Line[] = [];
  // We store token locations as ranges, which will need to have their row adjusted
  // prior to stitching everything together.
  var lowerAdjustment: number;
  if(args.reset) {
    lowerAdjustment = 0;
  } else {
    if(args.filter == undefined) throw new Error("update pass with an undefined filter");
    lowerAdjustment = newLines.length - args.filter.length;

    // Corner case for the upper partion is an edit on the very first line.
    if(args.changes.oldRange.start.row > 0) {
      upperPartition = args.filter.slice(0, args.changes.oldRange.start.row);
    }

    // Likewise, the lower partition's is an edit to the very last line.
    if(args.filter.length > args.changes.oldRange.end.row + 1) {
      lowerPartition = args.filter.slice(args.changes.oldRange.end.row + 1 - lowerAdjustment);
    }
  }

  const linesChanged = newLines.length - (upperPartition.length + lowerPartition.length);
  assert(upperPartition.length + lowerPartition.length + linesChanged == newLines.length,
      "partition size mismatch");
  assert(linesChanged > 0, "expected there to always be at least one modified line");

  const reprocessStart = upperPartition.length;
  const reprocessEnd = upperPartition.length + linesChanged;

  var middlePartition: Filter.Line[] = [];
  for(var i = reprocessStart; i < reprocessEnd; i++) {
    const currentLine = newLines[i];

    const result = parser.parseLine({ editor: args.editor, itemData: args.itemData,
        lineText: currentLine, row: i });
    assert(result, "parseLine should always return a Filter.Line");

    middlePartition.push(result);
  }

  const totalLength = upperPartition.length + middlePartition.length + lowerPartition.length;
  assert(totalLength == newLines.length, "processed partition size mismatch");

  const output = upperPartition.concat(middlePartition);
  if(lowerAdjustment != 0) {
    const delta = new Point(lowerAdjustment, 0);

    for(var line of lowerPartition) {
      translateLineRanges(line, delta);
      output.push(line);
    }
  } else {
    lowerPartition.forEach((line) => { output.push(line); });
  }
  assert(output.length == newLines.length, "size mismatch for output");

  return output;
}

import { Point, Range, CompositeDisposable, Emitter } from "atom";
import * as path from "path";
import * as assert from "assert";

import * as data from "./data";
import * as parser from "./parser";

interface BufferChanges {
  oldRange: TextBuffer.Range
  newRange: TextBuffer.Range
}

/** Handles subscriptions for every buffer, while also managing the data for
 *  item filters. */
class FilterManager {
  private readonly editor: AtomCore.TextEditor;
  private subscriptions: CompositeDisposable;
  private filterSubs: CompositeDisposable;
  private changes?: BufferChanges;

  filter?: Promise<Filter.Line[]>;

  constructor(editor: AtomCore.TextEditor) {
    this.editor = editor;
    this.subscriptions = new CompositeDisposable;

    this.subscriptions.add(editor.buffer.onDidChangePath((newPath) => {
      if(this.isFilter()) {
        this.registerFilter();
      } else  {
        this.filter = undefined;
        if(this.filterSubs) this.filterSubs.dispose();
      }
    }));

    this.subscriptions.add(editor.buffer.onDidDestroy(() => {
      this.destructor();
    }));

    this.subscriptions.add(data.emitter.on("poe-did-update-item-data", () => {
      console.log("Did get the message.");
      this.processIfFilter();
    }));

    this.subscriptions.add(data.emitter.on("poe-did-update-injected-data", () => {
      this.processIfFilter();
    }));

    if(this.isFilter()) {
      this.registerFilter();
      this.processFilter();
    } else if(this.filterSubs) this.filterSubs.dispose();
  }

  /** Removes all subscriptions and destroys any data on the item filter. */
  destructor() {
    this.filter = undefined;
    if(this.filterSubs) this.filterSubs.dispose();
    this.subscriptions.dispose();
    buffers.delete(this.editor.buffer.id);
    emitter.emit('poe-did-destroy-buffer', this.editor.buffer.id);
  }

  /** Returns whether or not this buffer contains an item filter. */
  public isFilter() {
    if(path.extname(this.editor.buffer.getPath()) == ".filter") return true;
    else return false;
  }

  /** Register the buffer for the filter-specific events. */
  private registerFilter() {
    if(!this.filterSubs) this.filterSubs = new CompositeDisposable();

    this.filterSubs.add(this.editor.buffer.onDidChange((event) => {
      if(this.changes) {
        this.changes.oldRange = event.oldRange.union(this.changes.oldRange);
        this.changes.newRange = event.newRange.union(this.changes.newRange);
      } else {
        this.changes = { oldRange: event.oldRange.copy(), newRange: event.newRange.copy()};
      }
    }));

    this.filterSubs.add(this.editor.buffer.onDidStopChanging(() => {
      this.processFilterChanges();
    }));
  }

  /** Ensures that the buffer contains a filter prior to processing it.. */
  public processIfFilter() {
    if(this.isFilter()) this.processFilter();
  }

  /** Processes the entire item filter from scratch. */
  private processFilter() {
    const oldRange = new Range([0, 0], [0, 0]);

    const lastRow = this.editor.getLastBufferRow();
    const lastRowText = this.editor.lineTextForBufferRow(lastRow);
    const lastColumn = lastRowText.length - 1;
    const newRange = new Range([0, 0], [lastRow, lastColumn]);

    this.filter = this.parseLineInfo(this.filter, { oldRange: oldRange,
        newRange: newRange }, true);
  }

  /** Processes only the recent changes to the item filter. */
  private processFilterChanges() {
    if(!this.changes || !this.filter) return;

    this.filter = this.parseLineInfo(this.filter, this.changes);
    this.changes = undefined;
  }

  private translateLineRanges(line: Filter.Line, delta: Point) {
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

  private async parseLineInfo(filter: Promise<Filter.Line[]>|undefined,
      changes: BufferChanges, reset = false): Promise<Filter.Line[]> {
    const lines = this.editor.buffer.getLines();
    const itemData = await data.filterItemData;

    var previousLines: Filter.Line[];
    if(reset) previousLines = [];
    else if(filter) previousLines = await filter;
    else throw new Error("unexpected state for getLineInfo.");

    var output: Filter.Line[] = [];
    var lowerAdjustment: number;
    if(reset) lowerAdjustment = 0;
    else lowerAdjustment = lines.length - previousLines.length;

    // Changes are essentially a partition of the file that is now invalidated
    // and must be reprocessed. We can reuse the surrounding two partitions,
    // which will hopefully be the vast majority.
    var upperPartition: Filter.Line[] = [];
    if(changes.oldRange.start.row > 0) {
      upperPartition = previousLines.slice(0, changes.oldRange.start.row);
    }

    output = output.concat(upperPartition);
    var newExtent: number = changes.newRange.end.row - changes.newRange.start.row;
    for(var i = 0; i <= newExtent; i++) {
      const row = changes.newRange.start.row + i;
      const currentLine = lines[row];

      const result = parser.parseLine({itemData: itemData, lineText: currentLine,
          row: row, filePath: this.editor.buffer.getPath()});
      assert(result, "bad times.");
      output.push(result);
    }

    var lowerPartition: Filter.Line[];
    if(reset) {
      lowerPartition = [];
    } else {
      const remaining = lines.length - output.length;
      lowerPartition = previousLines.splice(previousLines.length - remaining,
          previousLines.length);
    }

    const delta = new Point(lowerAdjustment, 0);
    lowerPartition.forEach((line) => {
      this.translateLineRanges(line, delta);
      output.push(line);
    });

    emitter.emit<Filter.Params.DataUpdate>("poe-did-process-filter",
        { editorID: this.editor.buffer.id, lines: output });
    return output;
  }
}

var subscriptions: CompositeDisposable;
export var emitter: Emitter;
export const buffers = new Map<string, FilterManager>();

export function activate() {
  assert(buffers.size == 0, "activation called unexpectedly.");

  if(subscriptions) subscriptions.dispose();
  if(emitter) emitter.dispose();
  emitter = new Emitter;
  subscriptions = new CompositeDisposable;

  // Process the active text editor first, prior to observing the others.
  const editor = atom.workspace.getActiveTextEditor();
  if(editor) {
    buffers.set(editor.buffer.id, new FilterManager(editor));
  }

  subscriptions.add(atom.workspace.observeTextEditors((editor) => {
    if(buffers.has(editor.buffer.id)) return;
    buffers.set(editor.buffer.id, new FilterManager(editor));
  }));
}

export function deactivate() {
  emitter.clear();
  buffers.forEach((buffer) => buffer.destructor());
  buffers.clear();
}

import { Range, CompositeDisposable, Emitter } from "atom";
import * as path from "path";
import * as assert from "assert";

import * as data from "./data";

/** Handles subscriptions for every buffer, while also managing the data for
 *  item filters. */
class FilterManager {
  private readonly editor: AtomCore.TextEditor;
  private subscriptions: CompositeDisposable;
  private filterSubs: CompositeDisposable;
  private changes?: Filter.BufferChanges;

  filter?: Promise<Filter.ItemFilter>;

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
    if(this.isFilter()) this.processFilter;
  }

  /** Processes the entire item filter from scratch. */
  private async processFilter() {
    const oldRange = new Range([0, 0], [0, 0]);

    const lastRow = this.editor.getLastBufferRow();
    const lastRowText = this.editor.lineTextForBufferRow(lastRow);
    const lastColumn = lastRowText.length - 1;
    const newRange = new Range([0, 0], [lastRow, lastColumn]);

    this.filter = this.getLineInfo({ oldRange: oldRange, newRange: newRange });

    const lines = await this.filter;
    emitter.emit<Filter.Params.DataUpdate>("poe-did-process-filter",
        { editorID: this.editor.buffer.id, lines: lines });
  }

  /** Processes only the recent changes to the item filter. */
  private async processFilterChanges() {
    if(!this.changes || !this.filter) return;

    this.filter = this.getLineInfo(this.changes);
    const lines = await this.filter;
    emitter.emit<Filter.Params.DataUpdate>("poe-did-process-filter",
        { editorID: this.editor.buffer.id, lines: lines });
  }

  private async getLineInfo(change: Filter.BufferChanges) {
    const linterData = await data.linterData;
    return [];
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

import { Point, Range, CompositeDisposable, Emitter } from "atom";
import * as path from "path";
import * as assert from "assert";

import * as jsonData from "./json-data";
import * as settings from "./settings";
import * as fp from "./filter-processor";

/** Handles subscriptions for every buffer, while also managing the data for
 *  item filters. */
class FilterManager {
  private readonly editor: AtomCore.TextEditor;
  private subscriptions: CompositeDisposable;
  private filterSubs: CompositeDisposable;
  private changes?: Filter.Params.BufferChanges;

  filter?: Promise<Filter.Line[]>;

  constructor(editor: AtomCore.TextEditor) {
    this.editor = editor;
    this.subscriptions = new CompositeDisposable;

    this.subscriptions.add(editor.onDidChangeGrammar((grammar) => {
      if(this.isFilter()) {
        this.registerFilter();
        this.processFilter();
      } else {
        this.filter = undefined;
        if(this.filterSubs) this.filterSubs.dispose();
        emitter.emit("poe-did-unregister-filter", this.editor.buffer.id);
      }
    }));

    this.subscriptions.add(editor.buffer.onDidChangePath((newPath) => {
      if(this.isFilter()) {
        emitter.emit("poe-did-rename-filter", { editor: this.editor,
            path: newPath });
      }
    }));

    this.subscriptions.add(editor.buffer.onDidDestroy(() => {
      this.destructor();
    }));

    this.subscriptions.add(jsonData.emitter.on("poe-did-update-item-data", () => {
      this.processIfFilter();
    }));

    this.subscriptions.add(jsonData.emitter.on("poe-did-update-injected-data", () => {
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
    if(this.isFilter()) emitter.emit("poe-did-unregister-filter", this.editor.buffer.id);
    emitter.emit("poe-did-destroy-buffer", this.editor.buffer.id);
  }

  /** Returns whether or not this buffer contains an item filter. */
  public isFilter() {
    const grammar = this.editor.getGrammar();
    if(grammar.scopeName === "source.poe") return true;
    else return false;
  }

  /** Register the buffer for the filter-specific events. */
  private registerFilter() {
    if(!this.filterSubs) this.filterSubs = new CompositeDisposable;

    this.filterSubs.add(this.editor.buffer.onDidChange((event) => {
      if(this.changes) {
        this.changes.oldRange = event.oldRange.union(this.changes.oldRange);
        this.changes.newRange = event.newRange.union(this.changes.newRange);
      } else {
        this.changes = { oldRange: event.oldRange.copy(), newRange: event.newRange.copy()};
      }
    }));

    this.filterSubs.add(this.editor.buffer.onDidStopChanging(async () => {
      this.processFilterChanges();
    }));

    this.filterSubs.add(settings.config.linterSettings.enableWarnings.onDidChange(() => {
      this.processFilter();
    }));

    emitter.emit("poe-did-register-filter", this.editor.buffer.id);
  }

  /** Ensures that the buffer contains a filter prior to processing it.. */
  public processIfFilter() {
    if(this.isFilter()) this.processFilter();
    else if(this.filter) {
      this.filter = undefined;
      emitter.emit("poe-did-unregister-filter", this.editor.buffer.id);
    }
  }

  /** Processes the entire item filter from scratch. */
  private async processFilter() {
    const oldRange = new Range([0, 0], [0, 0]);

    const lastRow = this.editor.getLastBufferRow();
    const lastRowText = this.editor.lineTextForBufferRow(lastRow);
    const lastColumn = lastRowText.length - 1;
    const newRange = new Range([0, 0], [lastRow, lastColumn]);

    const data = await jsonData.promise;

    const result = new Promise<Filter.Line[]>((resolve, reject) => {
      const lineInfo = fp.parseLineInfo({
        changes: { oldRange, newRange },
        editor: this.editor,
        filter: undefined,
        itemData: data.linter,
        reset: true
      });
      resolve(lineInfo);
    });

    const lineInfo = await result;
    emitter.emit<Filter.Params.DataUpdate>("poe-did-process-filter",
        { editor: this.editor, lines: lineInfo });
    this.filter = result;
  }

  /** Processes only the recent changes to the item filter. */
  private async processFilterChanges() {
    if(!this.changes || !this.filter) return;

    const data = await jsonData.promise;
    const previousData = await this.filter;

    const result = new Promise<Filter.Line[]>((resolve, reject) => {
      const lineInfo = fp.parseLineInfo({
        changes: (<Filter.Params.BufferChanges>this.changes),
        editor: this.editor,
        filter: previousData,
        itemData: data.linter,
        reset: false
      });
      resolve(lineInfo);
    });

    this.changes = undefined;
    const lineInfo = await result;

    emitter.emit<Filter.Params.DataUpdate>("poe-did-process-filter",
        { editor: this.editor, lines: lineInfo });
    this.filter = result;
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

  // const editor = atom.workspace.getActiveTextEditor();
  // if(editor) {
  //   buffers.set(editor.buffer.id, new FilterManager(editor));
  // }

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

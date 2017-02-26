import { CompositeDisposable, Emitter } from "atom";
import * as path from "path";
import * as assert from "assert";

import * as data from "./data";

class ItemFilter {
  private readonly editor: AtomCore.TextEditor;
  lineInfo: Promise<Filter.Line[]>;

  constructor(editor: AtomCore.TextEditor) {
    this.editor = editor;
    this.lineInfo = this.parseBuffer();
  }

  destructor() {}

  async parseBuffer() {
    const linterData = await data.linterData;
    return [];
  }

  async reparseBufferRanges(modifiedRanges: TextBuffer.IRange[]) {
  }
}

class BufferManager {
  private readonly editor: AtomCore.TextEditor;
  private subscriptions: CompositeDisposable;
  private filterSubs: CompositeDisposable;
  private changes: Linter.BufferChanges;

  filter?: ItemFilter;

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

  /** Removes all subscriptions and destroys any filter data. */
  destructor() {
    if(this.filter) {
      this.filter.destructor();
      this.filter = undefined;
    }
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
      if(!this.changes) this.changes = [];
      this.changes.push(event);
    }));

    this.filterSubs.add(this.editor.buffer.onDidStopChanging(() => {
      this.processFilterChanges();
    }));
  }

  /** Ensures that the buffer contains a filter before calling processFilter. */
  public processIfFilter() {
    if(this.isFilter()) this.processFilter;
  }

  /** Resets the item filter data and reprocsses it. */
  private async processFilter() {
    if(this.filter) this.filter.destructor();

    this.filter = new ItemFilter(this.editor);
    const lines = await this.filter.lineInfo;
    emitter.emit<Filter.Params.DataUpdate>("poe-did-process-filter",
        { editorID: this.editor.buffer.id, lines: lines });
  }

  /** A wrapper for processFilter in order to manage some internal data on each
   *  call to it. */
  private async processFilterChanges() {
    if(!this.changes || !this.filter || this.changes.length == 0) return;

    // TODO(glen): perform work to transform the change data here.
    this.filter.reparseBufferRanges([]);
    const lines = await this.filter.lineInfo;
    emitter.emit<Filter.Params.DataUpdate>("poe-did-process-filter",
        { editorID: this.editor.buffer.id, lines: lines });
  }
}

var subscriptions: CompositeDisposable;
export var emitter: Emitter;
export const buffers = new Map<string, BufferManager>();

export function activate() {
  assert(buffers.size == 0, "activation called unexpectedly.");

  if(subscriptions) subscriptions.dispose();
  if(emitter) emitter.dispose();
  emitter = new Emitter;
  subscriptions = new CompositeDisposable;

  // Process the active text editor first, prior to observing the others.
  const editor = atom.workspace.getActiveTextEditor();
  if(editor) {
    buffers.set(editor.buffer.id, new BufferManager(editor));
  }

  subscriptions.add(atom.workspace.observeTextEditors((editor) => {
    if(buffers.has(editor.buffer.id)) return;
    buffers.set(editor.buffer.id, new BufferManager(editor));
  }));
}

export function deactivate() {
  emitter.clear();
  buffers.forEach((buffer) => buffer.destructor());
  buffers.clear();
}

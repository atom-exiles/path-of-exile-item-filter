import { Point, Range, CompositeDisposable, Emitter } from "atom";

import * as path from "path";

import * as settings from "./settings";
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

  filter: ItemFilter;

  constructor(editor: AtomCore.TextEditor) {
    this.editor = editor;
    this.subscriptions = new CompositeDisposable;

    this.subscriptions.add(editor.buffer.onDidChangePath((newPath) => {
      if(this.isFilter()) this.registerFilter();
      else if(this.filterSubs) this.filterSubs.dispose();
    }));

    if(this.isFilter()) {
      this.registerFilter();
      this.processFilter();
    } else if(this.filterSubs) this.filterSubs.dispose();
  }

  /** Removes all event subscriptions for the buffer. */
  destructor() {
    if(this.filter) this.filter.destructor();
    if(this.filterSubs) this.filterSubs.dispose();
    this.subscriptions.dispose();
  }

  /** Determines whether or not the given buffer is an item filter. */
  private isFilter() {
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

  /** If the buffer is an item filter, causes all item filter data to be reset
   *  and reprocessed. */
  private async processFilter() {
    if(this.filter) this.filter.destructor();

    this.filter = new ItemFilter(this.editor);
    await this.filter.lineInfo;
    emitter.emit("poe-did-process-filter", this.filter);
  }

  /** A wrapper for processFilter in order to manage some internal data on each
   *  call to it. */
  private processFilterChanges() {
    if(!this.changes || this.changes.length == 0) return;

    // TODO(glen): perform work to transform the change data here.
    this.filter.reparseBufferRanges([]);
  }
}

var registry: Linter.Register;
var subscriptions: CompositeDisposable;
export var emitter: Emitter;

export function activate(r: Linter.Register) {
  if(subscriptions) subscriptions.dispose();
  if(emitter) emitter.dispose();

  registry = r;
  emitter = new Emitter;
  subscriptions = new CompositeDisposable;
  var currentBuffer: BufferManager;

  const startupAction = (item: any) => {
    if(!settings.config.generalSettings.enableLinter.get()) return;

    if(item instanceof require("atom").TextEditor) {
      if(currentBuffer) currentBuffer.destructor();
      currentBuffer = new BufferManager((<AtomCore.TextEditor>item));
    } else {
      if(currentBuffer) currentBuffer.destructor();
    }
  }

  subscriptions.add(atom.workspace.observeActivePaneItem(startupAction));

  subscriptions.add(settings.config.generalSettings.enableLinter.onDidChange(
      (newValue) => {
    const item = atom.workspace.getActivePaneItem();
    if(item) startupAction(item);
  }));

  subscriptions.add(data.emitter.on("poe-did-update-item-data", () => {
    currentBuffer.processIfFilter();
  }));

  subscriptions.add(data.emitter.on("poe-did-update-injected-data", () => {
    currentBuffer.processIfFilter();
  }));
}

export function deactivate() {
  subscriptions.dispose();
  emitter.dispose();
}

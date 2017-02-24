import { Point, Range, CompositeDisposable, Emitter } from "atom";

import * as path from "path";

import * as settings from "./settings";
import * as data from "./data";

interface ItemFilterData {}

class BufferData {
  private readonly editor: AtomCore.TextEditor;
  private subscriptions: CompositeDisposable;
  private filterSubs: CompositeDisposable;
  private changes: Array<TextBuffer.CallbackArgs.BufferModifiedEvent>;

  public filterData: Promise<ItemFilterData>;

  constructor(editor: AtomCore.TextEditor) {
    this.editor = editor;
    this.subscriptions = new CompositeDisposable;

    this.subscriptions.add(editor.onDidChangePath((newPath) => {
      if(this.isFilter()) this.registerFilter();
      else if(this.filterSubs) this.filterSubs.dispose();
    }));

    if(this.isFilter()) this.registerFilter();
    else if(this.filterSubs) this.filterSubs.dispose();
  }

  /** Removes all event subscriptions for the buffer. */
  destructor() {
    if(this.filterSubs) this.filterSubs.dispose();
    this.subscriptions.dispose();
  }

  /** Creates a changes object spanning the buffer's entire contents, allowing
   *  the initial processing to function identically to the reprocessing. */
  private mimickChangeData(): TextBuffer.CallbackArgs.BufferModifiedEvent[] {
    return [{
      oldRange: new Range([0, 0], [0, 0]),
      newRange: this.editor.buffer.getRange(),
      oldText: "",
      newText: this.editor.buffer.getText()
    }]
  }

  /** Determines whether or not the given buffer is an item filter. */
  private isFilter() {
    if(path.extname(this.editor.buffer.getPath()) == ".filter") return true;
    else return false;
  }

  /** Register the buffer for the filter-specific events, kicking off the filter
   *  processing afterwards.*/
  private registerFilter() {
    if(!this.filterSubs) this.filterSubs = new CompositeDisposable();

    this.processFilter(this.mimickChangeData());

    this.filterSubs.add(this.editor.buffer.onDidChange((event) => {
      if(!this.changes) this.changes = [];
      this.changes.push(event);
    }));

    this.filterSubs.add(this.editor.buffer.onDidStopChanging(() => {
      this.filterData.then((fd) =>  {
        this.processFilter(this.changes);
      });
    }));
  }

  /** If the buffer is an item filter, causes all item filter data to be reset
   *  and reprocessed. */
  public reprocessFilter() {
    if(this.isFilter()) {
      this.processFilter(this.mimickChangeData());
    }
  }

  /** A wrapper for processFilter in order to manage some internal data on each
   *  call to it. */
  private processFilter(changes: Array<TextBuffer.CallbackArgs.BufferModifiedEvent>) {
    if(!changes || changes.length == 0) {
      this.changes = [];
      return this.filterData;
    }

    this.filterData = new Promise<ItemFilterData>((resolve, reject) => {
      const fd: ItemFilterData = {};
      emitter.emit("poe-did-process-filter", this.filterData);
      resolve(fd);
    });
  }
}

var subscriptions: CompositeDisposable;
var emitter: Emitter;
var validBases = new Array<string>();
var validClasses = new Array<string>();
var injectedBases = new Array<string>();
var injectedClasses = new Array<string>();

export function activate(registry: Linter.Register) {
  if(!registry) throw new Error("PoEItemFilter: expected registry to be initialized.");
  if(subscriptions) subscriptions.dispose();
  if(emitter) emitter.dispose();

  emitter = new Emitter;
  subscriptions = new CompositeDisposable;
  var currentBuffer: BufferData;

  const startupAction = (item: any) => {
    if(!settings.config.generalSettings.enableLinter.get()) return;

    if(item instanceof require("atom").TextEditor) {
      if(currentBuffer) currentBuffer.destructor();
      currentBuffer = new BufferData((<AtomCore.TextEditor>item));
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
    // updateItemData();
    currentBuffer.reprocessFilter();
  }));

  subscriptions.add(data.emitter.on("poe-did-update-injected-data", () => {
    // updateWhitelists();
    currentBuffer.reprocessFilter();
  }));

  // updateItemData();
  // updateWhitelists();
}

export function deactivate() {
  subscriptions.dispose();
  emitter.dispose();
}

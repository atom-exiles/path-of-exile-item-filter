import { CompositeDisposable, Disposable, Emitter } from "atom";
import * as _ from "lodash";

import { ConfigManager } from "./config-manager";
import { EditorRegistry } from "./editor-registry";
import { ItemFilter } from "./item-filter";
import { ValidationData } from "./validation-data";

interface FilterData {
  editor: AtomCore.TextEditor
  filter: ItemFilter
  subscription: Disposable
}

/** Sorts changes by their start position, while also performing a data transformation
 *  to simplify the change structure.
 *
 *  Changes affecting the same rows are effectively merged together during this
 *  transformation. */
function transformChanges(c: AtomTextBuffer.CallbackArgs.TextChange[]) {
  let result: Filter.Params.BufferChange[] = [];

  // Atom will freeze each change object, yet sort requires each element of
  // the array to be mutable.
  let changes = [];
  for(var change of c) {
    changes.push({
      newExtent: change.newExtent.copy(),
      oldExtent: change.oldExtent.copy(),
      start: change.start.copy()
    });
  }

  changes.sort((a, b) => {
    if(a.start.row == b.start.row) {
      return 0;
    } else if(a.start.row < b.start.row) {
      return -1;
    } else {
      return 1;
    }
  });

  for(var i = 0; i < changes.length; i++) {
    const currentChange = changes[i];
    const lastResult = _.last(result);
    if(i == 0 || (lastResult && lastResult.start != currentChange.start.row)) {
      result.push({
        newExtent: currentChange.newExtent.row,
        oldExtent: currentChange.oldExtent.row,
        start: currentChange.start.row
      });
    }
  }

  return result;
}

export class FilterManager {
  private readonly subscriptions: CompositeDisposable;
  private readonly config: ConfigManager;
  private readonly validationData: ValidationData;
  private readonly registry: EditorRegistry;
  private readonly observedFilters: Array<number>;
  readonly emitter: Emitter;
  readonly filters: Map<number, FilterData>;

  constructor(config: ConfigManager, validationData: ValidationData, registry: EditorRegistry) {
    this.config = config;
    this.validationData = validationData;
    this.registry = registry;
    this.emitter = new Emitter;
    this.subscriptions = new CompositeDisposable;
    this.filters = new Map;
    this.observedFilters = new Array;

    this.setupSubscriptions();
  }

  dispose() {
    this.filters.forEach((filterData) => {
      filterData.subscription.dispose();
      filterData.filter.dispose();
    });
    this.emitter.dispose();
    this.subscriptions.dispose();
  }

  /** Waits for any of our dependencies, then sets up the subscriptions. */
  private async setupSubscriptions() {
    await this.validationData.data;

    this.subscriptions.add(this.registry.observeFilters((editor) => {
      this.handleNewFilter(editor);
    }));

    this.subscriptions.add(this.validationData.onDidUpdateData((data) => {
      this.filters.forEach((filterData, editorID) => {
        filterData.filter.dispose();
        this.emitter.emit("did-destroy-filter", (<Revelations.TextEditor>filterData.editor).id);
        filterData.filter = new ItemFilter(this.config, this.validationData, filterData.editor);
        this.emitter.emit("did-add-filter", filterData);
      });
    }));

    this.subscriptions.add(this.registry.onDidDestroyFilter((editorID) => {
      this.handleDestroyedFilter(editorID);
    }));

    return;
  }

  /** Invoke the given callback whenever an item filter is added. */
  onDidAddFilter(callback: (filterData: FilterData) => void) {
    return this.emitter.on<FilterData>("did-add-filter", (filterData) => {
      callback(filterData);
    });
  }

  /** Invoke the given callback whenever an item filter is destroyed. */
  onDidDestroyFilter(callback: (editorID: number) => void) {
    return this.emitter.on<number>("did-destroy-filter", (editorID) => {
      callback(editorID);
    });
  }

  /** Invoke the given callback with all current and future item filters. */
  observeFilters(callback: (filterData: FilterData) => void) {
    this.filters.forEach((filterData) => {
      callback(filterData);
    });
    return this.onDidAddFilter(callback);
  }

  /** Invoke the given callback whenever an item filter is processed. */
  onDidProcessFilter(callback: (processedData: Filter.Params.ProcessedFilterData) => void) {
    return this.emitter.on<Filter.Params.ProcessedFilterData>("did-process-filter", (processedData) => {
      callback(processedData);
    });
  }

  /** Invoke the given callback whenever an item filter is reprocessed. */
  onDidReprocessFilter(callback: (processedData: Filter.Params.ReprocessedFilterData) => void) {
    return this.emitter.on<Filter.Params.ReprocessedFilterData>("did-reprocess-filter", (processedData) => {
      callback(processedData);
    });
  }

  /** Invoke the given callback with all current and future item filters that
   *  have been processed. */
  observeProcessedFilters(callback: (data: Filter.Params.ProcessedFilterData) => void) {
    this.observedFilters.forEach((editorID) => {
      const filterData = this.filters.get(editorID);
      if(filterData) {
        filterData.filter.lines.then((ld) => {
          callback({
            editor: filterData.editor,
            lines: ld
          });
        });
      } else {
        throw new Error("observed filter with no associated filter data");
      }
    });

    return this.emitter.on<Filter.Params.ProcessedFilterData>("did-process-filter", (filterData) => {
      let editor = <Revelations.TextEditor>filterData.editor;
      if(!this.observedFilters.includes(editor.id)) {
        this.observedFilters.push(editor.id);
      }
      callback(filterData);
    });
  }

  /** Registers a new item filter with the manager. */
  private async handleNewFilter(editor: AtomCore.TextEditor) {
    const subscription = editor.onDidStopChanging((event) => {
      if(event.changes.length == 0) return;
      const filterData = this.filters.get((<Revelations.TextEditor>editor).id);
      if(filterData) {
        const changes = transformChanges(event.changes);
        filterData.filter.update(changes).then((filter) => {
          this.emitter.emit<Filter.Params.ReprocessedFilterData>("did-reprocess-filter", {
            editor: filterData.editor,
            lines: filter,
            changes
          });
        });
      } else {
        throw new Error("filter data missing within a change event");
      }
    });

    const filter = new ItemFilter(this.config, this.validationData, editor);
    const filterData: FilterData = { editor, filter, subscription };
    this.filters.set((<Revelations.TextEditor>editor).id, filterData);
    this.emitter.emit("did-add-filter", filterData);

    const lines = await filter.lines;
    this.emitter.emit<Filter.Params.ProcessedFilterData>("did-process-filter", {
      editor,
      lines
    });

    return;
  }

  /** Destroys an item filter previously registered with the manager. */
  private handleDestroyedFilter(editorID: number) {
    const filterData = this.filters.get(editorID);
    if(filterData) {
      filterData.subscription.dispose();
      filterData.filter.dispose();
      this.filters.delete(editorID);
      _.pull(this.observedFilters, editorID);
      this.emitter.emit("did-destroy-filter", editorID);
    } else {
      throw new Error("attempted to destroy an unknown item filter");
    }

    return;
  }
}

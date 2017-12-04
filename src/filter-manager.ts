import { CompositeDisposable, Disposable, Emitter, TextChange, TextEditor } from "atom";
import * as _ from "lodash";

import { EditorRegistry } from "./editor-registry";
import { log } from "./helpers";
import { ItemFilter, Line } from "./item-filter";
import { ValidationData } from "./validation-data";

export interface FilterData {
  editor: TextEditor;
  filter: ItemFilter;
  subscription: Disposable;
}

export interface ProcessedFilterData {
  editor: TextEditor;
  lines: Line[];
}

export interface ReprocessedFilterData extends ProcessedFilterData {
  changes: BufferChange[];
}

export interface BufferChange {
  newExtent: number;
  oldExtent: number;
  start: number;
}

/**
 * Sorts changes by their start position, while also performing a data transformation
 * to simplify the change structure.
 *
 * Changes affecting the same rows are effectively merged together during this
 * transformation.
 */
function transformChanges(c: TextChange[]) {
  const result: BufferChange[] = [];

  // Atom will freeze each change object, yet sort requires each element of
  // the array to be mutable.
  const changes = [];
  for (const change of c) {
    changes.push({
      newExtent: change.newExtent.copy(),
      oldExtent: change.oldExtent.copy(),
      start: change.start.copy(),
    });
  }

  changes.sort((a, b) => {
    if (a.start.row === b.start.row) {
      return 0;
    } else if (a.start.row < b.start.row) {
      return -1;
    } else {
      return 1;
    }
  });

  for (let i = 0; i < changes.length; i++) {
    const currentChange = changes[i];
    const lastResult = _.last(result);
    if (i === 0 || (lastResult && lastResult.start !== currentChange.start.row)) {
      result.push({
        newExtent: currentChange.newExtent.row,
        oldExtent: currentChange.oldExtent.row,
        start: currentChange.start.row,
      });
    }
  }

  return result;
}

export class FilterManager {
  private readonly subscriptions: CompositeDisposable;
  private readonly validationData: ValidationData;
  private readonly registry: EditorRegistry;
  private readonly observedFilters: number[];
  readonly emitter: Emitter;
  readonly filters: Map<number, FilterData>;

  constructor(validationData: ValidationData, registry: EditorRegistry) {
    this.validationData = validationData;
    this.registry = registry;
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.filters = new Map();
    this.observedFilters = new Array();

    this.setupSubscriptions();
  }

  dispose() {
    this.filters.forEach(filterData => {
      filterData.subscription.dispose();
      filterData.filter.dispose();
    });
    this.emitter.dispose();
    this.subscriptions.dispose();
  }

  /** Waits for any of our dependencies, then sets up the subscriptions. */
  private setupSubscriptions() {
    this.subscriptions.add(this.registry.observeFilters(editor => {
      this.handleNewFilter(editor);
    }));

    this.subscriptions.add(this.validationData.onDidUpdateData(_ => {
      this.filters.forEach((filterData, _) => {
        filterData.filter.dispose();
        this.emitter.emit("manager-did-destroy-filter", filterData.editor.id);
        filterData.filter = new ItemFilter(this.validationData, filterData.editor);
        this.emitter.emit("manager-did-add-filter", filterData);
      });
    }));

    this.subscriptions.add(this.registry.onDidDestroyFilter(editorID => {
      this.handleDestroyedFilter(editorID);
    }));

    return;
  }

  /** Invoke the given callback whenever an item filter is added. */
  onDidAddFilter(callback: (filterData: FilterData) => void) {
    return this.emitter.on("manager-did-add-filter", filterData => {
      if (filterData) {
        callback(filterData);
      } else {
        log("warning", "bad value passed to FilterManager::onDidAddFilter");
      }
    });
  }

  /** Invoke the given callback whenever an item filter is destroyed. */
  onDidDestroyFilter(callback: (editorID: number) => void) {
    return this.emitter.on("manager-did-destroy-filter", editorID => {
      if (editorID) {
        callback(editorID);
      } else {
        log("warning", "bad value passed to FilterManager::onDidDestroyFilter");
      }
    });
  }

  /** Invoke the given callback with all current and future item filters. */
  observeFilters(callback: (filterData: FilterData) => void) {
    this.filters.forEach(filterData => {
      callback(filterData);
    });
    return this.onDidAddFilter(callback);
  }

  /** Invoke the given callback whenever an item filter is processed. */
  onDidProcessFilter(callback: (processedData: ProcessedFilterData) => void) {
    return this.emitter.on("manager-did-process-filter", processedData => {
      if (processedData) {
        callback(processedData);
      } else {
        log("warning", "bad value passed to FilterManager::onDidProcessFilter");
      }
    });
  }

  /** Invoke the given callback whenever an item filter is reprocessed. */
  onDidReprocessFilter(callback: (processedData: ReprocessedFilterData) => void) {
    return this.emitter.on("manager-did-reprocess-filter", processedData => {
      if (processedData) {
        callback(processedData);
      } else {
        log("warning", "bad value passed to FilterManager::onDidReprocessFilter");
      }
    });
  }

  /**
   * Invoke the given callback with all current and future item filters that
   * have been processed.
   */
  observeProcessedFilters(callback: (data: ProcessedFilterData) => void) {
    this.observedFilters.forEach(editorID => {
      const filterData = this.filters.get(editorID);
      if (filterData) {
        callback({
          editor: filterData.editor,
          lines: filterData.filter.lines,
        });
      } else {
        throw new Error("observed filter with no associated filter data");
      }
    });

    return this.emitter.on("manager-did-process-filter", filterData => {
      if (filterData) {
        // let editor = <Revelations.TextEditor>filterData.editor;
        if (!this.observedFilters.includes(filterData.editor.id)) {
          this.observedFilters.push(filterData.editor.id);
        }
        callback(filterData);
      }
    });
  }

  /** Registers a new item filter with the manager. */
  private handleNewFilter(editor: TextEditor) {
    const subscription = editor.onDidStopChanging(event => {
      if (event.changes.length === 0) return;
      const filterData = this.filters.get(editor.id);
      if (filterData) {
        const changes = transformChanges(event.changes);
        filterData.filter.update(changes);
        this.emitter.emit("manager-did-reprocess-filter", {
          editor: filterData.editor,
          lines: filterData.filter.lines,
          changes,
        });
      } else {
        throw new Error("filter data missing within a change event");
      }
    });

    const filter = new ItemFilter(this.validationData, editor);
    const filterData: FilterData = { editor, filter, subscription };
    this.filters.set(editor.id, filterData);
    this.emitter.emit("manager-did-add-filter", filterData);

    this.emitter.emit("manager-did-process-filter", {
      editor,
      lines: filter.lines,
    });

    return;
  }

  /** Destroys an item filter previously registered with the manager. */
  private handleDestroyedFilter(editorID: number) {
    const filterData = this.filters.get(editorID);
    if (filterData) {
      filterData.subscription.dispose();
      filterData.filter.dispose();
      this.filters.delete(editorID);
      _.pull(this.observedFilters, editorID);
      this.emitter.emit("manager-did-destroy-filter", editorID);
    } else {
      throw new Error("attempted to destroy an unknown item filter");
    }

    return;
  }
}

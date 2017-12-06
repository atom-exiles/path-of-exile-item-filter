import { CompositeDisposable, Disposable, Emitter, TextEditor } from "atom";

import { EditorRegistry } from "./editor-registry";
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

interface Emissions {
  "did-add-filter": FilterData;
  "did-destroy-filter": number;
  "did-process-filter": ProcessedFilterData;
  "did-reprocess-filter": ProcessedFilterData;
}

export class FilterManager {
  private readonly subscriptions: CompositeDisposable;
  private readonly validationData: ValidationData;
  private readonly registry: EditorRegistry;
  readonly emitter: Emitter<{}, Emissions>;
  readonly filters: Map<number, FilterData>;

  constructor(validationData: ValidationData, registry: EditorRegistry) {
    this.validationData = validationData;
    this.registry = registry;
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.filters = new Map();

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
        filterData.filter.fullUpdate();
        this.emitter.emit("did-reprocess-filter", {
          editor: filterData.editor,
          lines: filterData.filter.lines,
        });
      });
    }));

    this.subscriptions.add(this.registry.onDidDestroyFilter(editorID => {
      this.handleDestroyedFilter(editorID);
    }));

    return;
  }

  /** Invoke the given callback whenever an item filter is added. */
  onDidAddFilter(callback: (filterData: FilterData) => void) {
    return this.emitter.on("did-add-filter", filterData => {
      callback(filterData);
    });
  }

  /** Invoke the given callback whenever an item filter is destroyed. */
  onDidDestroyFilter(callback: (editorID: number) => void) {
    return this.emitter.on("did-destroy-filter", editorID => {
      callback(editorID);
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
    return this.emitter.on("did-process-filter", processedData => {
      callback(processedData);
    });
  }

  /** Invoke the given callback whenever an item filter is reprocessed. */
  onDidReprocessFilter(callback: (processedData: ProcessedFilterData) => void) {
    return this.emitter.on("did-reprocess-filter", processedData => {
      callback(processedData);
    });
  }

  /**
   * Invoke the given callback with all current and future item filters that
   * have been processed.
   */
  observeProcessedFilters(callback: (data: ProcessedFilterData) => void) {
    this.filters.forEach(filterData => {
      callback({ editor: filterData.editor, lines: filterData.filter.lines });
    });
    return this.onDidProcessFilter(callback);
  }

  /** Registers a new item filter with the manager. */
  private handleNewFilter(editor: TextEditor) {
    const subscription = editor.buffer.onDidStopChanging(event => {
      if (event.changes.length === 0) return;
      const filterData = this.filters.get(editor.id);
      if (filterData) {
        filterData.filter.update(event.changes);
        this.emitter.emit("did-reprocess-filter", {
          editor: filterData.editor,
          lines: filterData.filter.lines,
        });
      } else {
        throw new Error("filter data missing within a change event");
      }
    });

    const filter = new ItemFilter(this.validationData, editor);
    const filterData: FilterData = { editor, filter, subscription };
    this.filters.set(editor.id, filterData);
    this.emitter.emit("did-add-filter", filterData);
    this.emitter.emit("did-process-filter", {
      editor,
      lines: filter.lines,
    });
  }

  /** Destroys an item filter previously registered with the manager. */
  private handleDestroyedFilter(editorID: number) {
    const filterData = this.filters.get(editorID);
    if (filterData) {
      filterData.subscription.dispose();
      filterData.filter.dispose();
      this.filters.delete(editorID);
      this.emitter.emit("did-destroy-filter", editorID);
    } else {
      throw new Error("attempted to destroy an unknown item filter");
    }
  }
}

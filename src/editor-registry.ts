import { CompositeDisposable, Emitter, Gutter, TextEditor } from "atom";

import { enableGutter } from "./config";
import { isItemFilter, log } from "./helpers";

interface EditorData {
  editor: TextEditor;
  subscriptions: CompositeDisposable;
}

interface FilterData {
  editor: TextEditor;
  gutter: Gutter;
}

/**
 * Maintains two distinct registries: one with every TextEditor open within Atom
 * and another with every item filter open within Atom.
 */
export class EditorRegistry {
  private readonly packageName: string;
  private readonly subscriptions: CompositeDisposable;
  readonly editors: Map<number, EditorData>;
  readonly filters: Map<number, FilterData>;
  readonly emitter: Emitter;

  constructor() {
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.editors = new Map();
    this.filters = new Map();

    this.subscriptions.add(
      atom.workspace.observeTextEditors(editor => {
        this.handleNewEditor(editor);
      }),

      enableGutter.observe(value => {
        this.handleEnableGutterChange(value);
      })
    );
  }

  dispose() {
    this.filters.forEach(filterData => {
      filterData.gutter.destroy();
    });

    this.editors.forEach(editorData => {
      editorData.subscriptions.dispose();
    });

    this.subscriptions.dispose();
    this.emitter.dispose();

    return;
  }

  /** Invoke the given callback whenever an editor is added. */
  onDidAddEditor(callback: (editor: TextEditor) => void) {
    return this.emitter.on("registry-did-add-editor", editor => {
      if (editor) {
        callback(editor);
      } else {
        log("warning", "bad value passed to EditorRegistry::onDidAddEditor");
      }
    });
  }

  /** Invoke the given callback whenever an editor is destroyed. */
  onDidDestroyEditor(callback: (editorID: number) => void) {
    return this.emitter.on("registry-did-destroy-editor", editorID => {
      if (editorID) {
        callback(editorID);
      } else {
        log("warning", "bad value passed on EditorRegistry::onDidDestroyEditor");
      }
    });
  }

  /** Invoke the given callback with all current and future editors. */
  observeEditors(callback: (editor: TextEditor) => void) {
    this.editors.forEach(editorData => {
      callback(editorData.editor);
    });
    return this.onDidAddEditor(callback);
  }

  /** Invoke the given callback whenever an item filter is added. */
  onDidAddFilter(callback: (editor: TextEditor) => void) {
    return this.emitter.on("registry-did-add-filter", editor => {
      if (editor) {
        callback(editor);
      } else {
        log("warning", "bad value passed to EditorRegistry::onDidAddFilter");
      }
    });
  }

  /** Invoke the given callback whenever an item filter is destroyed. */
  onDidDestroyFilter(callback: (editorID: number) => void) {
    return this.emitter.on("registry-did-destroy-filter", editorID => {
      if (editorID) {
        callback(editorID);
      } else {
        log("warning", "bad value passed to EditorRegistry::onDidDestroyFilter");
      }
    });
  }

  /** Invoke the given callback with all current and future item filters. */
  observeFilters(callback: (editor: TextEditor) => void) {
    this.filters.forEach(filterData => {
      callback(filterData.editor);
    });
    return this.onDidAddFilter(callback);
  }

  /** Registers a new editor with the registry. */
  private handleNewEditor(editor: TextEditor) {
    log("info", `added editor with ID #${editor.id}`);
    const editorSubs = new CompositeDisposable();
    editorSubs.add(editor.getBuffer().onDidDestroy(() => {
      this.handleDestroyedEditor(editor.id);
    }));

    editorSubs.add(editor.onDidChangeGrammar(_ => {
      this.handleGrammarChange(editor);
    }));

    this.editors.set(editor.id, {
      editor, subscriptions: editorSubs,
    });
    this.emitter.emit("registry-did-add-editor", editor);

    if (isItemFilter(editor)) {
      this.constructFilter(editor);
    }

    return;
  }

  /** Destroys an editor previously registered with the registry. */
  private handleDestroyedEditor(editorID: number) {
    log("info", `editor with ID #${editorID} was destroyed`);
    const filterData = this.filters.get(editorID);
    if (filterData) {
      this.destroyFilter(filterData);
    }

    const editorData = this.editors.get(editorID);
    if (editorData) {
      editorData.subscriptions.dispose();
      this.editors.delete(editorID);
      this.emitter.emit("registry-did-destroy-editor", editorID);
    }

    return;
  }

  /** Handles a grammar change in one of the registered editors. */
  private handleGrammarChange(editor: TextEditor) {
    log("info", `grammar within the editor with ID #${editor.id} was changed`);
    if (isItemFilter(editor)) {
      this.constructFilter(editor);
    } else {
      const filterData = this.filters.get(editor.id);
      if (filterData) {
        this.destroyFilter(filterData);
      }
    }

    return;
  }

  /**
   * Changes the visibilty state for all registered item filters based on the
   * value of the enableGutter configuration variable.
   */
  private handleEnableGutterChange(enableGutter: boolean) {
    if (enableGutter) log("info", "showing the gutter across all editors");
    else log("info", "hiding the gutter across all editors");

    this.filters.forEach(filterData => {
      const gutter = filterData.gutter;
      if (enableGutter) {
        if (!gutter.isVisible()) gutter.show();
      } else {
        if (gutter.isVisible()) gutter.hide();
      }
    });

    return;
  }

  /** Adds a gutter under our package name to the given editor. */
  private addDecorationGutter(editor: TextEditor) {
    log("info", `adding a gutter to the editor with ID #${editor.id}`);
    return editor.addGutter({
      name: this.packageName,
      priority: 75,
      visible: enableGutter.value,
    });
  }

  /** Performs any work necessary to register an item filter using the given editor. */
  private constructFilter(editor: TextEditor) {
    const gutter = this.addDecorationGutter(editor);
    this.filters.set(editor.id, { editor, gutter });
    this.emitter.emit("registry-did-add-filter", editor);
  }

  /** Performs any work necessary to unregister an item filter. */
  private destroyFilter(data: FilterData) {
    data.gutter.destroy();
    this.filters.delete(data.editor.id);
    this.emitter.emit("registry-did-destroy-filter", data.editor.id);

    return;
  }
}

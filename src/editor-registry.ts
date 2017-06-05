import { CompositeDisposable, Emitter } from "atom";

import { isItemFilter } from "./helpers";
import ConfigManager from "./config-manager";

interface EditorData {
  editor: AtomCore.TextEditor
  subscriptions: CompositeDisposable
}

interface FilterData {
  editor: AtomCore.TextEditor
  gutter: AtomCore.Gutter
}

/** Maintains two distinct registries: one with every TextEditor open within Atom
 *  and another with every item filter open within Atom. */
export default class EditorRegistry {
  private readonly config: ConfigManager;
  private readonly packageName: string;
  private readonly subscriptions: CompositeDisposable
  readonly editors: Map<number, EditorData>;
  readonly filters: Map<number, FilterData>;
  readonly emitter: Emitter;

  constructor(config: ConfigManager, packageName: string) {
    this.config = config;
    this.packageName = packageName;
    this.emitter = new Emitter;
    this.subscriptions = new CompositeDisposable;
    this.editors = new Map;
    this.filters = new Map;

    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      this.handleNewEditor(editor);
    }));

    this.subscriptions.add(config.general.enableGutter.observe((enableGutter) => {
      this.handleEnableGutterChange(enableGutter);
    }));
  }

  dispose() {
    this.filters.forEach((filterData) => {
      filterData.gutter.destroy();
    });

    this.editors.forEach((editorData) => {
      editorData.subscriptions.dispose();
    });

    this.subscriptions.dispose();
    this.emitter.dispose();

    return;
  }

  /** Invoke the given callback whenever an editor is added. */
  onDidAddEditor(callback: (editor: AtomCore.TextEditor) => void) {
    return this.emitter.on("did-add-editor", (editor) => {
      callback(editor);
    });
  }

  /** Invoke the given callback whenever an editor is destroyed. */
  onDidDestroyEditor(callback: (editorID: number) => void) {
    return this.emitter.on("did-destroy-editor", (editorID) => {
      callback(editorID);
    });
  }

  /** Invoke the given callback with all current and future editors. */
  observeEditors(callback: (editor: AtomCore.TextEditor) => void) {
    this.editors.forEach((editorData) => {
      callback(editorData.editor);
    });
    return this.onDidAddEditor(callback);
  }

  /** Invoke the given callback whenever an item filter is added. */
  onDidAddFilter(callback: (editor: AtomCore.TextEditor) => void) {
    return this.emitter.on("did-add-filter", (editor) => {
      callback(editor);
    });
  }

  /** Invoke the given callback whenever an item filter is destroyed. */
  onDidDestroyFilter(callback: (editorID: number) => void) {
    return this.emitter.on("did-destroy-filter", (editorID) => {
      callback(editorID);
    });
  }

  /** Invoke the given callback with all current and future item filters. */
  observeFilters(callback: (editor: AtomCore.TextEditor) => void) {
    this.filters.forEach((filterData) => {
      callback(filterData.editor);
    });
    return this.onDidAddFilter(callback);
  }

  /** Registers a new editor with the registry. */
  private handleNewEditor(editor: AtomCore.TextEditor) {
    const editorSubs = new CompositeDisposable;
    editorSubs.add(editor.buffer.onDidDestroy(() => {
      this.handleDestroyedEditor(editor.id);
    }));

    editorSubs.add(editor.onDidChangeGrammar((grammar) => {
      this.handleGrammarChange(editor, grammar);
    }));

    this.editors.set(editor.id, { editor, subscriptions: editorSubs });
    this.emitter.emit("did-add-editor", editor);

    if(isItemFilter(editor)) {
      this.constructFilter(editor);
    }

    return;
  }

  /** Destroys an editor previously registered with the registry. */
  private handleDestroyedEditor(editorID: number) {
    const filterData = this.filters.get(editorID);
    if(filterData) {
      this.destroyFilter(filterData);
    }

    const editorData = this.editors.get(editorID);
    if(editorData) {
      editorData.subscriptions.dispose();
      this.editors.delete(editorID);
      this.emitter.emit("did-destroy-editor", editorID);
    }

    return;
  }

  /** Handles a grammar change in one of the registered editors. */
  private handleGrammarChange(editor: AtomCore.TextEditor, grammar: FirstMate.Grammar) {
    if(isItemFilter(editor)) {
      this.constructFilter(editor);
    } else {
      const filterData = this.filters.get(editor.id);
      if(filterData) {
        this.destroyFilter(filterData);
      }
    }

    return;
  }

  /** Changes the visibilty state for all registered item filters based on the
   *  value of the enableGutter configuration variable. */
  private handleEnableGutterChange(enableGutter: boolean) {
    this.filters.forEach((filterData) => {
      const gutter = filterData.gutter;
      if(enableGutter) {
        if(!gutter.isVisible()) gutter.show();
      } else {
        if(gutter.isVisible()) gutter.hide();
      }
    });

    return;
  }

  /** Adds a gutter under our package name to the given editor. */
  private addDecorationGutter(editor: AtomCore.TextEditor) {
    return editor.addGutter({
      name: this.packageName,
      priority: 75,
      visible: this.config.general.enableGutter.value
    });
  }

  /** Performs any work necessary to register an item filter using the given editor. */
  private constructFilter(editor: AtomCore.TextEditor) {
    const gutter = this.addDecorationGutter(editor);
    this.filters.set(editor.id, { editor, gutter });
    this.emitter.emit("did-add-filter", editor);
  }

  /** Performs any work necessary to unregister an item filter. */
  private destroyFilter(data: FilterData) {
    data.gutter.destroy();
    this.filters.delete(data.editor.id);
    this.emitter.emit("did-destroy-filter", data.editor.id);

    return;
  }
}

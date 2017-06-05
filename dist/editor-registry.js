"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const helpers_1 = require("./helpers");
class EditorRegistry {
    constructor(config, packageName) {
        this.config = config;
        this.packageName = packageName;
        this.emitter = new atom_1.Emitter;
        this.subscriptions = new atom_1.CompositeDisposable;
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
    onDidAddEditor(callback) {
        return this.emitter.on("did-add-editor", (editor) => {
            callback(editor);
        });
    }
    onDidDestroyEditor(callback) {
        return this.emitter.on("did-destroy-editor", (editorID) => {
            callback(editorID);
        });
    }
    observeEditors(callback) {
        this.editors.forEach((editorData) => {
            callback(editorData.editor);
        });
        return this.onDidAddEditor(callback);
    }
    onDidAddFilter(callback) {
        return this.emitter.on("did-add-filter", (editor) => {
            callback(editor);
        });
    }
    onDidDestroyFilter(callback) {
        return this.emitter.on("did-destroy-filter", (editorID) => {
            callback(editorID);
        });
    }
    observeFilters(callback) {
        this.filters.forEach((filterData) => {
            callback(filterData.editor);
        });
        return this.onDidAddFilter(callback);
    }
    handleNewEditor(editor) {
        const editorSubs = new atom_1.CompositeDisposable;
        editorSubs.add(editor.buffer.onDidDestroy(() => {
            this.handleDestroyedEditor(editor.id);
        }));
        editorSubs.add(editor.onDidChangeGrammar((grammar) => {
            this.handleGrammarChange(editor, grammar);
        }));
        this.editors.set(editor.id, { editor, subscriptions: editorSubs });
        this.emitter.emit("did-add-editor", editor);
        if (helpers_1.isItemFilter(editor)) {
            this.constructFilter(editor);
        }
        return;
    }
    handleDestroyedEditor(editorID) {
        const filterData = this.filters.get(editorID);
        if (filterData) {
            this.destroyFilter(filterData);
        }
        const editorData = this.editors.get(editorID);
        if (editorData) {
            editorData.subscriptions.dispose();
            this.editors.delete(editorID);
            this.emitter.emit("did-destroy-editor", editorID);
        }
        return;
    }
    handleGrammarChange(editor, grammar) {
        if (helpers_1.isItemFilter(editor)) {
            this.constructFilter(editor);
        }
        else {
            const filterData = this.filters.get(editor.id);
            if (filterData) {
                this.destroyFilter(filterData);
            }
        }
        return;
    }
    handleEnableGutterChange(enableGutter) {
        this.filters.forEach((filterData) => {
            const gutter = filterData.gutter;
            if (enableGutter) {
                if (!gutter.isVisible())
                    gutter.show();
            }
            else {
                if (gutter.isVisible())
                    gutter.hide();
            }
        });
        return;
    }
    addDecorationGutter(editor) {
        return editor.addGutter({
            name: this.packageName,
            priority: 75,
            visible: this.config.general.enableGutter.value
        });
    }
    constructFilter(editor) {
        const gutter = this.addDecorationGutter(editor);
        this.filters.set(editor.id, { editor, gutter });
        this.emitter.emit("did-add-filter", editor);
    }
    destroyFilter(data) {
        data.gutter.destroy();
        this.filters.delete(data.editor.id);
        this.emitter.emit("did-destroy-filter", data.editor.id);
        return;
    }
}
exports.default = EditorRegistry;

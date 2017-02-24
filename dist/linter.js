"use strict";
const atom_1 = require("atom");
const path = require("path");
const settings = require("./settings");
const data = require("./data");
class BufferData {
    constructor(editor) {
        this.editor = editor;
        this.subscriptions = new atom_1.CompositeDisposable;
        this.subscriptions.add(editor.onDidChangePath((newPath) => {
            if (this.isFilter())
                this.registerFilter();
            else if (this.filterSubs)
                this.filterSubs.dispose();
        }));
        if (this.isFilter())
            this.registerFilter();
        else if (this.filterSubs)
            this.filterSubs.dispose();
    }
    destructor() {
        if (this.filterSubs)
            this.filterSubs.dispose();
        this.subscriptions.dispose();
    }
    mimickChangeData() {
        return [{
                oldRange: new atom_1.Range([0, 0], [0, 0]),
                newRange: this.editor.buffer.getRange(),
                oldText: "",
                newText: this.editor.buffer.getText()
            }];
    }
    isFilter() {
        if (path.extname(this.editor.buffer.getPath()) == ".filter")
            return true;
        else
            return false;
    }
    registerFilter() {
        if (!this.filterSubs)
            this.filterSubs = new atom_1.CompositeDisposable();
        this.processFilter(this.mimickChangeData());
        this.filterSubs.add(this.editor.buffer.onDidChange((event) => {
            if (!this.changes)
                this.changes = [];
            this.changes.push(event);
        }));
        this.filterSubs.add(this.editor.buffer.onDidStopChanging(() => {
            this.filterData.then((fd) => {
                this.processFilter(this.changes);
            });
        }));
    }
    reprocessFilter() {
        if (this.isFilter()) {
            this.processFilter(this.mimickChangeData());
        }
    }
    processFilter(changes) {
        if (!changes || changes.length == 0) {
            this.changes = [];
            return this.filterData;
        }
        this.filterData = new Promise((resolve, reject) => {
            const fd = {};
            emitter.emit("poe-did-process-filter", this.filterData);
            resolve(fd);
        });
    }
}
var subscriptions;
var emitter;
var validBases = new Array();
var validClasses = new Array();
var injectedBases = new Array();
var injectedClasses = new Array();
function activate(registry) {
    if (!registry)
        throw new Error("PoEItemFilter: expected registry to be initialized.");
    if (subscriptions)
        subscriptions.dispose();
    if (emitter)
        emitter.dispose();
    emitter = new atom_1.Emitter;
    subscriptions = new atom_1.CompositeDisposable;
    var currentBuffer;
    const startupAction = (item) => {
        if (!settings.config.generalSettings.enableLinter.get())
            return;
        if (item instanceof require("atom").TextEditor) {
            if (currentBuffer)
                currentBuffer.destructor();
            currentBuffer = new BufferData(item);
        }
        else {
            if (currentBuffer)
                currentBuffer.destructor();
        }
    };
    subscriptions.add(atom.workspace.observeActivePaneItem(startupAction));
    subscriptions.add(settings.config.generalSettings.enableLinter.onDidChange((newValue) => {
        const item = atom.workspace.getActivePaneItem();
        if (item)
            startupAction(item);
    }));
    subscriptions.add(data.emitter.on("poe-did-update-item-data", () => {
        currentBuffer.reprocessFilter();
    }));
    subscriptions.add(data.emitter.on("poe-did-update-injected-data", () => {
        currentBuffer.reprocessFilter();
    }));
}
exports.activate = activate;
function deactivate() {
    subscriptions.dispose();
    emitter.dispose();
}
exports.deactivate = deactivate;

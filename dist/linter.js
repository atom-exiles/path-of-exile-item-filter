"use strict";
var atom_1 = require("atom");
var path = require("path");
var data = require("./data");
var BufferData = (function () {
    function BufferData(editor) {
        var _this = this;
        this.editor = editor;
        this.subscriptions = new atom_1.CompositeDisposable;
        this.subscriptions.add(editor.onDidChangePath(function (newPath) {
            if (_this.isFilter())
                _this.registerFilter();
            else if (_this.filterSubs)
                _this.filterSubs.dispose();
        }));
        if (this.isFilter())
            this.registerFilter();
        else if (this.filterSubs)
            this.filterSubs.dispose();
    }
    BufferData.prototype.destructor = function () {
        if (this.filterSubs)
            this.filterSubs.dispose();
        this.subscriptions.dispose();
    };
    BufferData.prototype.mimickChangeData = function () {
        return [{
                oldRange: new atom_1.Range([0, 0], [0, 0]),
                newRange: this.editor.buffer.getRange(),
                oldText: "",
                newText: this.editor.buffer.getText()
            }];
    };
    BufferData.prototype.isFilter = function () {
        if (path.extname(this.editor.buffer.getPath()) == '.filter')
            return true;
        else
            return false;
    };
    BufferData.prototype.registerFilter = function () {
        var _this = this;
        if (!this.filterSubs)
            this.filterSubs = new atom_1.CompositeDisposable();
        this.processFilter(this.mimickChangeData());
        this.filterSubs.add(this.editor.buffer.onDidChange(function (event) {
            if (!_this.changes)
                _this.changes = [];
            _this.changes.push(event);
        }));
        this.filterSubs.add(this.editor.buffer.onDidStopChanging(function () {
            _this.filterData.then(function (fd) {
                _this.processFilter(_this.changes);
            });
        }));
    };
    BufferData.prototype.reprocessFilter = function () {
        if (this.isFilter()) {
            this.processFilter(this.mimickChangeData());
        }
    };
    BufferData.prototype.processFilter = function (changes) {
        var _this = this;
        if (!changes || changes.length == 0) {
            this.changes = [];
            return this.filterData;
        }
        this.filterData = new Promise(function (resolve, reject) {
            var fd = {};
            emitter.emit('poe-did-process-filter', _this.filterData);
            resolve(fd);
        });
    };
    return BufferData;
}());
var subscriptions;
var emitter;
function setupSubscriptions(registry) {
    if (!registry)
        throw new Error("PoEItemFilter: expected registry to be initialized.");
    if (subscriptions)
        subscriptions.dispose();
    if (emitter)
        emitter.dispose();
    emitter = new atom_1.Emitter;
    subscriptions = new atom_1.CompositeDisposable;
    var currentBuffer;
    subscriptions.add(atom.workspace.observeActivePaneItem(function (item) {
        if (item instanceof require('atom').TextEditor) {
            if (currentBuffer)
                currentBuffer.destructor();
            currentBuffer = new BufferData(item);
        }
        else {
            if (currentBuffer)
                currentBuffer.destructor();
        }
    }));
    subscriptions.add(data.emitter.on("poe-did-update-item-data", function () {
        currentBuffer.reprocessFilter();
    }));
    subscriptions.add(data.emitter.on("poe-did-update-injected-data", function () {
        currentBuffer.reprocessFilter();
    }));
}
exports.setupSubscriptions = setupSubscriptions;
function removeSubscriptions() {
    subscriptions.dispose();
    emitter.dispose();
}
exports.removeSubscriptions = removeSubscriptions;

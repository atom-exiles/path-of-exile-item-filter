"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const Helpers = require("./helpers");
function gatherMessages(filter) {
    const output = {
        errors: [],
        warnings: [],
        info: []
    };
    for (var line of filter) {
        if (line.messages.errors.length > 0) {
            output.errors = output.errors.concat(line.messages.errors);
        }
        if (line.messages.warnings.length > 0) {
            output.warnings = output.warnings.concat(line.messages.warnings);
        }
        if (line.messages.info.length > 0) {
            output.info = output.info.concat(line.messages.info);
        }
    }
    return output;
}
function transformMessage(message, severity) {
    if (message.file == null)
        throw new Error("transform message called with invalid file");
    let solution;
    if (message.solution) {
        solution = {
            currentText: message.solution.currentText,
            replaceWith: message.solution.replaceWith,
            position: atom_1.Range.fromObject(message.range)
        };
    }
    let solutions = [];
    const output = {
        excerpt: message.excerpt,
        description: message.description,
        severity,
        solutions,
        location: {
            file: message.file,
            position: atom_1.Range.fromObject(message.range)
        }
    };
    return output;
}
function postProcessFilter(filter, file) {
    for (var line of filter) {
        if (Helpers.Guards.isBlock(line)) {
            return;
        }
        else if (Helpers.Guards.isEmpty(line) || Helpers.Guards.isUnknown(line) ||
            Helpers.Guards.isLineComment(line)) {
            continue;
        }
        else {
            line.messages.errors.length = 0;
            line.messages.warnings.length = 0;
            line.messages.info.length = 0;
            line.invalid = true;
            line.messages.errors.push({
                excerpt: "A filter rule must be contained within a block.",
                file: file,
                range: line.range,
                url: "http://pathofexile.gamepedia.com/Item_filter"
            });
        }
    }
}
function adjustMessagePaths(messages, newPath) {
    for (var message of messages.errors)
        message.file = newPath;
    for (var message of messages.warnings)
        message.file = newPath;
    for (var message of messages.info)
        message.file = newPath;
    return messages;
}
class LinterProvider {
    constructor(config, filterManager, delegate) {
        this.config = config;
        this.filterManager = filterManager;
        this.delegate = delegate;
        this.subscriptions = new atom_1.CompositeDisposable;
        this.editorSubs = new Map;
        this.filterMessages = new Map;
        this.unsavedFilterMessages = new Map;
        this.messageCache = [];
        this.subscriptions.add(filterManager.observeProcessedFilters((data) => {
            const editor = data.editor;
            this.editorSubs.set(editor.id, editor.onDidChangePath((newPath) => {
                this.handlePathChange(editor.id, newPath);
            }));
            postProcessFilter(data.lines, editor.getPath());
            this.handleNewFilter(data);
        }));
        this.subscriptions.add(filterManager.onDidReprocessFilter((data) => {
            postProcessFilter(data.lines, data.editor.getPath());
            this.handleFilterUpdate(data);
        }));
        this.subscriptions.add(filterManager.onDidDestroyFilter((editorID) => {
            this.handleDestroyedFilter(editorID);
        }));
        this.subscriptions.add(this.config.general.enableLinter.onDidChange(() => {
            this.resetMessageCache();
        }));
        this.subscriptions.add(this.config.linter.enableWarnings.onDidChange(() => {
            this.resetMessageCache();
        }));
        this.subscriptions.add(this.config.linter.enableInfo.onDidChange((event) => {
            this.resetMessageCache();
        }));
    }
    dispose() {
        this.editorSubs.forEach((sub) => {
            sub.dispose();
        });
        this.subscriptions.dispose();
    }
    handleNewFilter(data) {
        const messages = gatherMessages(data.lines);
        const editor = data.editor;
        if (data.editor.getPath()) {
            this.filterMessages.set(editor.id, messages);
            this.appendMessages(messages);
        }
        else {
            this.unsavedFilterMessages.set(editor.id, messages);
        }
    }
    handleFilterUpdate(data) {
        const messages = gatherMessages(data.lines);
        const editor = data.editor;
        if (data.editor.getPath()) {
            this.filterMessages.set(editor.id, messages);
            this.resetMessageCache();
        }
        else {
            this.unsavedFilterMessages.set(editor.id, messages);
        }
    }
    handleDestroyedFilter(editorID) {
        const editorSubs = this.editorSubs.get(editorID);
        if (editorSubs)
            editorSubs.dispose();
        this.editorSubs.delete(editorID);
        this.filterMessages.delete(editorID);
        this.unsavedFilterMessages.delete(editorID);
        this.resetMessageCache();
    }
    handlePathChange(editorID, newPath) {
        var messages = this.unsavedFilterMessages.get(editorID);
        if (messages != null) {
            this.unsavedFilterMessages.delete(editorID);
        }
        else {
            messages = this.filterMessages.get(editorID);
        }
        if (messages != null) {
            this.filterMessages.set(editorID, adjustMessagePaths(messages, newPath));
        }
        this.resetMessageCache();
    }
    processMessages(input) {
        const messages = [];
        input.errors.forEach((message) => {
            messages.push(transformMessage(message, "error"));
        });
        if (this.config.linter.enableWarnings.value) {
            input.warnings.forEach((message) => {
                messages.push(transformMessage(message, "warning"));
            });
        }
        if (this.config.linter.enableInfo.value) {
            input.info.forEach((message) => {
                messages.push(transformMessage(message, "info"));
            });
        }
        return messages;
    }
    appendMessages(m) {
        const messages = this.processMessages(m);
        this.messageCache = this.messageCache.concat(messages);
        this.delegate.setAllMessages(this.messageCache);
    }
    resetMessageCache() {
        this.messageCache.length = 0;
        if (this.config.general.enableLinter.value) {
            this.filterMessages.forEach((messages) => {
                const processedMessages = this.processMessages(messages);
                this.messageCache = this.messageCache.concat(processedMessages);
            });
            this.delegate.setAllMessages(this.messageCache);
        }
        else {
            this.delegate.clearMessages();
        }
    }
}
exports.LinterProvider = LinterProvider;

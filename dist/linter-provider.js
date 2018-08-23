"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
function gatherMessages(filter) {
    const output = {
        errors: [],
        warnings: [],
        info: [],
    };
    for (const line of filter) {
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
    if (message.file === undefined) {
        throw new Error("transform message called with invalid file");
    }
    const solutions = message.solution ? [{
            currentText: message.solution.currentText,
            replaceWith: message.solution.replaceWith,
            position: atom_1.Range.fromObject(message.range),
        }] : [];
    const output = {
        excerpt: message.excerpt,
        description: message.description,
        severity,
        solutions,
        location: {
            file: message.file,
            position: atom_1.Range.fromObject(message.range),
        },
    };
    return output;
}
function adjustMessagePaths(messages, newPath) {
    for (const message of messages.errors)
        message.file = newPath;
    for (const message of messages.warnings)
        message.file = newPath;
    for (const message of messages.info)
        message.file = newPath;
    return messages;
}
class LinterProvider {
    constructor(filterManager) {
        this.subscriptions = new atom_1.CompositeDisposable();
        this.editorSubs = new Map();
        this.filterMessages = new Map();
        this.unsavedFilterMessages = new Map();
        this.messageCache = [];
        this.subscriptions.add(filterManager.observeProcessedFilters(data => {
            const editor = data.editor;
            this.editorSubs.set(editor.id, editor.onDidChangePath(newPath => {
                this.handlePathChange(editor.id, newPath);
            }));
            this.handleNewFilter(data);
        }));
        this.subscriptions.add(filterManager.onDidReprocessFilter(data => {
            this.handleFilterUpdate(data);
        }));
        this.subscriptions.add(filterManager.onDidDestroyFilter(editorID => {
            this.handleDestroyedFilter(editorID);
        }));
    }
    dispose() {
        this.editorSubs.forEach(sub => {
            sub.dispose();
        });
        this.subscriptions.dispose();
        if (this.delegate) {
            this.delegate.clearMessages();
            this.delegate.dispose();
        }
    }
    setLinter(delegate) {
        this.delegate = delegate;
        delegate.setAllMessages(this.messageCache);
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
        let messages = this.unsavedFilterMessages.get(editorID);
        if (messages !== undefined) {
            this.unsavedFilterMessages.delete(editorID);
        }
        else {
            messages = this.filterMessages.get(editorID);
        }
        if (messages !== undefined) {
            this.filterMessages.set(editorID, adjustMessagePaths(messages, newPath));
        }
        this.resetMessageCache();
    }
    processMessages(input) {
        const messages = [];
        input.errors.forEach(message => {
            messages.push(transformMessage(message, "error"));
        });
        input.warnings.forEach(message => {
            messages.push(transformMessage(message, "warning"));
        });
        input.info.forEach(message => {
            messages.push(transformMessage(message, "info"));
        });
        return messages;
    }
    appendMessages(m) {
        const messages = this.processMessages(m);
        this.messageCache = this.messageCache.concat(messages);
        if (this.delegate) {
            this.delegate.setAllMessages(this.messageCache);
        }
    }
    resetMessageCache() {
        this.messageCache.length = 0;
        this.filterMessages.forEach(messages => {
            const processedMessages = this.processMessages(messages);
            this.messageCache = this.messageCache.concat(processedMessages);
        });
        if (this.delegate) {
            this.delegate.setAllMessages(this.messageCache);
        }
    }
}
exports.LinterProvider = LinterProvider;

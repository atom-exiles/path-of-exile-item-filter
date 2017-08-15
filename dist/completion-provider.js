"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const Helpers = require("./helpers");
class CompletionProvider {
    constructor(config, suggestions) {
        this.config = config;
        this.suggestions = suggestions;
    }
    dispose() { }
    getSuggestions({ editor, bufferPosition, scopeDescriptor, prefix, activatedManually }) {
        return __awaiter(this, void 0, void 0, function* () {
            const enableCompletion = yield this.config.general.enableCompletion.promise;
            if (!enableCompletion)
                return [];
            const suggestionData = yield this.suggestions.data;
            const enableExtraSuggestions = this.config.completion.enableExtraSuggestions.value;
            let result = [];
            prefix = this.getPrefix(editor, bufferPosition);
            const cursorScopes = scopeDescriptor.scopes;
            const lastScope = cursorScopes[cursorScopes.length - 1];
            let shouldPruneSuggestions = true;
            if (lastScope == "source.filter") {
                result = result.concat(suggestionData.blocks);
                if (enableExtraSuggestions) {
                    result = result.concat(suggestionData.extraBlocks);
                }
            }
            else if (lastScope == "line.empty.filter" || lastScope == "line.unknown.filter") {
                if (cursorScopes.indexOf("block.filter") != -1) {
                    result = result.concat(suggestionData.blocks, suggestionData.actions, suggestionData.filters);
                    if (enableExtraSuggestions) {
                        result = result.concat(suggestionData.extraBlocks);
                    }
                }
            }
            else {
                if (cursorScopes.includes("rarity.filter")) {
                    if (this.isFirstValue(editor, bufferPosition, true)) {
                        result = result.concat(suggestionData.rarities);
                    }
                    if (this.isPotentialOperator(editor, bufferPosition)) {
                        result = result.concat(suggestionData.operators);
                    }
                }
                else if (cursorScopes.includes("identified.filter")) {
                    if (this.isFirstValue(editor, bufferPosition, true)) {
                        result = result.concat(suggestionData.booleans);
                    }
                }
                else if (cursorScopes.includes("corrupted.filter")) {
                    if (this.isFirstValue(editor, bufferPosition, true)) {
                        result = result.concat(suggestionData.booleans);
                    }
                }
                else if (cursorScopes.includes("class.filter")) {
                    result = result.concat(suggestionData.classes, suggestionData.classWhitelist);
                    if (enableExtraSuggestions) {
                        result = result.concat(suggestionData.extraClasses);
                    }
                }
                else if (cursorScopes.includes("base-type.filter")) {
                    result = result.concat(suggestionData.bases, suggestionData.baseWhitelist);
                    if (enableExtraSuggestions) {
                        result = result.concat(suggestionData.extraBases);
                    }
                }
                else if (cursorScopes.includes("socket-group.filter")) {
                    if (!(prefix == "SocketGroup")) {
                        shouldPruneSuggestions = false;
                        if (this.isFirstValue(editor, bufferPosition, true) && prefix.length < 6) {
                            prefix = "";
                            result = result.concat(suggestionData.sockets);
                        }
                    }
                }
                else if (cursorScopes.includes("play-alert-sound.filter")) {
                    if (this.isFirstValue(editor, bufferPosition, true)) {
                        result = result.concat(result, suggestionData.sounds);
                    }
                }
                else {
                    const numberValueRule = cursorScopes.includes("item-level.filter") ||
                        cursorScopes.includes("drop-level.filter") ||
                        cursorScopes.includes("quality.filter") ||
                        cursorScopes.includes("sockets.filter") ||
                        cursorScopes.includes("linked-sockets.filter") ||
                        cursorScopes.includes("height.filter") ||
                        cursorScopes.includes("width.filter");
                    if (numberValueRule) {
                        if (this.isPotentialOperator(editor, bufferPosition)) {
                            result = result.concat(suggestionData.operators);
                        }
                    }
                }
            }
            if (shouldPruneSuggestions)
                result = this.pruneSuggestions(prefix, result);
            this.setReplacementPrefix(editor, suggestionData, bufferPosition, prefix, result);
            return result;
        });
    }
    onDidInsertSuggestion({ editor, suggestion }) {
        if (editor.hasMultipleCursors()) {
            let cursorPositions = editor.getCursorBufferPositions();
            for (var cursorPosition of cursorPositions) {
                this.removeConsecutiveQuotes(editor, cursorPosition);
            }
        }
        else {
            let cursorPosition = editor.getCursorBufferPosition();
            this.removeConsecutiveQuotes(editor, cursorPosition);
        }
        return;
    }
    isPotentialOperator(editor, position) {
        const line = editor.lineTextForBufferRow(position.row);
        const regex = /^\s*\S+\s*(>|<)?$/;
        const result = regex.exec(line);
        if (result)
            return true;
        return false;
    }
    isFirstValue(editor, position, hasOperator) {
        const line = editor.lineTextForBufferRow(position.row);
        if (hasOperator) {
            var regex = /^\s*\S+\s*(>=|<=|>|<|=)?\s*\S*(.*)/;
        }
        else {
            var regex = /^\s*\S+\s*\S*(.*)/;
        }
        const result = regex.exec(line);
        if (result) {
            const trailingText = result[2];
            if (trailingText.length > 0) {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return true;
        }
    }
    getPrefix(editor, position) {
        let previousPositionScopes;
        if (position.column > 0) {
            const previousPosition = new atom_1.Point(position.row, position.column - 1);
            previousPositionScopes = editor.scopeDescriptorForBufferPosition(previousPosition).scopes;
        }
        const previousText = editor.getTextInBufferRange([[position.row, 0], position]);
        let prefix;
        if (previousPositionScopes && previousPositionScopes.indexOf("string.partial-quotation.filter") != -1) {
            const prefixRegex = /(\"[^"]*)$/;
            const result = prefixRegex.exec(previousText);
            if (result)
                prefix = result[1];
        }
        else if (previousPositionScopes && previousPositionScopes.indexOf("string.quotation.filter") != -1) {
            const stringRange = editor.bufferRangeForScopeAtCursor("string.quotation.filter");
            if (stringRange.end.column > position.column) {
                const prefixRegex = /(\"[^"]*)$/;
                const result = prefixRegex.exec(previousText);
                if (result)
                    prefix = result[1];
            }
            else {
                const prefixRegex = /(\"[^"]*\")$/;
                const result = prefixRegex.exec(previousText);
                if (result)
                    prefix = result[1];
            }
        }
        else {
            const prefixRegex = /([\s]*([^\s]*))*$/;
            const result = prefixRegex.exec(previousText);
            if (result)
                prefix = result[2];
        }
        if (prefix == undefined)
            prefix = "";
        return prefix;
    }
    pruneSuggestions(prefix, suggestions) {
        if (prefix.length == 0)
            return suggestions;
        const result = [];
        const upperPrefix = prefix.toUpperCase();
        const firstChar = prefix.charAt(0);
        for (var s of suggestions) {
            if (s.displayText && firstChar != '"') {
                var text = s.displayText.toUpperCase();
            }
            else if (Helpers.Guards.isSnippetSuggestion(s)) {
                var text = s.snippet.toUpperCase();
            }
            else if (Helpers.Guards.isTextSuggestion(s)) {
                var text = s.text.toUpperCase();
            }
            else
                continue;
            if (text.indexOf(upperPrefix) != -1)
                result.push(s);
        }
        return result;
    }
    setReplacementPrefix(editor, data, position, prefix, suggestions) {
        for (var suggestion of suggestions) {
            let blockElement = false;
            for (var block of data.blocks) {
                if (Helpers.Guards.isSnippetSuggestion(suggestion) && Helpers.Guards.isSnippetSuggestion(block)) {
                    if (suggestion.snippet == block.snippet)
                        blockElement = true;
                }
                else if (Helpers.Guards.isTextSuggestion(suggestion) && Helpers.Guards.isTextSuggestion(block)) {
                    if (suggestion.text == block.text)
                        blockElement = true;
                }
            }
            if (blockElement) {
                const range = new atom_1.Range([position.row, 0], position);
                suggestion.replacementPrefix = editor.getTextInBufferRange(range);
            }
            else {
                suggestion.replacementPrefix = prefix;
            }
        }
        return;
    }
    removeConsecutiveQuotes(editor, position) {
        const leftCharLocation = new atom_1.Range([position.row, position.column - 1], position);
        const rightCharLocation = new atom_1.Range(position, [position.row,
            position.column + 1]);
        const leftChar = editor.getTextInBufferRange(leftCharLocation);
        const rightChar = editor.getTextInBufferRange(rightCharLocation);
        if (leftChar == '"' && rightChar == '"') {
            editor.setTextInBufferRange(rightCharLocation, "", { undo: "skip" });
        }
        return;
    }
}
exports.CompletionProvider = CompletionProvider;

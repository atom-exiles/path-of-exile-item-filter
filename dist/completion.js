"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const atom_1 = require("atom");
const settings = require("./settings");
const data = require("./data");
function activate() { }
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
function isPotentialOperator(editor, position) {
    const line = editor.lineTextForBufferRow(position.row);
    const regex = /^\s*\S+\s*(>|<)?$/;
    const result = regex.exec(line);
    if (result)
        return true;
    return false;
}
function isFirstValue(editor, position, hasOperator) {
    const line = editor.lineTextForBufferRow(position.row);
    var regex;
    if (hasOperator) {
        regex = /^\s*\S+\s*(>=|<=|>|<|=)?\s*\S*(.*)/;
    }
    else {
        regex = /^\s*\S+\s*\S*(.*)/;
    }
    const result = regex.exec(line);
    if (result) {
        const trailingText = result[2];
        if (trailingText.length > 0)
            return false;
        else
            return true;
    }
    else {
        return true;
    }
}
function getPrefix(editor, position) {
    var previousPositionScopes;
    if (position.column > 0) {
        const previousPosition = new atom_1.Point(position.row, position.column - 1);
        previousPositionScopes = editor.scopeDescriptorForBufferPosition(previousPosition).scopes;
    }
    const previousText = editor.getTextInBufferRange([[position.row, 0], position]);
    var prefix;
    if (previousPositionScopes && previousPositionScopes.indexOf("string.partial-quotation.poe") != -1) {
        const prefixRegex = /(\"[^"]*)$/;
        const result = prefixRegex.exec(previousText);
        if (result)
            prefix = result[1];
    }
    else if (previousPositionScopes && previousPositionScopes.indexOf("string.quotation.poe") != -1) {
        const stringRange = editor.bufferRangeForScopeAtCursor("string.quotation.poe");
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
function setReplacementPrefix(editor, position, prefix, suggestions) {
    for (var suggestion of suggestions) {
        var blockElement = false;
        for (var block of data.files.suggestions.blocks) {
            if (suggestion.snippet && block.snippet) {
                if (suggestion.snippet == block.snippet) {
                    blockElement = true;
                }
            }
            else if (suggestion.text && block.text) {
                if (suggestion.text == block.text) {
                    blockElement = true;
                }
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
    return suggestions;
}
function pruneSuggestions(prefix, suggestions) {
    if (prefix.length == 0)
        return suggestions;
    const upperPrefix = prefix.toUpperCase();
    const prunedSuggestions = [];
    const firstChar = prefix.charAt(0);
    for (var s of suggestions) {
        var text;
        if (s.displayText && firstChar != '"') {
            text = s.displayText.toUpperCase();
        }
        else if (s.snippet) {
            text = s.snippet.toUpperCase();
        }
        else if (s.text) {
            text = s.text.toUpperCase();
        }
        else
            continue;
        if (text.indexOf(upperPrefix) != -1)
            prunedSuggestions.push(s);
    }
    return prunedSuggestions;
}
function getSuggestions(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!settings.config.generalSettings.enableCompletion.get()) {
            return [];
        }
        const cd = yield data.completionData;
        var suggestions = [];
        var prefix = getPrefix(args.editor, args.bufferPosition);
        const cursorScopes = args.scopeDescriptor.scopes;
        const topScope = cursorScopes[cursorScopes.length - 1];
        var shouldPruneSuggestions = true;
        const enableExtraSuggestions = settings.config.completionSettings.
            enableExtraSuggestions.get();
        if (topScope == "source.poe") {
            suggestions = suggestions.concat(data.files.suggestions.blocks);
        }
        else if (topScope == "line.empty.poe" || topScope == "line.unknown.poe") {
            if (cursorScopes.indexOf("block.poe") != -1) {
                suggestions = suggestions.concat(data.files.suggestions.blocks, data.files.suggestions.actions, data.files.suggestions.filters);
                if (enableExtraSuggestions) {
                    suggestions = suggestions.concat(data.files.suggestions.extraBlocks);
                }
            }
        }
        else {
            if (cursorScopes.indexOf("filter.rarity.poe") != -1) {
                if (isFirstValue(args.editor, args.bufferPosition, true)) {
                    suggestions = suggestions.concat(data.files.suggestions.rarities);
                }
                if (isPotentialOperator(args.editor, args.bufferPosition)) {
                    suggestions = suggestions.concat(data.files.suggestions.operators);
                }
            }
            else if (cursorScopes.indexOf("filter.identified.poe") != -1) {
                if (isFirstValue(args.editor, args.bufferPosition, true)) {
                    suggestions = suggestions.concat(data.files.suggestions.booleans);
                }
            }
            else if (cursorScopes.indexOf("filter.corrupted.poe") != -1) {
                if (isFirstValue(args.editor, args.bufferPosition, true)) {
                    suggestions = suggestions.concat(data.files.suggestions.booleans);
                }
            }
            else if (cursorScopes.indexOf("filter.class.poe") != -1) {
                suggestions = suggestions.concat(cd.classes, cd.whitelistClasses);
                if (enableExtraSuggestions) {
                    suggestions = suggestions.concat(data.files.suggestions.extraClasses);
                }
            }
            else if (cursorScopes.indexOf("filter.base-type.poe") != -1) {
                suggestions = suggestions.concat(cd.bases, cd.whitelistBases);
                if (enableExtraSuggestions) {
                    suggestions = suggestions.concat(data.files.suggestions.extraBases);
                }
            }
            else if (cursorScopes.indexOf("filter.socket-group.poe") != -1) {
                if (!(prefix == "SocketGroup")) {
                    shouldPruneSuggestions = false;
                    if (isFirstValue(args.editor, args.bufferPosition, true) && prefix.length < 6) {
                        prefix = "";
                        suggestions = suggestions.concat(data.files.suggestions.socketGroup);
                    }
                }
            }
            else {
                const numberValueRule = cursorScopes.indexOf("filter.item-level.poe") != -1 ||
                    cursorScopes.indexOf("filter.drop-level.poe") != -1 ||
                    cursorScopes.indexOf("filter.quality.poe") != -1 ||
                    cursorScopes.indexOf("filter.sockets.poe") != -1 ||
                    cursorScopes.indexOf("filter.linked-sockets.poe") != -1 ||
                    cursorScopes.indexOf("filter.height.poe") != -1 ||
                    cursorScopes.indexOf("filter.width.poe") != -1;
                if (numberValueRule) {
                    if (isPotentialOperator(args.editor, args.bufferPosition)) {
                        suggestions = suggestions.concat(data.files.suggestions.operators);
                    }
                }
            }
        }
        if (shouldPruneSuggestions)
            suggestions = pruneSuggestions(prefix, suggestions);
        setReplacementPrefix(args.editor, args.bufferPosition, prefix, suggestions);
        return suggestions;
    });
}
function removeConsecutiveQuotes(editor, position) {
    const leftCharLocation = new atom_1.Range([position.row, position.column - 1], position);
    const rightCharLocation = new atom_1.Range(position, [position.row,
        position.column + 1]);
    const leftChar = editor.getTextInBufferRange(leftCharLocation);
    const rightChar = editor.getTextInBufferRange(rightCharLocation);
    if (leftChar == '"' && rightChar == '"') {
        editor.setTextInBufferRange(rightCharLocation, "");
    }
}
function insertedSuggestion(params) {
    if (params.editor.hasMultipleCursors()) {
        const cursorPositions = params.editor.getCursorBufferPositions();
        for (var cursorPosition of cursorPositions) {
            removeConsecutiveQuotes(params.editor, cursorPosition);
        }
    }
    else {
        const cursorPosition = params.editor.getCursorBufferPosition();
        removeConsecutiveQuotes(params.editor, cursorPosition);
    }
}
exports.provider = {
    selector: ".source.poe",
    disableForSelector: ".source.poe .comment",
    inclusionPriority: 1,
    excludeLowerPriority: true,
    getSuggestions: getSuggestions,
    onDidInsertSuggestion: insertedSuggestion
};
